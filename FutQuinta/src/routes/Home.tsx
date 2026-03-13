import { useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import { AuthContext } from '../components/AuthContext';
import CartaJogador from '../components/CartaJogador';


const API_URL = import.meta.env.VITE_API_URL;
const PASS = import.meta.env.VITE_ADMIN_PASSWORD;

// Interfaces necessárias
export interface Jogador {
  id: number;
  nome: string;
  posicao: "Goleiro" | "Linha";
  fisico: number
  pontos: number;
  partidas: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  fotoUrl: string | null;
}

interface PartidaSalva {
  id: null | number;
  jogadores: Array<{ id: number; time: string }>;
  golsAzul: number;
  golsVermelho: number;
  vencedor: string;
  data: Date;
}

interface HomeProps {
  jogadores: Jogador[];
  carregarJogadores: () => Promise<void>;
}

export default function Home({ jogadores, carregarJogadores }: HomeProps) {
  const [carregando, setCarregando] = useState(false);
  const [timeEditandoModal, setTimeEditandoModal] = useState<'Azul' | 'Vermelho' | null>(null);
  const [jogadoresSelecionadosTime1, setJogadoresSelecionadosTime1] = useState<number[]>([]);
  const [jogadoresSelecionadosTime2, setJogadoresSelecionadosTime2] = useState<number[]>([]);
  const [golsTime1, setGolsTime1] = useState<number>(0);
  const [golsTime2, setGolsTime2] = useState<number>(0);
  const [partidasSalvas, setPartidasSalvas] = useState<PartidaSalva[]>([]);

  const { equipeAtiva } = useContext(AuthContext);


  useEffect(() => {
    async function carregarPartidas() {
      try {
        const res = await fetch(`${API_URL}/partidas`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('token_acesso')}`
           }
        });
        if (!res.ok) throw new Error('Erro ao buscar partidas');
        const data = await res.json();
        setPartidasSalvas(data);
      } catch (err) {
        console.error(err);
      }
    }
    carregarJogadores();
    carregarPartidas();

  }, []);



  // Ordena as partidas por data
  const partidasOrdenadas = [...partidasSalvas].sort((a, b) => {
    const dataA = new Date(a.data).getTime();
    const dataB = new Date(b.data).getTime();
    return dataB - dataA;
  });

  const removerJogadorTime1 = (id: number) => {
    setJogadoresSelecionadosTime1(jogadoresSelecionadosTime1.filter(jId => jId !== id));
  };

  const removerJogadorTime2 = (id: number) => {
    setJogadoresSelecionadosTime2(jogadoresSelecionadosTime2.filter(jId => jId !== id));
  };

  const toggleJogador = (id: number) => {
    if (!timeEditandoModal) return;

    const isAzul = timeEditandoModal === 'Azul';
    const timeAtual = isAzul ? jogadoresSelecionadosTime1 : jogadoresSelecionadosTime2;
    const setTimeAtual = isAzul ? setJogadoresSelecionadosTime1 : setJogadoresSelecionadosTime2;
    const timeAdversario = isAzul ? jogadoresSelecionadosTime2 : jogadoresSelecionadosTime1;

    if (timeAtual.includes(id)) {
      setTimeAtual(timeAtual.filter(jId => jId !== id));
    } else {
      if (timeAtual.length < 8 && !timeAdversario.includes(id)) {
        setTimeAtual([...timeAtual, id]);
      }
    }
  };

  async function atualizarEstatisticasJogador(id: number, resultado: 'vitoria' | 'empate' | 'derrota') {
    const jogadorAtual = jogadores.find(j => j.id === id);
    if (!jogadorAtual) return;

    const dadosAtualizados = {
      ...jogadorAtual,
      partidas: jogadorAtual.partidas + 1,
      pontos: jogadorAtual.pontos + (resultado === 'vitoria' ? 3 : (resultado === 'empate' ? 1 : 0)),
      vitorias: jogadorAtual.vitorias + (resultado === 'vitoria' ? 1 : 0),
      empates: jogadorAtual.empates + (resultado === 'empate' ? 1 : 0),
      derrotas: jogadorAtual.derrotas + (resultado === 'derrota' ? 1 : 0),
    };

    return fetch(`${API_URL}/jogadores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosAtualizados),
    });
  }

  const salvarPartida = async () => {
    const userInput: string | null = window.prompt("Please enter password: ");
    if (userInput !== PASS) {
      alert("Esta ação requer permissões de administrador!");
      return;
    }

    setCarregando(true);

    try {
      if (golsTime1 < 0 || golsTime2 < 0) {
        alert('Os gols não podem ser negativos!');
        return;
      }

      if (jogadoresSelecionadosTime1.length > 8 || jogadoresSelecionadosTime2.length > 8) {
        alert('Cada time pode ter no máximo 8 jogadores!');
        return;
      }

      let vencedor: string;
      if (golsTime1 > golsTime2) {
        vencedor = 'Azul';
      } else if (golsTime1 < golsTime2) {
        vencedor = 'Vermelho';
      } else {
        vencedor = 'Empate';
      }

      const jogadoresComTimes = [
        ...jogadoresSelecionadosTime1.map(id => ({ id, time: 'Azul' })),
        ...jogadoresSelecionadosTime2.map(id => ({ id, time: 'Vermelho' }))
      ];

      const dadosPartida: PartidaSalva = {
        id: null,
        jogadores: jogadoresComTimes,
        golsAzul: golsTime1,
        golsVermelho: golsTime2,
        vencedor,
        data: new Date()
      };

      const res = await fetch(`${API_URL}/partidas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token_acesso')}`
         },
        body: JSON.stringify(dadosPartida),
      });

      if (!res.ok) throw new Error('Erro ao salvar partida');

      const partidaSalva = await res.json();
      setPartidasSalvas([...partidasSalvas, partidaSalva]);

      const promessasAzul = jogadoresSelecionadosTime1.map(id => {
        const resultado = vencedor === 'Azul' ? 'vitoria' : (vencedor === 'Empate' ? 'empate' : 'derrota');
        return atualizarEstatisticasJogador(id, resultado);
      });

      const promessasVermelho = jogadoresSelecionadosTime2.map(id => {
        const resultado = vencedor === 'Vermelho' ? 'vitoria' : (vencedor === 'Empate' ? 'empate' : 'derrota');
        return atualizarEstatisticasJogador(id, resultado);
      });

      await Promise.all([...promessasAzul, ...promessasVermelho]);
      await carregarJogadores();

      setJogadoresSelecionadosTime1([]);
      setJogadoresSelecionadosTime2([]);
      setGolsTime1(0);
      setGolsTime2(0);

      alert('Partida e estatísticas salvas com sucesso!');

    } catch (err) {
      console.error(err);
      alert('Erro ao processar partida!');
    } finally {
      setCarregando(false);
    }
  };


  //Cards
  const [ jogadorDestaque, setJogadorDestaque ] = useState<number>(0);
  const jogadorEncontrado = jogadores.find(jogador => jogador.id === jogadorDestaque);

  const scoreJogador = (jogador: Jogador) => {
    if (jogador.partidas === 0) {
        return 0.00.toFixed(2);
    } else if (jogador.partidas <= 2) {
        return 50.00.toFixed(2);
    } else {
        const pontosPossiveis = jogador.partidas * 3;
        
        //Dividimos um pelo outro e multiplicamos por 100
        return ((jogador.pontos / pontosPossiveis) * 100).toFixed(2);
    }
  }

  return (
    <>
      {equipeAtiva?.role === 'ADMIN' && (
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-6">Registrar Partida</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* TIME AZUL */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-blue-400 mb-4">Time Azul</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Escalação do Time
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeEditandoModal('Azul')}
                  disabled={jogadoresSelecionadosTime1.length >= 8}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-md transition-colors cursor-pointer"
                >
                  Selecionar Jogadores
                </button>
              </div>
            </div>

            {jogadoresSelecionadosTime1.length >= 8 && (
              <p className="text-yellow-400 text-xs mb-2">Máximo de 8 jogadores atingido</p>
            )}

            <div className="mb-4 space-y-2">
              {jogadoresSelecionadosTime1.map((jogadorId) => {
                const jogador = jogadores.find(j => j.id === jogadorId)
                if (!jogador) return null
                return (
                  <div key={jogadorId} className="bg-gray-700 rounded-md p-3 flex items-center justify-between">
                    <span className="text-white font-medium">{jogador.nome}</span>
                    <button
                      onClick={() => removerJogadorTime1(jogadorId)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Remover jogador"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Número de Gols
              </label>
              <input
                type="number"
                value={golsTime1}
                onChange={(e) => {
                  const valor = parseInt(e.target.value) || 0
                  setGolsTime1(valor < 0 ? 0 : valor)
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* TIME VERMELHO */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-red-400 mb-4">Time Vermelho</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Escalação do Time
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeEditandoModal('Vermelho')}
                  disabled={jogadoresSelecionadosTime2.length >= 8}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold rounded-md transition-colors cursor-pointer"
                >
                  Selecionar Jogadores
                </button>
              </div>
            </div>

            {jogadoresSelecionadosTime2.length >= 8 && (
              <p className="text-yellow-400 text-xs mb-2">Máximo de 8 jogadores atingido</p>
            )}

            <div className="mb-4 space-y-2">
              {jogadoresSelecionadosTime2.map((jogadorId) => {
                const jogador = jogadores.find(j => j.id === jogadorId)
                if (!jogador) return null
                return (
                  <div key={jogadorId} className="bg-gray-700 rounded-md p-3 flex items-center justify-between">
                    <span className="text-white font-medium">{jogador.nome}</span>
                    <button
                      onClick={() => removerJogadorTime2(jogadorId)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Remover jogador"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Número de Gols
              </label>
              <input
                type="number"
                value={golsTime2}
                onChange={(e) => {
                  const valor = parseInt(e.target.value) || 0
                  setGolsTime2(valor < 0 ? 0 : valor)
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={salvarPartida}
            disabled={carregando || equipeAtiva?.role !== 'ADMIN'}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors cursor-pointer"
          >
            {carregando ? 'Salvando...' : 'Salvar Partida'}
          </button>
        </div>
      </div>
      )}

      {/* SEÇÃO DE PARTIDAS SALVAS */}
      {partidasOrdenadas.length > 0 && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Partidas Registradas</h2>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide">
            {partidasOrdenadas.map((partida) => {
              const jogadoresAzul = partida.jogadores.filter(j => j.time === 'Azul')
              const jogadoresVermelho = partida.jogadores.filter(j => j.time === 'Vermelho')
              const dataFormatada = new Date(partida.data).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })

              return (
                <div key={partida.id} className="bg-gray-800 rounded-lg shadow-lg p-6 min-w-full md:w-1/4 box-border scrollbar-hide snap-center">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-400">{dataFormatada}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${partida.vencedor === 'Azul' ? 'bg-blue-500 text-white' :
                        partida.vencedor === 'Vermelho' ? 'bg-red-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                        {partida.vencedor}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-center">
                        <p className="text-blue-400 font-bold text-lg">{partida.golsAzul}</p>
                        <p className="text-xs text-gray-400">Time Azul</p>
                      </div>
                      <span className="text-gray-500 text-xl">×</span>
                      <div className="text-center">
                        <p className="text-red-400 font-bold text-lg">{partida.golsVermelho}</p>
                        <p className="text-xs text-gray-400">Time Vermelho</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-blue-400 mb-2">Time Azul ({jogadoresAzul.length} jogadores):</p>
                      <div className="flex flex-wrap gap-1">
                        {jogadoresAzul.map((j) => {
                          const jogador = jogadores.find(jog => jog.id === j.id)
                          return (
                            <span key={j.id} className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">
                              {jogador?.nome || `ID: ${j.id}`}
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-red-400 mb-2">Time Vermelho ({jogadoresVermelho.length} jogadores):</p>
                      <div className="flex flex-wrap gap-1">
                        {jogadoresVermelho.map((j) => {
                          const jogador = jogadores.find(jog => jog.id === j.id)
                          return (
                            <span key={j.id} className="text-xs bg-red-900 text-red-200 px-2 py-1 rounded">
                              {jogador?.nome || `ID: ${j.id}`}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mb-8 bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-white mb-6">Visualizar BID</h2>
        
        <select
          value={jogadorDestaque}
          onChange={(e) => setJogadorDestaque(parseInt(e.target.value))}
          className="w-full max-w-md px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 mb-8"
        >
          <option value={0}>Selecione um jogador para ver a carta</option>
          {jogadores.map((jogador) => (
            <option key={jogador.id} value={jogador.id}>{jogador.nome}</option>
          ))}
        </select>

        {jogadorEncontrado && (
          <div className="transform scale-90 sm:scale-100 transition-all">
            <CartaJogador
              jogador={jogadorEncontrado}
              notaGeral={parseInt(scoreJogador(jogadorEncontrado))}
            />
          </div>
        )}
      </div>

      {/* MODAL DE EDIÇÃO DE TIME */}
      {timeEditandoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setTimeEditandoModal(null);
          }}
        >
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col border border-gray-700">
            <h2 className="text-xl font-bold text-white">
              Selecionar Jogadores - Time {timeEditandoModal}
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Selecionados: {timeEditandoModal === 'Azul' ? jogadoresSelecionadosTime1.length : jogadoresSelecionadosTime2.length} / 8
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {jogadores.map((jogador) => {
                const estaNoOutroTime = timeEditandoModal === 'Azul'
                  ? jogadoresSelecionadosTime2.includes(jogador.id)
                  : jogadoresSelecionadosTime1.includes(jogador.id);

                const estaNoTimeAtual = timeEditandoModal === 'Azul'
                  ? jogadoresSelecionadosTime1.includes(jogador.id)
                  : jogadoresSelecionadosTime2.includes(jogador.id);

                return (
                  <div
                    key={jogador.id}
                    className={`flex items-center justify-between p-3 rounded-md transition-colors ${estaNoOutroTime ? 'bg-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    <span className={`font-medium ${estaNoOutroTime ? 'text-gray-600' : 'text-white'}`}>
                      {jogador.nome}
                    </span>
                    <input
                      type="checkbox"
                      checked={estaNoTimeAtual}
                      disabled={estaNoOutroTime}
                      onChange={() => toggleJogador(jogador.id)}
                      className={`w-5 h-5 cursor-pointer ${timeEditandoModal === 'Azul' ? 'accent-blue-500' : 'accent-red-500'}`}
                    />
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setTimeEditandoModal(null)}
              className={`w-full mt-6 text-white font-bold py-2 rounded transition-colors ${timeEditandoModal === 'Azul'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-red-600 hover:bg-red-700'
                }`}
            >
              Recolher Seleção
            </button>
          </div>
        </div>
      )}
    </>
  );
}