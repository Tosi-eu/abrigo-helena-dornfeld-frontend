import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { StockDistributionItem } from "@/interfaces/interfaces";
import { useState } from "react";

interface StockProportionCardProps {
  title: string;
  data: StockDistributionItem[];
  colors: string[];
}

export default function StockProportionCard({
  title,
  data,
  colors,
}: StockProportionCardProps) {
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
    } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ transition: "all 0.3s ease", opacity: 1 }}
        />
      </g>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
          <div className="w-full lg:w-1/2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  outerRadius={80}
                  activeIndex={activePieIndex ?? undefined}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, i) => setActivePieIndex(i)}
                  onMouseLeave={() => setActivePieIndex(null)}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(_v: any, _n: string, p: any) => [
                    p.payload.rawValue,
                    "Quantidade",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-sm text-slate-700">
            {data.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[i % colors.length] }}
                />
                <span>
                  {item.name}: <b>{item.value}%</b>
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
