import React, { useState } from 'react';
import {
  Factory,
  Building2,
  DollarSign,
  Package,
  FileSpreadsheet,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Layers,
  Database,
  ShieldCheck,
  UserCheck,
  Croissant,
  UtensilsCrossed,
  Signpost,
  Footprints,
  Briefcase,
  BookOpen,
  HardHat,
  KeyRound
} from 'lucide-react';
import { User, Venture } from '../types';
import { storage } from '../services/storage';

interface NavbarProps {
  currentUser: User | null;
  activeVenture: Venture | null;
  ventures: Venture[];
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onSelectVenture: (ventureId: string) => void;
  onLogout: () => void;
  onOpenDatabaseTools: () => void;
  onOpenUserManual: () => void;
  onOpenChangePassword: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeVenture,
  ventures,
  currentTab,
  onSelectTab,
  onSelectVenture,
  onLogout,
  onOpenDatabaseTools,
  onOpenUserManual,
  onOpenChangePassword,
}) => {
  const [ventureMenuOpen, setVentureMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isRoot = currentUser?.role === 'root';
  const isAdmin = currentUser?.role === 'admin';

  const getIndustryIcon = (industry?: string) => {
    switch (industry) {
      case 'panaderia':
        return <Croissant className="w-4 h-4 text-amber-500" />;
      case 'empanadas':
        return <UtensilsCrossed className="w-4 h-4 text-orange-500" />;
      case 'carteleria':
        return <Signpost className="w-4 h-4 text-blue-500" />;
      case 'calzado':
        return <Footprints className="w-4 h-4 text-emerald-500" />;
      default:
        return <Briefcase className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-900/30 group-hover:scale-105 transition-transform">
                <Factory className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-white font-mono">
                    MEDINA<span className="text-cyan-400">FACTORY</span>
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                    ERP v2
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Presupuestos de Producción</p>
              </div>
            </button>

            {/* Active Venture Switcher (for Root) or Badge (for Admin/Invitado) */}
            <div className="ml-4 pl-4 border-l border-slate-700/80 relative">
              {isRoot ? (
                <div className="relative">
                  <button
                    onClick={() => setVentureMenuOpen(!ventureMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-medium text-slate-200 border border-slate-700 hover:border-cyan-500/50 transition-colors shadow-sm"
                  >
                    {getIndustryIcon(activeVenture?.industry)}
                    <span className="max-w-[180px] truncate font-semibold text-white">
                      {activeVenture ? activeVenture.name : 'Seleccionar Emprendimiento'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                      ROOT
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                  </button>

                  {ventureMenuOpen && (
                    <div
                      className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-1"
                      onMouseLeave={() => setVentureMenuOpen(false)}
                    >
                      <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex justify-between items-center">
                        <span>Cambiar Emprendimiento</span>
                        <span className="text-[10px] text-cyan-400">{ventures.length} activos</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto py-1">
                        {ventures.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => {
                              onSelectVenture(v.id);
                              setVentureMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-800 transition-colors ${
                              activeVenture?.id === v.id ? 'bg-cyan-950/60 text-cyan-300 font-semibold' : 'text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              {getIndustryIcon(v.industry)}
                              <span className="truncate">{v.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {v.monthlyCapacityUnits.toLocaleString()} u/m
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-slate-800 pt-1 mt-1 px-2">
                        <button
                          onClick={() => {
                            onSelectTab('ventures');
                            setVentureMenuOpen(false);
                          }}
                          className="w-full text-center py-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center justify-center gap-1 hover:bg-slate-800/60 rounded-lg transition-colors"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Gestionar todos los Emprendimientos</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-slate-200">
                  {getIndustryIcon(activeVenture?.industry)}
                  <span className="max-w-[200px] truncate font-semibold text-white">
                    {activeVenture ? activeVenture.name : 'Emprendimiento Asignado'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                    {currentUser?.role === 'admin' ? 'ADMIN' : 'INVITADO'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* 1. Resumen */}
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Resumen</span>
            </button>

            {/* 2. Presupuestos */}
            <button
              onClick={() => onSelectTab('budgets')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                currentTab === 'budgets'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
              <span>Presupuestos</span>
            </button>

            {/* 3. Producción */}
            <button
              onClick={() => onSelectTab('production')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                currentTab === 'production'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <HardHat className="w-4 h-4 text-cyan-400" />
              <span>Producción</span>
            </button>

            {/* 4. Productos & Recetas */}
            <button
              onClick={() => onSelectTab('products')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                currentTab === 'products'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4 text-amber-400" />
              <span>Productos & Recetas</span>
            </button>

            {/* 5. Costos Fijos & Var. */}
            <button
              onClick={() => onSelectTab('costs')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                currentTab === 'costs'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Costos Fijos & Var.</span>
            </button>

            {isRoot && (
              <button
                onClick={() => onSelectTab('ventures')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  currentTab === 'ventures'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>Emprendimientos</span>
              </button>
            )}

            {(isRoot || isAdmin) && (
              <button
                onClick={() => onSelectTab('users')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  currentTab === 'users'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>Usuarios</span>
              </button>
            )}
          </nav>

          {/* User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                  {currentUser?.username.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">
                    {currentUser?.username || 'Invitado'}
                  </div>
                  <div className="text-[10px] text-cyan-400 flex items-center gap-1">
                    {currentUser?.role === 'root' ? (
                      <span className="flex items-center gap-0.5 font-bold text-cyan-300">
                        <ShieldCheck className="w-2.5 h-2.5" /> Root
                      </span>
                    ) : currentUser?.role === 'admin' ? (
                      <span className="flex items-center gap-0.5 text-blue-300 font-medium">
                        <UserCheck className="w-2.5 h-2.5" /> Admin
                      </span>
                    ) : (
                      <span className="text-slate-400">Invitado</span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white">{currentUser?.name || currentUser?.username}</p>
                    <p className="text-[11px] text-slate-400">{currentUser?.email || 'Sin correo asociado'}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        Rol: {currentUser?.role}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onOpenChangePassword();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-amber-300 hover:bg-slate-800 hover:text-amber-200 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span>Cambiar mi Contraseña</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenUserManual();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-cyan-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 font-medium"
                    >
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <span>Manual de Usuario Completo</span>
                    </button>

                    {isRoot && (
                      <button
                        onClick={() => {
                          onSelectTab('ventures');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                      >
                        <Building2 className="w-4 h-4 text-cyan-400" />
                        <span>Administrar Emprendimientos</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onOpenDatabaseTools();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                    >
                      <Database className="w-4 h-4 text-indigo-400" />
                      <span>Respaldo y Base de Datos</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-800 pt-1 mt-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Submenu Navigation */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800 py-2 bg-slate-900/90 text-xs px-2 overflow-x-auto">
        {/* 1. Resumen */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium ${
            currentTab === 'dashboard' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Resumen</span>
        </button>

        {/* 2. Presupuestos */}
        <button
          onClick={() => onSelectTab('budgets')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium ${
            currentTab === 'budgets' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Presupuestos</span>
        </button>

        {/* 3. Producción */}
        <button
          onClick={() => onSelectTab('production')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium ${
            currentTab === 'production' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
          }`}
        >
          <HardHat className="w-3.5 h-3.5" />
          <span>Producción</span>
        </button>

        {/* 4. Productos */}
        <button
          onClick={() => onSelectTab('products')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium ${
            currentTab === 'products' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Productos</span>
        </button>

        {/* 5. Costos */}
        <button
          onClick={() => onSelectTab('costs')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium ${
            currentTab === 'costs' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Costos</span>
        </button>

        {isRoot && (
          <button
            onClick={() => onSelectTab('ventures')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium ${
              currentTab === 'ventures' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Empresas</span>
          </button>
        )}
      </div>
    </header>
  );
};
