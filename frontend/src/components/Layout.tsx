import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plane, LayoutDashboard, Compass, LogIn, Moon, Sun } from 'lucide-react';
import { useAppStore } from '../store';
import { useTheme } from '../hooks/useTheme';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const user = useAppStore(state => state.user);
  const { isDark, toggleDark } = useTheme();

  const navigation = [
    { name: 'Plan Trip', href: '/planner', icon: Plane },
    { name: 'My Trips', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Explore', href: '/explore', icon: Compass },
  ];

  return (
    <div className="h-[100dvh] bg-[#FAF9F6] dark:bg-zinc-950 text-[#2D2D2D] dark:text-zinc-100 font-sans flex flex-col transition-colors duration-200 overflow-hidden">
      <nav className="flex-shrink-0 z-50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-b border-[#E5E2D9] dark:border-zinc-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 relative">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-[#2D2D2D] dark:bg-zinc-100 rounded-lg flex items-center justify-center">
                  <Plane className="w-4 h-4 text-white dark:text-zinc-900" />
                </div>
                <span className="font-extrabold text-lg tracking-tight text-[#2D2D2D] dark:text-zinc-100">VOYAGE AI</span>
              </Link>
            </div>
            <div className="hidden sm:flex items-center justify-center space-x-8 absolute left-1/2 -translate-x-1/2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-xs font-bold transition-colors ${
                      isActive 
                        ? 'text-[#2D2D2D] dark:text-zinc-100 border-b-2 border-blue-600' 
                        : 'text-[#7D7A74] dark:text-zinc-400 hover:text-[#2D2D2D] dark:hover:text-zinc-100'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5 mr-2 text-blue-500" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={toggleDark}
                className="p-2 rounded-xl text-[#7D7A74] dark:text-zinc-400 hover:bg-[#E5E2D9] dark:hover:bg-zinc-800 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <div className="flex items-center">
                {user ? (
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline text-xs font-semibold text-[#7D7A74] dark:text-zinc-400">Hi, {user.name}</span>
                    <div className="w-7 h-7 rounded-full bg-[#E5E2D9] dark:bg-zinc-800 border border-white dark:border-zinc-700 flex items-center justify-center text-[#2D2D2D] dark:text-zinc-100 text-xs font-bold shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-2xs"
                  >
                    <LogIn className="w-3.5 h-3.5 mr-1 sm:mr-1.5" />
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col relative pb-16 sm:pb-0 overflow-y-auto min-h-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-[#E5E2D9] dark:border-zinc-800 z-40 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-[#A8A399] dark:text-zinc-500'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-[#A8A399] dark:text-zinc-500'}`} />
                <span className="text-[10px] font-bold tracking-wider">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
