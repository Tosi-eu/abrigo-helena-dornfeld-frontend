import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardStatsCardProps {
  label: string;
  value: number | string;
  onClick: () => void;
}

export const DashboardStatsCard = memo(function DashboardStatsCard({
  label,
  value,
  onClick,
}: DashboardStatsCardProps) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
    >
      <CardContent className="flex flex-col items-center py-8">
        <p className="text-sm text-muted-foreground mb-2 text-center">
          {label}
        </p>
        <p className="text-5xl font-bold text-sky-700">{value}</p>
      </CardContent>
    </Card>
  );
});
