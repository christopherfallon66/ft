import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home', icon: '◉' },
  { to: '/timer', label: 'Timer', icon: '⏱' },
  { to: '/log-time', label: 'Log', icon: '＋' },
  { to: '/add-expense', label: 'Expense', icon: '$' },
  { to: '/history', label: 'History', icon: '☰' },
];

export default function Layout() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-forest-deep px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <img src={`${import.meta.env.BASE_URL}icons/icon.svg`} alt="" className="w-8 h-8" />
          <h1 className="text-lg font-semibold text-text-light tracking-tight">Fallon Tracker</h1>
        </div>
        <NavLink to="/settings" className="text-text-muted hover:text-gold transition-colors p-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.34 1.804A1 1 0 019.32 1h1.36a1 1 0 01.98.804l.295 1.473a7.04 7.04 0 011.33.768l1.413-.508a1 1 0 011.21.408l.68 1.178a1 1 0 01-.231 1.211l-1.118.965a7.07 7.07 0 010 1.536l1.118.965a1 1 0 01.231 1.211l-.68 1.178a1 1 0 01-1.21.408l-1.413-.508a7.04 7.04 0 01-1.33.768l-.295 1.473a1 1 0 01-.98.804H9.32a1 1 0 01-.98-.804l-.295-1.473a7.04 7.04 0 01-1.33-.768l-1.413.508a1 1 0 01-1.21-.408l-.68-1.178a1 1 0 01.231-1.211l1.118-.965a7.07 7.07 0 010-1.536l-1.118-.965a1 1 0 01-.231-1.211l.68-1.178a1 1 0 011.21-.408l1.413.508a7.04 7.04 0 011.33-.768L8.34 1.804zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
          </svg>
        </NavLink>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="bg-forest-deep border-t border-forest/50 safe-bottom shrink-0">
        <div className="flex justify-around py-2">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 min-w-[44px] min-h-[44px] justify-center rounded-lg transition-colors ${
                  isActive ? 'text-gold' : 'text-text-muted hover:text-text-light'
                }`
              }
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
