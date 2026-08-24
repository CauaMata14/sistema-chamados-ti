import { Ticket } from '../models/Ticket';

interface ContagemStatus {
  status: string;
  total: number;
}

interface ContagemCategoria {
  categoriaId: string;
  categoria: string;
  total: number;
}

export interface MetricasDashboard {
  totalChamados: number;
  porStatus: ContagemStatus[];
  porCategoria: ContagemCategoria[];
  tempoMedioResolucaoHoras: number | null;
}

export async function obterMetricas(): Promise<MetricasDashboard> {
  const [totalChamados, porStatusAgg, porCategoriaAgg, tempoResolucaoAgg] = await Promise.all([
    Ticket.countDocuments(),

    Ticket.aggregate<{ _id: string; total: number }>([
      { $group: { _id: '$status', total: { $sum: 1 } } },
    ]),

    Ticket.aggregate<{ _id: string; categoria: string; total: number }>([
      { $group: { _id: '$categoria', total: { $sum: 1 } } },
      {
        $lookup: {
          from: 'categorias',
          localField: '_id',
          foreignField: '_id',
          as: 'categoriaInfo',
        },
      },
      { $unwind: { path: '$categoriaInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          total: 1,
          categoria: { $ifNull: ['$categoriaInfo.nome', 'Sem categoria'] },
        },
      },
      { $sort: { total: -1 } },
    ]),

    Ticket.aggregate<{ mediaMs: number }>([
      { $match: { resolvedAt: { $ne: null } } },
      {
        $project: {
          diffMs: { $subtract: ['$resolvedAt', '$createdAt'] },
        },
      },
      { $group: { _id: null, mediaMs: { $avg: '$diffMs' } } },
    ]),
  ]);

  const tempoMedioResolucaoHoras = tempoResolucaoAgg[0]
    ? Number((tempoResolucaoAgg[0].mediaMs / 1000 / 60 / 60).toFixed(1))
    : null;

  return {
    totalChamados,
    porStatus: porStatusAgg.map((item) => ({ status: item._id, total: item.total })),
    porCategoria: porCategoriaAgg.map((item) => ({
      categoriaId: String(item._id),
      categoria: item.categoria,
      total: item.total,
    })),
    tempoMedioResolucaoHoras,
  };
}
