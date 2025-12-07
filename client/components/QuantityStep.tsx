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
    <div className="bg-white rounded-lg border border-gray-300 max-w-3xl mx-auto shadow-sm overflow-hidden">
      <div className="bg-blue-100 p-6">
        <h2 className="text-gray-800 font-semibold text-xl">Detalhes do Item</h2>
      </div>

      <div className="p-8 flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <StockCard item={item} selected={false} onSelect={() => {}} disabled={false} />
        </div>

        <div className="w-72 flex flex-col justify-center">
          <label className="block text-sm text-gray-700 mb-2">Quantidade</label>
          <input
            type="number"
            min={1}
            max={item.quantidade}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-200 focus:outline-none"
            placeholder="0"
          />
          <span className="text-xs text-gray-500 mt-1">Disponível: {item.quantidade}</span>
        </div>
      </div>

      <div className="bg-blue-100 p-6 flex justify-between items-center">
        <button
          onClick={onConfirm}
          className="px-6 py-3 bg-white text-blue-600 border border-blue-300 rounded-lg text-sm font-semibold hover:bg-blue-50 transition"
        >
          Confirmar
        </button>
      </div>  
    </div>
  );
}