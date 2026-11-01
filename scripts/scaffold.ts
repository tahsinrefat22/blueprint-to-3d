#!/usr/bin/env bun
/**
 * Scaffolds a blueprint-to-3d project in the current working directory.
 *
 *   bun scaffold.ts <project-slug> --title "Project Title" [--docs-only] [--no-install]
 *
 * --docs-only   create only <slug>/docs/ (Phase 1); run again without it in Phase 7 to add the code.
 * --no-install  skip `bun install`.
 *
 * Never overwrites: files that already exist are kept and reported.
 */
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";

const SKILL_ROOT = resolve(import.meta.dir, "..");
const TEMPLATES = join(SKILL_ROOT, "templates");
const TEXT_EXTENSIONS = new Set([".ts", ".astro", ".md", ".json", ".mjs", ".css", ".txt", ".html", ""]);
/** Template files stored under a safe name and renamed on copy (dotfiles get lost in packaging). */
const RENAMES: Record<string, string> = { _gitignore: ".gitignore" };

function fail(message: string): never {
  console.error(`scaffold: ${message}`);
  process.exit(1);
}

function parseArgs(argv: string[]): { slug: string; title: string; docsOnly: boolean; install: boolean } {
  const positional: string[] = [];
  let title = "";
  let docsOnly = false;
  let install = true;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] ?? "";
    if (arg === "--title") title = argv[++i] ?? "";
    else if (arg === "--docs-only") docsOnly = true;
    else if (arg === "--no-install") install = false;
    else if (arg.startsWith("--")) fail(`unknown option ${arg}`);
    else positional.push(arg);
  }
  const slug = positional[0] ?? "";
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) fail("usage: scaffold.ts <project-slug> --title \"Title\" (slug: lowercase, digits, hyphens)");
  if (!title) fail("--title is required");
  return { slug, title, docsOnly, install };
}

function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function extensionOf(path: string): string {
  const name = path.split("/").pop() ?? "";
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot) : "";
}

async function copyTree(
  from: string,
  to: string,
  tokens: Record<string, string>,
  report: { created: string[]; kept: string[] },
): Promise<void> {
  for await (const source of walk(from)) {
    const rel = relative(from, source);
    const parts = rel.split("/");
    const last = parts.pop() ?? "";
    const target = join(to, ...parts, RENAMES[last] ?? last);
    if (existsSync(target)) {
      report.kept.push(target);
      continue;
    }
    await mkdir(dirname(target), { recursive: true });
    if (TEXT_EXTENSIONS.has(extensionOf(source))) {
      let text = await readFile(source, "utf8");
      for (const [token, value] of Object.entries(tokens)) text = text.replaceAll(token, value);
      await writeFile(target, text);
    } else {
      await writeFile(target, await readFile(source));
    }
    report.created.push(target);
  }
}

const { slug, title, docsOnly, install } = parseArgs(process.argv.slice(2));
const projectDir = resolve(process.cwd(), slug);
const tokens = { __TITLE__: title, __SLUG__: slug, __DATE__: today() };
const report = { created: [] as string[], kept: [] as string[] };

await copyTree(join(TEMPLATES, "docs"), join(projectDir, "docs"), tokens, report);
if (!docsOnly) await copyTree(join(TEMPLATES, "project"), projectDir, tokens, report);

console.log(`scaffold: ${projectDir}`);
console.log(`  created ${report.created.length} files, kept ${report.kept.length} existing files`);
for (const kept of report.kept) console.log(`  kept (not overwritten): ${relative(projectDir, kept)}`);

if (!docsOnly && install) {
  console.log("scaffold: bun install");
  const proc = Bun.spawn(["bun", "install"], { cwd: projectDir, stdout: "inherit", stderr: "inherit" });
  if ((await proc.exited) !== 0) fail("bun install failed");
}

console.log(
  docsOnly
    ? `next: fill in ${slug}/docs/01-intake.md and tick ${slug}/docs/00-progress.md`
    : `next: cd ${slug} && bun run check   (then replace the template demo, see docs/07-build-plan.md)`,
);
