'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/Card';

export function CategoryChart({ dados }: { dados: { categoria: string; total: number }[] }) {
  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-ink-800">Chamados por categoria</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dados}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e6eaee" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#576a7d' }} />
            <YAxis
              type="category"
              dataKey="categoria"
              width={110}
              tick={{ fontSize: 12, fill: '#576a7d' }}
            />
            <Tooltip
              cursor={{ fill: '#f4f6f8' }}
              contentStyle={{ borderRadius: 8, borderColor: '#e6eaee', fontSize: 13 }}
            />
            <Bar dataKey="total" fill="#187b7c" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
