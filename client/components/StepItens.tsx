import { StockCard } from "@/components/StockCard";
import { StockItemRaw } from "@/interfaces/interfaces";

interface Props {
  items: StockItemRaw[];
  allItemsCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  selected: StockItemRaw | null;
  onSelectItem: (item: StockItemRaw | null) => void;
  onBack: () => void;
  setPage: (p: number) => void;
}

export default function StepItems({ items, selected, onSelectItem }: Props) {
  console.log(items)
  return (
    <div className="w-full space-y-4">
      <div
        className="
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          lg:grid-cols-3 
          xl:grid-cols-3
          gap-6
          justify-items-center
        "
      >
        {items.map((item) => {
          const isDisabled = item.quantidade === 0;
          const isSelected = selected?.estoque_id === item.estoque_id;

          return (
            <div className="w-full max-w-[380px] sm:max-w-[420px]">
              <StockCard
                key={`${item.estoque_id}-${item.tipo_item}`}
                item={item}
                selected={isSelected}
                disabled={isDisabled}
                tooltip={isDisabled ? "Este item está sem estoque" : undefined}
                onSelect={() => onSelectItem(isSelected ? null : item)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
