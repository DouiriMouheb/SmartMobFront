import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Home, Table, X, ShieldCheck, Monitor, Database, Radio, SlidersHorizontal } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/settings', label: 'Impostazioni', icon: Table },
  { to: '/esito-impostazioni', label: 'Esito Impostazioni', icon: SlidersHorizontal },
  { to: '/acquisizioni', label: 'Acquisizioni', icon: Database },
  { to: '/controllo-qualita', label: 'Controllo Qualita', icon: ShieldCheck },
  { to: '/dispositivi-multimediali', label: 'Dispositivi Multimediali', icon: Monitor },
  { to: '/realtime-latest', label: 'Monitor Real-time', icon: Radio },

];

const Sidebar = ({ open, setOpen }) => {
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 p-3 text-white shadow-xl transition-all duration-300 ${open ? 'w-72' : 'w-[72px]'}`}
    >
      <button
        className="mb-6 inline-flex h-10 w-10 items-center justify-center self-start rounded-lg border border-slate-700 bg-slate-800 text-white transition hover:border-red-500 hover:bg-slate-700"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Chiudi sidebar' : 'Apri sidebar'}
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>


      <nav className="flex flex-col gap-2">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to;

          return (
            <Link
              key={to}
              to={to}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${open ? '' : 'justify-center'} ${isActive
                ? 'bg-red-700 text-white'
                : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
                }`}
              title={label}
            >
              {React.createElement(Icon, {
                size: 20,
                className: isActive ? 'text-white' : 'text-slate-400 group-hover:text-red-300',
              })}
              {open && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
