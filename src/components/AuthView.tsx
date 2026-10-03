import React, { useState } from 'react';
import { Factory, ShieldCheck, UserCheck, Users, KeyRound, AlertCircle, Sparkles, Check, ArrowRight } from 'lucide-react';
import { User, Venture } from '../types';

interface AuthViewProps {
  users: User[];
  ventures: Venture[];
  onLogin: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ users, ventures, onLogin }) => {
  const [username, setUsername] = useState('root');
  const [password, setPassword] = useState('Adm1807++');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (user) {
      onLogin(user);
    } else {
      setError('Credenciales incorrectas. Verifique el usuario y la contraseña.');
    }
  };

  const handleQuickLogin = (uName: string, pWord: string) => {
    setUsername(uName);
    setPassword(pWord);
    const user = users.find(
      (u) => u.username.toLowerCase() === uName.toLowerCase() && u.password === pWord
    );
    if (user) {
      onLogin(user);
    }
  };

  const getVentureName = (vId: string | null) => {
    if (!vId) return 'Acceso Total (Todos los emprendimientos)';
    const v = ventures.find((item) => item.id === vId);
    return v ? v.name : 'Emprendimiento';
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-xl shadow-cyan-900/40 border border-cyan-400/30">
            <Factory className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-white font-mono">
          MEDINA<span className="text-cyan-400">FACTORY</span>
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400 font-medium">
          Control Integral de Costos y Presupuestos de Producción
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-slate-900/95 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-800">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Usuario
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-mono"
                  placeholder="ej. root o admin_pan"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Contraseña
                </label>
                <span className="text-[11px] text-cyan-400 font-mono">Root: Adm1807++</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-mono"
                  placeholder="••••••••"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 shadow-lg shadow-cyan-900/30 transition-all cursor-pointer"
            >
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Access Demo Credentials Section */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Cuentas Configuradas
              </span>
              <span className="text-[10px] text-slate-500">Clic para autocompletar</span>
            </div>

            <div className="space-y-2">
              {/* Root Account */}
              <button
                type="button"
                onClick={() => handleQuickLogin('root', 'Adm1807++')}
                className="w-full text-left p-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/50 hover:border-cyan-500/80 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-600/30 text-cyan-300 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300">root</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950 font-bold uppercase">
                        Propietario
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">Adm1807++ (Acceso Total)</p>
                  </div>
                </div>
                <span className="text-[11px] text-cyan-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  Entrar <Check className="w-3 h-3" />
                </span>
              </button>

              {/* Admin Panadería */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin_pan', 'Panaderia2026*')}
                className="w-full text-left p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                    🥖
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200">admin_pan</span>
                      <span className="text-[10px] text-slate-400">(Panadería El Molino)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">Panaderia2026*</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 group-hover:text-white">Admin</span>
              </button>

              {/* Admin Cartelería */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin_carteleria', 'Carteles2026*')}
                className="w-full text-left p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs">
                    🪧
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200">admin_carteleria</span>
                      <span className="text-[10px] text-slate-400">(Medina Signs)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">Carteles2026*</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 group-hover:text-white">Admin</span>
              </button>

              {/* Admin Calzado */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin_calzado', 'Calzado2026*')}
                className="w-full text-left p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                    👟
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200">admin_calzado</span>
                      <span className="text-[10px] text-slate-400">(Medina Shoes)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">Calzado2026*</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 group-hover:text-white">Admin</span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Medina Factory ERP &copy; 2026 • Separación de datos independiente por emprendimiento
        </p>
      </div>
    </div>
  );
};
