
import * as React from "react";
import * as RechartsPrimitive from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  ChartConfig
} from "@/components/ui/chart";

// A properly typed ChartTooltipContent component for our needs
const CustomChartTooltipContent = ({
  formatter,
  label,
  nameKey,
  payload,
  ...props
}: {
  formatter?: (value: any) => any;
  label?: string;
  nameKey?: string;
  payload?: any[];
} & React.ComponentPropsWithoutRef<"div">) => {
  if (!payload || payload.length === 0) {
    return null;
  }
  
  return (
    <div className="rounded-md border bg-background p-2 shadow-md">
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <p className="font-medium">{label}</p>
        <div className="border-l pl-2">
          {payload.map((entry, index) => (
            <p
              key={`item-${index}`}
              className="flex items-center gap-2 font-medium"
              style={{ color: entry.color }}
            >
              {formatter ? formatter(entry.value) : entry.value}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

// A properly typed ChartLegendContent component for our needs
const CustomChartLegendContent = ({
  payload,
  nameKey,
  ...props
}: {
  payload?: any[];
  nameKey?: string;
} & React.ComponentPropsWithoutRef<"div">) => {
  if (!payload || payload.length === 0) {
    return null;
  }
  
  return (
    <ul className="flex flex-wrap items-center gap-4">
      {payload.map((entry, index) => (
        <li key={`item-${index}`} className="flex items-center gap-1">
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

export function BarChart(props: any) {
  const {
    data = [],
    index,
    categories,
    colors = ["primary"],
    valueFormatter,
    showAnimation = true,
    showLegend = true,
    showXAxis = true,
    showYAxis = true,
    showGridLines = true,
    ...rest
  } = props;

  const config = React.useMemo(() => {
    return categories.reduce((acc: ChartConfig, category: string, i: number) => {
      acc[category] = {
        label: category,
        color: `hsl(var(--${colors[i % colors.length]}))`,
      };
      return acc;
    }, {});
  }, [categories, colors]);

  return (
    <ChartContainer config={config} {...rest}>
      <RechartsPrimitive.BarChart data={data}>
        {showGridLines && (
          <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" vertical={false} />
        )}
        {showXAxis && (
          <RechartsPrimitive.XAxis
            dataKey={index}
            tickLine={false}
            axisLine={false}
            padding={{ left: 10, right: 10 }}
          />
        )}
        {showYAxis && (
          <RechartsPrimitive.YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={valueFormatter}
          />
        )}
        <RechartsPrimitive.Tooltip
          content={<CustomChartTooltipContent formatter={valueFormatter} label={index} />}
        />
        {showLegend && (
          <RechartsPrimitive.Legend
            content={<CustomChartLegendContent />}
            verticalAlign="top"
          />
        )}
        {categories.map((category: string, i: number) => (
          <RechartsPrimitive.Bar
            key={category}
            dataKey={category}
            fill={`hsl(var(--${colors[i % colors.length]}))`}
            radius={4}
            isAnimationActive={showAnimation}
          />
        ))}
      </RechartsPrimitive.BarChart>
    </ChartContainer>
  );
}

export function AreaChart(props: any) {
  const {
    data = [],
    index,
    categories,
    colors = ["primary"],
    valueFormatter,
    showAnimation = true,
    showLegend = true,
    showXAxis = true,
    showYAxis = true,
    showGridLines = true,
    ...rest
  } = props;

  const config = React.useMemo(() => {
    return categories.reduce((acc: ChartConfig, category: string, i: number) => {
      acc[category] = {
        label: category,
        color: `hsl(var(--${colors[i % colors.length]}))`,
      };
      return acc;
    }, {});
  }, [categories, colors]);

  return (
    <ChartContainer config={config} {...rest}>
      <RechartsPrimitive.AreaChart data={data}>
        {showGridLines && (
          <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" vertical={false} />
        )}
        {showXAxis && (
          <RechartsPrimitive.XAxis
            dataKey={index}
            tickLine={false}
            axisLine={false}
            padding={{ left: 10, right: 10 }}
          />
        )}
        {showYAxis && (
          <RechartsPrimitive.YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={valueFormatter}
          />
        )}
        <RechartsPrimitive.Tooltip
          content={<CustomChartTooltipContent formatter={valueFormatter} label={index} />}
        />
        {showLegend && (
          <RechartsPrimitive.Legend
            content={<CustomChartLegendContent />}
            verticalAlign="top"
          />
        )}
        {categories.map((category: string, i: number) => (
          <RechartsPrimitive.Area
            key={category}
            type="monotone"
            dataKey={category}
            fill={`hsl(var(--${colors[i % colors.length]}))`}
            stroke={`hsl(var(--${colors[i % colors.length]}))`}
            fillOpacity={0.1}
            isAnimationActive={showAnimation}
          />
        ))}
      </RechartsPrimitive.AreaChart>
    </ChartContainer>
  );
}

export function PieChart(props: any) {
  const {
    data = [],
    index,
    category,
    colors = ["primary"],
    valueFormatter,
    showAnimation = true,
    showTooltip = true,
    showLegend = true,
    ...rest
  } = props;

  const config = React.useMemo(() => {
    return data.reduce((acc: ChartConfig, dataItem: any, i: number) => {
      const name = dataItem[index];
      acc[name] = {
        label: name,
        color: `hsl(var(--${colors[i % colors.length]}))`,
      };
      return acc;
    }, {});
  }, [data, index, colors]);

  return (
    <ChartContainer config={config} {...rest}>
      <RechartsPrimitive.PieChart>
        <RechartsPrimitive.Pie
          data={data}
          nameKey={index}
          dataKey={category}
          cx="50%"
          cy="50%"
          outerRadius={80}
          labelLine={false}
          label={(entry) => entry[index]}
          isAnimationActive={showAnimation}
        >
          {data.map((entry: any, i: number) => (
            <RechartsPrimitive.Cell
              key={`cell-${i}`}
              fill={`hsl(var(--${colors[i % colors.length]}))`}
            />
          ))}
        </RechartsPrimitive.Pie>
        {showTooltip && (
          <RechartsPrimitive.Tooltip
            content={<CustomChartTooltipContent formatter={valueFormatter} label={index} nameKey={index} />}
          />
        )}
        {showLegend && (
          <RechartsPrimitive.Legend
            content={<CustomChartLegendContent nameKey={index} />}
            verticalAlign="bottom"
          />
        )}
      </RechartsPrimitive.PieChart>
    </ChartContainer>
  );
}
