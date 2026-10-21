'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Wifi, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  ExternalLink,
  Activity,
  Clock
} from 'lucide-react';

export default function LoginsFilteredPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-sky-400 font-mono text-sm">
        <RefreshCw className="animate-spin mr-2" size={20} /> Carregando conexões...
      </div>
    }>
      <LoginsContent />
    </Suspense>
  );
}

function LoginsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filterType = searchParams.get('filter') || 'ativos'; // ativos, inativos, bloqueados

  const [logins, setLogins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchFilteredLogins() {
      setLoading(true);
      
      // Busca logins e faz join com a tabela de clientes no Supabase
      let query = supabase
        .from('client_logins')
        .select(`
          *,
          clients (id, name, cpf, phone)
        `);

      if (filterType === 'ativos') {
        query = query.eq('status', 'CONECTADO');
      } else if (filterType === 'inativos') {
        query = query.eq('status', 'INATIVO');
      } else if (filterType === 'bloqueados') {
        query = query.eq('status', 'BLOQUEADO');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar logins:', error.message);
      } else {
        setLogins(data || []);
      }
      setLoading(false);
    }

    fetchFilteredLogins();
  }, [filterType]);

  const filteredLogins = logins.filter(item => 
    item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.clients?.name && item.clients.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8 text-slate-100 font-sans space-y-6">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/"
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold"
          >
            <ArrowLeft size={16} /> Voltar para Dashboard
          </Link>
          
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wide flex items-center gap-2">
              <Wifi className="text-sky-400" size={24} /> 
              Monitoramento de Conexões PPPoE ({filterType.toUpperCase()})
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Listagem em tempo real filtrada por estado operacional</p>
          </div>
        </div>

        {/* ABAS DE FILTRO RÁPIDO */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1.5 rounded-xl gap-1 text-xs font-bold">
          <Link 
            href="/logins?filter=ativos"
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              filterType === 'ativos' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 size={13} /> Ativos
          </Link>
          <Link 
            href="/logins?filter=inativos"
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              filterType === 'inativos' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertCircle size={13} /> Inativos
          </Link>
          <Link 
            href="/logins?filter=bloqueados"
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              filterType === 'bloqueados' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <XCircle size={13} /> Bloqueados
          </Link>
        </div>
      </div>

      {/* BARRA DE PESQUISA */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
        <input 
          type="text"
          placeholder="Filtrar por login PPPoE ou nome do cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none focus:border-sky-500 text-slate-200 placeholder:text-slate-600 font-mono"
        />
      </div>

      {/* TABELA DE LOGINS */}
      {loading ? (
        <div className="flex justify-center p-16 text-sky-400 font-mono text-xs"><RefreshCw className="animate-spin mr-2" size={20} /> Carregando logins...</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-bold bg-slate-950/80">
                <th className="p-4">Login PPPoE</th>
                <th className="p-4">Cliente Vinculado</th>
                <th className="p-4">Plano / Velocidade</th>
                <th className="p-4">Uptime / Consumo</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {filteredLogins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 italic">
                    Nenhum login encontrado para o filtro "{filterType}".
                  </td>
                </tr>
              ) : (
                filteredLogins.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-sky-300">{item.username}</td>
                    <td className="p-4 font-semibold text-slate-200">{item.clients?.name || 'Cliente não vinculado'}</td>
                    <td className="p-4 text-slate-400 font-mono">{item.plan_name} ({item.download_speed}M / {item.upload_speed}M)</td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      <span className="block text-slate-300">Uptime: {item.uptime || '0h 0m'}</span>
                      <span className="text-amber-400">Consumo: {item.consumption || '0 MB'}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        item.status === 'CONECTADO' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        item.status === 'INATIVO' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {item.status || 'CONECTADO'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {item.clients?.id && (
                        <button 
                          onClick={() => router.push(`/clientes/${item.clients.id}`)}
                          className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-lg font-bold inline-flex items-center gap-1 transition-colors"
                        >
                          Abrir Perfil <ExternalLink size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}