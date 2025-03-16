// components/SensorGauge.tsx
import React from "react";

interface SensorGaugeProps {
  value: number;
  min?: number;
  max?: number;
  title?: string;
  unit?: string;
  color?: string;
  size?: number;
}

const SensorGauge: React.FC<SensorGaugeProps> = ({
  value,
  min = 0,
  max = 100,
  title,
  unit = "",
  color = "#3B82F6",
  size = 120,
}) => {
  // Normalize the value to a percentage
  const normalizedValue = Math.min(Math.max((value - min) / (max - min), 0), 1);

  // Calculate the angle for the gauge needle
  const angle = normalizedValue * 180;

  // Calculate coordinates for the needle
  const radius = (size * 0.8) / 2;
  const radians = (angle - 90) * (Math.PI / 180);
  const x = radius * Math.cos(radians) + size / 2;
  const y = radius * Math.sin(radians) + size / 2;

  // Generate threshold colors based on value
  const getColor = (): string => {
    if (normalizedValue < 0.3) return "#10B981"; // Green for low values
    if (normalizedValue < 0.7) return "#F59E0B"; // Yellow for mid values
    return "#EF4444"; // Red for high values
  };

  const gaugeColor = color === "auto" ? getColor() : color;

  return (
    <div className="flex flex-col items-center">
      {title && <p className="text-sm font-medium mb-2">{title}</p>}
      <svg
        width={size}
        height={size / 2 + 10}
        viewBox={`0 0 ${size} ${size / 2 + 10}`}
      >
        {/* Background arc */}
        <path
          d={`M ${size * 0.1} ${size / 2} A ${radius} ${radius} 0 0 1 ${size * 0.9} ${size / 2}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={size * 0.05}
          strokeLinecap="round"
        />

        {/* Value arc */}
        <path
          d={`M ${size * 0.1} ${size / 2} A ${radius} ${radius} 0 0 1 ${x} ${y}`}
          fill="none"
          stroke={gaugeColor}
          strokeWidth={size * 0.05}
          strokeLinecap="round"
        />

        {/* Center point */}
        <circle cx={size / 2} cy={size / 2} r={size * 0.03} fill="#6B7280" />

        {/* Needle */}
        <line
          x1={size / 2}
          y1={size / 2}
          x2={x}
          y2={y}
          stroke="#374151"
          strokeWidth={size * 0.02}
          strokeLinecap="round"
        />

        {/* Min label */}
        <text
          x={size * 0.1}
          y={size / 2 + 15}
          fill="#6B7280"
          fontSize={size * 0.07}
          textAnchor="middle"
        >
          {min}
        </text>

        {/* Max label */}
        <text
          x={size * 0.9}
          y={size / 2 + 15}
          fill="#6B7280"
          fontSize={size * 0.07}
          textAnchor="middle"
        >
          {max}
        </text>

        {/* Value label */}
        <text
          x={size / 2}
          y={size / 2 + size * 0.2}
          fill="#111827"
          fontSize={size * 0.12}
          fontWeight="bold"
          textAnchor="middle"
        >
          {value.toFixed(1)}
          <tspan fontSize={size * 0.07} dy={-size * 0.02}>
            {unit}
          </tspan>
        </text>
      </svg>
    </div>
  );
};

export default SensorGauge;
