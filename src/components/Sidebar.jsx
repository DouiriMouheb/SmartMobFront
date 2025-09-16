import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Home, Table, X ,ShieldCheck, Monitor, Activity, Database, Radio} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/settings', label: 'Impostazioni', icon: Table },
  { to: '/acquisizioni', label: 'Acquisizioni', icon: Database },
  { to: '/controllo-qualita', label: 'Controllo Qualita', icon: ShieldCheck },
  { to: '/dispositivi-multimediali', label: 'Dispositivi Multimediali', icon: Monitor },
 // { to: '/realtime-controllo', label: 'Real-time Controllo', icon: Activity },
  { to: '/realtime-latest', label: 'Monitor Real-time', icon: Radio },

];

const Sidebar = ({ open, setOpen }) => {
  const location = useLocation();
  return (
    <aside className={`fixed h-screen bg-black text-white flex flex-col p-4 z-40 left-0 top-0 shadow-lg transition-all duration-300 ${open ? 'w-64' : 'w-16'}`}>
      <button
        className="mb-6 flex justify-center items-center w-10 h-10 bg-gray-700 rounded text-white self-start"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Chiudi sidebar' : 'Apri sidebar'}
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      <nav className="flex flex-col gap-4">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 hover:bg-red-700 p-2 rounded ${open ? '' : 'justify-center'} ${isActive ? 'bg-red-700 text-white' : ''}`}
            >
              <Icon size={24} color={isActive ? '#ffffffff' : '#a51414ff'} />
              {open && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
