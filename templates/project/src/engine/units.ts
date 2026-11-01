/**
 * Unit constants and conversions. The only place conversions happen; everything else uses
 * unit-suffixed names (massG, lengthMm, torqueNmm, speedRpm).
 */

/** Standard gravity, m/s². Exact by definition (3rd CGPM, 1901). */
export const STANDARD_GRAVITY = 9.80665;

export const DEG = Math.PI / 180;

export const degToRad = (deg: number): number => deg * DEG;
export const radToDeg = (rad: number): number => rad / DEG;

export const gToKg = (g: number): number => g / 1000;
export const kgToG = (kg: number): number => kg * 1000;

export const mmToM = (mm: number): number => mm / 1000;

export const rpmToHz = (rpm: number): number => rpm / 60;
export const rpmToRadS = (rpm: number): number => (rpm * 2 * Math.PI) / 60;

export const nmmToNm = (nmm: number): number => nmm / 1000;
export const nmToNmm = (nm: number): number => nm * 1000;

/** Weight in newtons of a mass in grams. */
export const weightN = (massG: number): number => gToKg(massG) * STANDARD_GRAVITY;
