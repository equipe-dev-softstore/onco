"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

export default function RelatoriosPage() {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/reports/export?year=${year}&month=${month}`);
      if (res?.success && res.data) {
        if (res.data.length === 0) {
          toast.warning("Nenhum dado encontrado para o período");
          return;
        }

        const exportData = res.data.map((item: any) => ({
          'ID Atendimento': item.id,
          'Data do Atendimento': new Date(item.data_atendimento).toLocaleString('pt-BR'),
          'Nome do Paciente': item.patient?.nome,
          'CPF': item.patient?.cpf,
          'Tipo de Atendimento': item.tipo_atendimento.replace('_', ' '),
          'Tratamento': item.tipo_tratamento.replace('_', ' '),
          'CID': item.cid,
          'Comparecimento': item.status_comparecimento.replace('_', ' '),
          'Encaminhamento': item.encaminhamento.replace('_', ' '),
          'Observações': item.observacoes || ''
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Atendimentos");
        
        XLSX.writeFile(wb, `Relatorio_Atendimentos_${String(month).padStart(2,'0')}_${year}.xlsx`);
        toast.success("Relatório gerado com sucesso");
      } else {
        toast.error("Erro ao gerar relatório");
      }
    } catch (e) {
      toast.error("Erro interno");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">Exportação de dados para planilhas.</p>
      </div>

      <Card className="max-w-md shadow-sm border-t-4 border-t-info">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileSpreadsheet size={20} className="text-info" /> Exportar Atendimentos</CardTitle>
          <CardDescription>Selecione o período para gerar a planilha Excel (.xlsx).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mês</label>
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({length: 12}, (_, i) => (
                    <SelectItem key={i+1} value={String(i+1)}>{new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ano</label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[year-2, year-1, year, year+1].map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleExport} disabled={loading} className="w-full gap-2">
            <Download size={16} /> {loading ? "Gerando..." : "Baixar Planilha (XLSX)"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
