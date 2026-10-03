import React from 'react';
import {
  Factory,
  Building,
  DollarSign,
  Package,
  FileSpreadsheet,
  TrendingUp,
  Percent,
  Download,
  Plus,
  ArrowRight,
  Sparkles,
  Croissant,
  UtensilsCrossed,
  Signpost,
  Footprints,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Venture, CostItem, Product, Budget, User, ProductionOrder } from '../types';
import { calculateTotalMonthlyFixedCosts, formatCurrency, calculateProductCost } from '../services/costCalculator';
import { exportBudgetToPDF } from '../services/pdfExporter';

interface DashboardViewProps {
  activeVenture: Venture;
  ventures: Venture[];
  costs: CostItem[];
  products: Product[];
  budgets: Budget[];
  orders?: ProductionOrder[];
  currentUser: User | null;
  onSelectTab: (tab: string) => void;
  onSelectVenture: (ventureId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeVenture,
  ventures,
  costs,
  products,
  budgets,
  orders = [],
  currentUser,
  onSelectTab,
  onSelectVenture,
}) => {
  const isRoot = currentUser?.role === 'root';
  const totalMonthlyFixed = calculateTotalMonthlyFixedCosts(costs);
  const fixedRatePerUnit =
    activeVenture.monthlyCapacityUnits > 0
      ? totalMonthlyFixed / activeVenture.monthlyCapacityUnits
      : 0;
  const variableCount = costs.filter((c) => c.category === 'variable').length;
  const totalQuoted = budgets.reduce((sum, b) => sum + b.totalSalePrice, 0);
  const totalProfitQuoted = budgets.reduce((sum, b) => sum + b.totalProfit, 0);
  const avgMargin =
    budgets.length > 0
      ? budgets.reduce((sum, b) => sum + b.profitMarginPercent, 0) / budgets.length
      : 0;

  const recentBudgets = budgets.slice(0, 4);
  const spotlightProduct = products[0] || null;
  const spotlightCost = spotlightProduct
    ? calculateProductCost(spotlightProduct, costs, activeVenture)
    : null;

  const getIndustryIcon = (ind: string) => {
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
        return <Factory className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold mb-3">
                {getIndustryIcon(activeVenture.industry)}
                <span>Emprendimiento Activo: {activeVenture.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Control de Producción & Presupuestos Medina Factory
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Gestione costos fijos, insumos variables, fórmulas de fabricación para panadería, empanadas, cartelería o calzado, y cotice con desglose automático para clientes.
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
              <button
                onClick={() => onSelectTab('production')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-900/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Control de Producción</span>
              </button>

              <button
                onClick={() => onSelectTab('budgets')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800/90 hover:bg-slate-750 hover:text-white border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Presupuestos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Industries Switcher Showcase */}
      {isRoot && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" /> Cambiar entre Emprendimientos Preconfigurados
            </span>
            <span className="text-[11px] text-slate-400">Total: {ventures.length} industrias</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ventures.map((v) => {
              const isSelected = v.id === activeVenture.id;
              return (
                <button
                  key={v.id}
                  onClick={() => onSelectVenture(v.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-50 border-cyan-400 shadow-sm ring-1 ring-cyan-400'
                      : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    {getIndustryIcon(v.industry)}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {v.name}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                      {v.industry}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Costos Fijos */}
        <div
          onClick={() => onSelectTab('costs')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-blue-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Costos Fijos / Mes
            </span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <Building className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {formatCurrency(totalMonthlyFixed, activeVenture.currency)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Incidencia fija:</span>
            <span className="font-mono font-bold text-slate-700">
              {formatCurrency(fixedRatePerUnit, activeVenture.currency)}/u
            </span>
          </div>
        </div>

        {/* Insumos Variables */}
        <div
          onClick={() => onSelectTab('costs')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-emerald-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Insumos Variables
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {variableCount}
            </span>
            <span className="text-xs text-slate-500 ml-1">materias primas</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Para recetas:</span>
            <span className="font-bold text-emerald-600">{products.length} productos</span>
          </div>
        </div>

        {/* Valor Total Cotizado */}
        <div
          onClick={() => onSelectTab('budgets')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-cyan-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Cotizado (Ventas)
            </span>
            <span className="p-2 rounded-xl bg-cyan-50 text-cyan-600 group-hover:scale-105 transition-transform">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-cyan-700 font-mono">
              {formatCurrency(totalQuoted, activeVenture.currency)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Presupuestos emitidos:</span>
            <span className="font-bold text-slate-700">{budgets.length}</span>
          </div>
        </div>

        {/* Margen Promedio */}
        <div
          onClick={() => onSelectTab('budgets')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-emerald-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rentabilidad Promedio
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-600 font-mono">
              +{avgMargin.toFixed(1)}%
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Ganancia neta cotizada:</span>
            <span className="font-mono font-bold text-emerald-700">
              +{formatCurrency(totalProfitQuoted, activeVenture.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Spotlight Product & Recent Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Spotlight Cost Structure Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Desglose de Costo en Ficha Técnica
                </h3>
              </div>
              <button
                onClick={() => onSelectTab('products')}
                className="text-xs text-amber-600 hover:text-amber-700 font-bold"
              >
                Ver todos
              </button>
            </div>

            {spotlightProduct && spotlightCost ? (
              <div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {spotlightProduct.sku || 'PROD-01'}
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                    {spotlightProduct.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    {spotlightProduct.description}
                  </p>
                </div>

                {/* Mathematical Formula Display */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                    <span className="text-emerald-900 font-medium">
                      1. Materiales e Insumos ({spotlightCost.materialsBreakdown.length}):
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatCurrency(spotlightCost.unitVariableCost, activeVenture.currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/70 border border-blue-100">
                    <span className="text-blue-900 font-medium">
                      2. Cuota de Costos Fijos Distribuida:
                    </span>
                    <span className="font-mono font-bold text-blue-700">
                      {formatCurrency(spotlightCost.unitFixedCost, activeVenture.currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 border border-slate-200 font-bold">
                    <span className="text-slate-900">= Costo Total de Producción:</span>
                    <span className="font-mono text-slate-900">
                      {formatCurrency(spotlightCost.unitTotalCost, activeVenture.currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200 font-bold">
                    <span className="text-amber-900">Precio Sugerido de Venta:</span>
                    <span className="font-mono text-amber-800">
                      {formatCurrency(spotlightCost.suggestedPrice, activeVenture.currency)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-emerald-100/60 border border-emerald-300 flex items-center justify-between text-xs">
                  <span className="text-emerald-900 font-semibold">Margen Bruto Unitario:</span>
                  <span className="font-mono font-black text-emerald-800">
                    +{formatCurrency(spotlightCost.suggestedProfit, activeVenture.currency)} (
                    {spotlightCost.suggestedMarginPercent.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hay productos cargados aún.
              </div>
            )}
          </div>

          <button
            onClick={() => onSelectTab('products')}
            className="mt-4 w-full py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Configurar Fórmulas y Recetas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recent Budgets Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Presupuestos de Producción Recientes
                </h3>
              </div>
              <button
                onClick={() => onSelectTab('budgets')}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold"
              >
                Ver todos ({budgets.length})
              </button>
            </div>

            {recentBudgets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hay presupuestos creados aún.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Código</th>
                      <th className="py-2.5 px-3">Cliente</th>
                      <th className="py-2.5 px-3 text-right">Costo Fabril</th>
                      <th className="py-2.5 px-3 text-right">Total Venta</th>
                      <th className="py-2.5 px-3 text-right">Margen</th>
                      <th className="py-2.5 px-3 text-center">PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {recentBudgets.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {b.code}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 truncate max-w-[120px]">
                          {b.clientName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                          {formatCurrency(b.totalProductionCost, activeVenture.currency)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                          {formatCurrency(b.totalSalePrice, activeVenture.currency)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-600 font-bold">
                          +{b.profitMarginPercent.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => exportBudgetToPDF(b, activeVenture)}
                            title="Descargar presupuesto PDF"
                            className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                          >
                            <Download className="w-3.5 h-3.5 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Todos los presupuestos incluyen reporte formal con firmas
            </span>
            <button
              onClick={() => onSelectTab('budgets')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Ir al Administrador de Presupuestos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
