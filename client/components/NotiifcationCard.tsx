import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { useState } from "react";

interface NotificationCardProps {
  residentName: string;
  medicineName: string;
  dateToGo: string;
  destiny: string;
  createdBy: string;
  onComplete?: () => Promise<void>;
  onCancel?: () => Promise<void>;
  onEdit?: () => void; 
  onRemove?: () => void; 
}

export function NotificationCard({
  residentName,
  medicineName,
  dateToGo,
  destiny,
  createdBy,
  onComplete,
  onCancel,
  onEdit,
  onRemove
}: NotificationCardProps) {
  const [visible, setVisible] = useState(true);

  const handleAction = async (action: () => Promise<void>) => {
    await action();
    setVisible(false);
    onRemove?.();
  };

  return (
    <div
      className={`transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      <Card className="relative shadow-sm hover:shadow-md transition-shadow duration-200">
        {onEdit && (
          <button
            onClick={onEdit}
            className="absolute top-2 right-2 p-1 rounded hover:bg-slate-100"
          >
            <Pencil className="w-4 h-4 text-slate-600" />
          </button>
        )}

        <CardHeader>
          <CardTitle>{residentName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <div>Medicamento: {medicineName}</div>
          <div>Data prevista: {dateToGo}</div>
          <div>Destino: {destiny}</div>
          <div>Criado por: {createdBy}</div>

          <div className="flex gap-2 mt-2">
            {onComplete && (
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition"
                onClick={() => handleAction(onComplete)}
              >
                Concluir
              </button>
            )}
            {onCancel && (
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
                onClick={() => handleAction(onCancel)}
              >
                Cancelar
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}