import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Download,
  Eye,
  Trash2,
  Calendar,
  Layers,
  Building,
  DollarSign,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  X,
  FileText,
  Printer
} from 'lucide-react';
import { Budget, BudgetItem, Product, CostItem, Venture, User, BudgetStatus } from '../types';
import {
  buildBudgetItem,
  aggregateConsolidatedMaterials,
  formatCurrency,
  validateNonNegative
} from '../services/costCalculator';
import { exportBudgetToPDF } from '../services/pdfExporter';
import { storage } from '../services/storage';

interface BudgetsManagerProps {
  budgets: Budget[];
  products: Product[];
  costs: CostItem[];
  activeVenture: Venture;
  currentUser: User | null;
  onSaveBudget: (budget: Budget) => void;
  onDeleteBudget: (budgetId: string) => void;
}

export const BudgetsManager: React.FC<BudgetsManagerProps> = ({
  budgets,
  products,
  costs,
  activeVenture,
  currentUser,
  onSaveBudget,
  onDeleteBudget,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingBudget, setViewingBudget] = useState<Budget | null>(null);

  // Form State for new/edit budget
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientTaxId, setClientTaxId] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<BudgetStatus>('borrador');
  const [notes, setNotes] = useState('');

  // Selected Products lines: array of { productId, quantity, unitSalePrice }
  const [lineItems, setLineItems] = useState<
    Array<{ productId: string; quantity: number; unitSalePrice: number }>
  >([]);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Filtered budgets
  const filteredBudgets = budgets.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      return (
        b.code.toLowerCase().includes(term) ||
        b.clientName.toLowerCase().includes(term) ||
        b.clientTaxId?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const openNewModal = () => {
    if (products.length === 0) {
      alert('Primero debe registrar al menos un producto terminado en el módulo de Productos.');
      return;
    }

    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setClientTaxId('');
    setClientAddress('');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setValidUntil(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setStatus('borrador');
    setNotes('');

    // Default with first product, quantity 1
    const firstProduct = products[0];
    setLineItems([
      {
        productId: firstProduct.id,
        quantity: 1,
        unitSalePrice: firstProduct.suggestedPrice,
      },
    ]);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const addProductLine = () => {
    if (products.length === 0) return;
    const first = products[0];
    setLineItems([
      ...lineItems,
      {
        productId: first.id,
        quantity: 1,
        unitSalePrice: first.suggestedPrice,
      },
    ]);
  };

  const updateLineProduct = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      productId,
      unitSalePrice: prod ? prod.suggestedPrice : updated[index].unitSalePrice,
    };
    setLineItems(updated);
  };

  const updateLineQuantity = (index: number, qty: number) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      quantity: Math.max(0, qty),
    };
    setLineItems(updated);
  };

  const updateLineSalePrice = (index: number, price: number) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      unitSalePrice: Math.max(0, price),
    };
    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  // Live calculation of all items and totals for modal
  const computedItems: BudgetItem[] = lineItems.map((line) => {
    const prod = products.find((p) => p.id === line.productId);
    if (!prod) {
      return {
        productId: line.productId,
        productName: 'Producto eliminado',
        unit: 'u',
        quantity: line.quantity,
        unitVariableCost: 0,
        unitFixedCost: 0,
        unitTotalCost: 0,
        unitSalePrice: line.unitSalePrice,
        totalVariableCost: 0,
        totalFixedCost: 0,
        totalCost: 0,
        totalSalePrice: line.unitSalePrice * line.quantity,
        profit: line.unitSalePrice * line.quantity,
        profitMarginPercent: 100,
        materialsDetails: [],
      };
    }
    return buildBudgetItem(prod, line.quantity, costs, activeVenture, line.unitSalePrice);
  });

  const totalVariableCost = computedItems.reduce((sum, item) => sum + item.totalVariableCost, 0);
  const totalFixedCost = computedItems.reduce((sum, item) => sum + item.totalFixedCost, 0);
  const totalProductionCost = totalVariableCost + totalFixedCost;
  const totalSalePrice = computedItems.reduce((sum, item) => sum + item.totalSalePrice, 0);
  const totalProfit = totalSalePrice - totalProductionCost;
  const profitMarginPercent = totalProductionCost > 0 ? (totalProfit / totalProductionCost) * 100 : 0;
  const consolidatedMaterials = aggregateConsolidatedMaterials(computedItems);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!clientName.trim()) {
      errors.clientName = 'El nombre del cliente o empresa es obligatorio.';
    }

    if (lineItems.length === 0) {
      errors.lines = 'Debe agregar al menos un producto a producir.';
    }

    for (let i = 0; i < lineItems.length; i++) {
      if (lineItems[i].quantity <= 0) {
        errors.lines = `La cantidad en la línea #${i + 1} debe ser mayor a 0.`;
        break;
      }
      if (lineItems[i].unitSalePrice < 0) {
        errors.lines = `El precio de venta en la línea #${i + 1} no puede ser negativo.`;
        break;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const budget: Budget = {
      id: `budget-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      code: storage.getNextBudgetCode(activeVenture.id),
      ventureId: activeVenture.id,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || undefined,
      clientEmail: clientEmail.trim() || undefined,
      clientTaxId: clientTaxId.trim() || undefined,
      clientAddress: clientAddress.trim() || undefined,
      issueDate,
      validUntil,
      status,
      items: computedItems,
      totalVariableCost,
      totalFixedCost,
      totalProductionCost,
      totalSalePrice,
      totalProfit,
      profitMarginPercent,
      notes: notes.trim() || undefined,
      createdBy: currentUser?.username || 'admin',
      createdAt: new Date().toISOString(),
    };

    onSaveBudget(budget);
    setIsModalOpen(false);
  };

  const handleDownloadPDF = (b: Budget) => {
    exportBudgetToPDF(b, activeVenture);
  };

  const handleDelete = (id: string, code: string) => {
    if (window.confirm(`¿Está seguro de eliminar el presupuesto ${code}?`)) {
      onDeleteBudget(id);
    }
  };

  const getStatusBadge = (st: BudgetStatus) => {
    switch (st) {
      case 'aprobado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-2.5 h-2.5" /> Aprobado
          </span>
        );
      case 'en_produccion':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-2.5 h-2.5" /> En Producción
          </span>
        );
      case 'enviado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Send className="w-2.5 h-2.5" /> Enviado
          </span>
        );
      case 'entregado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            ✓ Entregado
          </span>
        );
      case 'rechazado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Rechazado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Borrador
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Módulo de Presupuestos de Producción
              </h1>
              <p className="text-xs text-slate-500">
                Cotizaciones, cálculo de costos totales, margen de ganancia y exportación en PDF
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-700/20 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo Presupuesto de Producción</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Presupuestos Registrados
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {budgets.length}
            </span>
            <span className="text-xs text-slate-500">cotizaciones</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {budgets.filter((b) => b.status === 'aprobado').length} aprobados / en producción
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Valor Cotizado (Venta)
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-700 font-mono">
              {formatCurrency(
                budgets.reduce((sum, b) => sum + b.totalSalePrice, 0),
                activeVenture.currency
              )}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Costo Fabril Total:{' '}
            {formatCurrency(
              budgets.reduce((sum, b) => sum + b.totalProductionCost, 0),
              activeVenture.currency
            )}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Margen de Ganancia Promedio
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 font-mono">
              {budgets.length > 0
                ? (
                    budgets.reduce((sum, b) => sum + b.profitMarginPercent, 0) / budgets.length
                  ).toFixed(1)
                : '0.0'}
              %
            </span>
            <span className="text-xs text-slate-500">sobre costo total</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Ganancia bruta acumulada:{' '}
            {formatCurrency(
              budgets.reduce((sum, b) => sum + b.totalProfit, 0),
              activeVenture.currency
            )}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="all">Todos los estados</option>
            <option value="borrador">Borrador</option>
            <option value="enviado">Enviado</option>
            <option value="aprobado">Aprobado</option>
            <option value="en_produccion">En Producción</option>
            <option value="entregado">Entregado</option>
            <option value="rechazado">Rechazado</option>
          </select>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por cliente, código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {filteredBudgets.length} presupuestos
        </span>
      </div>

      {/* Budgets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredBudgets.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No hay presupuestos que mostrar</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Cree un nuevo presupuesto seleccionando los productos terminados y las cantidades a producir.
            </p>
            <button
              onClick={openNewModal}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Nuevo Presupuesto</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Código & Estado</th>
                  <th className="py-3 px-3">Cliente / Receptor</th>
                  <th className="py-3 px-3">Fecha Emisión</th>
                  <th className="py-3 px-3 text-center">Líneas</th>
                  <th className="py-3 px-3 text-right">Costos Fijos</th>
                  <th className="py-3 px-3 text-right">Costos Variables</th>
                  <th className="py-3 px-3 text-right">Costo Total Fabril</th>
                  <th className="py-3 px-3 text-right">Precio Venta</th>
                  <th className="py-3 px-3 text-right">Margen Ganancia</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBudgets.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">{b.code}</div>
                      <div className="mt-1">{getStatusBadge(b.status)}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{b.clientName}</div>
                      {b.clientTaxId && (
                        <div className="text-[10px] text-slate-400 font-mono">Doc: {b.clientTaxId}</div>
                      )}
                      {b.clientPhone && (
                        <div className="text-[10px] text-slate-500">{b.clientPhone}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                      <div>{b.issueDate}</div>
                      <div className="text-[10px] text-slate-400">Vence: {b.validUntil}</div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {b.items.length} {b.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                      {formatCurrency(b.totalFixedCost, activeVenture.currency)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                      {formatCurrency(b.totalVariableCost, activeVenture.currency)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(b.totalProductionCost, activeVenture.currency)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-blue-700 text-sm">
                      {formatCurrency(b.totalSalePrice, activeVenture.currency)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono">
                      <span className="font-bold text-emerald-600 block">
                        +{formatCurrency(b.totalProfit, activeVenture.currency)}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-medium">
                        {b.profitMarginPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewingBudget(b)}
                          title="Ver desglose completo en pantalla"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(b)}
                          title="Exportar a PDF oficial de producción"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {currentUser?.role !== 'invitado' && (
                          <button
                            onClick={() => handleDelete(b.id, b.code)}
                            title="Eliminar presupuesto"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    Generar Nuevo Presupuesto de Producción
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activeVenture.name} • Folio tentativo: {storage.getNextBudgetCode(activeVenture.id)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
              {/* Client & Dates Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cliente / Destinatario <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Panadería Central SRL, Don Pedro Restaurante, Farmacia del Sol"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.clientName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.clientName && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.clientName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CUIT / RUT / DNI
                  </label>
                  <input
                    type="text"
                    placeholder="ej. 30-12345678-9"
                    value={clientTaxId}
                    onChange={(e) => setClientTaxId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="ej. +54 11 4455-6677"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="ej. compras@cliente.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fecha Emisión</label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Validez Hasta</label>
                  <input
                    type="date"
                    required
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Line Items Builder */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      Selección de Productos Terminados & Cantidades a Producir
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      El sistema calcula en vivo los costos variables de insumos, costos fijos aplicados y precio total
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addProductLine}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Agregar Producto</span>
                  </button>
                </div>

                {formErrors.lines && (
                  <p className="text-[11px] text-rose-500 mb-2 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">
                    {formErrors.lines}
                  </p>
                )}

                <div className="space-y-2">
                  <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-[11px] font-bold text-slate-500 px-2 uppercase">
                    <div className="col-span-4">Producto Terminado</div>
                    <div className="col-span-2 text-center">Cantidad a Producir</div>
                    <div className="col-span-2 text-right">C. Unit Fabril</div>
                    <div className="col-span-2 text-right">Precio Venta Unit.</div>
                    <div className="col-span-1 text-right">Subtotal</div>
                    <div className="col-span-1 text-center">Quitar</div>
                  </div>

                  {lineItems.map((line, index) => {
                    const computed = computedItems[index];

                    return (
                      <div
                        key={index}
                        className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                      >
                        <div className="sm:col-span-4">
                          <select
                            value={line.productId}
                            onChange={(e) => updateLineProduct(index, e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="any"
                              min="0.01"
                              placeholder="Cant."
                              value={line.quantity}
                              onChange={(e) => updateLineQuantity(index, Number(e.target.value))}
                              className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-[11px] text-slate-500 font-mono shrink-0">
                              {computed?.unit || 'u'}
                            </span>
                          </div>
                        </div>

                        <div className="sm:col-span-2 text-right">
                          <div className="text-xs font-mono font-bold text-slate-800">
                            {formatCurrency(computed?.unitTotalCost || 0, activeVenture.currency)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            (Var: {formatCurrency(computed?.unitVariableCost || 0, activeVenture.currency)} + Fijo: {formatCurrency(computed?.unitFixedCost || 0, activeVenture.currency)})
                          </div>
                        </div>

                        <div className="sm:col-span-2 text-right">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            placeholder="Precio Venta"
                            value={line.unitSalePrice}
                            onChange={(e) => updateLineSalePrice(index, Number(e.target.value))}
                            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-blue-700 font-mono font-bold text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div className="sm:col-span-1 text-right">
                          <div className="text-xs font-mono font-black text-slate-900">
                            {formatCurrency(computed?.totalSalePrice || 0, activeVenture.currency)}
                          </div>
                          <div className="text-[10px] text-emerald-600 font-mono font-bold">
                            +{formatCurrency(computed?.profit || 0, activeVenture.currency)}
                          </div>
                        </div>

                        <div className="sm:col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => removeLineItem(index)}
                            disabled={lineItems.length === 1}
                            className={`p-1 rounded transition-colors ${
                              lineItems.length === 1
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-400 hover:text-rose-600'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5 mx-auto" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Automatic Calculation Summary Box (Desglose Requerido) */}
              <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl">
                <div className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 mb-3 flex items-center justify-between">
                  <span>Cálculo Automático de Costos y Margen de Producción</span>
                  <span className="text-[10px] text-slate-400">Totalización Oficial</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                      Total Costos Variables
                    </span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {formatCurrency(totalVariableCost, activeVenture.currency)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Materia prima e insumos
                    </span>
                  </div>

                  <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                      Total Costos Fijos Aplicados
                    </span>
                    <span className="text-sm font-bold text-blue-400 font-mono">
                      {formatCurrency(totalFixedCost, activeVenture.currency)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Absorción de planta
                    </span>
                  </div>

                  <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                      Costo Total Producción
                    </span>
                    <span className="text-base font-black text-rose-400 font-mono">
                      {formatCurrency(totalProductionCost, activeVenture.currency)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Costo de fabricación
                    </span>
                  </div>

                  <div className="bg-slate-800/90 p-3 rounded-xl border border-cyan-800/50">
                    <span className="text-[10px] text-cyan-300 font-semibold block uppercase">
                      Precio Total de Venta
                    </span>
                    <span className="text-base font-black text-white font-mono">
                      {formatCurrency(totalSalePrice, activeVenture.currency)}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 font-mono block mt-0.5">
                      Ganancia: +{formatCurrency(totalProfit, activeVenture.currency)} ({profitMarginPercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* Raw materials needed breakdown banner */}
                {consolidatedMaterials.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      Materia Prima e Insumos Totales Requeridos para este Lote ({consolidatedMaterials.length}):
                    </span>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                      {consolidatedMaterials.map((mat, i) => (
                        <div
                          key={i}
                          className="bg-slate-800/80 px-2.5 py-1 rounded-lg text-[10px] border border-slate-700 text-slate-200"
                        >
                          <span className="font-semibold">{mat.materialName}:</span>{' '}
                          <span className="font-mono text-cyan-300 font-bold">
                            {mat.totalQuantity.toLocaleString('es-AR', { maximumFractionDigits: 2 })} {mat.unit}
                          </span>{' '}
                          <span className="text-slate-400 font-mono">
                            ({formatCurrency(mat.totalCost, activeVenture.currency)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estado del Presupuesto
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BudgetStatus)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="borrador">Borrador</option>
                    <option value="enviado">Enviado al Cliente</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="en_produccion">En Producción</option>
                    <option value="entregado">Entregado</option>
                    <option value="rechazado">Rechazado</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Observaciones y Condiciones (Aparecen en el PDF)
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Plazo de entrega 5 días hábiles. Pago 50% anticipo y saldo contra entrega."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-700/20 transition-all cursor-pointer"
                >
                  Guardar Presupuesto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Budget Detailed Modal */}
      {viewingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-600/30 text-cyan-300 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono">
                    {viewingBudget.code} • {viewingBudget.clientName}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activeVenture.name} • Emitido: {viewingBudget.issueDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPDF(viewingBudget)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PDF</span>
                </button>
                <button
                  onClick={() => setViewingBudget(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Status and metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Estado</span>
                  <div className="mt-1">{getStatusBadge(viewingBudget.status)}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Cliente</span>
                  <span className="text-xs font-bold text-slate-800">{viewingBudget.clientName}</span>
                  {viewingBudget.clientTaxId && (
                    <span className="text-[10px] text-slate-500 block font-mono">{viewingBudget.clientTaxId}</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Validez</span>
                  <span className="text-xs font-medium text-slate-800">{viewingBudget.validUntil}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Creado por</span>
                  <span className="text-xs font-mono text-slate-700">{viewingBudget.createdBy}</span>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Desglose de Productos Cotizados
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Producto</th>
                        <th className="py-2.5 px-2 text-center">Cant.</th>
                        <th className="py-2.5 px-2 text-right">C. Var. U.</th>
                        <th className="py-2.5 px-2 text-right">C. Fijo U.</th>
                        <th className="py-2.5 px-2 text-right">Costo Tot. U.</th>
                        <th className="py-2.5 px-2 text-right">Precio Vta. U.</th>
                        <th className="py-2.5 px-3 text-right">Subtotal Venta</th>
                        <th className="py-2.5 px-3 text-right">Margen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {viewingBudget.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-bold">{item.productName}</td>
                          <td className="py-2.5 px-2 text-center font-mono">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono">
                            {formatCurrency(item.unitVariableCost, activeVenture.currency)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono">
                            {formatCurrency(item.unitFixedCost, activeVenture.currency)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono font-bold">
                            {formatCurrency(item.unitTotalCost, activeVenture.currency)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono font-bold text-blue-700">
                            {formatCurrency(item.unitSalePrice, activeVenture.currency)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                            {formatCurrency(item.totalSalePrice, activeVenture.currency)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                            +{formatCurrency(item.profit, activeVenture.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Economic Summary */}
              <div className="bg-slate-900 rounded-2xl p-5 text-white">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">
                  Resumen Económico & Rentabilidad de Fabricación
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase">Costos Variables</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {formatCurrency(viewingBudget.totalVariableCost, activeVenture.currency)}
                    </span>
                  </div>
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase">Costos Fijos Asignados</span>
                    <span className="text-sm font-bold text-blue-400 font-mono">
                      {formatCurrency(viewingBudget.totalFixedCost, activeVenture.currency)}
                    </span>
                  </div>
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase">Costo Total de Fabricación</span>
                    <span className="text-base font-black text-rose-400 font-mono">
                      {formatCurrency(viewingBudget.totalProductionCost, activeVenture.currency)}
                    </span>
                  </div>
                  <div className="bg-slate-800 p-3 rounded-xl border border-cyan-800">
                    <span className="text-[10px] text-cyan-300 block uppercase">Precio Total Venta</span>
                    <span className="text-base font-black text-white font-mono">
                      {formatCurrency(viewingBudget.totalSalePrice, activeVenture.currency)}
                    </span>
                    <span className="text-[10px] text-emerald-400 block font-mono font-bold mt-0.5">
                      Margen: +{viewingBudget.profitMarginPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Materials Breakdown */}
              {viewingBudget.items.some((it) => it.materialsDetails && it.materialsDetails.length > 0) && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Insumos y Materias Primas Requeridas (Producción)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {aggregateConsolidatedMaterials(viewingBudget.items).map((mat, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-700"
                      >
                        <span className="font-bold">{mat.materialName}:</span>{' '}
                        <span className="font-mono text-blue-700 font-bold">
                          {mat.totalQuantity.toLocaleString('es-AR', { maximumFractionDigits: 2 })} {mat.unit}
                        </span>{' '}
                        <span className="text-slate-400 font-mono">
                          ({formatCurrency(mat.totalCost, activeVenture.currency)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingBudget.notes && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Condiciones:</span> {viewingBudget.notes}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingBudget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
