import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private dateRange(year: number, month: number) {
    if (month > 0 && month <= 12) {
      const start = `${year}-${String(month).padStart(2, '0')}-01`;
      const end = new Date(year, month, 0).toISOString().split('T')[0];
      return { start, end };
    }
    return { start: `${year}-01-01`, end: `${year}-12-31` };
  }

  async getStats(year: number, month: number) {
    const { start, end } = this.dateRange(year, month);
    const currentDate = new Date();
    const currentMonthStart = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
    const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

    const [rows, tratamentos, seguimento, totalMes] = await Promise.all([
      // Totais gerais do período
      this.prisma.$queryRawUnsafe<any[]>(`
        SELECT
          COUNT(*) AS total,
          COUNT(DISTINCT nome_paciente) AS pacientes,
          COUNT(*) FILTER (WHERE status_comparecimento = 'Não Compareceu') AS nao_compareceu
        FROM appointments
        WHERE data_atendimento >= '${start}'::date AND data_atendimento <= '${end}'::date + interval '1 day'
      `),

      // Pacientes por tipo de tratamento (1ª vez) no período
      this.prisma.$queryRawUnsafe<any[]>(`
        WITH primeiros AS (
          SELECT DISTINCT ON (nome_paciente) nome_paciente, tipo_tratamento, data_atendimento
          FROM appointments
          ORDER BY nome_paciente, data_atendimento ASC
        )
        SELECT
          nome_paciente AS nome,
          tipo_tratamento,
          data_atendimento
        FROM primeiros
        WHERE data_atendimento >= $1::date AND data_atendimento <= $2::date + interval '1 day'
      `, start, end),

      // Pacientes em seguimento (Controle ou Paliativo - tratamento continuado)
      this.prisma.$queryRawUnsafe<any[]>(`
        SELECT DISTINCT ON (nome_paciente)
          nome_paciente AS nome,
          tipo_tratamento,
          data_atendimento
        FROM appointments
        WHERE data_atendimento >= $1::date AND data_atendimento <= $2::date + interval '1 day'
          AND tipo_tratamento IN ('Controle', 'Paliativo')
        ORDER BY nome_paciente, data_atendimento DESC
      `, start, end),

      // Total de atendimentos no mês corrente (sempre, independente do filtro)
      this.prisma.$queryRawUnsafe<any[]>(`
        SELECT COUNT(*) AS total FROM appointments
        WHERE data_atendimento >= $1::date AND data_atendimento <= $2::date + interval '1 day'
      `, currentMonthStart, currentMonthEnd),
    ]);

    const total = Number(rows[0].total) || 0;
    const pacientes = Number(rows[0].pacientes) || 0;
    const naoCompareceu = Number(rows[0].nao_compareceu) || 0;

    // Separar primeiros atendimentos por tipo de tratamento
    const primeiraVezQuimio = tratamentos.filter(t => t.tipo_tratamento === 'Quimioterapia');
    const primeiraVezRadio = tratamentos.filter(t => t.tipo_tratamento === 'Radioterapia');
    const primeiraVezQuimioRadio = tratamentos.filter(t => t.tipo_tratamento === 'Quimio_Radio');

    return {
      totalAtendimentos: total,
      pacientesAtendidos: pacientes,
      taxaAbsenteismo: total > 0 ? Math.round((naoCompareceu / total) * 100) : 0,
      totalAtendimentosMesAtual: Number(totalMes[0]?.total) || 0,
      periodo: { year, month },

      // Métricas de 1ª vez
      primeiraVezQuimio: {
        total: primeiraVezQuimio.length,
        pacientes: primeiraVezQuimio.map(p => ({ nome: p.nome, data: p.data_atendimento })),
      },
      primeiraVezRadio: {
        total: primeiraVezRadio.length,
        pacientes: primeiraVezRadio.map(p => ({ nome: p.nome, data: p.data_atendimento })),
      },
      primeiraVezQuimioRadio: {
        total: primeiraVezQuimioRadio.length,
        pacientes: primeiraVezQuimioRadio.map(p => ({ nome: p.nome, data: p.data_atendimento })),
      },

      // Pacientes em seguimento
      emSeguimento: {
        total: seguimento.length,
        pacientes: seguimento.map(p => ({ nome: p.nome, tipo: p.tipo_tratamento, data: p.data_atendimento })),
      },

      // Óbitos (Removido pois não temos mais rastreio de status de paciente isolado)
      obitos: {
        total: 0,
        pacientes: [],
      },
    };
  }

  async getCharts(year: number, month: number) {
    const { start, end } = this.dateRange(year, month);
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;

    const [topCids, porTratamento, porEncaminhamento, volume] = await Promise.all([
      this.prisma.$queryRawUnsafe<any[]>(`
        SELECT cid, COUNT(*) AS count FROM appointments
        WHERE data_atendimento BETWEEN $1::date AND $2::date + interval '1 day'
        GROUP BY cid ORDER BY count DESC LIMIT 5
      `, start, end),

      this.prisma.$queryRawUnsafe<any[]>(`
        SELECT tipo_tratamento AS tipo, COUNT(*) AS count FROM appointments
        WHERE data_atendimento BETWEEN $1::date AND $2::date + interval '1 day'
        GROUP BY tipo_tratamento
      `, start, end),

      this.prisma.$queryRawUnsafe<any[]>(`
        SELECT encaminhamento, COUNT(*) AS count FROM appointments
        WHERE data_atendimento BETWEEN $1::date AND $2::date + interval '1 day'
        GROUP BY encaminhamento
      `, start, end),

      this.prisma.$queryRawUnsafe<any[]>(`
        SELECT EXTRACT(MONTH FROM data_atendimento) AS mes, COUNT(*) AS count
        FROM appointments WHERE data_atendimento BETWEEN $1::date AND $2::date + interval '1 day'
        GROUP BY mes ORDER BY mes
      `, yearStart, yearEnd),
    ]);

    const volumeMensal = Array.from({ length: 12 }, (_, i) => {
      const found = volume.find(r => Number(r.mes) === i + 1);
      return { mes: i + 1, count: found ? Number(found.count) : 0 };
    });

    const obitosPorMes = Array.from({ length: 12 }, (_, i) => {
      return { mes: i + 1, count: 0 };
    });

    return {
      topCids: topCids.map(r => ({ cid: r.cid, count: Number(r.count) })),
      porTipoTratamento: porTratamento.map(r => ({ tipo: r.tipo, count: Number(r.count) })),
      porEncaminhamento: porEncaminhamento.map(r => ({ encaminhamento: r.encaminhamento, count: Number(r.count) })),
      volumeMensal,
      obitosPorMes,
    };
  }
}
