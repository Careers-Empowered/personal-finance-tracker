import { useState } from "react";
import type { TrendDataPoint } from "../types/dashboard";

interface MonthlyTrendProps {
  data?: TrendDataPoint[];
  title?: string;
  description?: string;
  granularity?: "month" | "day";
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(amount);

const formatMonth = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(new Date(`${date}-01T00:00:00`));

const formatDay = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));

const MonthlyTrend = ({
  data = [],
  title = "Monthly trend",
  description = "Income and expenses over the last six months",
  granularity = "month",
}: MonthlyTrendProps) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    index: number;
    metric: "income" | "expenses";
  } | null>(null);

  if (data.length === 0) {
    return (
      <section className="dashboard-section">
        <div className="empty-state">
          No monthly trend data available
        </div>
      </section>
    );
  }

  const width = 640;
  const height = 220;

  const padding = {
    top: 18,
    right: 18,
    bottom: 32,
    left: 46,
  };

  const maxValue = Math.max(
    ...data.flatMap((point) => [
      point.income,
      point.expenses,
    ]),
    1,
  );

  const chartWidth =
    width - padding.left - padding.right;

  const chartHeight =
    height - padding.top - padding.bottom;

  const getX = (index: number) =>
    padding.left +
    (index * chartWidth) /
      Math.max(data.length - 1, 1);

  const getY = (value: number) =>
    padding.top +
    chartHeight -
    (value / maxValue) * chartHeight;

  const makePoints = (
    key: "income" | "expenses",
  ) =>
    data
      .map(
        (point, index) =>
          `${getX(index)},${getY(point[key])}`,
      )
      .join(" ");

  const gridValues = [0, 0.5, 1].map((ratio) =>
    Math.round(maxValue * ratio),
  );

  const tooltipPoint = hoveredPoint
    ? data[hoveredPoint.index]
    : null;

  const tooltipValue =
    tooltipPoint && hoveredPoint
      ? tooltipPoint[hoveredPoint.metric]
      : 0;

  const tooltipX = hoveredPoint
    ? Math.min(
        Math.max(
          getX(hoveredPoint.index) - 52,
          padding.left,
        ),
        width - padding.right - 104,
      )
    : 0;

  const tooltipY = hoveredPoint
    ? Math.max(
        getY(tooltipValue) - 38,
        4,
      )
    : 0;

  const formatLabel =
    granularity === "day"
      ? formatDay
      : formatMonth;

  return (
    <section className="dashboard-section monthly-trend-section">
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <div className="trend-legend">
          <span>
            <i className="trend-legend__dot trend-legend__dot--income" />
            Income
          </span>

          <span>
            <i className="trend-legend__dot trend-legend__dot--expense" />
            Expenses
          </span>
        </div>
      </div>

      <div className="monthly-trend-chart">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Monthly income and expense trend"
          onMouseLeave={() =>
            setHoveredPoint(null)
          }
        >
          {/* Grid lines and Y-axis labels */}
          {gridValues.map((value) => (
            <g key={value}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={getY(value)}
                y2={getY(value)}
                className="trend-grid-line"
              />

              <text
                x={padding.left - 9}
                y={getY(value) + 4}
                className="trend-axis-label"
                textAnchor="end"
              >
                {formatCurrency(value)}
              </text>
            </g>
          ))}

          {/* Income line */}
          <polyline
            points={makePoints("income")}
            className="trend-line trend-line--income"
          />

          {/* Expense line */}
          <polyline
            points={makePoints("expenses")}
            className="trend-line trend-line--expense"
          />

          {/* Data points */}
          {data.map((point, index) => (
            <g key={`${point.date}-${index}`}>
              {/* Income point */}
              <circle
                cx={getX(index)}
                cy={getY(point.income)}
                r="6"
                className="trend-point trend-point--income"
                tabIndex={0}
                onMouseEnter={() =>
                  setHoveredPoint({
                    index,
                    metric: "income",
                  })
                }
                onFocus={() =>
                  setHoveredPoint({
                    index,
                    metric: "income",
                  })
                }
              />

              {/* Expense point */}
              <circle
                cx={getX(index)}
                cy={getY(point.expenses)}
                r="6"
                className="trend-point trend-point--expense"
                tabIndex={0}
                onMouseEnter={() =>
                  setHoveredPoint({
                    index,
                    metric: "expenses",
                  })
                }
                onFocus={() =>
                  setHoveredPoint({
                    index,
                    metric: "expenses",
                  })
                }
              />

              {/* X-axis label */}
              <text
                x={getX(index)}
                y={height - 8}
                className="trend-axis-label"
                textAnchor="middle"
              >
                {point.label ?? formatLabel(point.date)}
              </text>
            </g>
          ))}

          {/* Tooltip */}
          {tooltipPoint && hoveredPoint && (
            <g
              className="trend-tooltip"
              pointerEvents="none"
            >
              <rect
                x={tooltipX}
                y={tooltipY}
                width="104"
                height="29"
                rx="5"
              />

              <text
                x={tooltipX + 8}
                y={tooltipY + 12}
              >
                {pointLabel(tooltipPoint, formatLabel)}{" "}
                ·{" "}
                {hoveredPoint.metric === "income"
                  ? "Income"
                  : "Expenses"}
              </text>

              <text
                x={tooltipX + 8}
                y={tooltipY + 23}
              >
                {formatCurrency(tooltipValue)}
              </text>
            </g>
          )}
        </svg>
      </div>
    </section>
  );
};

const pointLabel = (
  point: TrendDataPoint,
  fallbackFormatter: (date: string) => string,
) => point.label ?? fallbackFormatter(point.date);

export default MonthlyTrend;