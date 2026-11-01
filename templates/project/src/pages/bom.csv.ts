import type { APIRoute } from "astro";
import { bom } from "../spec";

const columns = [
  "part",
  "manufacturer",
  "partNumber",
  "qty",
  "supplier",
  "supplierCountry",
  "url",
  "unitPrice",
  "currency",
  "priceDate",
  "shipping",
  "duty",
  "stock",
  "backupSupplier",
  "backupUrl",
  "notes",
] as const;

const cell = (value: unknown): string => {
  const text = value === undefined || value === null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

/** Static CSV of the BOM (dist/bom.csv), linked from the BOM section. */
export const GET: APIRoute = () => {
  const rows = bom.map((line) =>
    [
      line.part,
      line.manufacturer,
      line.partNumber,
      line.qty,
      line.supplier,
      line.supplierCountry,
      line.url,
      line.unitPrice,
      line.currency,
      line.priceDate,
      line.shipping,
      line.duty,
      line.stock,
      line.backup?.supplier,
      line.backup?.url,
      line.notes,
    ]
      .map(cell)
      .join(","),
  );
  return new Response([columns.join(","), ...rows].join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8" },
  });
};
