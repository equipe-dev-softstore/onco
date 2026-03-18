"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Edit2, Trash2 } from "lucide-react";

const CATEGORIES = [
  { value: 'TIPO_ATENDIMENTO', label: 'Tipo de Atendimento' },
  { value: 'TIPO_TRATAMENTO', label: 'Tratamento' },
  { value: 'ENCAMINHAMENTO', label: 'Encaminhamento' },
  { value: 'STATUS_COMPARECIMENTO', label: 'Status Comparecimento' },
];

export default function ConfigOptionsPage() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].value);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ 
    id: "", category: activeCategory, label: "", value: "", active: true 
  });

  const loadOptions = async (category: string) => {
    setLoading(true);
    const res = await apiFetch(`/field-options?category=${category}`);
    if (res?.success || Array.isArray(res)) {
      // res might be the array directly depending on how transform.interceptor works
      setOptions(Array.isArray(res) ? res : res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOptions(activeCategory);
  }, [activeCategory]);

  const handleOpenNew = () => {
    setIsEdit(false);
    setFormData({ 
      id: "", category: activeCategory, label: "", value: "", active: true 
    });
    setOpen(true);
  };

  const handleOpenEdit = (opt: any) => {
    setFormData({
      id: opt.id,
      category: opt.category,
      label: opt.label,
      value: opt.value,
      active: opt.active
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta opção?")) return;
    
    const res = await apiFetch(`/field-options/${id}`, { method: 'DELETE' });
    if (res?.success || !res?.error) {
      toast.success("Opção excluída");
      loadOptions(activeCategory);
    } else {
      toast.error("Erro ao excluir");
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const { id, category, label, value, active } = formData;
    const url = isEdit ? `/field-options/${id}` : '/field-options';
    const method = isEdit ? 'PATCH' : 'POST';
    
    // For update, we only send label, value, active
    const payload = isEdit ? { label, value, active } : { category, label, value, active };

    const res = await apiFetch(url, {
      method,
      body: JSON.stringify(payload)
    });

    setSubmitting(false);
    if (res?.success || !res?.error) {
      toast.success(`Opção ${isEdit ? 'atualizada' : 'criada'}`);
      setOpen(false);
      loadOptions(activeCategory);
    } else {
      toast.error(res?.message || "Erro ao salvar");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações de Campos</h1>
        <p className="text-muted-foreground">Gerencie as opções dos seletores do sistema.</p>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            {CATEGORIES.map(cat => (
              <TabsTrigger key={cat.value} value={cat.value}>{cat.label}</TabsTrigger>
            ))}
          </TabsList>
          <Button onClick={handleOpenNew} className="gap-2"><Plus size={16} /> Nova Opção</Button>
        </div>

        {CATEGORIES.map(cat => (
          <TabsContent key={cat.value} value={cat.value}>
            <div className="border rounded-md bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                  <TableRow>
                    <TableHead>Título (Label)</TableHead>
                    <TableHead>Valor (Value)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8">Carregando...</TableCell></TableRow>
                  ) : options.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhuma opção cadastrada para esta categoria.</TableCell></TableRow>
                  ) : (
                    options.map((opt) => (
                      <TableRow key={opt.id}>
                        <TableCell className="font-medium">{opt.label}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-xs">{opt.value}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${opt.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {opt.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(opt)}><Edit2 size={16} /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(opt.id)}><Trash2 size={16} /></Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar Opção" : "Nova Opção"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Categoria</Label>
              <Input disabled value={CATEGORIES.find(c => c.value === formData.category)?.label} />
            </div>
            <div className="grid gap-2">
              <Label>Título (O que aparece para o usuário)</Label>
              <Input 
                required 
                placeholder="Ex: Quimioterapia" 
                value={formData.label} 
                onChange={e => setFormData({...formData, label: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label>Valor Interno (ID ou Código)</Label>
              <Input 
                required 
                placeholder="Ex: QUIMIO_NOVO" 
                value={formData.value} 
                onChange={e => setFormData({...formData, value: e.target.value})} 
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="active" 
                checked={formData.active} 
                onChange={e => setFormData({...formData, active: e.target.checked})} 
              />
              <Label htmlFor="active">Ativo</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
