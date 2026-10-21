'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Wifi, 
  Activity, 
  DollarSign, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Plus, 
  ChevronDown,
  ShieldCheck,
  RefreshCw,
  X,
  Loader2,
  Lock,
  Key,
  Calendar,
  Zap,
  Info,
  BarChart2,
  Download,
  Send,
  FileCheck,
  MoreVertical,
  Eye,
  Printer
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  address?: string;
  city?: string;
}

interface ClientLogin {
  id: string;
  client_id: string;
  username: string;
  password?: string;
  plan_name: string;
  download_speed: number;
  upload_speed: number;
  due_day: number;
  status: string;
  uptime: string;
  consumption: string;
}

interface Plan {
  id: string;
  name: string;
  download_speed: number;
  upload_speed: number;
}

interface Invoice {
  id: string;
  description: string;
  due_date: string;
  amount: number;
  discount: number;
  interest: number;
  status: string;
  payment_date: string;
  invoice_code: string;
  nf_integrated: boolean;
}

export default function ClientDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-sky-400 font-mono text-sm">
        <RefreshCw className="animate-spin mr-2" size={20} />
        Carregando painel do cliente...
      </div>
    }>
      <ClientContent />
    </Suspense>
  );
}

function ClientContent() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [logins, setLogins] = useState<ClientLogin[]>([]);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdownActions, setShowDropdownActions] = useState(false);

  // Estados do Modal de Criar Login PPPoE
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [savingLogin, setSavingLogin] = useState(false);
  const [pppoeUsername, setPppoeUsername] = useState('');
  const [pppoePassword, setPppoePassword] = useState('102030');
  const [selectedPlanName, setSelectedPlanName] = useState('');
  const [downloadSpeed, setDownloadSpeed] = useState(300);
  const [uploadSpeed, setUploadSpeed] = useState(150);
  const [dueDay, setDueDay] = useState(15);

  const [isDuplicate, setIsDuplicate] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  const [deletingLoginId, setDeletingLoginId] = useState<string | null>(null);
  const [deletingLoginName, setDeletingLoginName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Faturas / Notas Fiscais
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: '1', description: 'Mensalidade FiberGrid LTDA - Plano Fibra Turbo', due_date: '15/10/2026', amount: 140.00, discount: 0.00, interest: 0.00, status: 'paid', payment_date: '20/10/2026', invoice_code: '#0463392', nf_integrated: true },
    { id: '2', description: 'Mensalidade FiberGrid LTDA - Plano Fibra Turbo', due_date: '15/09/2026', amount: 140.00, discount: 5.00, interest: 0.00, status: 'paid', payment_date: '15/09/2026', invoice_code: '#2435020', nf_integrated: true },
    { id: '3', description: 'Mensalidade FiberGrid LTDA - Plano Fibra Turbo', due_date: '15/08/2026', amount: 140.00, discount: 0.00, interest: 2.50, status: 'paid', payment_date: '20/08/2026', invoice_code: '#2408241', nf_integrated: true },
  ]);

  const [activeInvoiceMenuId, setActiveInvoiceMenuId] = useState<string | null>(null);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState<string | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const fetchAllData = async () => {
    if (!clientId) return;
    setLoading(true);

    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    const { data: loginsData } = await supabase
      .from('client_logins')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    const { data: plansData } = await supabase
      .from('plans')
      .select('*')
      .order('price', { ascending: true });

    setClient(clientData);
    setLogins(loginsData || []);
    setAvailablePlans(plansData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [clientId]);

  const handlePlanSelect = (planName: string) => {
    setSelectedPlanName(planName);
    const plan = availablePlans.find(p => p.name === planName);
    if (plan) {
      setDownloadSpeed(plan.download_speed);
      setUploadSpeed(plan.upload_speed);
    }
  };

  const handleGenerateAutoLogin = async () => {
    if (!client?.name) return;

    const cleanName = client.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    const firstName = cleanName.slice(0, 8);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const autoGeneratedUsername = `${firstName}.${randomSuffix}`;

    setPppoeUsername(autoGeneratedUsername);
    setPppoePassword('102030');

    checkUsernameAvailability(autoGeneratedUsername);
  };

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck.trim()) {
      setIsDuplicate(false);
      return;
    }

    setCheckingDuplicate(true);
    const { data } = await supabase
      .from('client_logins')
      .select('id')
      .eq('username', usernameToCheck.trim().toLowerCase());

    if (data && data.length > 0) {
      setIsDuplicate(true);
    } else {
      setIsDuplicate(false);
    }
    setCheckingDuplicate(false);
  };

  const handleSaveLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDuplicate) {
      alert('Não é possível salvar: Este login PPPoE já está em uso por outro cliente!');
      return;
    }

    setSavingLogin(true);

    const payload = {
      client_id: clientId,
      username: pppoeUsername.trim().toLowerCase(),
      password: pppoePassword || '102030',
      plan_name: selectedPlanName || 'Plano Fibra Turbo',
      download_speed: Number(downloadSpeed),
      upload_speed: Number(uploadSpeed),
      due_day: Number(dueDay),
      status: 'CONECTADO',
      uptime: '0h 01m',
      consumption: '0 MB'
    };

    const { error } = await supabase.from('client_logins').insert([payload]);

    if (error) {
      alert(`Erro ao criar login PPPoE: ${error.message}`);
    } else {
      setIsLoginModalOpen(false);
      setPppoeUsername('');
      setPppoePassword('102030');
      setIsDuplicate(false);
      fetchAllData();
    }
    setSavingLogin(false);
  };

  const confirmDeleteLogin = async () => {
    if (!deletingLoginId) return;
    setIsDeleting(true);

    const { error } = await supabase.from('client_logins').delete().eq('id', deletingLoginId);

    if (error) {
      alert(`Erro ao excluir login: ${error.message}`);
    } else {
      setDeletingLoginId(null);
      fetchAllData();
    }
    setIsDeleting(false);
  };

  const confirmDeleteInvoice = () => {
    if (!deletingInvoiceId) return;
    setInvoices(invoices.filter(inv => inv.id !== deletingInvoiceId));
    setDeletingInvoiceId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-sky-400 font-mono text-sm">
        <RefreshCw className="animate-spin mr-2" size={20} />
        Carregando dados do cliente...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 lg:p-8 text-slate-100 font-sans space-y-6">
      
      {/* NAVEGAÇÃO & TOPO DO CLIENTE */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold"
          >
            <ArrowLeft size={16} /> Voltar para Dashboard
          </Link>
          
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-black text-white uppercase tracking-wide">
              {client?.name || 'CLIENTE NÃO ENCONTRADO'}
            </h1>
            
            <div className="relative">
              <button 
                onClick={() => setShowDropdownActions(!showDropdownActions)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-sky-400 font-bold flex items-center gap-1 transition-colors"
              >
                + Mais <ChevronDown size={14} />
              </button>

              {showDropdownActions && (
                <div className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs text-slate-300">
                  <button className="w-full text-left px-4 py-2 hover:bg-slate-800 flex items-center gap-2">
                    <Clock size={14} className="text-sky-400" /> Últimos logs
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-slate-800 flex items-center gap-2">
                    <FileText size={14} className="text-amber-400" /> Ordens de Serviço
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-slate-800 flex items-center gap-2">
                    <DollarSign size={14} className="text-emerald-400" /> Gerar carnês
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-slate-800 flex items-center gap-2">
                    <Info size={14} className="text-sky-400" /> Info
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
            <ShieldCheck size={14} /> Cadastro Ativo
          </span>
        </div>
      </div>

      {/* SEÇÃO DE LOGINS PPPOE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Wifi size={16} className="text-sky-400" /> Logins PPPoE Vinculados ao Cliente
          </h2>

          <button 
            onClick={() => setIsLoginModalOpen(true)}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(56,189,248,0.2)]"
          >
            <Plus size={16} /> Criar Novo Login PPPoE
          </button>
        </div>

        {logins.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
            Nenhum login PPPoE cadastrado para este cliente. Clique em "Criar Novo Login PPPoE" acima.
          </div>
        ) : (
          <div className="space-y-3">
            {logins.map((login) => (
              <div 
                key={login.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider uppercase">
                    {login.status || 'CONECTADO'}
                  </span>

                  <div>
                    <div className="text-sm font-bold font-mono text-sky-300 flex items-center gap-2">
                      {login.username}
                      <span className="text-[10px] text-slate-400 font-normal bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {login.plan_name} ({login.download_speed}M / {login.upload_speed}M)
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><Clock size={12} className="text-slate-500" /> Uptime: {login.uptime || '0h 0m'}</span>
                      <span className="flex items-center gap-1"><Activity size={12} className="text-amber-400" /> Consumo: {login.consumption || '0 MB'}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} className="text-sky-400" /> Vencimento: Dia {login.due_day || 15}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors">
                    <Info size={13} className="text-sky-400" /> Info Login
                  </button>
                  <button className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors">
                    <BarChart2 size={13} className="text-indigo-400" /> Relatório
                  </button>

                  <button 
                    onClick={() => {
                      setDeletingLoginId(login.id);
                      setDeletingLoginName(login.username);
                    }}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl transition-colors ml-2"
                    title="Excluir este login PPPoE"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RESUMO FINANCEIRO */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
          <span className="bg-sky-500/10 text-sky-400 px-2.5 py-1 rounded-lg border border-sky-500/20 font-bold">
            Automático
          </span>
          <span>Logins Ativos: <strong>{logins.length}</strong></span>
          <span className="text-slate-600">•</span>
          <span>Status Financeiro: <strong className="text-emerald-400">Em dia</strong></span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Saldo Atual</span>
            <span className="text-base font-extrabold text-rose-400 font-mono">SALDO R$ 0,00</span>
          </div>
        </div>
      </div>

      {/* TABELA DE BOLETOS COM MENU DROPDOWN DE AÇÕES */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 rounded-t-2xl">
          <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
            <FileText size={16} className="text-sky-400" />
            Histórico de Boletos e Notas Fiscais
          </h3>
          <span className="text-xs font-mono text-slate-500">{invoices.length} faturas encontradas</span>
        </div>

        <div className="p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-bold bg-slate-950/40">
                <th className="p-3">Descrição</th>
                <th className="p-3">Vencimento</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Situação</th>
                <th className="p-3">Cód. Boleto</th>
                <th className="p-3 text-center">Integrado/NF</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                    Nenhum boleto ou nota fiscal registrada para este cliente.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-semibold text-slate-200 flex items-center gap-2">
                      <FileText size={15} className="text-slate-500 shrink-0" />
                      {inv.description}
                    </td>
                    <td className="p-3 font-mono text-slate-400">{inv.due_date}</td>
                    <td className="p-3 font-bold text-slate-100 font-mono">
                      R$ {inv.amount.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="p-3">
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg font-bold font-mono inline-flex items-center gap-1 text-[11px]">
                        <CheckCircle2 size={12} /> {inv.payment_date || inv.due_date}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-sky-400 font-medium">{inv.invoice_code}</td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center justify-center p-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20" title="NF Integrada">
                        <FileCheck size={14} />
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="relative inline-block text-left">
                        {/* BOTÃO DE MENU LATERAL (TRÊS PONTINHOS) */}
                        <button 
                          onClick={() => setActiveInvoiceMenuId(activeInvoiceMenuId === inv.id ? null : inv.id)}
                          className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors inline-flex items-center justify-center shadow"
                          title="Opções da Fatura / Nota Fiscal"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* MENU FLUTUANTE DE AÇÕES */}
                        {activeInvoiceMenuId === inv.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-left text-xs text-slate-200 space-y-0.5">
                            <button 
                              onClick={() => { setActiveInvoiceMenuId(null); window.print(); }}
                              className="w-full px-3 py-2 hover:bg-slate-800 flex items-center gap-2 text-sky-400 transition-colors"
                            >
                              <Download size={14} /> Baixar Boleto PDF
                            </button>
                            <button 
                              onClick={() => { setActiveInvoiceMenuId(null); alert('Enviando boleto via WhatsApp...'); }}
                              className="w-full px-3 py-2 hover:bg-slate-800 flex items-center gap-2 text-emerald-400 transition-colors"
                            >
                              <Send size={14} /> Enviar no WhatsApp
                            </button>
                            <button 
                              onClick={() => { 
                                setActiveInvoiceMenuId(null); 
                                setViewingInvoice(inv); 
                              }}
                              className="w-full px-3 py-2 hover:bg-slate-800 flex items-center gap-2 text-indigo-400 transition-colors font-semibold"
                            >
                              <Eye size={14} /> Ver Nota Fiscal
                            </button>
                            <div className="border-t border-slate-800 my-1"></div>
                            <button 
                              onClick={() => { 
                                setActiveInvoiceMenuId(null); 
                                setDeletingInvoiceId(inv.id); 
                              }}
                              className="w-full px-3 py-2 hover:bg-rose-500/10 text-rose-400 flex items-center gap-2 font-semibold transition-colors"
                            >
                              <Trash2 size={14} /> Excluir Nota Fiscal
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE VISUALIZAÇÃO DA NOTA FISCAL / FATURA COMPLETA COM SUPORTE A IMPRESSÃO REAL */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-6 text-slate-100">
            
            {/* CABEÇALHO DO MODAL */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">Nota Fiscal de Prestação de Serviços</h3>
                  <p className="text-xs text-sky-400 font-mono">Código de Autenticação: {viewingInvoice.invoice_code}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingInvoice(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* CORPO DA NOTA FISCAL */}
            <div className="p-6 space-y-6 text-xs bg-slate-900">
              
              {/* DADOS DA EMPRESA EMISSORA */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-sm text-sky-400">FiberGrid LTDA - Provedor de Internet</h4>
                  <p className="text-slate-400 mt-0.5">CNPJ: 45.890.123/0001-90</p>
                  <p className="text-slate-400">Santo Antônio de Jesus - BA</p>
                </div>
                <div className="text-left sm:text-right font-mono">
                  <span className="text-slate-500 block">Emissão: {viewingInvoice.due_date}</span>
                  <span className="text-emerald-400 font-bold block mt-1">STATUS: QUITADO / PAGO</span>
                </div>
              </div>

              {/* DADOS DO CLIENTE */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Tomador do Serviço (Cliente)</span>
                <div className="font-bold text-sm text-slate-100">{client?.name || 'Cliente'}</div>
                <div className="text-slate-400 font-mono flex flex-wrap gap-4">
                  <span>CPF/CNPJ: {client?.cpf || 'Não informado'}</span>
                  <span>Tel: {client?.phone || 'Não informado'}</span>
                </div>
              </div>

              {/* DISCRIMINAÇÃO DOS SERVIÇOS */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden">
                <div className="bg-slate-950 px-4 py-2.5 font-bold text-slate-400 uppercase text-[11px] border-b border-slate-800">
                  Discriminação dos Serviços
                </div>
                <div className="p-4 space-y-3 bg-slate-900">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-medium">{viewingInvoice.description}</span>
                    <span className="font-mono font-bold text-slate-100">R$ {viewingInvoice.amount.toFixed(2).replace('.', ',')}</span>
                  </div>

                  {viewingInvoice.discount > 0 && (
                    <div className="flex justify-between items-center text-emerald-400">
                      <span>(-) Desconto Concedido</span>
                      <span className="font-mono font-bold">R$ {viewingInvoice.discount.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}

                  {viewingInvoice.interest > 0 && (
                    <div className="flex justify-between items-center text-amber-400">
                      <span>(+) Juros e Multa por Atraso</span>
                      <span className="font-mono font-bold">R$ {viewingInvoice.interest.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* VALOR TOTAL */}
              <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-sky-400 font-bold uppercase tracking-wider block">Valor Total da Nota</span>
                  <span className="text-[10px] text-slate-400">Tributos inclusos conforme legislação vigente</span>
                </div>
                <div className="text-xl font-black text-sky-300 font-mono">
                  R$ {(viewingInvoice.amount - viewingInvoice.discount + viewingInvoice.interest).toFixed(2).replace('.', ',')}
                </div>
              </div>

            </div>

            {/* RODAPÉ DO MODAL (BOTÃO IMPRIMIR ATIVO) */}
            <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <button 
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl font-bold flex items-center gap-2 transition-colors text-xs shadow"
              >
                <Printer size={15} /> Imprimir / PDF
              </button>
              
              <button 
                onClick={() => setViewingInvoice(null)}
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition-colors text-xs shadow-lg"
              >
                Fechar Visualização
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL CRIAR LOGIN */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <h3 className="text-slate-100 font-bold text-base flex items-center gap-2">
                <Wifi size={18} className="text-sky-400" />
                Criar Novo Login PPPoE
              </h3>
              <button onClick={() => setIsLoginModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLogin} className="p-6 space-y-4 text-xs">
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={handleGenerateAutoLogin}
                  className="bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors text-[11px]"
                >
                  <Zap size={14} /> Gerar Login Automático
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Login PPPoE *</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-3 text-slate-500" />
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: cliente.fibra"
                      value={pppoeUsername}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPppoeUsername(val);
                        checkUsernameAvailability(val);
                      }}
                      className={`w-full bg-slate-950 border ${
                        isDuplicate ? 'border-rose-500 text-rose-400' : 'border-slate-800 text-slate-200'
                      } pl-9 pr-3.5 py-2 rounded-xl outline-none focus:border-sky-500 font-mono`}
                    />
                  </div>

                  {checkingDuplicate && (
                    <span className="text-[10px] text-sky-400 mt-1 block">Verificando disponibilidade...</span>
                  )}
                  {isDuplicate && (
                    <span className="text-[10px] text-rose-400 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> Este login já existe no sistema! Escolha outro.
                    </span>
                  )}
                  {!isDuplicate && pppoeUsername.length > 2 && !checkingDuplicate && (
                    <span className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Login disponível!
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-slate-400 mb-1">Senha de Autenticação *</label>
                  <div className="relative">
                    <Key size={14} className="absolute left-3 top-3 text-slate-500" />
                    <input 
                      type="text" 
                      required
                      value={pppoePassword}
                      onChange={(e) => setPppoePassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 pl-9 pr-3.5 py-2 rounded-xl outline-none focus:border-sky-500 text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Plano de Internet Comercial</label>
                <select
                  value={selectedPlanName}
                  onChange={(e) => handlePlanSelect(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl outline-none focus:border-sky-500 text-slate-200"
                >
                  <option value="">Selecione um plano cadastrado...</option>
                  {availablePlans.map((plan) => (
                    <option key={plan.id} value={plan.name}>
                      {plan.name} ({plan.download_speed}M / {plan.upload_speed}M)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Download (Mbps)</label>
                  <input 
                    type="number" 
                    required
                    value={downloadSpeed}
                    onChange={(e) => setDownloadSpeed(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl outline-none focus:border-sky-500 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Upload (Mbps)</label>
                  <input 
                    type="number" 
                    required
                    value={uploadSpeed}
                    onChange={(e) => setUploadSpeed(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl outline-none focus:border-sky-500 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Dia de Vencimento da Mensalidade</label>
                <select
                  value={dueDay}
                  onChange={(e) => setDueDay(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl outline-none focus:border-sky-500 text-slate-200 font-mono"
                >
                  <option value={5}>Dia 05</option>
                  <option value={10}>Dia 10</option>
                  <option value={15}>Dia 15</option>
                  <option value={20}>Dia 20</option>
                  <option value={25}>Dia 25</option>
                  <option value={30}>Dia 30</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={savingLogin || isDuplicate}
                  className={`font-bold px-5 py-2 rounded-xl flex items-center gap-1.5 ${
                    isDuplicate 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                  }`}
                >
                  {savingLogin ? <Loader2 size={14} className="animate-spin" /> : 'Criar Login PPPoE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EXCLUSÃO DE LOGIN */}
      {deletingLoginId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">Excluir Login PPPoE?</h3>
                <p className="text-xs text-slate-400">Esta ação não poderá ser desfeita.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
              Tem certeza que deseja remover o login <strong className="text-sky-400">{deletingLoginName}</strong> do cliente?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setDeletingLoginId(null)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 text-xs font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDeleteLogin}
                disabled={isDeleting}
                className="bg-rose-500 hover:bg-rose-400 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : 'Sim, Excluir Login'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE NOTA FISCAL */}
      {deletingInvoiceId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">Excluir Nota Fiscal / Fatura?</h3>
                <p className="text-xs text-slate-400">O registro fiscal será removido do histórico.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
              Tem certeza que deseja excluir esta fatura/nota fiscal selecionada?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setDeletingInvoiceId(null)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 text-xs font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDeleteInvoice}
                className="bg-rose-500 hover:bg-rose-400 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5"
              >
                Sim, Excluir Nota Fiscal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}