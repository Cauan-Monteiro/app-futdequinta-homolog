import { Link, Outlet } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import logo from '../assets/newLogo.png';
import Cookies from 'js-cookie';
import { AuthContext } from './AuthContext';

const TITLE = import.meta.env.VITE_TITULO_MAIN;
const API_URL = import.meta.env.VITE_API_URL;

export function LayoutInterno() {
  const { equipeAtiva, setEquipeAtiva, permissoesGlobais } = useContext(AuthContext);
  const [times, setTimes] = useState<any[]>([]);
  const [menuAberto, setMenuAberto] = useState(false);

  const reloadPage = () => {
    window.location.reload();
  };

  const mudarEquipe = (idTime: string) => {
    setEquipeAtiva({ id: idTime, role: permissoesGlobais[idTime] });
  };

  const logout = () => {
    if(window.confirm("Tem certeza que deseja fazer Logout?")) {
      Cookies.remove('token_acesso');
      setEquipeAtiva(null);
      window.location.href = '/';
    } else {
      reloadPage();
    }
  };

  useEffect(() => {
    const buscarTimes = async () => {
      const ids = Object.keys(permissoesGlobais);
      if (ids.length === 0) return;

      try {
        // Dispara uma requisição para cada ID que está no token
        const promessas = ids.map(id => 
          // Importante: Ajuste "/companies/" para o caminho exato do seu controller, se for diferente
          fetch(`${API_URL}/company/${id}`, {
            headers: { 
              'Authorization': `Bearer ${Cookies.get('token_acesso')}` 
            }
          }).then(res => res.json())
        );
        
        // Espera todas as requisições terminarem
        const dadosDosTimes = await Promise.all(promessas);
        setTimes(dadosDosTimes.filter(Boolean));
      } catch (error) {
        console.error("Erro ao buscar detalhes dos times:", error);
      }
    };

    buscarTimes();
  }, [permissoesGlobais]);

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="absolute left-4">
            <button 
              onClick={() => setMenuAberto(!menuAberto)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg hover:bg-blue-600 focus:outline-none transition-colors"
            >
              {/* Ícone de Casa/Escudo */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span>
                {equipeAtiva ? times.find(t => t?.id?.toString() === equipeAtiva.id)?.nome || "Carregando..." : ""}
              </span>
            </button>

            {menuAberto && (
              <div className="absolute left-0 mt-2 w-56 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden">
                {times.map((time) => (
                  <button
                    key={time.id}
                    onClick={() => mudarEquipe(time.id.toString())}
                    className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-0"
                  >
                    {time.nome} {/* Verifique se a propriedade no backend se chama 'nome' */}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="absolute right-4">
            <button 
              onClick={logout} // Sua função de logout aqui
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md active:scale-95"
            >
              {/* O ÍCONE: Definimos o tamanho exato aqui */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className="w-5 h-5 shrink-0" // shrink-0 impede que o flex esmague o ícone
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" 
                />
              </svg>

              <span>Sair</span>
            </button>
          </div>
          <div className="flex flex-col gap-8 justify-center items-center">
            <div className="flex flex-col items-center space-y-2">
              <img src={logo} alt="FutQuinta Logo" className="h-50 w-80 object-cover cursor-pointer" onClick={reloadPage} />
              <h1 className="text-4xl font-thin text-white">{TITLE}</h1>
            </div>
            <div className="flex flex-row gap-12 w-full h-full justify-center">
              <Link to="/home" className="text-gray-300 hover:text-white transition-colors" >Home</Link>
              {/* O link para o Login foi removido do menu interno, pois não faz sentido voltar para lá se já estamos logados */}
              <Link to="/ranking" className="text-gray-300 hover:text-white transition-colors" >Ranking</Link>
              <Link to="/sorteio" className="text-gray-300 hover:text-white transition-colors cursor-pointer" >Sorteador Times</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ÁREA DINÂMICA: É aqui que o React vai renderizar a Home, o Ranking ou o Sorteio */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </div>
    </div>
  );
}