import { useState, useMemo } from "react";
import { StockCard } from "./StockCard";
import { OperationType } from "@/enums/enums";
import { useToast } from "@/hooks/use-toast";

interface StockItem {
  item_id: number;
  estoque_id: number;
  tipo_item: OperationType;
  nome: string;
  principio_ativo?: string;
  validade?: string | null;
  quantidade: number;
  minimo?: number;
  origem?: string;
  tipo?: string;
  paciente?: string | null;
  armario_id?: number | null;
  casela_id?: number | null;
  detalhes?: string;
}

interface Props {
  items: StockItem[];
  onSubmit: (data: {
    itemId: number;
    estoqueId: number;
    tipoItem: OperationType;
    armarioId: number;
    caselaId?: number;
    quantity: number;
    validity: string | null;
    resident: string | null;
  }) => void;
}

export function StockOutForm({ items, onSubmit }: Props) {
  const [selected, setSelected] = useState<{ estoqueId: number; tipo: string } | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [filters, setFilters] = useState({ nome: "", armario: "", origem: "" });
  const { toast } = useToast();

  const selectedItem = items.find(
    (i) => selected?.estoqueId === i.estoque_id && selected?.tipo === i.tipo_item
  );

  const handleSubmit = () => {
    if (!selectedItem) {
      toast({ title: "Seleção obrigatória", description: "Selecione um item.", variant: "error" });
      return;
    }

    const itemQuantity = Number(quantity);
    if (!itemQuantity || itemQuantity <= 0) {
      toast({ title: "Quantidade inválida", description: "Informe uma quantidade maior que 0.", variant: "error" });
      return;
    }

    if (itemQuantity > selectedItem.quantidade) {
      toast({
        title: "Estoque insuficiente",
        description: `A quantidade disponível é ${selectedItem.quantidade}.`,
        variant: "error",
      });
      return;
    }

    onSubmit({
      itemId: selectedItem.item_id,
      estoqueId: selectedItem.estoque_id,
      tipoItem: selectedItem.tipo_item as OperationType,
      armarioId: selectedItem.armario_id ?? 0,
      caselaId: selectedItem.casela_id ?? undefined,
      quantity: itemQuantity,
      validity: selectedItem.validade ? new Date(selectedItem.validade).toISOString() : null,
      resident: selectedItem.paciente ?? "",
    });

    setQuantity("");
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesNome = filters.nome ? item.nome.toLowerCase().includes(filters.nome.toLowerCase()) : true;
      const matchesArmario = filters.armario ? String(item.armario_id ?? "").includes(filters.armario) : true;
      const matchesOrigem = filters.origem ? (item.origem ?? "").toLowerCase().includes(filters.origem.toLowerCase()) : true;
      return matchesNome && matchesArmario && matchesOrigem;
    });
  }, [items, filters]);

const renderCard = (item: StockItem) => {
  const isDisabled = item.quantidade <= 0;

  return (
    <StockCard
      key={item.estoque_id}
      item={item}
      selected={selected?.estoqueId === item.estoque_id && selected?.tipo === item.tipo_item}
      disabled={isDisabled}
      tooltip={isDisabled ? "Este item está sem estoque" : undefined}
      onSelect={() => {
        if (isDisabled) return; 
        setSelected((prev) =>
          prev?.estoqueId === item.estoque_id && prev?.tipo === item.tipo_item
            ? null
            : { estoqueId: item.estoque_id, tipo: item.tipo_item }
        );
      }}
    />
  );
};

  return (
    <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantidade</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm"
            placeholder="0"
            disabled={!selectedItem}
          />
        </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4 w-full mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-center items-end">
              <div>
                <label className="block text-xs text-gray-700 mb-1">Nome</label>
                <input
                  list="nomes"
                  placeholder="Selecione ou digite"
                  value={filters.nome}
                  onChange={(e) => setFilters((prev) => ({ ...prev, nome: e.target.value }))}
                  className="w-full border rounded-lg p-2 text-sm"
                />
                <datalist id="nomes">
                  {Array.from(new Set(items.map((i) => i.nome))).map((nome) => (
                    <option key={nome} value={nome} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-1">Armário</label>
                <input
                  list="armarios"
                  placeholder="Selecione"
                  value={filters.armario}
                  onChange={(e) => setFilters((prev) => ({ ...prev, armario: e.target.value }))}
                  className="w-full border rounded-lg p-2 text-sm"
                />
                <datalist id="armarios">
                  {Array.from(new Set(items.map((i) => i.armario_id ?? "-"))).map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-1">Origem</label>
                <input
                  list="origens"
                  placeholder="Selecione"
                  value={filters.origem}
                  onChange={(e) => setFilters((prev) => ({ ...prev, origem: e.target.value }))}
                  className="w-full border rounded-lg p-2 text-sm"
                />
                <datalist id="origens">
                  {Array.from(new Set(items.map((i) => i.origem ?? "-"))).map((o) => (
                    <option key={o} value={o} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!selectedItem}
                className="px-5 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 transition disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>

      <label className="block text-sm font-medium text-gray-700">Itens do Estoque</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredItems.map(renderCard)}
      </div>
    </div>
  );
}