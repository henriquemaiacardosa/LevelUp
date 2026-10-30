import { Routes, Route } from 'react-router-dom';
import Autenticacao from './pages/Autenticacao';
import Inicio from './pages/Inicio';
import RotaProtegida from './routes/RotaProtegida';
import Layout from './layout/Layout';
import Busca from './pages/Busca';
import Mentorias from './pages/Mentorias';
import Ranking from './pages/Ranking';
import Perfil from './pages/Perfil';



export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Autenticacao />} />
      <Route element={<RotaProtegida />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/buscar" element={<Busca />} />
          <Route path="/mentorias" element={<Mentorias />} />
          <Route path="/ranking" element={<Ranking />} />
            <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Route>
    </Routes>
  );
}