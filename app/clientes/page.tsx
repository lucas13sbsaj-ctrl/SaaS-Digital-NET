'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Plus, 
  Search, 
  ArrowLeft, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  FileText, 
  X, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  cep?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  uf?: string;
  ibge_code?: string;
  created_at?: string;
}

export default function ClientsManagementPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados do Modal de Novo Cliente
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Campos do Formulário de Cliente
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  
  // Campos de Endereço & IBGE para ANATEL
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [uf, setUf] = useState('');
  const [ibgeCode, setIbgeCode] = useState('');
  const [fetchingCep, setFetchingCep] = useState(false);

  // Estados de Exclusão
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  // BUSCA AUTOMÁTICA DE CEP E CÓDIGO IBGE (EXIGÊNCIA ANATEL)
  const handleCepChange = async (value: string) => {
    const cleanCep = value.replace(/\D/g, '');
    setCep(value);

    if (cleanCep.length === 8) {
      setFetchingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setAddress(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || '');
          setUf(data.uf || '');
          setIbgeCode(data.ibge || ''); // Código IBGE retornado pelo ViaCEP
        } else {
          alert('CEP não encontrado.');
        }
      } catch (err) {
        console.error('Erro ao consultar CEP:', err);
      }
      setFetchingCep(false);
    }
  };

  // SALVAR NOVO CLIENTE
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);

    const payload = {
      name: name.trim(),
      cpf: cpf.trim(),
      phone: phone.trim(),
      cep: cep.trim(),
      address: address.trim(),
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      uf: uf.trim(),
      ibge_code: ibgeCode.trim() // Salvando o código IBGE para relatórios ANATEL
    };

    const { error } = await supabase.from('clients').insert([payload]);

    if (error) {
      alert(`Erro ao cadastrar cliente: ${error.message}`);
    } else {
      setIsModalOpen(false);
      setName('');
      setCpf('');
      setPhone('');
      setCep('');
      setAddress('');
      setNeighborhood('');
      setCity('');
      setUf('');
      setIbgeCode('');
      fetchClients();
    }
    setSaving(false);
  };

  // EXCLUIR CLIENTE
  const confirmDeleteClient = async () => {
    if (!deletingId) return;

    const { error } = await supabase.from('clients').delete().eq('id', deletingId);

    if (error) {
      alert(`Erro ao excluir cliente: ${error.message}`);
    } else {
      setDeletingId(null);
      fetchClients();
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.cpf && c.cpf.includes(searchTerm)) ||
    (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-8 text-slate-100 font-sans space-y-6">
      
      {/* TOPO E NAVEGAÇÃO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold"
          >
            <ArrowLeft size={16} /> Voltar para Dashboard
          </Link>
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-white uppercase tracking-wide flex items-center gap-2">
              <Users className="text-sky-400" size={24} /> Gestão de Clientes & Base Provedor
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Gerenciamento completo de cadastros e dados geográficos ANATEL</p>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(56,189,248,0.2)]"
        >
          <Plus size={16} /> Novo Cliente
        </button>
      </div>

      {/* BARRA DE PESQUISA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, CPF ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none focus:border-sky-500 text-slate-200 placeholder:text-slate-600 font-mono"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">{filteredClients.length} clientes cadastrados</span>
      </div>

      {/* TABELA DE CLIENTES */}
      {loading ? (
        <div className="flex justify-center p-16 text-sky-400 font-mono text-xs">
          <RefreshCw className="animate-spin mr-2" size={20} /> Carregando base de clientes...
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-bold bg-slate-950/80">
                <th className="p-4">Nome do Cliente</th>
                <th className="p-4">CPF / CNPJ</th>
                <th className="p-4">Contato / Telefone</th>
                <th className="p-4">Cidade / UF</th>
                <th className="p-4">Cód. IBGE (ANATEL)</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 italic">
                    Nenhum cliente cadastrado. Clique em "Novo Cliente" acima para começar.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-slate-100 flex items-center gap-2">
                      <Users size={15} className="text-sky-400 shrink-0" />
                      {client.name}
                    </td>
                    <td className="p-4 font-mono text-slate-300">{client.cpf || 'Não informado'}</td>
                    <td className="p-4 font-mono text-slate-400">{client.phone || 'N/A'}</td>
                    <td className="p-4 text-slate-300">{client.city ? `${client.city} - ${client.uf}` : 'Não informado'}</td>
                    <td className="p-4 font-mono text-emerald-400 font-bold">{client.ibge_code || 'Pendente'}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/clientes/${client.id}`}
                          className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-lg font-bold transition-colors"
                        >
                          Gerenciar Perfil
                        </Link>
                        <button 
                          onClick={() => setDeletingId(client.id)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-colors"
                          title="Excluir Cliente"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE NOVO CLIENTE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative my-6">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="text-slate-100 font-bold text-base flex items-center gap-2">
                <Users size={18} className="text-sky-400" />
                Cadastrar Novo Cliente (Padrão ANATEL)
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Nome Completo *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: João da Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">CPF / CNPJ</label>
                  <input 
                    type="text" 
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">Telefone / WhatsApp</label>
                <input 
                  type="text" 
                  placeholder="(75) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 text-slate-200 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">CEP (Busca Automática) *</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      placeholder="44570-000"
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 text-slate-200 font-mono"
                    />
                    {fetchingCep && (
                      <Loader2 size={16} className="animate-spin absolute right-3 top-3 text-sky-400" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-emerald-400 mb-1">Código IBGE (Exigência ANATEL)</label>
                  <input 
                    type="text" 
                    readOnly
                    placeholder="Preenchido pelo CEP"
                    value={ibgeCode}
                    className="w-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2.5 rounded-xl text-emerald-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-400 mb-1">Endereço / Logradouro</label>
                  <input 
                    type="text" 
                    placeholder="Rua, Avenida, etc."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">Bairro</label>
                  <input 
                    type="text" 
                    placeholder="Bairro"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-medium text-slate-400 mb-1">Cidade</label>
                  <input 
                    type="text" 
                    placeholder="Cidade"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-400 mb-1">UF</label>
                  <input 
                    type="text" 
                    placeholder="BA"
                    value={uf}
                    onChange={(e) => setUf(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-lg"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">Excluir Cliente?</h3>
                <p className="text-xs text-slate-400">Todos os dados e logins PPPoE vinculados serão removidos.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setDeletingId(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 text-xs font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDeleteClient}
                className="bg-rose-500 hover:bg-rose-400 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
              >
                Sim, Excluir Cliente
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}