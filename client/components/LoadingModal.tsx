import { LoadingModalProps } from "@/interfaces/interfaces";
import * as React from "react";

export default function LoadingModal({
  open,
  title,
  description,
}: LoadingModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4 shadow-lg">
        <div className="w-16 h-16 border-4 border-t-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        {title && (
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        )}
        {description && <p className="text-sm text-slate-600">{description}</p>}
      </div>
    </div>
  );
}
