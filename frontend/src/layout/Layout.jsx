import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Layout.css';

const LINKS = [
  { para: '/', rotulo: 'Início', exato: true },
  { para: '/buscar', rotulo: 'Buscar tutores' },
  { para: '/mentorias', rotulo: 'Minhas mentorias' },
  { para: '/ranking', rotulo: 'Ranking' },
  { para: '/perfil', rotulo: 'Perfil' },
];

export default function Layout() {
  const { sair } = useAuth();

  return (
    <div className="layout">
      <header className="layout__cabecalho">
        <div className="layout__barra">
          <p className="marca">
            <span className="marca__simbolo" aria-hidden="true" />
            LevelUp
          </p>

          <nav className="layout__nav" aria-label="Principal">
            {LINKS.map((link) => (
              <NavLink
                key={link.para}
                to={link.para}
                end={link.exato}
                className="layout__link"
              >
                {link.rotulo}
              </NavLink>
            ))}
          </nav>

          <button type="button" className="layout__sair" onClick={sair}>
            Sair
          </button>
        </div>
      </header>

      <main className="layout__conteudo">
        <Outlet />
      </main>
    </div>
  );
}