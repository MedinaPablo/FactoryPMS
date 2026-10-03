import React, { useState } from 'react';
import {
  Building2,
  Plus,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Croissant,
  UtensilsCrossed,
  Signpost,
  Footprints,
  Briefcase,
  Layers,
  DollarSign,
  Package,
  FileSpreadsheet,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  Lock
} from 'lucide-react';
import { Venture, User, VentureIndustry, CostItem, Product, Budget } from '../types';
import { formatCurrency, calculateTotalMonthlyFixedCosts } from '../services/costCalculator';

interface VenturesManagerProps {
  ventures: Venture[];
  users: User[];
  costs: CostItem[];
  products: Product[];
  budgets: Budget[];
  currentUser: User | null;
  activeVentureId: string;
  onSelectVenture: (ventureId: string) => void;
  onSaveVenture: (venture: Venture, adminUser?: { name: string; username: string; password: string }) => void;
  onDeleteVenture: (ventureId: string) => void;
}

export const VenturesManager: React.FC<VenturesManagerProps> = ({
  ventures,
  users,
  costs,
  products,
  budgets,
  currentUser,
  activeVentureId,
  onSelectVenture,
  onSaveVenture,
  onDeleteVenture,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenture, setEditingVenture] = useState<Venture | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState<VentureIndustry>('general');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('$');
  const [monthlyCapacityUnits, setMonthlyCapacityUnits] = useState('2000');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [taxId, setTaxId] = useState('');

  // Admin user creation state
  const [createAdmin, setCreateAdmin] = useState(true);
  const [adminName, setAdminName] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const isRoot = currentUser?.role === 'root';

  const getIndustryIcon = (ind: VentureIndustry) => {
    switch (ind) {
      case 'panaderia':
        return <Croissant className="w-5 h-5 text-amber-500" />;
      case 'empanadas':
        return <UtensilsCrossed className="w-5 h-5 text-orange-500" />;
      case 'carteleria':
        return <Signpost className="w-5 h-5 text-blue-500" />;
      case 'calzado':
        return <Footprints className="w-5 h-5 text-emerald-500" />;
      default:
        return <Briefcase className="w-5 h-5 text-indigo-500" />;
    }
  };

  const openNewModal = () => {
    setEditingVenture(null);
    setName('');
    setIndustry('panaderia');
    setDescription('');
    setCurrency('$');
    setMonthlyCapacityUnits('3000');
    setAddress('');
    setPhone('');
    setEmail('');
    setTaxId('');
    setCreateAdmin(true);
    setAdminName('');
    setAdminUsername('');
    setAdminPassword('');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (v: Venture) => {
    setEditingVenture(v);
    setName(v.name);
    setIndustry(v.industry);
    setDescription(v.description);
    setCurrency(v.currency);
    setMonthlyCapacityUnits(String(v.monthlyCapacityUnits));
    setAddress(v.address || '');
    setPhone(v.phone || '');
    setEmail(v.email || '');
    setTaxId(v.taxId || '');
    setCreateAdmin(false);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!name.trim()) errors.name = 'El nombre del emprendimiento es obligatorio.';
    if (Number(monthlyCapacityUnits) <= 0) {
      errors.monthlyCapacityUnits = 'La capacidad mensual debe ser mayor a 0.';
    }

    if (!editingVenture && createAdmin) {
      if (!adminUsername.trim()) errors.adminUsername = 'El usuario administrador es obligatorio.';
      if (!adminPassword.trim() || adminPassword.length < 4) {
        errors.adminPassword = 'La contraseña debe tener al menos 4 caracteres.';
      }
      // Check if username is taken
      if (users.some((u) => u.username.toLowerCase() === adminUsername.trim().toLowerCase())) {
        errors.adminUsername = 'Ese nombre de usuario ya está en uso.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const savedVenture: Venture = {
      id: editingVenture ? editingVenture.id : `venture-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      industry,
      description: description.trim(),
      currency: currency.trim() || '$',
      monthlyCapacityUnits: Number(monthlyCapacityUnits),
      address: address.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      taxId: taxId.trim() || undefined,
      createdAt: editingVenture ? editingVenture.createdAt : new Date().toISOString(),
    };

    const adminData =
      !editingVenture && createAdmin
        ? {
            name: adminName.trim() || `Admin ${name}`,
            username: adminUsername.trim(),
            password: adminPassword,
          }
        : undefined;

    onSaveVenture(savedVenture, adminData);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, vName: string) => {
    if (ventures.length <= 1) {
      alert('No se puede eliminar el único emprendimiento activo.');
      return;
    }
    if (
      window.confirm(
        `¡Atención! Eliminar "${vName}" borrará de manera definitiva todos sus costos, productos y presupuestos. ¿Desea continuar?`
      )
    ) {
      onDeleteVenture(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Gestión Central de Emprendimientos (Multi-Tenancy)
              </h1>
              <p className="text-xs text-slate-500">
                Panel exclusivo del usuario <span className="font-bold text-cyan-600 font-mono">root</span> para aislar datos de producción
              </p>
            </div>
          </div>
        </div>

        {isRoot && (
          <button
            onClick={openNewModal}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-700/20 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Crear Nuevo Emprendimiento</span>
          </button>
        )}
      </div>

      {/* Root explanation banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md flex items-start gap-3">
        <div className="p-2 rounded-xl bg-cyan-600/30 text-cyan-300 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs leading-relaxed">
          <div className="font-bold text-cyan-300">Aislamiento Estricto de Datos por Emprendimiento</div>
          <p className="text-slate-300 mt-0.5">
            Cada emprendimiento funciona como una fábrica independiente. Los costos fijos, insumos variables, fórmulas de productos y presupuestos <strong>no se mezclan</strong>. Como usuario <span className="font-mono text-cyan-300 font-semibold">root</span>, puede ingresar a cualquiera de ellos, o designar un Administrador exclusivo para cada negocio.
          </p>
        </div>
      </div>

      {/* Ventures Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ventures.map((v) => {
          const ventureCosts = costs.filter((c) => c.ventureId === v.id);
          const ventureProducts = products.filter((p) => p.ventureId === v.id);
          const ventureBudgets = budgets.filter((b) => b.ventureId === v.id);
          const monthlyFixed = calculateTotalMonthlyFixedCosts(ventureCosts);
          const adminUser = users.find((u) => u.ventureId === v.id && u.role === 'admin');
          const isActive = activeVentureId === v.id;

          return (
            <div
              key={v.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all relative flex flex-col justify-between ${
                isActive
                  ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      {getIndustryIcon(v.industry)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-extrabold text-slate-900">{v.name}</h3>
                        {isActive && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold uppercase tracking-wider">
                            Activo
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        Rubro: {v.industry}
                      </span>
                    </div>
                  </div>

                  {isRoot && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(v)}
                        title="Editar parámetros"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id, v.name)}
                        title="Eliminar emprendimiento"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {v.description && (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{v.description}</p>
                )}

                {/* Administrator badge */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-slate-500 font-medium">Administrador:</span>
                    <span className="font-bold text-slate-800">
                      {adminUser ? adminUser.username : 'Sin asignar'}
                    </span>
                  </div>
                  {adminUser && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      Clave: {adminUser.password}
                    </span>
                  )}
                </div>

                {/* Metrics bar */}
                <div className="mt-4 grid grid-cols-4 gap-2 text-center py-2.5 px-2 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Costos Fijos
                    </span>
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      {formatCurrency(monthlyFixed, v.currency)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Capacidad
                    </span>
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      {v.monthlyCapacityUnits.toLocaleString()} u
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Productos
                    </span>
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      {ventureProducts.length}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Presupuestos
                    </span>
                    <span className="text-xs font-bold text-blue-600 font-mono">
                      {ventureBudgets.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {v.taxId ? `CUIT: ${v.taxId}` : 'Sin CUIT'}
                </span>

                <button
                  onClick={() => onSelectVenture(v.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-50 text-cyan-800 border border-cyan-300'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <span>{isActive ? 'Gestionando Ahora' : 'Ingresar al Módulo'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Venture Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {editingVenture ? 'Editar Emprendimiento' : 'Registrar Nuevo Emprendimiento'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Configuración multi-tenancy</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre del Emprendimiento <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Panadería Don Bosco, Fábrica de Calzado Medina"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {formErrors.name && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rubro / Industria
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value as VentureIndustry)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="panaderia">🥖 Panadería & Bollería</option>
                    <option value="empanadas">🥟 Empanadas & Pastas</option>
                    <option value="carteleria">🪧 Cartelería & Gráfica</option>
                    <option value="calzado">👟 Calzado & Zapatillas</option>
                    <option value="general">🏢 Otra Industria / Fábrica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción</label>
                <input
                  type="text"
                  placeholder="ej. Producción a escala y venta mayorista"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Base Producción Mensual (u/mes) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="3000"
                    value={monthlyCapacityUnits}
                    onChange={(e) => setMonthlyCapacityUnits(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Para absorber costos fijos
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Moneda ($)</label>
                  <input
                    type="text"
                    placeholder="$"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CUIT / RUT / DNI</label>
                  <input
                    type="text"
                    placeholder="30-..."
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Admin User creation section */}
              {!editingVenture && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                      Crear Administrador para este Emprendimiento
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    El usuario administrador podrá gestionar costos, productos, presupuestos y crear usuarios invitados.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre del Administrador
                      </label>
                      <input
                        type="text"
                        placeholder="ej. Juan Pérez"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre de Usuario <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ej. admin_fabrica"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {formErrors.adminUsername && (
                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.adminUsername}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Contraseña <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ej. Fabrica2026*"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {formErrors.adminPassword && (
                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.adminPassword}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-700/20 transition-all cursor-pointer"
                >
                  {editingVenture ? 'Guardar Cambios' : 'Crear Emprendimiento y Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
