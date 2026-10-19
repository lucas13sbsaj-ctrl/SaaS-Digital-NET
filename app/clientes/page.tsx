'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, 
  Plus, 
  UserCheck, 
  Cpu, 
  X, 
  RefreshCw, 
  MapPin, 
  Network, 
  Lock, 
  User, 
  Building2, 
  Trash2, 
  ArrowLeft,
  Search,
  Wifi,
  WifiOff,
  Activity,
  Calendar,
  SlidersHorizontal,
  Info
} from 'lucide-react';

interface Client {
  id: string;
  created_at?: string;
  name: string;
  phone?: string;
  plan: string;
  status: 'Ativo' | 'Suspenso' | 'Cancelado';
  pppoe_login?: string;
  olt_name?: string;
  cdr_name?: string;
  cto_box?: string;
  cto_port?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  // Campos de Monitoramento MikroTik / FTTH
  ip_address?: string;
  mac_address?: string;
  router_model?: string;
  is_online?: boolean;
  uptime?: string;
}

interface CityOption {
  id: string;
  name: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados de Pesquisa e Filtros
  const [searchTerm, setSearchTerm] = useState('');

  // Estados do Modal de Diagnóstico / Quedas MikroTik
  const [selectedClientForDiag, setSelectedClientForDiag] = useState<Client | null>(null);
  const [isDiagModalOpen, setIsDiagModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dropDays, setDropDays] = useState(10); // Padrão 10 dias
  const [loadingDiag, setLoadingDiag] = useState(false);
  const [mikrotikData, setMikrotikData] = useState<{ dropsCount: number; history: string[] } | null>(null);

  // Dados auxiliares
  const [availableCities, setAvailableCities] = useState<CityOption[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState('Plano 100Mb');
  const [oltName, setOltName] = useState('OLT Central - Huawei');
  const [cdrName, setCdrName] = useState('');
  const [ctoBox, setCtoBox] = useState('');
  const [ctoPort, setCtoPort] = useState('');
  const [pppoeLogin, setPppoeLogin] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('Santo Antônio de Jesus');

  const [newCityInput, setNewCityInput] = useState('');
  const [showAddCity, setShowAddCity] = useState(false);

  // 1. Buscar Dados do Supabase
  const fetchData = async () => {
    setLoading(true);
    
    const { data: clientsData } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: citiesData } = await supabase
      .from('cities')
      .select('*')
      .order('name', { ascending: true });

    // Simulação de dados de IP e Conexão MikroTik caso estejam vazios na base
    const enrichedClients = (clientsData || []).map((c, index) => ({
      ...c,
      ip_address: c.ip_address || `10.50.${Math.floor(index / 254) + 1}.${(index % 254) + 10}`,
      mac_address: c.mac_address || `48:8F:38:${Math.floor(Math.random()*89+10)}:${Math.floor(Math.random()*89+10)}:${Math.floor(Math.random()*89+10)}`,
      router_model: c.router_model || 'ONU Huawei EG8141A5',
      is_online: index % 4 !== 0, // Simulação online/offline
      uptime: '4 dias 12h'
    }));

    setClients(enrichedClients);
    setAvailableCities(citiesData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // Definir datas padrão (últimos 10 dias)
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 10);
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(pastDate.toISOString().split('T')[0]);
  }, []);

  // Abrir modal de diagnóstico e consultar MikroTik
  const handleOpenDiagnostics = (client: Client) => {
    setSelectedClientForDiag(client);
    setIsDiagModalOpen(true);
    fetchMikrotikLogs(client);
  };

  const fetchMikrotikLogs = async (client: Client) => {
    setLoadingDiag(true);
    // Simulação de chamada à API do MikroTik RouterOS para obter quedas no período
    setTimeout(() => {
      const mockDrops = Math.floor(Math.random() * 4); // entre 0 e 3 quedas
      setMikrotikData({
        dropsCount: mockDrops,
        history: mockDrops > 0 ? [
          `Desconexão PPPoE por timeout (LCP echo failure) - ${startDate}`,
          `Queda de link na OLT / SFP - ${endDate}`
        ] : ['Nenhuma queda registada no período selecionado.']
      });
      setLoadingDiag(false);
    }, 600);
  };

  // Filtrar clientes por nome, login ou IP
  const filteredClients = clients.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.pppoe_login && c.pppoe_login.toLowerCase().includes(term)) ||
      (c.ip_address && c.ip_address.includes(term))
    );
  });

  // Adicionar Nova Cidade
  const handleSaveNewCity = async () => {
    if (!newCityInput.trim()) return;
    const { error } = await supabase.from('cities').insert([{ name: newCityInput.trim() }]);
    if (error) {
      alert(`Erro ao adicionar cidade: ${error.message}`);
    } else {
      setCity(newCityInput.trim());
      setNewCityInput('');
      setShowAddCity(false);
      fetchData();
    }
  };

  // Gerar PPPoE
  const handleGeneratePPPoE = () => {
    if (!name.trim()) {
      alert('Por favor, digite o nome do cliente primeiro.');
      return;
    }
    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setPppoeLogin(`${cleanName}_${randomSuffix}`);
  };

  // Adicionar Cliente
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    if (pppoeLogin.trim()) {
      const { data: existingUser } = await supabase
        .from('clients')
        .select('id')
        .eq('pppoe_login', pppoeLogin.trim())
        .single();

      if (existingUser) {
        setErrorMsg(`O login PPPoE "${pppoeLogin}" já está em uso.`);
        setSubmitting(false);
        return;
      }
    }

    const { error } = await supabase.from('clients').insert([
      {
        name,
        phone,
        plan,
        status: 'Ativo',
        olt_name: oltName,
        cdr_name: cdrName,
        cto_box: ctoBox,
        cto_port: ctoPort,
        pppoe_login: pppoeLogin.trim() || null,
        street,
        number,
        neighborhood,
        city
      }
    ]);

    if (error) {
      setErrorMsg(`Erro ao cadastrar cliente: ${error.message}`);
    } else {
      setName('');
      setPhone('');
      setCdrName('');
      setCtoBox('');
      setCtoPort('');
      setPppoeLogin('');
      setStreet('');
      setNumber('');
      setNeighborhood('');
      setIsModalOpen(false);
      fetchData();
    }
    setSubmitting(false);
  };

  // Excluir Cliente
  const handleDeleteClient = async (id: string, clientName: string) => {
    const confirmDelete = window.confirm(`Tem certeza de que deseja excluir o cliente "${clientName}"?`);
    if (!confirmDelete) return;

    setDeletingId(id);
    const { error } = await supabase.from('clients').delete().eq('id', id);

    if (error) {
      alert(`Erro ao excluir cliente: ${error.message}`);
    } else {
      setClients(prev => prev.filter(c => c.id !== id));
    }
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <datalist id="cities-list">
        {availableCities.map((c) => (
          <option key={c.id} value={c.name} />
        ))}
      </datalist>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
              title="Voltar para a Dashboard"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Voltar</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
                <Cpu size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100">FiberGrid System</h1>
                <p className="text-xs text-sky-400 font-medium">Gestão, Conexão e Telemetria MikroTik</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => { setErrorMsg(null); setIsModalOpen(true); }}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            <Plus size={18} /> Adicionar Cliente
          </button>
        </div>

        {/* Barra de Pesquisa Avançada */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="relative w-full sm:w-96">
            <Search size={18} className="absolute left-3.5 top-3 text-slate-500" />
            <input 
              type="text" 
              placeholder="Pesquisar por Nome, Login PPPoE ou IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-200 placeholder:text-slate-600"
            />
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
              {clients.filter(c => c.is_online).length} Online
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 font-medium border border-rose-500/20">
              {clients.filter(c => !c.is_online).length} Offline
            </span>
          </div>
        </div>

        {/* Tabela de Clientes */}
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-sky-400" size={32} /></div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase bg-slate-950/50">
                  <th className="p-4">Estado / Cliente</th>
                  <th className="p-4">PPPoE & IP</th>
                  <th className="p-4">Plano</th>
                  <th className="p-4">Rede (OLT / Caixa)</th>
                  <th className="p-4">Equipamento & MAC</th>
                  <th className="p-4 text-right">Ações / Diagnóstico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {filteredClients.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">Nenhum cliente encontrado.</td></tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <span title={client.is_online ? 'Online na MikroTik' : 'Offline'} className={`w-3 h-3 rounded-full shrink-0 ${client.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        <div>
                          <div className="font-medium text-slate-200">{client.name}</div>
                          <div className="text-xs text-slate-500">{client.phone || 'Sem contacto'}</div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs">
                        <div className="text-sky-300 font-semibold">{client.pppoe_login || '-'}</div>
                        <div className="text-slate-400">{client.ip_address || 'Sem IP'}</div>
                      </td>
                      <td className="p-4 text-sky-400 font-medium">{client.plan}</td>
                      <td className="p-4 text-xs text-slate-300">
                        <div className="font-medium">{client.olt_name || 'OLT Padrão'}</div>
                        <div className="text-slate-400">{client.cdr_name ? `${client.cdr_name} | ` : ''}{client.cto_box ? `Caixa: ${client.cto_box}` : ''}</div>
                      </td>
                      <td className="p-4 text-xs text-slate-300">
                        <div className="text-slate-200 font-medium">{client.router_model}</div>
                        <div className="text-slate-500 font-mono text-[11px]">{client.mac_address}</div>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenDiagnostics(client)}
                          title="Ver Quedas e Telemetria MikroTik"
                          className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                        >
                          <Activity size={14} /> Telemetria
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id, client.name)}
                          disabled={deletingId === client.id}
                          title="Excluir Cliente"
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors disabled:opacity-50 inline-flex items-center"
                        >
                          {deletingId === client.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
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

      {/* MODAL DE DIAGNÓSTICO E QUEDAS MIKROTIK */}
      {isDiagModalOpen && selectedClientForDiag && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
            
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-2.5 text-sky-400">
                <Activity size={22} />
                <div>
                  <h2 className="text-slate-100 font-bold text-base">Telemetria & Histórico MikroTik</h2>
                  <p className="text-xs text-slate-400">Cliente: {selectedClientForDiag.name} ({selectedClientForDiag.pppoe_login})</p>
                </div>
              </div>
              <button onClick={() => setIsDiagModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg bg-slate-900 border border-slate-800">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Filtro de Período (Padrão 10 dias) */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-1.5">
                    <Calendar size={14} className="text-sky-400" /> Período de Análise de Quedas
                  </span>
                  <span className="text-xs text-sky-400 font-medium">Padrão: {dropDays} dias</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Data Inicial</label>
                    <input 
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-200 outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Data Final</label>
                    <input 
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-200 outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={() => fetchMikrotikLogs(selectedClientForDiag)}
                      className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw size={14} /> Atualizar Logs
                    </button>
                  </div>
                </div>
              </div>

              {/* Resultado da Consulta MikroTik */}
              {loadingDiag ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-sky-400" size={32} /></div>
              ) : mikrotikData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                      <div className="text-xs text-slate-400">Total de Quedas no Período</div>
                      <div className="text-3xl font-bold text-amber-400 mt-1">{mikrotikData.dropsCount}</div>
                      <p className="text-[11px] text-slate-500 mt-1">Registos recolhidos via API RouterOS</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                      <div className="text-xs text-slate-400">IP Atribuído Atualmente</div>
                      <div className="text-xl font-mono font-bold text-sky-300 mt-1">{selectedClientForDiag.ip_address}</div>
                      <p className="text-[11px] text-slate-500 mt-1">MAC: {selectedClientForDiag.mac_address}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Histórico de Eventos na OLT / MikroTik</div>
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-2 text-xs font-mono">
                      {mikrotikData.history.map((log, idx) => (
                        <div key={idx} className="text-slate-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
              <button 
                onClick={() => setIsDiagModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL POP-UP DE NOVO CLIENTE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-8">
            
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2 text-sky-400 font-semibold">
                <User size={20} />
                <span className="text-slate-100 text-lg font-bold">Cadastrar Novo Cliente FTTH</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddClient} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Dados Pessoais */}
              <div>
                <h3 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User size={14} /> Dados Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nome Completo *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ex: João da Silva"
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Telemóvel / WhatsApp</label>
                    <input 
                      type="text" 
                      placeholder="(75) 99999-0000"
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="border-t border-slate-800/80 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={14} /> Endereço de Instalação
                  </h3>
                  <button 
                    type="button"
                    onClick={() => setShowAddCity(!showAddCity)}
                    className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <Building2 size={12} /> + Nova Cidade Lista
                  </button>
                </div>

                {showAddCity && (
                  <div className="mb-4 p-3 bg-slate-950 border border-sky-500/30 rounded-xl flex gap-2 items-center">
                    <input 
                      type="text"
                      placeholder="Nome da nova cidade"
                      value={newCityInput}
                      onChange={(e) => setNewCityInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs outline-none text-slate-200"
                    />
                    <button 
                      type="button" 
                      onClick={handleSaveNewCity}
                      className="bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs px-3 py-1.5 rounded-lg font-semibold"
                    >
                      Salvar Cidade
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Cidade</label>
                    <input 
                      type="text" 
                      list="cities-list"
                      placeholder="Ex: Santo Antônio de Jesus"
                      value={city} 
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Bairro</label>
                    <input 
                      type="text" 
                      placeholder="Centro"
                      value={neighborhood} 
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Rua</label>
                    <input 
                      type="text" 
                      placeholder="Nome da Rua"
                      value={street} 
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-200"
                    />
                  </div>
                </div>
                <div className="mt-3 w-1/3">
                  <label className="block text-xs text-slate-400 mb-1">Número</label>
                  <input 
                    type="text" 
                    placeholder="123"
                    value={number} 
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-200"
                  />
                </div>
              </div>

              {/* FTTH */}
              <div className="border-t border-slate-800/80 pt-4">
                <h3 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Network size={14} /> Dados de Conexão FTTH
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Plano Escolhido</label>
                    <select 
                      value={plan} 
                      onChange={(e) => setPlan(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-200"
                    >
                      <option value="Plano 50Mb">Plano 50Mb</option>
                      <option value="Plano 100Mb">Plano 100Mb</option>
                      <option value="Plano 300Mb">Plano 300Mb</option>
                      <option value="Plano 500Mb">Plano 500Mb</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">OLT Conectada</label>
                    <select 
                      value={oltName} 
                      onChange={(e) => setOltName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-200"
                    >
                      <option value="OLT Central - Huawei">OLT Central - Huawei</option>
                      <option value="OLT Norte - FiberHome">OLT Norte - FiberHome</option>
                      <option value="OLT Sul - ZTE">OLT Sul - ZTE</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">CDR (Distribuidor)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: CDR-01 Central"
                      value={cdrName} 
                      onChange={(e) => setCdrName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Caixa (CTO)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: CTO-04"
                      value={ctoBox} 
                      onChange={(e) => setCtoBox(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Porta CTO</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 08"
                      value={ctoPort} 
                      onChange={(e) => setCtoPort(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* PPPoE */}
              <div className="border-t border-slate-800/80 pt-4">
                <h3 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Lock size={14} /> Credenciais PPPoE
                </h3>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Login PPPoE (Único na OLT)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="ex: joaosilva_102"
                      value={pppoeLogin} 
                      onChange={(e) => setPppoeLogin(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-200 font-mono"
                    />
                    <button 
                      type="button" 
                      onClick={handleGeneratePPPoE}
                      className="bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs px-3 py-2 rounded-xl font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
                    >
                      <RefreshCw size={14} /> Gerar Automático
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-800 pt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Salvar Cliente'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}