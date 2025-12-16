export async function fetchAllPaginated<T>(
  fetchFn: (page: number, limit: number) => Promise<{ data: T[] }>,
  limit = 100
): Promise<T[]> {
  let page = 1;
  let all: T[] = [];

  while (true) {
    const res = await fetchFn(page, limit);
    const data = res.data ?? [];

    all = all.concat(data);

    if (data.length === 0) break;

    page++;
  }

  return all;
}