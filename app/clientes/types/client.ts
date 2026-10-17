export interface Client {
  id?: string;
  created_at?: string;
  name: string;
  email?: string;
  phone?: string;
  plan: string;
  status: 'Ativo' | 'Suspenso' | 'Cancelado';
  ip_address?: string;
  address?: string;
}