'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/Card';
import { STATUS_LABEL } from '@/lib/constants';
import type { StatusChamado } from '@/types';

const CORES_STATUS: Record<StatusChamado, string> = {
  aberto: '#c2620a',
  em_andamento: '#1d5fbf',
  resolvido: '#1a8a5f',
  fechado: '#5b6472',
};

export function StatusChart({ dados }: { dados: { status: StatusChamado; total: number }[] }) {
  const dadosFormatados = dados.map((item) => ({ nome: STATUS_LABEL[item.status], total: item.total, status: item.status }));

  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-ink-800">Chamados por status</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosFormatados} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6eaee" vertical={false} />
            <XAxis dataKey="nome" tick={{ fontSize: 12, fill: '#576a7d' }} axisLine={{ stroke: '#e6eaee' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#576a7d' }} axisLine={{ stroke: '#e6eaee' }} />
            <Tooltip
              cursor={{ fill: '#f4f6f8' }}
              contentStyle={{ borderRadius: 8, borderColor: '#e6eaee', fontSize: 13 }}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {dadosFormatados.map((item) => (
                <Cell key={item.status} fill={CORES_STATUS[item.status]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
