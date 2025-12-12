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
  onRemove,
}: NotificationCardProps) {
  const [visible, setVisible] = useState(true);

  const handleAction = async (action: () => Promise<void>) => {
    await action();
    setVisible(false);
    onRemove?.();
  };

  return (
    <div
      className={`transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      <Card className="relative shadow-sm hover:shadow-md border-slate-200 transition-all duration-200 rounded-xl">
        {onEdit && (
          <button
            onClick={onEdit}
            className="absolute top-3 right-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Pencil className="w-4 h-4 text-slate-600" />
          </button>
        )}

        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-slate-800">
            {residentName}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 text-sm text-slate-700">
          <ul className="space-y-1">
            <li>
              <span className="font-medium text-slate-800">Medicamento:</span>{" "}
              {medicineName}
            </li>
            <li>
              <span className="font-medium text-slate-800">Data prevista:</span>{" "}
              {dateToGo}
            </li>
            <li>
              <span className="font-medium text-slate-800">Destino:</span>{" "}
              {destiny}
            </li>
            <li>
              <span className="font-medium text-slate-800">Criado por:</span>{" "}
              {createdBy}
            </li>
          </ul>

          <div className="flex gap-3 pt-3">
            {onComplete && (
              <button
                className="
                  bg-green-600 
                  hover:bg-green-700 
                  text-white 
                  px-4 py-2 
                  rounded-lg 
                  text-sm 
                  font-medium 
                  transition
                "
                onClick={() => handleAction(onComplete)}
              >
                Concluir
              </button>
            )}

            {onCancel && (
              <button
                className="
                  bg-red-600 
                  hover:bg-red-700 
                  text-white 
                  px-4 py-2 
                  rounded-lg 
                  text-sm 
                  font-medium 
                  transition
                "
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