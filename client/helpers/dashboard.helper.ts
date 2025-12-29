export function getMaxSectionRows(
  tables: Array<{ total: number; pageSize?: number }>,
) {
  return Math.max(...tables.map((t) => Math.min(t.total, t.pageSize)));
}
