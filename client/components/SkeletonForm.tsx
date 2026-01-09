import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonFormProps {
  fields?: number;
}

export function SkeletonForm({ fields = 5 }: SkeletonFormProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-6">
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="space-y-6">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

