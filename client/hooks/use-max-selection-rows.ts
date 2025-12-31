import { useMemo } from "react";

type UseMaxSectionRowsOptions = {
  min?: number;
  max?: number;
};

export function useMaxSectionRows(
  lists: Array<unknown[] | undefined>,
  options?: UseMaxSectionRowsOptions,
) {
  const { min = 0, max } = options || {};

  return useMemo(() => {
    const lengths = lists.filter(Boolean).map((list) => list!.length);

    const biggest = lengths.length ? Math.max(...lengths) : 0;

    let result = Math.max(biggest, min);

    if (typeof max === "number") {
      result = Math.min(result, max);
    }

    return result;
  }, [lists, min, max]);
}
