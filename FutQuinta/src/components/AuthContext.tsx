import { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

// 1. Criamos o Molde
interface EquipeAtiva {
  id: string;
  role: string;
}

// 2. Criamos a "caixa" (o Contexto em si)
export const AuthContext = createContext<any>(null);

// 3. Criamos o Provedor que vai abraçar a aplicação
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [equipeAtiva, setEquipeAtiva] = useState<EquipeAtiva | null>(null);
  const [permissoesGlobais, setPermissoesGlobais] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = Cookies.get('token_acesso');
    if (token) {
      const tokenData = jwtDecode<{ permissoes: Record<string, string> }>(token);
      const primeiroId = Object.keys(tokenData.permissoes)[0];
      if (primeiroId) {
        setEquipeAtiva({ id: primeiroId, role: tokenData.permissoes[primeiroId] });
        setPermissoesGlobais(tokenData.permissoes);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{equipeAtiva, setEquipeAtiva, permissoesGlobais}}>
      {children}
    </AuthContext.Provider>
  );
}