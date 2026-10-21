'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  Users, 
  Network, 
  MapPin, 
  FileText, 
  Receipt, 
  Headphones, 
  Box, 
  Bell, 
  Activity, 
  Server, 
  Wifi, 
  TrendingUp,
  Search,
  Menu,
  X,
  LogOut,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const trafficData = [
  { time: '10:00', download: 450, upload: 120 },
  { time: '10:10', download: 520, upload: 140 },
  { time: '10:20', download: 610, upload: 180 },
  { time: '10:30', download: 580, upload: 160 },
  { time: '10:40', download: 750, upload: 220 },
  { time: '10:50', download: 890, upload: 250 },
  { time: '11:00', download: 820, upload: 240 },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // BUSCA GLOBAL INTELIGENTE (CLIENTES + LOGINS PPPOE)
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearching(true);
    setIsSearchModalOpen(true);

    const term = searchTerm.trim().toLowerCase();

    const { data: clientsData } = await supabase
      .from('clients')
      .select('*')
      .or(`name.ilike.%${term}%,cpf.ilike.%${term}%`);

    const { data: loginsData } = await supabase
      .from('client_logins')
      .select('client_id, username, plan_name')
      .ilike('username', `%${term}%`);

    let finalResults = clientsData || [];

    if (loginsData && loginsData.length > 0) {
      const clientIdsFromLogins = loginsData.map(l => l.client_id);
      
      const { data: extraClients } = await supabase
        .from('clients')
        .select('*')
        .in('id', clientIdsFromLogins);

      if (extraClients) {
        const existingIds = new Set(finalResults.map(c => c.id));
        for (const ec of extraClients) {
          if (!existingIds.has(ec.id)) {
            finalResults.push(ec);
          }
        }
      }
    }

    setSearchResults(finalResults);
    setSearching(false);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30 lg:hidden" />
      )}

      {/* Sidebar / Menu Lateral */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        transition-all duration-300 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0
      `}>
        {/* LOGO CORPORATIVA EMPRESARIAL */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center font-black text-slate-950 text-lg shadow-[0_0_20px_rgba(56,189,248,0.3)]">
              FG
            </div>
            <div>
              <span className="text-base font-black tracking-wider bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent block">
                FiberGrid
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest block uppercase">ISP Solutions</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <Link href="/" className="block">
            <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active />
          </Link>
          <Link href="/clientes" className="block">
            <NavItem icon={<Users size={18} />} label="Clientes" />
          </Link>
          <NavItem icon={<Network size={18} />} label="Rede & RB / OLT" />
          <NavItem icon={<MapPin size={18} />} label="Mapa & CTOs" />
          <Link href="/financeiro" className="block">
            <NavItem icon={<FileText size={18} />} label="Financeiro" />
          </Link>
          <NavItem icon={<Receipt size={18} />} label="Notas Fiscais" />
          <NavItem icon={<Headphones size={18} />} label="Atendimento / O.S." />
          <Link href="/estoque" className="block">
            <NavItem icon={<Box size={18} />} label="Estoque" />
          </Link>
          <Link href="/planos" className="block">
            <NavItem icon={<Wifi size={18} />} label="Planos Comerciais" />
          </Link>
          <NavItem icon={<Activity size={18} />} label="Automações" />
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        
        {/* TOPBAR / CABEÇALHO REFINADO E PROFISSIONAL */}
        <header className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-10 shrink-0 gap-4">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl bg-slate-800 text-slate-300 lg:hidden">
              <Menu size={20} />
            </button>
            
            {/* Barra de Pesquisa */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 flex-1">
                <Search size={18} className="text-sky-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Buscar por nome, CPF ou login PPPoE..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-slate-200 w-full placeholder:text-slate-600 font-mono"
                />
              </div>
              <button 
                type="submit"
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0 shadow-md"
              >
                Buscar
              </button>
            </form>
          </div>

          <div className="flex items-center gap-4">
            {/* FILTROS INTERATIVOS DE LOGINS PPPOE */}
            <div className="hidden xl:flex items-center bg-slate-950 border border-slate-800 p-1.5 rounded-xl gap-1 text-xs font-bold">
              <Link 
                href="/logins?filter=ativos"
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 size={13} /> Ativos
              </Link>
              <Link 
                href="/logins?filter=inativos"
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
              >
                <AlertCircle size={13} /> Inativos
              </Link>
              <Link 
                href="/logins?filter=bloqueados"
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
              >
                <XCircle size={13} /> Bloqueados
              </Link>
            </div>

            <button className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-sm text-slate-950 shadow-md">
                FG
              </div>
              <button 
                onClick={handleLogout}
                title="Sair do Sistema"
                className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 text-xs font-semibold transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-950 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="CPU Router (Core 1)" value="14%" subValue="Temp: 42°C" icon={<Server className="text-sky-400" size={20} />} status="Normal" />
            <MetricCard title="Uso de Memória RAM" value="512 MB / 2 GB" subValue="25% Utilizado" icon={<Activity className="text-emerald-400" size={20} />} status="Normal" />
            <MetricCard title="Clientes Online" value="1.428" subValue="12 Offline nas últimas 24h" icon={<Wifi className="text-sky-400" size={20} />} status="Excelente" />
            <MetricCard title="Uptime da RB Core" value="45 dias, 12h" subValue="RouterOS v7.12.1" icon={<TrendingUp className="text-amber-400" size={20} />} status="Estável" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Tráfego do Concentrador (Mbps)</h3>
                  <p className="text-xs text-slate-400">Monitoramento em tempo real via API RouterOS</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-sky-400 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span> Download</span>
                  <span className="flex items-center gap-1.5 text-blue-500 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Upload</span>
                </div>
              </div>
              <div className="h-60 lg:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <defs>
                      <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#64748b" textAnchor="end" tick={{fontSize: 12}} />
                    <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="download" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorDownload)" />
                    <Area type="monotone" dataKey="upload" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUpload)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="font-bold text-slate-100 mb-1 text-base">Ações Rápidas</h3>
                <p className="text-xs text-slate-400 mb-5">Atalhos para operações frequentes no suporte</p>
                
                <div className="space-y-3">
                  <Link href="/clientes" className="block">
                    <button className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors">
                      <span>Novo Cliente</span>
                      <span className="text-sky-400 font-bold">Atalho</span>
                    </button>
                  </Link>
                  <button className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors">
                    <span>Abrir Ordem de Serviço (O.S.)</span>
                    <span className="text-emerald-400 font-bold">Suporte</span>
                  </button>
                  <Link href="/financeiro" className="block">
                    <button className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors">
                      <span>Liberar Desbloqueio</span>
                      <span className="text-amber-400 font-bold">Financeiro</span>
                    </button>
                  </Link>
                  <button className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors">
                    <span>Disparar Cobrança WhatsApp</span>
                    <span className="text-sky-400 font-bold">Automação</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
                <span>FiberGrid System: v1.0.0</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* POP-UP DE RESULTADO DA BUSCA */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                  <Search size={18} />
                </div>
                <div>
                  <h3 className="text-slate-100 font-bold text-base">Resultado da Busca</h3>
                  <p className="text-xs text-slate-400 font-mono">Termo: "{searchTerm}"</p>
                </div>
              </div>
              <button onClick={() => setIsSearchModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
              {searching ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-sky-400 font-mono text-xs">
                  <Loader2 size={24} className="animate-spin" />
                  <span>Buscando no banco de dados...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Nenhum cliente ou login encontrado com estes dados.
                </div>
              ) : (
                searchResults.map((client) => (
                  <div 
                    key={client.id}
                    onClick={() => {
                      setIsSearchModalOpen(false);
                      router.push(`/clientes/${client.id}`);
                    }}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-100 group-hover:text-sky-400 transition-colors text-sm">
                        {client.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                        <span>CPF/CNPJ: {client.cpf || 'Não informado'}</span>
                        <span>Tel: {client.phone || 'N/A'}</span>
                      </div>
                    </div>

                    <span className="text-xs bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 shrink-0 group-hover:bg-sky-500 group-hover:text-slate-950 transition-all">
                      Abrir Perfil <ExternalLink size={12} />
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${active ? 'bg-sky-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(56,189,248,0.2)]' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}>
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

function MetricCard({ title, value, subValue, icon, status }: { title: string, value: string, subValue: string, icon: React.ReactNode, status: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{title}</span>
        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
          {icon}
        </div>
      </div>
      <div className="my-3">
        <h4 className="text-2xl font-black text-slate-100 tracking-tight">{value}</h4>
        <p className="text-xs text-slate-400 mt-1">{subValue}</p>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
        <span className="text-slate-500">Status</span>
        <span className="text-emerald-400 font-bold">{status}</span>
      </div>
    </div>
  );
}