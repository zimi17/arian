import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Code } from '../../types';

interface CodeFrequencyChartsProps {
  codes: Code[];
  width?: number;
  height?: number;
}

// Color palette for charts
const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'];

export const CodeFrequencyCharts: React.FC<CodeFrequencyChartsProps> = ({ 
  codes, 
  width = 600, 
  height = 400 
}) => {
  // Prepare data for charts - top 10 codes by frequency
  const topCodes = [...codes]
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10)
    .map(code => ({
      name: code.name.length > 15 ? `${code.name.substring(0, 12)}...` : code.name,
      frequency: code.frequency,
      id: code.id
    }));

  return (
    <div className="code-frequency-charts w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Code Frequency - Bar Chart</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topCodes}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  tick={{ fontSize: 10 }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [value, 'Frequency']}
                  labelFormatter={(label) => `Code: ${label}`}
                />
                <Legend />
                <Bar dataKey="frequency" name="Frequency" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Code Distribution - Pie Chart</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topCodes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="frequency"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {topCodes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [value, 'Frequency']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};