// Kode error PostgreSQL untuk pelanggaran UNIQUE constraint
export function isUniqueViolation(error: unknown): boolean {
    const e = error as { code?: string; driverError?: { code?: string } };
    return e?.driverError?.code === '23505' || e?.code === '23505';
}
