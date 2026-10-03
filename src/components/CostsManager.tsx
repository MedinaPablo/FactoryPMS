import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  AlertTriangle,
  Building,
  TrendingDown,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';
import { CostItem, CostCategory, Venture, User } from '../types';
import { formatCurrency, calculateTotalMonthlyFixedCosts, validateNonNegative } from '../services/costCalculator';

interface CostsManagerProps {
  costs: CostItem[];
  activeVenture: Venture;
  currentUser: User | null;
  onSaveCost: (cost: CostItem) => void;
  onDeleteCost: (costId: string) => void;
}

const COMMON_UNITS_VARIABLE = ['kg', 'gr', 'litro', 'ml', 'metro', 'm2', 'hora', 'unidad', 'par', 'docena', 'placa', 'rollo'];
const COMMON_UNITS_FIXED = ['mes', 'bimestre', 'año', 'quincena'];

export const CostsManager: React.FC<CostsManagerProps> = ({
  costs,
  activeVenture,
  currentUser,
  onSaveCost,
  onDeleteCost,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'fijo' | 'variable'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<CostItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'variable' as CostCategory,
    subcategory: 'Materia Prima',
    unit: 'kg',
    customUnit: '',
    amount: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    supplier: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const canEdit = currentUser?.role === 'root' || currentUser?.role === 'admin';

  // Calculations
  const totalMonthlyFixed = calculateTotalMonthlyFixedCosts(costs);
  const fixedRatePerUnit =
    activeVenture.monthlyCapacityUnits > 0
      ? totalMonthlyFixed / activeVenture.monthlyCapacityUnits
      : 0;
  const variableCount = costs.filter((c) => c.category === 'variable').length;

  // Filtered Costs
  const filteredCosts = costs.filter((c) => {
    if (activeTab !== 'all' && c.category !== activeTab) return false;
    if (subcategoryFilter !== 'all' && c.subcategory !== subcategoryFilter) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchName = c.name.toLowerCase().includes(term);
      const matchSupplier = c.supplier?.toLowerCase().includes(term);
      const matchNotes = c.notes?.toLowerCase().includes(term);
      if (!matchName && !matchSupplier && !matchNotes) return false;
    }
    return true;
  });

  // Unique subcategories for filter
  const subcategories = Array.from(new Set(costs.map((c) => c.subcategory))).filter(Boolean);

  const openNewModal = (category: CostCategory = 'variable') => {
    setEditingCost(null);
    setFormData({
      name: '',
      category,
      subcategory: category === 'fijo' ? 'Alquiler' : 'Materia Prima',
      unit: category === 'fijo' ? 'mes' : 'kg',
      customUnit: '',
      amount: '',
      effectiveDate: new Date().toISOString().split('T')[0],
      supplier: '',
      notes: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (cost: CostItem) => {
    setEditingCost(cost);
    const isStandardUnit = (cost.category === 'fijo' ? COMMON_UNITS_FIXED : COMMON_UNITS_VARIABLE).includes(cost.unit);
    setFormData({
      name: cost.name,
      category: cost.category,
      subcategory: cost.subcategory,
      unit: isStandardUnit ? cost.unit : 'custom',
      customUnit: isStandardUnit ? '' : cost.unit,
      amount: String(cost.amount),
      effectiveDate: cost.effectiveDate,
      supplier: cost.supplier || '',
      notes: cost.notes || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre del costo es obligatorio.';
    }

    const amountErr = validateNonNegative(formData.amount, 'Monto');
    if (amountErr) {
      errors.amount = amountErr;
    } else if (Number(formData.amount) <= 0) {
      errors.amount = 'El monto debe ser mayor a 0.';
    }

    if (!formData.effectiveDate) {
      errors.effectiveDate = 'La fecha de vigencia es obligatoria.';
    }

    const finalUnit = formData.unit === 'custom' ? formData.customUnit.trim() : formData.unit;
    if (!finalUnit) {
      errors.unit = 'Debe especificar una unidad de medida.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const costItem: CostItem = {
      id: editingCost ? editingCost.id : `cost-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ventureId: activeVenture.id,
      name: formData.name.trim(),
      category: formData.category,
      subcategory: formData.subcategory.trim() || (formData.category === 'fijo' ? 'Fijo General' : 'Insumo'),
      unit: finalUnit,
      amount: Number(formData.amount),
      effectiveDate: formData.effectiveDate,
      supplier: formData.supplier.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      createdAt: editingCost ? editingCost.createdAt : new Date().toISOString(),
    };

    onSaveCost(costItem);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Está seguro de eliminar el costo "${name}"?`)) {
      try {
        onDeleteCost(id);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Error al eliminar el costo.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Módulo de Costos de Producción
              </h1>
              <p className="text-xs text-slate-500">
                Gestión de Costos Fijos y Variables para <span className="font-semibold text-slate-700">{activeVenture.name}</span>
              </p>
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openNewModal('fijo')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>+ Costo Fijo</span>
            </button>
            <button
              onClick={() => openNewModal('variable')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Costo Variable / Insumo</span>
            </button>
          </div>
        )}
      </div>

      {/* Industrial Cost Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Costos Fijos Mensuales */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Costos Fijos Mensuales
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Building className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {formatCurrency(totalMonthlyFixed, activeVenture.currency)}
            </span>
            <span className="text-xs text-slate-500 font-medium">/ mes</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Alquileres, sueldos fijos, servicios e infraestructura
          </p>
        </div>

        {/* Card 2: Capacidad y Factor de Absorción */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cuota Fija por Unidad Base
            </span>
            <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-700 font-mono">
              {formatCurrency(fixedRatePerUnit, activeVenture.currency)}
            </span>
            <span className="text-xs text-slate-500 font-medium">/ u</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Base mensual de absorción: <span className="font-semibold">{activeVenture.monthlyCapacityUnits.toLocaleString()} unidades/mes</span>
          </p>
        </div>

        {/* Card 3: Insumos Variables Registrados */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Insumos & Variables Activos
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 font-mono">
              {variableCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">insumos vigentes</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Materias primas, envases y mano de obra directa para recetas
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({costs.length})
          </button>
          <button
            onClick={() => setActiveTab('fijo')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'fijo'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Costos Fijos ({costs.filter((c) => c.category === 'fijo').length})
          </button>
          <button
            onClick={() => setActiveTab('variable')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'variable'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Costos Variables ({variableCount})
          </button>
        </div>

        {/* Search & Subcategory Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {subcategories.length > 0 && (
            <select
              value={subcategoryFilter}
              onChange={(e) => setSubcategoryFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="all">Todas las subcategorías</option>
              {subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          )}

          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar costo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Costs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredCosts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No se encontraron costos</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No hay costos registrados que coincidan con los filtros aplicados.
            </p>
            {canEdit && (
              <button
                onClick={() => openNewModal()}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Primer Costo</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Nombre del Costo</th>
                  <th className="py-3 px-3">Categoría</th>
                  <th className="py-3 px-3">Subcategoría</th>
                  <th className="py-3 px-3 text-center">Unidad de Medida</th>
                  <th className="py-3 px-4 text-right">Monto Vigente</th>
                  <th className="py-3 px-3">Fecha de Vigencia</th>
                  <th className="py-3 px-3">Proveedor / Notas</th>
                  {canEdit && <th className="py-3 px-4 text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCosts.map((cost) => (
                  <tr key={cost.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {cost.name}
                    </td>
                    <td className="py-3.5 px-3">
                      {cost.category === 'fijo' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Building className="w-2.5 h-2.5" /> Fijo Mensual
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Layers className="w-2.5 h-2.5" /> Variable Unitario
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">{cost.subcategory}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {cost.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black font-mono text-slate-900 text-sm">
                      {formatCurrency(cost.amount, activeVenture.currency)}
                      <span className="text-[10px] font-normal text-slate-400 block">
                        por {cost.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                      {cost.effectiveDate}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 max-w-xs truncate">
                      {cost.supplier && <span className="font-semibold text-slate-700">{cost.supplier}</span>}
                      {cost.supplier && cost.notes && ' • '}
                      {cost.notes && <span>{cost.notes}</span>}
                      {!cost.supplier && !cost.notes && <span className="text-slate-300">-</span>}
                    </td>
                    {canEdit && (
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(cost)}
                            title="Editar costo"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cost.id, cost.name)}
                            title="Eliminar costo"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Cost Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {editingCost ? 'Editar Registro de Costo' : 'Registrar Nuevo Costo de Producción'}
                  </h3>
                  <p className="text-[11px] text-slate-400">{activeVenture.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tipo de Costo <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        category: 'variable',
                        subcategory: 'Materia Prima',
                        unit: 'kg',
                      });
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      formData.category === 'variable'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Variable (Insumo/Receta)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        category: 'fijo',
                        subcategory: 'Alquiler',
                        unit: 'mes',
                      });
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      formData.category === 'fijo'
                        ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>Fijo (Mensual/Planta)</span>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Costo / Insumo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    formData.category === 'fijo'
                      ? 'ej. Alquiler de Salón Comercial o Sueldo Maestro Panadero'
                      : 'ej. Harina 000 de Trigo o Placa PVC Espumado 3mm'
                  }
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    formErrors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.name}</p>
                )}
              </div>

              {/* Subcategory & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subcategoría
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {formData.category === 'fijo' ? (
                      <>
                        <option value="Alquiler">Alquiler</option>
                        <option value="Mano de Obra">Mano de Obra / Sueldos Fijos</option>
                        <option value="Servicios">Servicios (Luz, Gas, Agua, Internet)</option>
                        <option value="Mantenimiento">Mantenimiento de Maquinaria</option>
                        <option value="Seguros">Seguros & Tasas</option>
                        <option value="Administración">Administración & Software</option>
                        <option value="Otro Fijo">Otro Fijo</option>
                      </>
                    ) : (
                      <>
                        <option value="Materia Prima">Materia Prima</option>
                        <option value="Insumos">Insumos de Producción</option>
                        <option value="Packaging">Envases & Packaging</option>
                        <option value="Mano de Obra">Mano de Obra Directa (Horas)</option>
                        <option value="Energía Directa">Energía / Combustible Directo</option>
                        <option value="Tercerización">Tercerización / Procesos</option>
                        <option value="Otro Variable">Otro Variable</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unidad de Medida <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  >
                    {formData.category === 'fijo'
                      ? COMMON_UNITS_FIXED.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))
                      : COMMON_UNITS_VARIABLE.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                    <option value="custom">+ Otra unidad...</option>
                  </select>
                </div>
              </div>

              {formData.unit === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Escriba la unidad personalizada <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ej. bobina, litro, caja, metro lineal"
                    value={formData.customUnit}
                    onChange={(e) => setFormData({ ...formData, customUnit: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {formErrors.unit && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.unit}</p>
                  )}
                </div>
              )}

              {/* Amount & Effective Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Monto Vigente ({activeVenture.currency}) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                      {activeVenture.currency}
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      required
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className={`w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        formErrors.amount ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {formErrors.amount && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.amount}</p>
                  )}
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {formData.category === 'fijo' ? 'Costo total mensual' : 'Costo por unidad de insumo'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fecha de Vigencia <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  {formErrors.effectiveDate && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.effectiveDate}</p>
                  )}
                </div>
              </div>

              {/* Supplier & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Proveedor (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Molino Cañuelas, Oracal SA"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Notas / Referencia (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Pago a 30 días, IVA incluido"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

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
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
                >
                  {editingCost ? 'Guardar Cambios' : 'Registrar Costo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
