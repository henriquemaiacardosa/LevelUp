import { Routes, Route } from 'react-router-dom';
import Autenticacao from './pages/Autenticacao';
import RotaProtegida from './routes/RotaProtegida';
import Layout from './layout/Layout';

function Inicio() {
  return <h1>Início</h1>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Autenticacao />} />
      <Route element={<RotaProtegida />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Inicio />} />
        </Route>
      </Route>
    </Routes>
  );
}