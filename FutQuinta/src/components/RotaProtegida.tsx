import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

export function RotaProtegida({ children }: { children: ReactNode }) {
  useLocation(); 
  
  const token = Cookies.get('token_acesso');

  if (!token) {
    return <Navigate to="/" state={{ aviso: "Você precisa fazer login para acessar." }} replace />;
  }
  
  return children;
}