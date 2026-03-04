import { Link, Outlet } from 'react-router-dom';
import logo from '../assets/newLogo.png';

const TITLE = import.meta.env.VITE_TITULO_MAIN;

export function LayoutInterno() {
  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Aqui está o seu NavBar original */}
      <nav className="bg-gray-800 border-b border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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