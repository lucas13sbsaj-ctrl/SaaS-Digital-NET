'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, 
  Plus, 
  ArrowLeft, 
  HardDrive, 
  Trash2, 
  X, 
  Wifi, 
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface RouterModel {
  id: string;
  model_name: string;
  brand: string;
  technology: string;
}

export default function StockPage() {
  const [routers, setRouters] = useState<RouterModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [routerName, setRouterName] = useState('');
  const [routerBrand, setRouterBrand] = useState('Huawei');
  const [routerTech, setRouterTech] = useState('Wi-Fi 5 Dual Band');

  const fetchRouters = async () => {
    setLoading(true);
    const { data } = await supabase.from('router_models').select('*').order('model_name', { ascending: true });
    setRouters(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRouters();
  }, []);

  const handleSaveRouter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from('router_models').insert([{
      model_name: routerName,
      brand: routerBrand,
      technology: routerTech
    }]);

    if (error) {
      alert(`Erro ao cadastrar equipamento: ${error.message}`);
    } else {
      setRouterName('');
      setIsModalOpen(false);
      fetchRouters();
    }
    setSubmitting(false);
  };

  const handleDeleteRouter = async (id: string, name: string) => {
    if (confirm(`Deseja realmente remover o modelo "${name}" do estoque?`)) {
      await supabase.from('router_models').delete().eq('id', id);
      fetchRouters();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Voltar</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
                <HardDrive size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Estoque de Equipamentos & ONUs</h1>
                <p className="text-xs text-sky-400 font-medium">Gestão de Modelos de Roteadores Homologados na Empresa</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_20px_rgba(56,189,248,0.2)]"
          >
            <Plus size={18} /> Cadastrar Novo Equipamento
          </button>
        </div>

        {/* TABELA DE EQUIPAMENTOS */}
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-sky-400" size={36} /></div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase bg-slate-950/50">
                  <th className="p-4">Modelo do Equipamento</th>
                  <th className="p-4">Marca / Fabricante</th>
                  <th className="p-4">Tecnologia Wi-Fi / Padrão</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {routers.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-500">Nenhum equipamento cadastrado no estoque.</td></tr>
                ) : (
                  routers.map((router) => (
                    <tr key={router.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-semibold text-slate-200 flex items-center gap-2.5">
                        <HardDrive size={16} className="text-sky-400" />
                        {router.model_name}
                      </td>
                      <td className="p-4 text-sky-300 font-mono text-xs">{router.brand}</td>
                      <td className="p-4 text-slate-300 text-xs">{router.technology}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteRouter(router.id, router.model_name)}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors inline-flex items-center"
                          title="Excluir Equipamento"
                        >
                          <Trash2 size={16} />
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

      {/* MODAL DE CADASTRAR EQUIPAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <h2 className="text-slate-100 font-bold text-base flex items-center gap-2">
                <HardDrive size={18} className="text-sky-400" />
                Novo Equipamento no Estoque
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRouter} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Modelo do Equipamento *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: ONU Huawei EG8141A5"
                  value={routerName}
                  onChange={(e) => setRouterName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Marca</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Huawei, ZTE, FiberHome"
                    value={routerBrand}
                    onChange={(e) => setRouterBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tecnologia</label>
                  <input 
                    type="text" 
                    placeholder="Wi-Fi 5 / Wi-Fi 6"
                    value={routerTech}
                    onChange={(e) => setRouterTech(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Salvar no Estoque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}