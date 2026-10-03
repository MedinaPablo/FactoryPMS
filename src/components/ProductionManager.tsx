import React, { useState } from 'react';
import {
  Wrench,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Plus,
  Search,
  Filter,
  User,
  Package,
  Calendar,
  Eye,
  Trash2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  X,
  FileSpreadsheet,
  AlertCircle,
  HardHat,
  Timer,
  Check,
  Building
} from 'lucide-react';
import { ProductionOrder, ProductionStatus, Venture, Product, CostItem, Budget, User as AppUser } from '../types';
import { formatCurrency, calculateProductCost } from '../services/costCalculator';
import { storage } from '../services/storage';

interface ProductionManagerProps {
  orders: ProductionOrder[];
  activeVenture: Venture;
  products: Product[];
  costs: CostItem[];
  budgets: Budget[];
  currentUser: AppUser | null;
  onSaveOrder: (order: ProductionOrder) => void;
  onDeleteOrder: (orderId: string) => void;
  onStartOrder: (orderId: string, operatorName?: string) => void;
  onPauseOrder: (orderId: string, reason: string) => void;
  onResumeOrder: (orderId: string) => void;
  onFinishOrder: (orderId: string) => void;
}

export const ProductionManager: React.FC<ProductionManagerProps> = ({
  orders,
  activeVenture,
  products,
  costs,
  budgets,
  currentUser,
  onSaveOrder,
  onDeleteOrder,
  onStartOrder,
  onPauseOrder,
  onResumeOrder,
  onFinishOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | ProductionStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<ProductionOrder | null>(null);
  
  // Pause Modal State
  const [pausingOrderId, setPausingOrderId] = useState<string | null>(null);
  const [pauseReason, setPauseReason] = useState('');
  const [pauseReasonError, setPauseReasonError] = useState<string | null>(null);

  // New Production Order Modal State
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [sourceType, setSourceType] = useState<'budget' | 'custom'>('budget');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [orderQuantity, setOrderQuantity] = useState<string>('1');
  const [orderClientName, setOrderClientName] = useState<string>('Stock / Producción de Planta');
  const [assignedOperator, setAssignedOperator] = useState<string>('');
  const [priority, setPriority] = useState<'baja' | 'media' | 'alta' | 'urgente'>('media');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [modalErrors, setModalErrors] = useState<{ [key: string]: string }>({});

  const canEdit = currentUser?.role === 'root' || currentUser?.role === 'admin';

  // Metrics
  const totalOrders = orders.length;
  const confirmedCount = orders.filter((o) => o.status === 'confirmado').length;
  const inProgressCount = orders.filter((o) => o.status === 'en_proceso').length;
  const pausedCount = orders.filter((o) => o.status === 'en_pausa').length;
  const finishedCount = orders.filter((o) => o.status === 'terminado').length;

  // Active orders (non-finished) for plant raw material & labor calculations
  const activeOrders = orders.filter((o) => o.status === 'confirmado' || o.status === 'en_proceso' || o.status === 'en_pausa');
  
  // Consolidated labor hours across active orders
  const totalActiveLaborHours = activeOrders.reduce((sum, o) => sum + (o.totalLaborHours || 0), 0);

  // Consolidated materials across active orders
  const consolidatedActiveMaterials = (() => {
    const map = new Map<string, { name: string; unit: string; quantity: number; isLaborHour: boolean; totalCost: number }>();
    for (const order of activeOrders) {
      for (const mat of order.requiredMaterials) {
        const key = `${mat.name}___${mat.unit}`;
        const existing = map.get(key);
        if (existing) {
          existing.quantity += mat.quantity;
          existing.totalCost += mat.totalCost;
        } else {
          map.set(key, {
            name: mat.name,
            unit: mat.unit,
            quantity: mat.quantity,
            isLaborHour: mat.isLaborHour,
            totalCost: mat.totalCost,
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => (b.isLaborHour ? 1 : 0) - (a.isLaborHour ? 1 : 0));
  })();

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    if (activeTab !== 'all' && order.status !== activeTab) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchOrder = order.orderNumber.toLowerCase().includes(term);
      const matchClient = order.clientName.toLowerCase().includes(term);
      const matchProduct = order.productName.toLowerCase().includes(term);
      const matchReason = order.currentPauseReason?.toLowerCase().includes(term);
      if (!matchOrder && !matchClient && !matchProduct && !matchReason) return false;
    }
    return true;
  });

  // Handlers for Pause Modal
  const openPauseModal = (orderId: string) => {
    setPausingOrderId(orderId);
    setPauseReason('');
    setPauseReasonError(null);
  };

  const handleConfirmPause = () => {
    if (!pauseReason.trim()) {
      setPauseReasonError('Debe indicar el motivo por el cual el pedido entra en pausa.');
      return;
    }
    if (pausingOrderId) {
      onPauseOrder(pausingOrderId, pauseReason.trim());
      setPausingOrderId(null);
      setPauseReason('');
    }
  };

  // Quick pause reasons suggestions
  const quickReasons = [
    'Falta de materia prima / insumo en depósito',
    'Avería o mantenimiento de maquinaria',
    'Corte temporal de energía eléctrica / gas',
    'Espera de aprobación de diseño por el cliente',
    'Cambio de turno / saturación de cuadra',
    'Revisión técnica de control de calidad',
  ];

  // Open New Order Modal
  const openNewOrderModal = () => {
    setIsNewOrderModalOpen(true);
    setModalErrors({});
    if (budgets.length > 0) {
      setSourceType('budget');
      setSelectedBudgetId(budgets[0].id);
    } else {
      setSourceType('custom');
    }
    if (products.length > 0) {
      setSelectedProductId(products[0].id);
    }
    setOrderQuantity('1');
    setOrderClientName('Stock de Fábrica');
    setAssignedOperator('');
    setPriority('media');
    setOrderNotes('');
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (sourceType === 'budget') {
      const budget = budgets.find((b) => b.id === selectedBudgetId);
      if (!budget || budget.items.length === 0) {
        errors.budget = 'Seleccione un presupuesto válido con productos.';
      }
    } else {
      if (!selectedProductId) errors.product = 'Seleccione un producto.';
      if (Number(orderQuantity) <= 0) errors.quantity = 'La cantidad debe ser mayor a 0.';
      if (!orderClientName.trim()) errors.client = 'El cliente o destino es obligatorio.';
    }

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      return;
    }

    if (sourceType === 'budget') {
      const budget = budgets.find((b) => b.id === selectedBudgetId)!;
      // Create an order for each item in the budget
      budget.items.forEach((item, index) => {
        const prod = products.find((p) => p.id === item.productId);
        const costData = prod ? calculateProductCost(prod, costs, activeVenture) : null;
        
        let totalHours = 0;
        const requiredMaterials = (item.materialsDetails && item.materialsDetails.length > 0)
          ? item.materialsDetails.map((m) => {
              const costItem = costs.find((c) => c.id === m.costItemId);
              const isHour = Boolean(costItem?.unit === 'hora' || costItem?.subcategory?.toLowerCase().includes('obra'));
              if (isHour) totalHours += m.totalQuantity;
              return {
                costItemId: m.costItemId,
                name: m.materialName,
                unit: m.unit,
                quantity: m.totalQuantity,
                isLaborHour: isHour,
                category: costItem?.subcategory || 'Materia Prima',
                unitCost: m.unitCost,
                totalCost: m.totalCost,
              };
            })
          : (costData?.materialsBreakdown || []).map((m) => {
              const costItem = costs.find((c) => c.id === m.costItemId);
              const isHour = Boolean(costItem?.unit === 'hora' || costItem?.subcategory?.toLowerCase().includes('obra'));
              const totalQty = m.quantity * (1 + m.wastePercentage / 100) * item.quantity;
              if (isHour) totalHours += totalQty;
              return {
                costItemId: m.costItemId,
                name: m.name,
                unit: m.unit,
                quantity: totalQty,
                isLaborHour: isHour,
                category: costItem?.subcategory || 'Insumo',
                unitCost: m.unitCost,
                totalCost: totalQty * m.unitCost,
              };
            });

        const newOrder: ProductionOrder = {
          id: `op-${Date.now()}-${index}`,
          orderNumber: storage.getNextProductionOrderCode(activeVenture.id),
          ventureId: activeVenture.id,
          budgetId: budget.id,
          budgetCode: budget.code,
          clientName: budget.clientName,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          status: 'confirmado',
          confirmedAt: new Date().toISOString(),
          pauseHistory: [],
          requiredMaterials,
          totalLaborHours: totalHours,
          assignedOperator: assignedOperator.trim() || undefined,
          priority,
          notes: orderNotes.trim() || budget.notes,
          createdAt: new Date().toISOString(),
        };

        onSaveOrder(newOrder);
      });
    } else {
      const prod = products.find((p) => p.id === selectedProductId)!;
      const costData = calculateProductCost(prod, costs, activeVenture);
      const qty = Number(orderQuantity);

      let totalHours = 0;
      const requiredMaterials = costData.materialsBreakdown.map((m) => {
        const costItem = costs.find((c) => c.id === m.costItemId);
        const isHour = Boolean(costItem?.unit === 'hora' || costItem?.subcategory?.toLowerCase().includes('obra'));
        const totalQty = m.quantity * (1 + m.wastePercentage / 100) * qty;
        if (isHour) totalHours += totalQty;
        return {
          costItemId: m.costItemId,
          name: m.name,
          unit: m.unit,
          quantity: totalQty,
          isLaborHour: isHour,
          category: costItem?.subcategory || 'Insumo',
          unitCost: m.unitCost,
          totalCost: totalQty * m.unitCost,
        };
      });

      const newOrder: ProductionOrder = {
        id: `op-${Date.now()}`,
        orderNumber: storage.getNextProductionOrderCode(activeVenture.id),
        ventureId: activeVenture.id,
        clientName: orderClientName.trim(),
        productId: prod.id,
        productName: prod.name,
        quantity: qty,
        unit: prod.unit,
        status: 'confirmado',
        confirmedAt: new Date().toISOString(),
        pauseHistory: [],
        requiredMaterials,
        totalLaborHours: totalHours,
        assignedOperator: assignedOperator.trim() || undefined,
        priority,
        notes: orderNotes.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      onSaveOrder(newOrder);
    }

    setIsNewOrderModalOpen(false);
  };

  const getStatusBadge = (status: ProductionStatus, pauseReason?: string) => {
    switch (status) {
      case 'confirmado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Confirmado / Por Iniciar</span>
          </span>
        );
      case 'en_proceso':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-300 shadow-xs animate-pulse">
            <Play className="w-3 h-3 text-blue-600 fill-blue-600" />
            <span>En Producción (Comenzado)</span>
          </span>
        );
      case 'en_pausa':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
            <Pause className="w-3 h-3 text-rose-600 fill-rose-600" />
            <span>En Pausa</span>
          </span>
        );
      case 'terminado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Terminado / Completado</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            {status}
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
            <div className="w-9 h-9 rounded-xl bg-cyan-600/10 text-cyan-600 flex items-center justify-center font-bold">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Módulo 4: Control de Producción y Planta
              </h1>
              <p className="text-xs text-slate-500">
                Seguimiento de pedidos confirmados, en proceso, pausas con motivo y terminados para <span className="font-semibold text-slate-800">{activeVenture.name}</span>
              </p>
            </div>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={openNewOrderModal}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-900/20 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nueva Orden de Fabricación</span>
          </button>
        )}
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Órdenes</span>
          <span className="text-xl font-black text-slate-900 font-mono mt-1 block">{totalOrders}</span>
          <span className="text-[10px] text-slate-500">en taller</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">1. Confirmados</span>
          <span className="text-xl font-black text-amber-700 font-mono mt-1 block">{confirmedCount}</span>
          <span className="text-[10px] text-amber-600">por iniciar</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">2. En Proceso</span>
          <span className="text-xl font-black text-blue-700 font-mono mt-1 block">{inProgressCount}</span>
          <span className="text-[10px] text-blue-600">comenzados hoy</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">3. En Pausa</span>
          <span className="text-xl font-black text-rose-700 font-mono mt-1 block">{pausedCount}</span>
          <span className="text-[10px] text-rose-600">con motivo registrado</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">4. Terminados</span>
          <span className="text-xl font-black text-emerald-700 font-mono mt-1 block">{finishedCount}</span>
          <span className="text-[10px] text-emerald-600">listos para entrega</span>
        </div>
      </div>

      {/* Requerimientos Consolidados de Planta (Insumos, Materia Prima y Horas Requeridas) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Requerimiento Consolidado de Planta: Insumos, Materias Primas y Horas
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Materiales y mano de obra total necesarios para fabricar los <strong>{activeOrders.length} pedidos activos</strong> de {activeVenture.name}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 shrink-0">
            <Timer className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300">Total Horas Hombre requeridas:</span>
            <span className="font-mono font-bold text-amber-300 text-sm">{totalActiveLaborHours.toFixed(1)} hs</span>
          </div>
        </div>

        {consolidatedActiveMaterials.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400 italic">
            No hay órdenes de producción pendientes ni en proceso actualmente.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {consolidatedActiveMaterials.map((mat, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between ${
                  mat.isLaborHour
                    ? 'bg-amber-950/30 border-amber-700/60 text-amber-200'
                    : 'bg-slate-800/70 border-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold line-clamp-1">{mat.name}</span>
                  {mat.isLaborHour && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold uppercase shrink-0">
                      Mano de Obra
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="font-mono text-sm font-extrabold text-cyan-300">
                    {mat.quantity.toLocaleString('es-AR', { maximumFractionDigits: 2 })} {mat.unit}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatCurrency(mat.totalCost, activeVenture.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('confirmado')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'confirmado' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Confirmados ({confirmedCount})
          </button>
          <button
            onClick={() => setActiveTab('en_proceso')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'en_proceso' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            En Proceso ({inProgressCount})
          </button>
          <button
            onClick={() => setActiveTab('en_pausa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'en_pausa' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            En Pausa ({pausedCount})
          </button>
          <button
            onClick={() => setActiveTab('terminado')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'terminado' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Terminados ({finishedCount})
          </button>
        </div>

        <div className="relative flex-1 max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por orden, cliente, producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <HardHat className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No se encontraron pedidos de producción</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No hay órdenes de trabajo que coincidan con el estado o filtro seleccionado.
          </p>
          {canEdit && (
            <button
              onClick={openNewOrderModal}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generar Pedido de Producción</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const isPaused = order.status === 'en_pausa';
            const isFinished = order.status === 'terminado';
            const isInProgress = order.status === 'en_proceso';
            const isConfirmed = order.status === 'confirmado';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all relative flex flex-col justify-between ${
                  isPaused
                    ? 'border-rose-300 ring-2 ring-rose-500/20 bg-rose-50/20'
                    : isInProgress
                    ? 'border-blue-300 ring-1 ring-blue-500/20'
                    : isFinished
                    ? 'border-slate-200 bg-slate-50/40 opacity-90'
                    : 'border-amber-200 bg-amber-50/10'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 text-sm bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {order.orderNumber}
                        </span>
                        {getStatusBadge(order.status)}
                        {order.priority === 'urgente' && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            Urgente
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 mt-2">
                        {order.productName}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium">
                        Cliente / Destino: <strong className="text-slate-800">{order.clientName}</strong>
                        {order.budgetCode && (
                          <span className="text-slate-400 ml-1.5 font-mono text-[11px]">
                            (Presupuesto: {order.budgetCode})
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xl font-black font-mono text-cyan-800 block">
                        {order.quantity} {order.unit}
                      </span>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">
                        Cantidad a Producir
                      </span>
                    </div>
                  </div>

                  {/* Operational Details (Hours & Workers) */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs py-2 px-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Operario / Responsable</span>
                      <span className="font-bold text-slate-800 truncate block">
                        {order.assignedOperator || 'Personal de Turno'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Horas Estimadas</span>
                      <span className="font-mono font-bold text-amber-700">
                        {order.totalLaborHours ? `${order.totalLaborHours.toFixed(1)} hs` : 'Sin horas registradas'}
                      </span>
                    </div>
                  </div>

                  {/* PAUSE REASON HIGHLIGHT (IF PAUSED) */}
                  {isPaused && (
                    <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1 text-rose-950 animate-in fade-in">
                      <div className="flex items-center gap-1.5 font-bold text-rose-800">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Motivo de la Pausa:</span>
                      </div>
                      <p className="font-medium text-[11px] leading-relaxed pl-5 text-rose-900">
                        "{order.currentPauseReason || 'Pausa operativa requerida en planta.'}"
                      </p>
                      {order.pauseHistory && order.pauseHistory.length > 0 && (
                        <div className="text-[10px] text-rose-600 pl-5 pt-0.5 font-mono">
                          Pausado el: {new Date(order.pauseHistory[0].date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                        </div>
                      )}
                    </div>
                  )}

                  {/* Finished info badge */}
                  {isFinished && order.finishedAt && (
                    <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Completado y aprobado el {new Date(order.finishedAt).toLocaleDateString('es-AR')} a las {new Date(order.finishedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</span>
                    </div>
                  )}

                  {/* Materials & Inputs Preview Pills */}
                  <div className="mt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Insumos y Materias Primas Requeridas ({order.requiredMaterials.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                      {order.requiredMaterials.map((mat, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border ${
                            mat.isLaborHour
                              ? 'bg-amber-50 border-amber-200 text-amber-900 font-bold'
                              : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{mat.name}:</span>
                          <span className="font-mono font-bold">
                            {mat.quantity.toLocaleString('es-AR', { maximumFractionDigits: 2 })} {mat.unit}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedOrderForDetails(order)}
                    className="text-xs text-cyan-700 hover:text-cyan-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Ficha Técnica</span>
                  </button>

                  {canEdit && (
                    <div className="flex items-center gap-1.5">
                      {/* Action 1: Comenzar (si está confirmado) */}
                      {isConfirmed && (
                        <button
                          onClick={() => onStartOrder(order.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Comenzar Pedido</span>
                        </button>
                      )}

                      {/* Action 2: Pausar (si está en proceso) */}
                      {isInProgress && (
                        <button
                          onClick={() => openPauseModal(order.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Pause className="w-3 h-3 fill-rose-600" />
                          <span>Pausar</span>
                        </button>
                      )}

                      {/* Action 3: Reanudar (si está en pausa) */}
                      {isPaused && (
                        <button
                          onClick={() => onResumeOrder(order.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Reanudar Pedido</span>
                        </button>
                      )}

                      {/* Action 4: Terminar (si está en proceso o en pausa) */}
                      {(isInProgress || isPaused) && (
                        <button
                          onClick={() => onFinishOrder(order.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Terminar</span>
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar la orden de producción ${order.orderNumber}?`)) {
                            onDeleteOrder(order.id);
                          }
                        }}
                        title="Eliminar orden"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: PAUSAR PEDIDO CON MOTIVO */}
      {pausingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-rose-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-800 text-rose-300 flex items-center justify-center font-bold">
                  <Pause className="w-4 h-4 fill-rose-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Pausar Pedido de Producción</h3>
                  <p className="text-[11px] text-rose-200">Indique la causa operativa de la detención</p>
                </div>
              </div>
              <button
                onClick={() => setPausingOrderId(null)}
                className="text-rose-300 hover:text-white p-1 rounded-lg hover:bg-rose-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <strong>Control de Planta:</strong> El motivo quedará registrado en el historial de trazabilidad de la orden para auditoría y replanificación de entrega.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Motivos Frecuentes (Clic para seleccionar):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {quickReasons.map((reason, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setPauseReason(reason);
                        setPauseReasonError(null);
                      }}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition-colors text-left"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción Detallada del Motivo <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="ej. Avería en termostato del horno rotativo. Técnico convocado para las 11:30 hs..."
                  value={pauseReason}
                  onChange={(e) => {
                    setPauseReason(e.target.value);
                    if (e.target.value.trim()) setPauseReasonError(null);
                  }}
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                    pauseReasonError ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300'
                  }`}
                />
                {pauseReasonError && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{pauseReasonError}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPausingOrderId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPause}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-xs transition-colors cursor-pointer"
                >
                  Confirmar Pausa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FICHA DETALLADA DE INSUMOS, MATERIAS PRIMAS Y HORAS */}
      {selectedOrderForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-600/30 text-cyan-300 flex items-center justify-center font-bold">
                  <HardHat className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono">
                    {selectedOrderForDetails.orderNumber} • Ficha Técnica de Producción
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedOrderForDetails.productName} ({selectedOrderForDetails.quantity} {selectedOrderForDetails.unit})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForDetails(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Header card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Estado</span>
                  <div className="mt-1">{getStatusBadge(selectedOrderForDetails.status)}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Cliente</span>
                  <span className="font-bold text-slate-800">{selectedOrderForDetails.clientName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Horas Totales</span>
                  <span className="font-mono font-bold text-amber-700">
                    {selectedOrderForDetails.totalLaborHours ? `${selectedOrderForDetails.totalLaborHours.toFixed(1)} hs` : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Confirmado</span>
                  <span className="text-slate-600 font-mono text-[11px]">
                    {new Date(selectedOrderForDetails.confirmedAt).toLocaleDateString('es-AR')}
                  </span>
                </div>
              </div>

              {/* Pause History if any */}
              {selectedOrderForDetails.pauseHistory && selectedOrderForDetails.pauseHistory.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-2">
                  <span className="font-bold text-rose-900 block flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Historial de Pausas Registradas:
                  </span>
                  <div className="space-y-1.5 pl-5">
                    {selectedOrderForDetails.pauseHistory.map((p, idx) => (
                      <div key={idx} className="text-rose-950 font-medium">
                        <span className="font-mono text-rose-700 font-bold">
                          {new Date(p.date).toLocaleString('es-AR')}:
                        </span>{' '}
                        <span>"{p.reason}"</span>
                        {p.resumedAt && (
                          <span className="text-emerald-700 font-mono text-[10px] block">
                            (Reanudado: {new Date(p.resumedAt).toLocaleString('es-AR')})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Materials & Labor Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                  <span>Detalle de Insumos, Materia Prima y Horas Requeridas</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {selectedOrderForDetails.requiredMaterials.length} componentes
                  </span>
                </h4>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Insumo / Proceso</th>
                        <th className="py-2.5 px-2">Tipo</th>
                        <th className="py-2.5 px-3 text-center">Cantidad Requerida</th>
                        <th className="py-2.5 px-3 text-right">Costo Unitario</th>
                        <th className="py-2.5 px-3 text-right">Costo Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {selectedOrderForDetails.requiredMaterials.map((mat, i) => (
                        <tr
                          key={i}
                          className={mat.isLaborHour ? 'bg-amber-50/50' : 'hover:bg-slate-50/60'}
                        >
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {mat.name}
                          </td>
                          <td className="py-2.5 px-2 text-[10px]">
                            {mat.isLaborHour ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                                Mano de Obra
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {mat.category}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-cyan-800">
                            {mat.quantity.toLocaleString('es-AR', { maximumFractionDigits: 2 })} {mat.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                            {formatCurrency(mat.unitCost, activeVenture.currency)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(mat.totalCost, activeVenture.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedOrderForDetails.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <strong className="text-slate-800">Notas de Planta:</strong> {selectedOrderForDetails.notes}
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedOrderForDetails(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CREAR NUEVA ORDEN DE PRODUCCIÓN */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-600/30 text-cyan-400 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Nueva Orden de Fabricación</h3>
                  <p className="text-[11px] text-slate-400">{activeVenture.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              {/* Origin selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Origen de la Orden de Producción
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSourceType('budget')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      sourceType === 'budget'
                        ? 'bg-cyan-50 border-cyan-500 text-cyan-800 ring-2 ring-cyan-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Desde Presupuesto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSourceType('custom')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      sourceType === 'custom'
                        ? 'bg-cyan-50 border-cyan-500 text-cyan-800 ring-2 ring-cyan-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Producción Directa / Stock</span>
                  </button>
                </div>
              </div>

              {sourceType === 'budget' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Seleccionar Presupuesto Aprobado o Emitido <span className="text-rose-500">*</span>
                  </label>
                  {budgets.length === 0 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                      No hay presupuestos creados en este emprendimiento. Puede usar "Producción Directa / Stock".
                    </div>
                  ) : (
                    <select
                      value={selectedBudgetId}
                      onChange={(e) => setSelectedBudgetId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {budgets.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.code} • {b.clientName} ({b.items.length} productos, Total {formatCurrency(b.totalSalePrice, activeVenture.currency)})
                        </option>
                      ))}
                    </select>
                  )}
                  {modalErrors.budget && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{modalErrors.budget}</p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Producto Terminado <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Cantidad a Producir <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        required
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Cliente / Destino <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ej. Stock Salón de Ventas"
                        value={orderClientName}
                        onChange={(e) => setOrderClientName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Operario / Encargado de Planta
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Maestro Panadero, Soldador"
                    value={assignedOperator}
                    onChange={(e) => setAssignedOperator(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prioridad</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'baja' | 'media' | 'alta' | 'urgente')}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media (Estándar)</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notas de Producción
                </label>
                <input
                  type="text"
                  placeholder="ej. Entregar empaquetado en cajas de 10 unidades..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-900/20 transition-all cursor-pointer"
                >
                  Generar Orden de Producción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
