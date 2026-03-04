import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Eye,
  LayoutDashboard,
  FilePlus,
  Settings,
  LogOut,
  Calculator,
  Activity,
  Type,
  Bell,
  Sun,
  Moon,
} from "lucide-react";
import { clsx } from "clsx";
import { useTranslation } from "../lib/i18n";
import { useTheme } from "../lib/ThemeContext";

export default function Layout() {
  const location = useLocation();
  const { t, language, setLanguage } = useTranslation();
  const { textSize, setTextSize, colorMode, setColorMode } = useTheme();

  const handleTextSizeToggle = () => {
    if (textSize === 'standard') setTextSize('large');
    else if (textSize === 'large') setTextSize('extra');
    else setTextSize('standard');
  };

  const navItems = [
    { name: t('nav.dashboard'), path: "/", icon: LayoutDashboard },
    { name: t('nav.register'), path: "/register", icon: FilePlus },
    { name: t('nav.queue'), path: "/queue", icon: Activity },
    { name: t('nav.billing'), path: "/billing", icon: Calculator },
    { name: t('nav.settings'), path: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-medical-bg text-medical-text font-sans selection:bg-medical-primary/20">
      {/* Sidebar - Modern Medical Feel */}
      <aside className="w-72 bg-medical-surface flex flex-col border-r border-medical-border z-10">
        <div className="p-8 flex items-center gap-4">
          <div className="bg-medical-primary p-2.5 rounded-2xl text-white shadow-lg shadow-medical-primary/20">
            <Eye size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-medical-text font-display">
              {t('app.title')}
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-medical-text-muted font-semibold mt-0.5">
              {t('app.subtitle')}
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-4">
          <div className="text-[10px] font-bold text-medical-text-muted uppercase tracking-[0.2em] mb-4 px-4">
            Main Menu
          </div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 group",
                  isActive
                    ? "bg-medical-primary/10 text-medical-primary shadow-sm"
                    : "text-medical-text-muted hover:bg-slate-50 hover:text-medical-text",
                )}
              >
                <div className={clsx(
                  "p-2 rounded-xl transition-colors",
                  isActive ? "bg-medical-primary text-white" : "bg-slate-100 text-medical-text-muted group-hover:bg-slate-200"
                )}>
                  <Icon size={18} strokeWidth={2.5} />
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-medical-border bg-slate-50/50">
          <div className="flex items-center gap-4 p-3 mb-4 bg-white rounded-2xl border border-medical-border shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medical-primary to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-medical-text truncate">
                Admin User
              </p>
              <p className="text-[10px] text-medical-text-muted font-semibold uppercase tracking-wider truncate">
                Administrator
              </p>
            </div>
          </div>
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-sm font-bold text-medical-text-muted hover:bg-red-50 hover:text-red-500 transition-all duration-300">
            <LogOut size={18} strokeWidth={2.5} />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-medical-surface border-b border-medical-border flex items-center justify-end px-8 gap-6 z-10 shrink-0">
          {/* Color Mode Toggle */}
          <button
            onClick={() => setColorMode(colorMode === 'light' ? 'dark' : 'light')}
            className="flex items-center gap-2 text-medical-text-muted hover:text-medical-primary transition-colors"
            title="Toggle Color Mode"
          >
            {colorMode === 'light' ? <Moon size={18} strokeWidth={2.5} /> : <Sun size={18} strokeWidth={2.5} />}
            <span className="text-xs font-bold uppercase tracking-wider">
              {colorMode === 'light' ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* Text Size Toggle */}
          <button
            onClick={handleTextSizeToggle}
            className="flex items-center gap-2 text-medical-text-muted hover:text-medical-primary transition-colors"
            title="Toggle Text Size"
          >
            <Type size={18} strokeWidth={2.5} />
            <span className="text-xs font-bold uppercase tracking-wider">
              {textSize === 'standard' ? 'A' : textSize === 'large' ? 'A+' : 'A++'}
            </span>
          </button>

          {/* Language Toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setLanguage('en')}
              className={clsx(
                "px-3 py-1 text-xs font-bold rounded-md transition-all",
                language === 'en' ? "bg-white text-medical-primary shadow-sm" : "text-medical-text-muted hover:text-medical-text"
              )}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ja')}
              className={clsx(
                "px-3 py-1 text-xs font-bold rounded-md transition-all",
                language === 'ja' ? "bg-white text-medical-primary shadow-sm" : "text-medical-text-muted hover:text-medical-text"
              )}
            >
              JP
            </button>
          </div>

          {/* Notifications */}
          <button className="relative text-medical-text-muted hover:text-medical-primary transition-colors">
            <Bell size={20} strokeWidth={2.5} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        <div className="flex-1 overflow-auto p-10 relative z-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
