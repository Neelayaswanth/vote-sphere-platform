
import * as React from "react";
import * as RechartsPrimitive from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  ChartConfig
} from "@/components/ui/chart";

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
          content={<ChartTooltipContent formatter={valueFormatter} label={index} />}
        />
        {showLegend && (
          <RechartsPrimitive.Legend
            content={<ChartLegendContent />}
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
          content={<ChartTooltipContent formatter={valueFormatter} label={index} />}
        />
        {showLegend && (
          <RechartsPrimitive.Legend
            content={<ChartLegendContent />}
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
            content={<ChartTooltipContent formatter={valueFormatter} label={index} nameKey={index} />}
          />
        )}
        {showLegend && (
          <RechartsPrimitive.Legend
            content={<ChartLegendContent nameKey={index} />}
            verticalAlign="bottom"
          />
        )}
      </RechartsPrimitive.PieChart>
    </ChartContainer>
  );
}
