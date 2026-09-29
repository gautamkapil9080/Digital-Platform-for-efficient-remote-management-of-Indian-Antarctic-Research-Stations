import { NavLink, useNavigate } from 'react-router-dom';
import { useStations } from '../context/StationContext';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Overview' },
  { to: '/view', label: '3D View' },
  { to: '/infrastructure', label: 'Infrastructure' },
  { to: '/energy', label: 'Energy' },
  { to: '/logistics', label: 'Logistics' },
  { to: '/environment', label: 'Environment' },
  { to: '/alerts', label: 'Alerts' }
];

export default function Navbar() {
  const { stations, selectedStationId, selectStation } = useStations();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">DT</span>
        <div className="brand-text">
          <div className="brand-title">Station Digital Twin</div>
          <div className="brand-sub">NCPOR &middot; Ministry of Earth Sciences</div>
        </div>
      </div>

      <nav className="nav-links">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} end={l.to === '/'}>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="station-switch">
        {stations.map((s) => (
          <button
            key={s.station._id}
            className={'station-pill' + (s.station._id === selectedStationId ? ' active' : '')}
            onClick={() => selectStation(s.station._id)}
          >
            {s.station.name}
          </button>
        ))}
      </div>

      <div className="user-block">
        <span className={'role-badge role-' + user?.role}>{user?.role === 'operator' ? 'Operator' : 'HQ (read-only)'}</span>
        <span className="user-name">{user?.name}</span>
        <button className="btn-small" onClick={handleLogout}>Log out</button>
      </div>
    </header>
  );
}
