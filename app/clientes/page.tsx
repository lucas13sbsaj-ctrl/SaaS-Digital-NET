'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Client } from '@/types/client';
import { Loader2, Plus, UserCheck } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [plan, setPlan] = useState('Plano 100Mb');
  const [phone, setPhone] = useState('');

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar clientes:', error.message);
    } else {
      setClients(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('clients').insert([
      { name, plan, phone, status: 'Ativo' }
    ]);

    if (error) {
      alert(`Erro ao criar cliente: ${error.message}`);
    } else {
      setName('');
      setPhone('');
      fetchClients();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-slate-100">Gestão de Clientes (ISP)</h1>

        {/* Formulário organizado em grelha */}
        <form onSubmit={handleAddClient} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 shadow-xl">
          <input 
            type="text" 
            placeholder="Nome do Cliente" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm outline-none focus:border-blue-500 text-slate-200 placeholder:text-slate-600"
          />
          <input 
            type="text" 
            placeholder="Telemóvel / WhatsApp" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm outline-none focus:border-blue-500 text-slate-200 placeholder:text-slate-600"
          />
          <select 
            value={plan} 
            onChange={(e) => setPlan(e.target.value)}
            className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm outline-none focus:border-blue-500 text-slate-200"
          >
            <option value="Plano 50Mb">Plano 50Mb</option>
            <option value="Plano 100Mb">Plano 100Mb</option>
            <option value="Plano 300Mb">Plano 300Mb</option>
          </select>
          <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors text-white">
            <Plus size={16} /> Adicionar Cliente
          </button>
        </form>

        {/* Tabela de Clientes */}
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase bg-slate-950/50">
                  <th className="p-4">Nome</th>
                  <th className="p-4">Telemóvel</th>
                  <th className="p-4">Plano</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {clients.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-500">Nenhum cliente registado.</td></tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-medium text-slate-200">{client.name}</td>
                      <td className="p-4 text-slate-400">{client.phone || '-'}</td>
                      <td className="p-4 text-blue-400 font-medium">{client.plan}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <UserCheck size={12} /> {client.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}