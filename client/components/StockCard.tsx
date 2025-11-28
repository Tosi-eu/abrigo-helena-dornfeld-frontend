interface StockCardProps {
  item: any;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  tooltip?: string;
}

export function StockCard({ item, selected, onSelect, disabled = false, tooltip }: StockCardProps) {
  const displayValue = (value: any) => (value !== null && value !== undefined ? value : "N/A");

  const fields: { label: string; value: string | number }[] = [];
  fields.push({ label: "Nome", value: displayValue(item.nome) });
  fields.push({ label: "Quantidade", value: displayValue(item.quantidade) });

  if (item.tipo_item === "medicamento") {
    fields.push({ label: "Princípio ativo", value: displayValue(item.detalhes) });
    fields.push({
      label: "Validade",
      value: item.validade ? new Date(item.validade).toLocaleDateString() : "N/A",
    });
    if (item.paciente) {
      fields.push({ label: "Paciente", value: displayValue(item.paciente) });
    }
  }

  fields.push({ label: "Armário", value: displayValue(item.armario_id) });
  fields.push({ label: "Casela", value: displayValue(item.casela_id) });
  if (item.origem) fields.push({ label: "Origem", value: displayValue(item.origem) });

  const mid = Math.ceil(fields.length / 2);
  const leftFields = fields.slice(0, mid);
  const rightFields = fields.slice(mid);

  return (
    <div
      onClick={() => {
        if (!disabled) onSelect();
      }}
      title={disabled && tooltip ? tooltip : ""}
      className={`
        w-full
        p-5
        rounded-lg
        border
        shadow-sm
        transition
        ${selected ? "bg-sky-50 border-sky-500" : "border-gray-200 hover:bg-gray-50"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <div className="font-semibold capitalize text-sm mb-2">{item.nome}</div>

      <div className="flex justify-center gap-x-8 text-xs text-gray-600">
        <div className="space-y-1">
          {leftFields.map((f, i) => (
            <div key={i}>
              <span className="font-medium">{f.label}:</span> {f.value}
            </div>
          ))}
        </div>
        <div className="space-y-1">
          {rightFields.map((f, i) => (
            <div key={i}>
              <span className="font-medium">{f.label}:</span> {f.value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
