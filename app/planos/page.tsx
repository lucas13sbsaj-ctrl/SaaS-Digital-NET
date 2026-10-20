'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, 
  Plus, 
  ArrowLeft, 
  Wifi, 
  Server, 
  Check, 
  Trash2, 
  Edit3, 
  X, 
  Zap,
  ShieldCheck,
  HardDrive
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  download_speed: number;
  upload_speed: number;
  price: number;
  supported_routers: string[];
}

interface RouterModel {
  id: string;
  model_name: string;
  brand: string;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [routerModels, setRouterModels] = useState<RouterModel[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do Modal de Planos
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState('');
  const [downloadSpeed, setDownloadSpeed] = useState(100);
  const [uploadSpeed, setUploadSpeed] = useState(50);
  const [price, setPrice] = useState(89.90);
  const [selectedRouters, setSelectedRouters] = useState<string[]>([]);
  const [submittingPlan, setSubmittingPlan] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data: plansData, error: plansError } = await supabase.from('plans').select('*').order('price', { ascending: true });
    const { data: routersData } = await supabase.from('router_models').select('*').order('model_name', { ascending: true });

    if (plansError) {
      console.error('Erro ao buscar planos:', plansError.message);
    }

    setPlans(plansData || []);
    setRouterModels(routersData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenPlanModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlanId(plan.id);
      setPlanName(plan.name);
      setDownloadSpeed(plan.download_speed);
      setUploadSpeed(plan.upload_speed);
      setPrice(plan.price);
      setSelectedRouters(plan.supported_routers || []);
    } else {
      setEditingPlanId(null);
      setPlanName('');
      setDownloadSpeed(100);
      setUploadSpeed(50);
      setPrice(89.90);
      setSelectedRouters([]);
    }
    setIsPlanModalOpen(true);
  };

  const toggleRouterSelection = (modelName: string) => {
    setSelectedRouters(prev => 
      prev.includes(modelName) ? prev.filter(r => r !== modelName) : [...prev, modelName]
    );
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPlan(true);

    const payload = {
      name: planName,
      download_speed: Number(downloadSpeed),
      upload_speed: Number(uploadSpeed),
      price: Number(price),
      supported_routers: selectedRouters
    };

    if (editingPlanId) {
      const { error } = await supabase.from('plans').update(payload).eq('id', editingPlanId);
      if (error) alert(`Erro ao atualizar plano: ${error.message}`);
    } else {
      const { error } = await supabase.from('plans').insert([payload]);
      if (error) alert(`Erro ao criar plano: ${error.message}`);
    }

    setIsPlanModalOpen(false);
    setSubmittingPlan(false);
    await fetchData(); // Recarrega os dados imediatamente para atualizar a tela
  };

  const handleDeletePlan = async (id: string) => {
    if (confirm('Deseja realmente remover este plano?')) {
      await supabase.from('plans').delete().eq('id', id);
      await fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/clientes"
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Voltar para Clientes</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
                <Wifi size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Gestão de Planos Comerciais</h1>
                <p className="text-xs text-sky-400 font-medium">Vincule velocidades e equipamentos do estoque aos planos</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/estoque"
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-400 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <HardDrive size={16} /> Ir para o Estoque
            </Link>
            
            <button 
              onClick={() => handleOpenPlanModal()}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_20px_rgba(56,189,248,0.2)]"
            >
              <Plus size={18} /> Novo Plano Comercial
            </button>
          </div>
        </div>

        {/* LISTA DE PLANOS */}
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-sky-400" size={36} /></div>
        ) : plans.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            Nenhum plano comercial cadastrado ainda. Clique em "Novo Plano Comercial" acima.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 hover:border-sky-500/40 rounded-3xl p-6 shadow-xl relative flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/20">
                        FTTH Banda Larga
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-100 mt-2">{plan.name}</h3>
                    </div>
                    
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleOpenPlanModal(plan)}
                        className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                        title="Editar Plano"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Excluir Plano"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 mb-5 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-500 uppercase font-semibold">Mensalidade</div>
                      <div className="text-2xl font-black text-emerald-400">
                        R$ {Number(plan.price).toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500 uppercase font-semibold">Download / Upload</div>
                      <div className="text-sm font-bold text-sky-300 font-mono">
                        {plan.download_speed}M / {plan.upload_speed}M
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Server size={14} className="text-sky-400" /> Equipamentos Vinculados
                    </h4>
                    {plan.supported_routers && plan.supported_routers.length > 0 ? (
                      <div className="space-y-1.5">
                        {plan.supported_routers.map((router, idx) => (
                          <div key={idx} className="text-xs bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300 flex items-center gap-2 font-mono">
                            <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                            <span className="truncate">{router}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 italic">Nenhum equipamento vinculado a este plano.</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1"><Zap size={12} className="text-amber-400" /> Provisionamento FTTH</span>
                  <span className="text-sky-400 font-semibold">Ativo</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL DE CRIAR/EDITAR PLANO */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative my-8">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <h2 className="text-slate-100 font-bold text-base flex items-center gap-2">
                <Wifi size={18} className="text-sky-400" />
                {editingPlanId ? 'Editar Plano Comercial' : 'Criar Novo Plano de Internet'}
              </h2>
              <button onClick={() => setIsPlanModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nome Comercial do Plano *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Plano 300Mb Fibra Turbo"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Download (Mbps)</label>
                  <input 
                    type="number" 
                    required
                    value={downloadSpeed}
                    onChange={(e) => setDownloadSpeed(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Upload (Mbps)</label>
                  <input 
                    type="number" 
                    required
                    value={uploadSpeed}
                    onChange={(e) => setUploadSpeed(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Valor da Mensalidade (R$) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  placeholder="89.90"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-sky-500 text-emerald-400 font-bold font-mono"
                />
              </div>

              {/* SELECIONAR EQUIPAMENTOS CADASTRADOS NO ESTOQUE */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Vincular Equipamentos do Estoque a este Plano
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {routerModels.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Nenhum equipamento no estoque. Cadastre na aba Estoque primeiro.</p>
                  ) : (
                    routerModels.map((router) => {
                      const isSelected = selectedRouters.includes(router.model_name);
                      return (
                        <div 
                          key={router.id}
                          onClick={() => toggleRouterSelection(router.model_name)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                            isSelected 
                              ? 'bg-sky-500/10 border-sky-500/40 text-sky-300' 
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="font-mono">{router.model_name} ({router.brand})</span>
                          {isSelected && <Check size={14} className="text-sky-400" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={submittingPlan}
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5"
                >
                  {submittingPlan ? <Loader2 size={14} className="animate-spin" /> : 'Salvar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}