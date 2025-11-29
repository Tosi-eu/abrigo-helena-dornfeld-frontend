import { StockItemRaw } from "@/interfaces/interfaces";
import { StockCard } from "./StockCard";

interface Props {
  item: StockItemRaw | null;
  quantity: string;
  setQuantity: (q: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}

export default function QuantityStep({ item, quantity, setQuantity, onBack, onConfirm }: Props) {
  if (!item) return null;

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-400 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4">

        <div className="flex-1">
          <StockCard
            item={item}
            selected={false}
            onSelect={() => {}}
            disabled={false}
          />
        </div>

        <div className="w-48 flex flex-col justify-center">
          <label className="block text-xs text-gray-700 mb-1">Quantidade</label>
          <input
            type="number"
            min={1}
            max={item.quantidade}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm"
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onBack} className="px-4 py-2 border rounded-lg text-sm">Voltar</button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 transition"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}
