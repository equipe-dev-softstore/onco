import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCpf = (cpf: string) =>
  cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

export const stripCpf = (cpf: string) => cpf.replace(/\D/g, '');

export const formatDate = (iso: string) => {
  if (!iso) return '';
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR');
};

export const formatDateTime = (iso: string) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('pt-BR');
};
