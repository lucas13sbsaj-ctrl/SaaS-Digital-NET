'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, Loader2, ShieldAlert, Cpu, Zap, Activity, Network } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(`Autenticação recusada: ${error.message}`);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 overflow-hidden font-sans">
      
      {/* BACKGROUND DE ALTA TECNOLOGIA: Fibras Ópticas expandidas por toda a tela */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glow Central Ciano/Azul */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />

        {/* Linhas de Fibra Óptica SVG ocupando 100% da Largura e Altura */}
        <svg className="absolute inset-0 w-full h-full opacity-45" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1440 900">
          <defs>
            <linearGradient id="fiberGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Feixes Diagonais e Cruzados cobrindo todo o espaço */}
          <g filter="url(#glow)">
            <path d="M-200,100 L1600,800" stroke="url(#fiberGlow)" strokeWidth="2" className="animate-pulse" />
            <path d="M100,-100 L1300,1000" stroke="url(#fiberGlow)" strokeWidth="1.5" />
            <path d="M-100,800 L1500,-100" stroke="url(#fiberGlow)" strokeWidth="2.5" className="animate-pulse" style={{ animationDuration: '3s' }} />
            <path d="M400,-100 L-100,1000" stroke="url(#fiberGlow)" strokeWidth="1.8" />
            <path d="M1200,-50 L1600,950" stroke="url(#fiberGlow)" strokeWidth="2" className="animate-pulse" style={{ animationDuration: '4s' }} />
            <path d="M-100,450 L1600,450" stroke="url(#fiberGlow)" strokeWidth="1.2" />
          </g>

          {/* Nós de Rede / Grid Holográfico espalhados por toda a tela */}
          <circle cx="10%" cy="15%" r="2" fill="#38bdf8" className="animate-ping" style={{ animationDuration: '4s' }} />
          <circle cx="90%" cy="80%" r="2.5" fill="#3b82f6" className="animate-ping" style={{ animationDuration: '6s' }} />
          <circle cx="75%" cy="20%" r="1.5" fill="#0ea5e9" className="animate-ping" style={{ animationDuration: '3s' }} />
          <circle cx="25%" cy="85%" r="2" fill="#38bdf8" className="animate-ping" style={{ animationDuration: '5s' }} />
          <circle cx="50%" cy="10%" r="2.2" fill="#60a5fa" className="animate-ping" style={{ animationDuration: '3.5s' }} />
        </svg>

        {/* Grid Sutil de Fundo Total */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* CARD DE LOGIN GLASSORPHISM PROFISSIONAL */}
      <div className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-sky-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(14,165,233,0.15)] overflow-hidden z-10">
        
        {/* Detalhe Luminoso Superior */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-sky-500/20 to-blue-600/10 border border-sky-500/30 rounded-2xl mb-4 text-sky-400 shadow-inner group">
            <Network size={30} className="animate-pulse text-sky-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sky-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
            FiberGrid System
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 flex items-center justify-center gap-1.5 font-medium">
            <Activity size={12} className="text-emerald-400 animate-pulse" /> Core ISP & Telemetria em Tempo Real
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 flex items-center gap-3 text-rose-400 text-xs animate-shake">
            <ShieldAlert size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Credencial de Acesso</label>
            <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-3 rounded-2xl border border-slate-800 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
              <Mail size={18} className="text-sky-400/70 shrink-0" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fibergrid.com" 
                className="bg-transparent border-none outline-none text-sm text-slate-200 w-full placeholder:text-slate-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Palavra-passe</label>
            <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-3 rounded-2xl border border-slate-800 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
              <Lock size={18} className="text-sky-400/70 shrink-0" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="bg-transparent border-none outline-none text-sm text-slate-200 w-full placeholder:text-slate-600 font-medium"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-3 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 text-sm font-bold py-3.5 rounded-2xl shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin text-slate-950" />
                <span>Estabelecendo Conexão FTTH...</span>
              </>
            ) : (
              <>
                <Zap size={18} className="fill-slate-950" />
                <span>Aceder ao Sistema</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>VPN SECURITY</span>
          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> ONLINE
          </span>
        </div>

      </div>
    </div>
  );
}