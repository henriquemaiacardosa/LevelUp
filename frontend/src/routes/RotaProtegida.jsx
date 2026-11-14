import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function RotaProtegida() {
  const { autenticado } = useAuth();

  return autenticado ? <Outlet /> : <Navigate to="/login" replace />;
}