interface StockCardProps {
  item: any;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  tooltip?: string;
}

export function StockCard({
  item,
  selected,
  onSelect,
  disabled = false,
  tooltip,
}: StockCardProps) {
  const display = (v: any) =>
    v !== null && v !== undefined && v !== "" ? v : "N/A";

  console.log(item)

  const fields: { label: string; value: string | number }[] = [
    { label: "Nome", value: display(item.nome) },
    { label: "Quantidade", value: display(item.quantidade) },
    { label: "Validade", value: display(item.validade) },
  ];

  if (item.tipo_item === "medicamento") {
    fields.push({
      label: "Princípio ativo",
      value: display(item.principio_ativo),
    });
    if (item.paciente) {
      fields.push({ label: "Paciente", value: display(item.paciente) });
    }
  }

  fields.push({ label: "Armário", value: display(item.armario_id) });
  fields.push({ label: "Casela", value: display(item.casela_id) });
  if (item.origem) fields.push({ label: "Origem", value: display(item.origem) });

  const mid = Math.ceil(fields.length / 2);
  const left = fields.slice(0, mid);
  const right = fields.slice(mid);

  return (
    <div
      onClick={() => {
        if (!disabled) onSelect();
      }}
      title={disabled && tooltip ? tooltip : ""}
      className={`
        w-full rounded-xl p-5 border shadow-sm transition-all
        ${
          selected
            ? "bg-sky-50 border-sky-600 shadow-md"
            : "bg-white border-slate-300 hover:bg-slate-50"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <div className="font-semibold text-slate-800 text-base mb-3">
        {item.nome}
      </div>

      <div className="flex justify-between gap-6 text-sm text-slate-600">
        <div className="space-y-1">
          {left.map((f, i) => (
            <div key={i}>
              <span className="font-medium text-slate-700">{f.label}:</span>{" "}
              {f.value}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {right.map((f, i) => (
            <div key={i}>
              <span className="font-medium text-slate-700">{f.label}:</span>{" "}
              {f.value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}