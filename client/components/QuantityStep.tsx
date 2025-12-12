import { StockItemRaw } from "@/interfaces/interfaces";
import { StockCard } from "@/components/StockCard";

interface Props {
  item: StockItemRaw | null;
  quantity: string;
  setQuantity: (q: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}

export default function QuantityStep({
  item,
  quantity,
  setQuantity,
  onBack,
  onConfirm,
}: Props) {
  if (!item) return null;

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
        <div className="bg-sky-50 px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Detalhes do Item</h2>
        </div>

        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <StockCard item={item} selected={false} onSelect={() => {}} disabled={false} />
          </div>

          <div className="w-full md:w-80 flex flex-col justify-center">
            <label className="block text-sm text-slate-700 mb-2">Quantidade</label>
            <input
              type="number"
              min={1}
              max={item.quantidade}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
              placeholder="0"
            />
            <span className="text-xs text-slate-500 mt-2">Disponível: {item.quantidade}</span>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onBack}
                type="button"
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition"
              >
                Voltar
              </button>

              <button
                onClick={onConfirm}
                type="button"
                className="flex-1 px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition font-semibold"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}