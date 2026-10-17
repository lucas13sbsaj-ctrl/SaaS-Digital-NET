'use client';

import { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Wifi, 
  WifiOff, 
  MoreVertical, 
  X, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  MapPin,
  Lock,
  CreditCard,
  Radio
} from 'lucide-react';
import Link from 'next/link';

// Dados de exemplo de clientes para visualização
const mockClientes = [
  {
    id: '1',
    nome: 'João Silva',
    cpfCnpj: '012.345.678-90',
    pppoe: 'joao.silva@provedor',
    ip: '100.64.10.15',
    plano: '300 Mega Fibra',
    valor: 99.90,
    vencimento: 10,
    cto: 'CTO-BairroNorte-04',
    porta: 3,
    sinalOnu: '-19.5 dBm',
    status: 'online',
    financeiro: 'em_dia'
  },
  {
    id: '2',
    nome: 'Maria Oliveira',
    cpfCnpj: '987.654.321-00',
    pppoe: 'maria.oliveira@provedor',
    ip: '100.64.10.18',
    plano: '500 Mega Fibra',
    valor: 129.90,
    vencimento: 15,
    cto: 'CTO-Centro-01',
    porta: 1,
    sinalOnu: '-22.1 dBm',
    status: 'online',
    financeiro: 'vencido'
  },
  {
    id: '3',
    nome: 'Empresa Alvorada LTDA',
    cpfCnpj: '12.345.678/0001-99',
    pppoe: 'alvorada.corp@provedor',
    ip: '177.100.50.2',
    plano: '1 Giga Dedicado',
    valor: 499.00,
    vencimento: 5,
    cto: 'CTO-Ind-02',
    porta: 8,
    sinalOnu: '-17.2 dBm',
    status: 'offline',
    financeiro: 'bloqueado'
  }
];

export default function ClientesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Filtragem de clientes
  const clientesFiltrados = mockClientes.filter(cliente => {
    const combinaBusca = cliente.nome.toLowerCase().includes(busca.toLowerCase()) || 
                         cliente.pppoe.toLowerCase().includes(busca.toLowerCase()) ||
                         cliente.cpfCnpj.includes(busca) ||
                         cliente.ip.includes(busca);
    
    if (filtroStatus === 'online') return combinaBusca && cliente.status === 'online';
    if (filtroStatus === 'offline') return combinaBusca && cliente.status === 'offline';
    if (filtroStatus === 'vencido') return combinaBusca && (cliente.financeiro === 'vencido' || cliente.financeiro === 'bloqueado');
    return combinaBusca;
  });

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        
        {/* Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              
              <p className="text-xs text-slate-400 hidden sm:block">Base total: {mockClientes.length} assinantes cadastrados</p>
            </div>
          </div>

          <button 
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
          >
            <UserPlus size={18} />
            <span>Novo Cliente</span>
          </button>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-950 space-y-6">
          
          {/* Barra de Filtros e Busca */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 w-full sm:w-96">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input 
                type="text" 
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome, login PPPoE, CPF ou IP..." 
                className="bg-transparent border-none outline-none text-sm text-slate-200 w-full placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <button 
                onClick={() => setFiltroStatus('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${filtroStatus === 'todos' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setFiltroStatus('online')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${filtroStatus === 'online' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'}`}
              >
                Online
              </button>
              <button 
                onClick={() => setFiltroStatus('offline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${filtroStatus === 'offline' ? 'bg-slate-700 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'}`}
              >
                Offline
              </button>
              <button 
                onClick={() => setFiltroStatus('vencido')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${filtroStatus === 'vencido' ? 'bg-rose-600 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-800'}`}
              >
                Inadimplentes
              </button>
            </div>
          </div>

          {/* Tabela de Clientes */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Status / Cliente</th>
                    <th className="py-3.5 px-4">Login PPPoE / IP</th>
                    <th className="py-3.5 px-4">Plano / Valor</th>
                    <th className="py-3.5 px-4">CTO / Porta</th>
                    <th className="py-3.5 px-4">Sinal ONU</th>
                    <th className="py-3.5 px-4">Financeiro</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {clientesFiltrados.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {cliente.status === 'online' ? (
                            <span className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Online">
                              <Wifi size={16} />
                            </span>
                          ) : (
                            <span className="p-1.5 rounded-full bg-slate-800 text-slate-500" title="Offline">
                              <WifiOff size={16} />
                            </span>
                          )}
                          <div>
                            <p className="font-semibold text-slate-100">{cliente.nome}</p>
                            <p className="text-xs text-slate-400">{cliente.cpfCnpj}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-mono text-xs text-blue-400">{cliente.pppoe}</p>
                        <p className="font-mono text-xs text-slate-400">{cliente.ip}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-200">{cliente.plano}</p>
                        <p className="text-xs text-slate-400">R$ {cliente.valor.toFixed(2)} (Dia {cliente.vencimento})</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="text-xs font-medium text-slate-300">{cliente.cto}</p>
                        <p className="text-xs text-slate-400">Porta {cliente.porta}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <Radio size={12} />
                          {cliente.sinalOnu}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {cliente.financeiro === 'em_dia' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Em dia
                          </span>
                        )}
                        {cliente.financeiro === 'vencido' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Vencido
                          </span>
                        )}
                        {cliente.financeiro === 'bloqueado' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Bloqueado
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>

      </div>

      {/* Modal de Cadastro de Cliente */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <UserPlus size={20} className="text-blue-400" />
                Cadastrar Novo Assinante
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setModalOpen(false); }}>
              
              {/* Dados Pessoais */}
              <div>
                <h3 className="text-xs font-semibold uppercase text-slate-400 mb-3 flex items-center gap-2">
                  <Users size={14} /> Dados Pessoais
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 font-medium">Nome Completo / Razão Social</label>
                    <input type="text" required placeholder="Ex: Carlos Eduardo" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-medium">CPF ou CNPJ</label>
                    <input type="text" required placeholder="000.000.000-00" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-medium">Celular / WhatsApp</label>
                    <input type="text" required placeholder="(75) 99999-9999" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-medium">E-mail</label>
                    <input type="email" placeholder="cliente@email.com" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              {/* Conexão PPPoE / Rede */}
              <div className="pt-3 border-t border-slate-800">
                <h3 className="text-xs font-semibold uppercase text-slate-400 mb-3 flex items-center gap-2">
                  <Lock size={14} /> Conexão PPPoE & Provisionamento
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 font-medium">Login PPPoE</label>
                    <input type="text" required placeholder="usuario@provedor" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-blue-400 outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-medium">Senha PPPoE</label>
                    <input type="password" required placeholder="******" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-medium">IP Fixo (Opcional)</label>
                    <input type="text" placeholder="100.64.X.X" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              {/* Plano & Financeiro */}
              <div className="pt-3 border-t border-slate-800">
                <h3 className="text-xs font-semibold uppercase text-slate-400 mb-3 flex items-center gap-2">
                  <CreditCard size={14} /> Plano & Vencimento
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 font-medium">Plano de Velocidade</label>
                    <select className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500">
                      <option>300 Mega Fibra - R$ 99,90</option>
                      <option>500 Mega Fibra - R$ 129,90</option>
                      <option>1 Giga Dedicado - R$ 499,00</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-medium">Dia de Vencimento</label>
                    <select className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500">
                      <option>Dia 05</option>
                      <option>Dia 10</option>
                      <option>Dia 15</option>
                      <option>Dia 20</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-medium">Caixa CTO / Porta</label>
                    <input type="text" placeholder="Ex: CTO-04 / Porta 3" className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
                  Salvar e Criar na RB
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}