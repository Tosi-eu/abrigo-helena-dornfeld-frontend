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

export default function StepItems({
  items,
  page,
  totalPages,
  selected,
  onSelectItem,
  onBack,
  setPage,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const isDisabled = item.quantidade === 0;
          const isSelected = selected?.estoque_id === item.estoque_id;
          return (
            <StockCard
              key={`${item.estoque_id}-${item.tipo_item}`}
              item={item}
              selected={isSelected}
              disabled={isDisabled}
              tooltip={isDisabled ? "Este item está sem estoque" : undefined}
              onSelect={() => onSelectItem(isSelected ? null : item)}
            />
          );
        })}
      </div>
    </div>
  );
}
