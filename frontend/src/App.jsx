import { Routes, Route } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import Autenticacao from './pages/Autenticacao';
import RotaProtegida from './routes/RotaProtegida';

function Inicio() {
  const { sair } = useAuth();

  return (
    <main>
      <h1>LevelUp</h1>
      <p>Você está logado.</p>
      <button onClick={sair}>Sair</button>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Autenticacao />} />
      <Route element={<RotaProtegida />}>
        <Route path="/" element={<Inicio />} />
      </Route>
    </Routes>
  );
}