"use client";

import React from 'react';
import { TelemetryData } from '@prisma/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TelemetryChartsProps {
  telemetry: TelemetryData[];
}

const TelemetryCharts: React.FC<TelemetryChartsProps> = ({ telemetry }) => {
  if (!telemetry || telemetry.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">No telemetry data available to display charts.</p>;
  }

  // Format data for charts - Recharts expects an array of objects
  // We'll sort by timestamp ascending for the charts
  const chartData = telemetry
    .map(t => ({
      ...t,
      timestamp: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      // Ensure array fields are present, defaulting to empty arrays if null/undefined
      voltage: t.voltage || [],
      current: t.current || [],
      power: t.power || [],
      powerFactor: t.powerFactor || [],
    }))
    .sort((a, b) => new Date(telemetry.find(tel => tel.timestamp === a.timestamp)!.timestamp).getTime() - new Date(telemetry.find(tel => tel.timestamp === b.timestamp)!.timestamp).getTime());


  const renderLineChart = (dataKeyPrefix: string, yAxisLabel: string, dataKeys: string[], colors: string[]) => {
    // Check if there's any valid data for this specific chart type
    const hasDataForChart = chartData.some(d =>
        (d[dataKeyPrefix as keyof typeof d] as number[] | undefined)?.some(val => typeof val === 'number')
    );

    if (!hasDataForChart && dataKeyPrefix !== 'temperature') { // temperature is a single value
        return <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">No {yAxisLabel.toLowerCase()} data available.</p>;
    }
    if (dataKeyPrefix === 'temperature' && !chartData.some(d => typeof d.temperature === 'number')) {
        return <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">No {yAxisLabel.toLowerCase()} data available.</p>;
    }


    return (
      <div className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow">
        <h4 className="text-md font-semibold mb-4 text-neutral-700 dark:text-neutral-300">{yAxisLabel} Over Time</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis dataKey="timestamp" />
            <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#666' }} />
            <Tooltip
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(2px)', border: '1px solid #ccc' }}
                itemStyle={{ color: '#333' }}
            />
            <Legend />
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={`${dataKeyPrefix}[${index}]`} // Access array elements for V, I, P, PF
                name={key}
                stroke={colors[index % colors.length]}
                dot={{ r: 2 }}
                activeDot={{ r: 5 }}
                connectNulls // Important if some data points are missing for a phase
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderSingleValueLineChart = (dataKey: keyof TelemetryData, yAxisLabel: string, color: string) => {
     const hasDataForChart = chartData.some(d => typeof d[dataKey] === 'number');
     if (!hasDataForChart) {
        return <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">No {yAxisLabel.toLowerCase()} data available.</p>;
    }
    return (
      <div className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow">
        <h4 className="text-md font-semibold mb-4 text-neutral-700 dark:text-neutral-300">{yAxisLabel} Over Time</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis dataKey="timestamp" />
            <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#666' }} />
            <Tooltip
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(2px)', border: '1px solid #ccc' }}
                itemStyle={{ color: '#333' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              name={yAxisLabel}
              stroke={color}
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const phaseColors = ["#8884d8", "#82ca9d", "#ffc658"];

  return (
    <section id="telemetry-charts">
      {renderLineChart("voltage", "Voltage (V)", ["Phase 1 (V1)", "Phase 2 (V2)", "Phase 3 (V3)"], phaseColors)}
      {renderLineChart("current", "Current (A)", ["Phase 1 (I1)", "Phase 2 (I2)", "Phase 3 (I3)"], phaseColors)}
      {renderLineChart("power", "Power (kW)", ["Phase 1 (P1)", "Phase 2 (P2)", "Phase 3 (P3)"], phaseColors)}
      {renderLineChart("powerFactor", "Power Factor", ["Phase 1 (PF1)", "Phase 2 (PF2)", "Phase 3 (PF3)"], phaseColors)}
      {renderSingleValueLineChart("temperature", "Temperature (°C)", "#fa8072")}
    </section>
  );
};

export default TelemetryCharts;
