"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";
import { Plus, Edit2 } from "lucide-react";

export default function AtendimentosPage() {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({
    TIPO_ATENDIMENTO: [], TIPO_TRATAMENTO: [], ENCAMINHAMENTO: [], STATUS_COMPARECIMENTO: []
  });

  const [formData, setFormData] = useState({ 
    id: "", nome_paciente: "", data_atendimento: "", tipo_tratamento: "", 
    status_comparecimento: "", encaminhamento: "", 
    tipo_atendimento: "", cid: "", observacoes: "" 
  });

  const loadData = async (page = 1) => {
    setLoading(true);
    const query = new URLSearchParams({ page: String(page), limit: "10" });
    const res = await apiFetch(`/appointments?${query.toString()}`);
    if (res?.success) {
      setData(res.data);
      setMeta(res.meta);
    }
    setLoading(false);
  };

  const loadFieldOptions = async () => {
    const res = await apiFetch('/field-options');
    const data = Array.isArray(res) ? res : res?.data || [];
    const grouped = data.reduce((acc: any, opt: any) => {
      if (!acc[opt.category]) acc[opt.category] = [];
      if (opt.active) acc[opt.category].push(opt);
      return acc;
    }, {
      TIPO_ATENDIMENTO: [], TIPO_TRATAMENTO: [], ENCAMINHAMENTO: [], STATUS_COMPARECIMENTO: []
    });
    setFieldOptions(grouped);
    return grouped;
  };

  useEffect(() => { 
    loadData(); 
    loadFieldOptions();
  }, []);

  const handleOpenNew = () => {
    setIsEdit(false);
    setFormData({ 
      id: "", nome_paciente: "", 
      data_atendimento: new Date().toISOString().slice(0, 16), 
      tipo_tratamento: fieldOptions.TIPO_TRATAMENTO[0]?.value || "", 
      status_comparecimento: fieldOptions.STATUS_COMPARECIMENTO[0]?.value || "", 
      encaminhamento: fieldOptions.ENCAMINHAMENTO[0]?.value || "", 
      tipo_atendimento: fieldOptions.TIPO_ATENDIMENTO[0]?.value || "", 
      cid: "", observacoes: "" 
    });
    setOpen(true);
  };

  const handleOpenEdit = async (id: string) => {
    const res = await apiFetch(`/appointments/${id}`);
    if (res?.success) {
      const p = res.data;
      setFormData({
        id: p.id,
        nome_paciente: p.nome_paciente,
        data_atendimento: p.data_atendimento?.slice(0, 16) || "",
        tipo_tratamento: p.tipo_tratamento,
        status_comparecimento: p.status_comparecimento,
        encaminhamento: p.encaminhamento,
        tipo_atendimento: p.tipo_atendimento,
        cid: p.cid,
        observacoes: p.observacoes || ""
      });
      setIsEdit(true);
      setOpen(true);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const { id, ...data } = formData;
    const payload = { ...data };
    payload.data_atendimento = new Date(payload.data_atendimento).toISOString();

    const url = isEdit ? `/appointments/${id}` : '/appointments';
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await apiFetch(url, {
      method,
      body: JSON.stringify(payload)
    });

    setSubmitting(false);
    if (res?.success) {
      toast.success(`Atendimento ${isEdit ? 'atualizado' : 'registrado'}`);
      setOpen(false);
      loadData(isEdit ? meta.page : 1);
    } else {
      toast.error(res?.message || res?.error || "Erro no formulário");
    }
  };

  const getLabel = (category: string, value: string) => {
    const opt = fieldOptions[category]?.find(o => o.value === value);
    return opt ? opt.label : value;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Atendimentos</h1>
          <p className="text-muted-foreground">Registro de consultas e procedimentos.</p>
        </div>
        <Button onClick={handleOpenNew} className="gap-2"><Plus size={16} /> Novo Atendimento</Button>
      </div>

      <div className="border rounded-md bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Tratamento</TableHead>
              <TableHead>Comparecimento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Carregando...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum atendimento registrado.</TableCell></TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{formatDateTime(item.data_atendimento)}</TableCell>
                  <TableCell className="font-medium">{item.nome_paciente}</TableCell>
                  <TableCell>{getLabel('TIPO_ATENDIMENTO', item.tipo_atendimento)}</TableCell>
                  <TableCell>{getLabel('TIPO_TRATAMENTO', item.tipo_tratamento)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status_comparecimento === 'Compareceu' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {getLabel('STATUS_COMPARECIMENTO', item.status_comparecimento)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item.id)}><Edit2 size={16} /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar Atendimento" : "Novo Atendimento"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2 col-span-2">
                <Label>Nome do Paciente</Label>
                <Input 
                  required 
                  placeholder="Nome completo do paciente" 
                  value={formData.nome_paciente} 
                  onChange={e => setFormData({...formData, nome_paciente: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label>Data e Hora</Label>
                <Input required type="datetime-local" value={formData.data_atendimento} onChange={e => setFormData({...formData, data_atendimento: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>CID</Label>
                <Input required placeholder="Ex: C50.9" value={formData.cid} onChange={e => setFormData({...formData, cid: e.target.value.toUpperCase()})} />
              </div>
              <div className="grid gap-2">
                <Label>Tipo de Atendimento</Label>
                <Select value={formData.tipo_atendimento} onValueChange={(v) => setFormData({...formData, tipo_atendimento: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {fieldOptions.TIPO_ATENDIMENTO.map(opt => (
                      <SelectItem key={opt.id} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Tratamento</Label>
                <Select value={formData.tipo_tratamento} onValueChange={(v) => setFormData({...formData, tipo_tratamento: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {fieldOptions.TIPO_TRATAMENTO.map(opt => (
                      <SelectItem key={opt.id} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Encaminhamento</Label>
                <Select value={formData.encaminhamento} onValueChange={(v) => setFormData({...formData, encaminhamento: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {fieldOptions.ENCAMINHAMENTO.map(opt => (
                      <SelectItem key={opt.id} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status Comparecimento</Label>
                <Select value={formData.status_comparecimento} onValueChange={(v) => setFormData({...formData, status_comparecimento: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {fieldOptions.STATUS_COMPARECIMENTO.map(opt => (
                      <SelectItem key={opt.id} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 col-span-2">
                <Label>Observações</Label>
                <Input value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
