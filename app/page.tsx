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
  AlertTriangle, 
  TrendingUp,
  Search,
  Menu,
  X,
  Cpu,
  LogOut
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
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* Overlay para fechar o menu no mobile quando aberto */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}

      {/* Sidebar / Menu Lateral */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        transition-all duration-300 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0
      `}>
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5 truncate">
            <div className="p-1.5 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400 shrink-0">
              <Cpu size={20} />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent truncate">
              FiberGrid
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link href="/" className="block">
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          </Link>
          <Link href="/clientes" className="block">
            <NavItem icon={<Users size={20} />} label="Clientes" />
          </Link>
          <NavItem icon={<Network size={20} />} label="Rede & RB / OLT" />
          <NavItem icon={<MapPin size={20} />} label="Mapa & CTOs" />
          
          {/* LIGAÇÃO DIRETA PARA A PÁGINA FINANCEIRA */}
          <Link href="/financeiro" className="block">
            <NavItem icon={<FileText size={20} />} label="Financeiro" />
          </Link>

          <NavItem icon={<Receipt size={20} />} label="Notas Fiscais" />
          <NavItem icon={<Headphones size={20} />} label="Atendimento / O.S." />
          <NavItem icon={<Box size={20} />} label="Estoque" />
          <NavItem icon={<Activity size={20} />} label="Automações" />
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        
        {/* Topbar / Cabeçalho */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg bg-slate-800 text-slate-300 lg:hidden">
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 w-64 lg:w-96">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Buscar cliente, CPF ou IP..." 
                className="bg-transparent border-none outline-none text-sm text-slate-200 w-full placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              VPN FiberGrid Conectada
            </div>
            <button className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center font-bold text-sm">
                FG
              </div>
              <button 
                onClick={handleLogout}
                title="Sair do Sistema"
                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 text-xs font-medium transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-950 space-y-6">
          
          {/* Alerta de Caixa / Vencimentos */}
          <div className="bg-gradient-to-r from-sky-950/60 to-blue-950/60 border border-sky-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-500/20 rounded-lg text-sky-400 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-sky-200 text-sm lg:text-base">Resumo Operacional do Dia</h4>
                <p className="text-xs text-slate-300">Existem 12 boletos vencidos hoje com envio programado via WhatsApp.</p>
              </div>
            </div>
            <Link href="/financeiro" className="bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold px-4 py-2 rounded-lg transition-colors w-full sm:w-auto text-center shrink-0">
              Ver Inadimplentes
            </Link>
          </div>

          {/* Cards de Saúde da RB */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="CPU Router (Core 1)" 
              value="14%" 
              subValue="Temp: 42°C" 
              icon={<Server className="text-sky-400" size={20} />} 
              status="Normal"
            />
            <MetricCard 
              title="Uso de Memória RAM" 
              value="512 MB / 2 GB" 
              subValue="25% Utilizado" 
              icon={<Activity className="text-emerald-400" size={20} />} 
              status="Normal"
            />
            <MetricCard 
              title="Clientes Online" 
              value="1.428" 
              subValue="12 Offline nas últimas 24h" 
              icon={<Wifi className="text-sky-400" size={20} />} 
              status="Excelente"
            />
            <MetricCard 
              title="Uptime da RB Core" 
              value="45 dias, 12h" 
              subValue="RouterOS v7.12.1" 
              icon={<TrendingUp className="text-amber-400" size={20} />} 
              status="Estável"
            />
          </div>

          {/* Gráfico de Tráfego ao Vivo & Resumo Financeiro */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Gráfico de Tráfego */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 lg:p-5 flex flex-col">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                <div>
                  <h3 className="font-semibold text-slate-200 text-sm lg:text-base">Tráfego do Concentrador (Mbps)</h3>
                  <p className="text-xs text-slate-400">Monitoramento em tempo real via API RouterOS</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-sky-400"><span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span> Download</span>
                  <span className="flex items-center gap-1.5 text-blue-500"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Upload</span>
                </div>
              </div>
              <div className="h-56 lg:h-64 w-full">
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
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="download" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorDownload)" />
                    <Area type="monotone" dataKey="upload" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUpload)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ações Rápidas / Atalhos */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-slate-200 mb-1 text-sm lg:text-base">Ações Rápidas</h3>
                <p className="text-xs text-slate-400 mb-4">Atalhos para operações frequentes no suporte</p>
                
                <div className="space-y-2.5">
                  <Link href="/clientes" className="block">
                    <button className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between transition-colors">
                      <span>+ Novo Cliente PPPoE</span>
                      <span className="text-xs text-sky-400 font-semibold">Atalho</span>
                    </button>
                  </Link>
                  <button className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between transition-colors">
                    <span>Abrir Ordem de Serviço (O.S.)</span>
                    <span className="text-xs text-emerald-400 font-semibold">Suporte</span>
                  </button>
                  <Link href="/financeiro" className="block">
                    <button className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between transition-colors">
                      <span>Liberar Desbloqueio de Confiança</span>
                      <span className="text-xs text-amber-400 font-semibold">Financeiro</span>
                    </button>
                  </Link>
                  <button className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between transition-colors">
                    <span>Disparar Cobrança WhatsApp</span>
                    <span className="text-xs text-sky-400 font-semibold">Automação</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
                <span>FiberGrid System: v1.0.0</span>
                <span className="text-emerald-400 font-medium">Online</span>
              </div>
            </div>

          </div>

        </main>

      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${active ? 'bg-sky-500 text-slate-950 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

function MetricCard({ title, value, subValue, icon, status }: { title: string, value: string, subValue: string, icon: React.ReactNode, status: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
          {icon}
        </div>
      </div>
      <div className="my-3">
        <h4 className="text-2xl font-bold text-slate-100">{value}</h4>
        <p className="text-xs text-slate-400 mt-1">{subValue}</p>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
        <span className="text-slate-500">Status</span>
        <span className="text-emerald-400 font-semibold">{status}</span>
      </div>
    </div>
  );
}