'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertCircle, 
  CheckCircle2, 
  X, 
  ArrowLeft, 
  Search, 
  Trash2, 
  FileText,
  Calendar,
  ShieldCheck,
  Filter,
  BarChart3,
  CreditCard,
  Send
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Invoice {
  id: string;
  client_name: string;
  pppoe_login?: string;
  plan: string;
  amount: number;
  due_date: string;
  status: 'Pago' | 'Pendente' | 'Vencido';
  created_at?: string;
}

const cashFlowData = [
  { mes: 'Jan', recebido: 42000, pendente: 5000 },
  { mes: 'Fev', recebido: 46000, pendente: 4200 },
  { mes: 'Mar', recebido: 51000, pendente: 6100 },
  { mes: 'Abr', recebido: 49000, pendente: 3800 },
  { mes: 'Mai', recebido: 55000, pendente: 4500 },
  { mes: 'Jun', recebido: 61200, pendente: 3100 },
];

export default function FinancePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados do Formulário de Nova Fatura
  const [clientName, setClientName] = useState('');
  const [pppoeLogin, setPppoeLogin] = useState('');
  const [plan, setPlan] = useState('Plano 100Mb');
  const [amount, setAmount] = useState('99.90');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'Pago' | 'Pendente' | 'Vencido'>('Pendente');

  // Buscar Faturas
  const fetchInvoices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('due_date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar faturas:', error.message);
    } else {
      setInvoices(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
    const today = new Date().toISOString().split('T')[0];
    setDueDate(today);
  }, []);

  // Adicionar Nova Fatura
  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const { error } = await supabase.from('invoices').insert([
      {
        client_name: clientName,
        pppoe_login: pppoeLogin || null,
        plan,
        amount: parseFloat(amount),
        due_date: dueDate,
        status
      }
    ]);

    if (error) {
      setErrorMsg(`Erro ao criar fatura: ${error.message}`);
    } else {
      setClientName('');
      setPppoeLogin('');
      setAmount('99.90');
      setIsModalOpen(false);
      fetchInvoices();
    }
    setSubmitting(false);
  };

  // Excluir Fatura
  const handleDeleteInvoice = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza de que deseja excluir permanentemente a fatura de "${name}"?`)) return;

    setDeletingId(id);
    const { error } = await supabase.from('invoices').delete().eq('id', id);

    if (error) {
      alert(`Erro ao excluir: ${error.message}`);
    } else {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    }
    setDeletingId(null);
  };

  // Filtrar Faturas por busca e status
  const filteredInvoices = invoices.filter(inv => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      inv.client_name.toLowerCase().includes(term) ||
      (inv.pppoe_login && inv.pppoe_login.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'todos' || inv.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Métricas Financeiras Avançadas
  const totalReceived = invoices.filter(i => i.status === 'Pago').reduce((acc, i) => acc + Number(i.amount), 0);
  const totalPending = invoices.filter(i => i.status === 'Pendente').reduce((acc, i) => acc + Number(i.amount), 0);
  const totalOverdue = invoices.filter(i => i.status === 'Vencido').reduce((acc, i) => acc + Number(i.amount), 0);
  const totalRevenue = invoices.reduce((acc, i) => acc + Number(i.amount), 0);
  
  // Taxa de Inadimplência
  const defaultRate = totalRevenue > 0 ? ((totalOverdue / totalRevenue) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8 text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Cabeçalho Executivo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium shadow-md"
              title="Voltar para a Dashboard"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-sky-500/20 to-blue-600/10 border border-sky-500/30 rounded-2xl text-sky-400 shadow-inner">
                <DollarSign size={26} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-100">Gestão Financeira & Faturamento</h1>
                <p className="text-xs text-sky-400 font-medium">Controlo corporativo de MRR, Inadimplência e Fluxo de Caixa ISP</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => alert('Exportação de relatório fiscal em lote iniciada.')}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <FileText size={16} className="text-sky-400" /> Exportar Relatório
            </button>
            <button 
              onClick={() => { setErrorMsg(null); setIsModalOpen(true); }}
              className="bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all shrink-0 cursor-pointer"
            >
              <Plus size={16} /> Nova Fatura / Cobrança
            </button>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 p-5 rounded-2xl shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Recebido (Liquidado)</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20"><CheckCircle2 size={18} /></div>
            </div>
            <div className="text-2xl lg:text-3xl font-black text-emerald-400 mt-3 tracking-tight">
              R$ {totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/90 mt-2 font-medium">
              <TrendingUp size={14} /> +12.4% vs mês anterior
            </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 p-5 rounded-2xl shadow-xl relative overflow-hidden group hover:border-amber-500/30 transition-all">
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Pendente / Em Aberto</span>
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20"><CreditCard size={18} /></div>
            </div>
            <div className="text-2xl lg:text-3xl font-black text-amber-400 mt-3 tracking-tight">
              R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Vencimentos previstos para os próximos dias</p>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 p-5 rounded-2xl shadow-xl relative overflow-hidden group hover:border-rose-500/30 transition-all">
            <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Em Atraso / Vencido</span>
              <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20"><AlertCircle size={18} /></div>
            </div>
            <div className="text-2xl lg:text-3xl font-black text-rose-400 mt-3 tracking-tight">
              R$ {totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-rose-400 mt-2 font-medium">
              <TrendingDown size={14} /> Taxa inadimplência: {defaultRate}%
            </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 p-5 rounded-2xl shadow-xl relative overflow-hidden group hover:border-sky-500/30 transition-all">
            <div className="absolute top-0 right-0 w-28 h-28 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Faturamento Projetado (MRR)</span>
              <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20"><BarChart3 size={18} /></div>
            </div>
            <div className="text-2xl lg:text-3xl font-black text-sky-300 mt-3 tracking-tight">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Base de clientes FTTH ativos</p>
          </div>

        </div>

        {/* Gráfico Analítico de Fluxo de Caixa */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
            <div>
              <h3 className="font-bold text-slate-100 text-base">Evolução do Fluxo de Caixa (Últimos Semestre)</h3>
              <p className="text-xs text-slate-400">Comparativo entre valores liquidados vs valores pendentes</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Recebido</span>
              <span className="flex items-center gap-1.5 text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Pendente</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="mes" stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="recebido" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRec)" />
                <Area type="monotone" dataKey="pendente" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorPend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Barra de Pesquisa e Filtros de Status */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="relative w-full sm:w-96">
            <Search size={18} className="absolute left-3.5 top-3 text-slate-500" />
            <input 
              type="text" 
              placeholder="Pesquisar por nome do cliente ou login PPPoE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-200 placeholder:text-slate-600 font-medium"
            />
          </div>

          {/* Filtros rápidos por estado */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {['todos', 'pago', 'pendente', 'vencido'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all capitalize shrink-0 ${
                  statusFilter === status 
                    ? 'bg-sky-500 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.4)]' 
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela de Faturas Enterprise */}
        {loading ? (
          <div className="flex justify-center p-16"><Loader2 className="animate-spin text-sky-400" size={36} /></div>
        ) : (
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold tracking-widest text-slate-400 uppercase bg-slate-950/70">
                  <th className="p-4">Cliente / Login PPPoE</th>
                  <th className="p-4">Plano FTTH</th>
                  <th className="p-4">Valor Cobrança</th>
                  <th className="p-4">Vencimento</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Ações & Automação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {filteredInvoices.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-slate-500 font-medium">Nenhuma fatura encontrada com os filtros atuais.</td></tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="p-4">
                        <div className="font-bold text-slate-200 group-hover:text-sky-400 transition-colors">{inv.client_name}</div>
                        <div className="text-xs text-sky-400/80 font-mono mt-0.5">{inv.pppoe_login || 'Sem login PPPoE associado'}</div>
                      </td>
                      <td className="p-4 text-slate-300 font-medium text-xs">{inv.plan}</td>
                      <td className="p-4 font-black text-slate-100 text-base">
                        R$ {Number(inv.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-xs text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-sky-400 shrink-0" />
                          {inv.due_date}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          inv.status === 'Pago' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                          inv.status === 'Pendente' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            inv.status === 'Pago' ? 'bg-emerald-400' : inv.status === 'Pendente' ? 'bg-amber-400' : 'bg-rose-400 animate-ping'
                          }`} />
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => alert(`Lembrete de fatura enviado via WhatsApp para ${inv.client_name}!`)}
                          title="Enviar Cobrança WhatsApp"
                          className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <Send size={13} /> WhatsApp
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(inv.id, inv.client_name)}
                          disabled={deletingId === inv.id}
                          title="Excluir Fatura"
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors disabled:opacity-50 inline-flex items-center"
                        >
                          {deletingId === inv.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* MODAL DE NOVA FATURA PROFISSIONAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative my-8">
            
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2.5 text-sky-400 font-semibold">
                <FileText size={22} />
                <span className="text-slate-100 text-lg font-bold">Lançamento de Fatura Corporativa</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-200 rounded-xl bg-slate-900 border border-slate-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddInvoice} className="p-6 space-y-5">
              {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3.5 rounded-2xl">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-1.5">Nome Completo do Cliente *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Carlos Eduardo"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-2xl text-sm outline-none focus:border-sky-500 text-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-1.5">Login PPPoE (Vinculado à OLT)</label>
                <input 
                  type="text" 
                  placeholder="Ex: carloseduardo_100"
                  value={pppoeLogin}
                  onChange={(e) => setPppoeLogin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-2xl text-sm outline-none focus:border-sky-500 text-slate-200 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-1.5">Plano FTTH</label>
                  <select 
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-2xl text-sm outline-none focus:border-sky-500 text-slate-200 font-medium"
                  >
                    <option value="Plano 50Mb">Plano 50Mb</option>
                    <option value="Plano 100Mb">Plano 100Mb</option>
                    <option value="Plano 300Mb">Plano 300Mb</option>
                    <option value="Plano 500Mb">Plano 500Mb</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-1.5">Valor (R$) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-2xl text-sm outline-none focus:border-sky-500 text-slate-200 font-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-1.5">Data de Vencimento *</label>
                  <input 
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-2xl text-sm outline-none focus:border-sky-500 text-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-1.5">Estado Inicial</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-2xl text-sm outline-none focus:border-sky-500 text-slate-200 font-bold"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Pago">Pago</option>
                    <option value="Vencido">Vencido</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-5 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-2xl border border-slate-800 text-slate-400 hover:bg-slate-800 text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-extrabold px-6 py-3 rounded-2xl text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] disabled:opacity-50 cursor-pointer transition-all"
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Efetivar Lançamento'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}