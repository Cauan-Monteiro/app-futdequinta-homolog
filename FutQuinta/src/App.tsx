import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'

// Importando as Telas
import Login from './routes/Login'
import Home from './routes/Home'
import Ranking from './routes/Ranking'
import Sorteio from './routes/Sorteio'

// Importando a Estrutura
import { RotaProtegida } from './components/RotaProtegida'
import { LayoutInterno } from './components/LayoutInterno'

import './App.css'

const API_URL = import.meta.env.VITE_API_URL

export interface Jogador {
  id: number
  nome: string
  posicao: "Goleiro" | "Linha"
  pontos: number
  partidas: number
  vitorias: number
  empates: number
  derrotas: number
}

function App() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])

  async function carregarJogadores() {
    try {
      const res = await fetch(`${API_URL}/jogadores`);
      if (!res.ok) throw new Error('Erro ao buscar jogadores');
      const data: Jogador[] = await res.json();
      setJogadores(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    carregarJogadores();
  }, []);

  jogadores.sort((a, b) => b.pontos - a.pontos);

  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={
        <RotaProtegida>
          <LayoutInterno />
          </RotaProtegida>
        }>
        
        <Route path="/home" element={<Home jogadores={jogadores} carregarJogadores={carregarJogadores} />} />
        <Route path="/ranking" element={<Ranking jogadores={jogadores} />} />
        <Route path="/sorteio" element={<Sorteio jogadores={jogadores} />} />
        
      </Route>
    </Routes>
  )
}

export default App