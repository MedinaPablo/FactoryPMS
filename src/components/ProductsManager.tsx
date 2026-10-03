import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Layers,
  Building,
  DollarSign,
  TrendingUp,
  Percent,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  X,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import { Product, ProductMaterial, CostItem, Venture, User } from '../types';
import { calculateProductCost, formatCurrency, validateNonNegative } from '../services/costCalculator';

interface ProductsManagerProps {
  products: Product[];
  costs: CostItem[];
  activeVenture: Venture;
  currentUser: User | null;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const ProductsManager: React.FC<ProductsManagerProps> = ({
  products,
  costs,
  activeVenture,
  currentUser,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('unidad');
  const [sku, setSku] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState('');
  const [fixedCostWeight, setFixedCostWeight] = useState('1.0');
  const [materials, setMaterials] = useState<ProductMaterial[]>([]);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const canEdit = currentUser?.role === 'root' || currentUser?.role === 'admin';
  const availableVariableCosts = costs.filter((c) => c.category === 'variable');

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    if (searchTerm.trim() === '') return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.sku?.toLowerCase().includes(term)
    );
  });

  const openNewModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setUnit(
      activeVenture.industry === 'panaderia'
        ? 'kg'
        : activeVenture.industry === 'empanadas'
        ? 'docena'
        : activeVenture.industry === 'calzado'
        ? 'par'
        : 'unidad'
    );
    setSku('');
    setSuggestedPrice('');
    setFixedCostWeight('1.0');
    setMaterials([]);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setUnit(prod.unit);
    setSku(prod.sku || '');
    setSuggestedPrice(String(prod.suggestedPrice));
    setFixedCostWeight(String(prod.fixedCostWeight || 1.0));
    setMaterials(JSON.parse(JSON.stringify(prod.materials)));
    setFormErrors({});
    setIsModalOpen(true);
  };

  const addMaterialRow = () => {
    if (availableVariableCosts.length === 0) {
      alert('Primero debe registrar al menos un costo variable o insumo en el módulo de Costos.');
      return;
    }
    setMaterials([
      ...materials,
      {
        costItemId: availableVariableCosts[0].id,
        quantity: 1,
        wastePercentage: 0,
      },
    ]);
  };

  const updateMaterialRow = (index: number, field: keyof ProductMaterial, value: unknown) => {
    const updated = [...materials];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setMaterials(updated);
  };

  const removeMaterialRow = (index: number) => {
    setMaterials(materials.filter((_, idx) => idx !== index));
  };

  // Preview Calculations inside modal
  const previewProduct: Product = {
    id: editingProduct ? editingProduct.id : 'preview',
    ventureId: activeVenture.id,
    name: name || 'Producto en edición',
    description,
    unit,
    sku,
    suggestedPrice: Number(suggestedPrice) || 0,
    fixedCostWeight: Number(fixedCostWeight) || 1.0,
    materials,
    createdAt: new Date().toISOString(),
  };

  const previewCost = calculateProductCost(previewProduct, costs, activeVenture);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!name.trim()) errors.name = 'El nombre del producto es obligatorio.';
    if (!unit.trim()) errors.unit = 'La unidad de medida es obligatoria.';

    const priceErr = validateNonNegative(suggestedPrice, 'Precio de Venta Sugerido');
    if (priceErr) {
      errors.suggestedPrice = priceErr;
    } else if (Number(suggestedPrice) <= 0) {
      errors.suggestedPrice = 'El precio de venta debe ser mayor a 0.';
    }

    const weightErr = validateNonNegative(fixedCostWeight, 'Factor de absorción fijo');
    if (weightErr) {
      errors.fixedCostWeight = weightErr;
    }

    // Validar materiales
    for (let i = 0; i < materials.length; i++) {
      const mat = materials[i];
      if (mat.quantity <= 0) {
        errors.materials = `La cantidad de insumos en la fila #${i + 1} debe ser mayor a 0.`;
        break;
      }
      if (mat.wastePercentage < 0) {
        errors.materials = `La merma en la fila #${i + 1} no puede ser negativa.`;
        break;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const saved: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ventureId: activeVenture.id,
      name: name.trim(),
      description: description.trim(),
      unit: unit.trim(),
      sku: sku.trim() || undefined,
      suggestedPrice: Number(suggestedPrice),
      fixedCostWeight: Number(fixedCostWeight) || 1.0,
      materials,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
    };

    onSaveProduct(saved);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, prodName: string) => {
    if (window.confirm(`¿Está seguro de eliminar el producto "${prodName}"?`)) {
      onDeleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Productos Terminados & Estructura de Recetas
              </h1>
              <p className="text-xs text-slate-500">
                Cálculo de costo de producción unitario (Costos Variables + Absorción de Costos Fijos)
              </p>
            </div>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={openNewModal}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-700/20 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Producto Terminado</span>
          </button>
        )}
      </div>

      {/* Info notice about automatic calculation */}
      <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3">
        <div className="p-1 rounded-lg bg-amber-500/20 text-amber-700 shrink-0 mt-0.5">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">Fórmula de Costeo Automático Medina Factory:</span> El sistema calcula automáticamente el costo unitario de cada producto sumando los <strong>materiales e insumos (costos variables)</strong> más la <strong>proporción distribuida de los costos fijos mensuales</strong> (divididos entre la base estimada de {activeVenture.monthlyCapacityUnits.toLocaleString()} unidades/mes).
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre de producto, descripción o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'} en catálogo
        </span>
      </div>

      {/* Products Grid & Cards */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No hay productos registrados</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Comience registrando los productos terminados que elabora este emprendimiento y asignando sus insumos.
          </p>
          {canEdit && (
            <button
              onClick={openNewModal}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Producto</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredProducts.map((prod) => {
            const costData = calculateProductCost(prod, costs, activeVenture);
            const isProfitPositive = costData.suggestedProfit > 0;

            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow relative flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                          {prod.sku || 'PROD'}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">
                          Unidad: {prod.unit}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">
                        {prod.name}
                      </h3>
                      {prod.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {prod.description}
                        </p>
                      )}
                    </div>

                    {canEdit && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditModal(prod)}
                          title="Editar producto y fórmula"
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id, prod.name)}
                          title="Eliminar producto"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Recipe / Materials preview pill list */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-2">
                      <Layers className="w-3 h-3 text-amber-500" />
                      Insumos en Receta ({costData.materialsBreakdown.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                      {costData.materialsBreakdown.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">
                          Sin insumos asignados (costo variable $0)
                        </span>
                      ) : (
                        costData.materialsBreakdown.map((m, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-700"
                          >
                            <span className="font-semibold">{m.name}:</span>
                            <span className="font-mono text-slate-500">
                              {m.quantity} {m.unit}
                            </span>
                            <span className="font-mono font-bold text-slate-900">
                              ({formatCurrency(m.subtotal, activeVenture.currency)})
                            </span>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Economic Breakdown Banner */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-4 gap-2 text-center bg-slate-50/70 p-2.5 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      C. Variable
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700 font-mono">
                      {formatCurrency(costData.unitVariableCost, activeVenture.currency)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      C. Fijo Dist.
                    </span>
                    <span className="text-xs font-extrabold text-blue-700 font-mono">
                      {formatCurrency(costData.unitFixedCost, activeVenture.currency)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">
                      Costo Total
                    </span>
                    <span className="text-xs font-black text-slate-900 font-mono">
                      {formatCurrency(costData.unitTotalCost, activeVenture.currency)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">
                      Precio Sugerido
                    </span>
                    <span className="text-xs font-black text-amber-700 font-mono">
                      {formatCurrency(costData.suggestedPrice, activeVenture.currency)}
                    </span>
                  </div>
                </div>

                {/* Profit Bar */}
                <div className="mt-2.5 flex items-center justify-between text-xs px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 text-[11px]">Margen Estimado:</span>
                    <span
                      className={`font-mono font-bold ${
                        isProfitPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(costData.suggestedProfit, activeVenture.currency)}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-black ${
                      isProfitPositive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isProfitPositive ? '+' : ''}
                    {costData.suggestedMarginPercent.toFixed(1)}% margen
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {editingProduct ? 'Editar Producto y Receta' : 'Crear Producto Terminado'}
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

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Product Info Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre del Producto Terminado <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Pan Francés Baguette 1kg, Cartel Frontlight 2x1m, Zapatillas Medina Classic"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      formErrors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Código SKU / Referencia
                  </label>
                  <input
                    type="text"
                    placeholder="ej. PAN-001, ZAP-CL-01"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción del Producto
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre terminación, materiales, presentación comercial o especificaciones técnicas..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unidad de Medida del Producto <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. unidad, docena, par, kg, m2"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Precio Venta Sugerido ({activeVenture.currency}) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                      {activeVenture.currency}
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      required
                      placeholder="0.00"
                      value={suggestedPrice}
                      onChange={(e) => setSuggestedPrice(e.target.value)}
                      className={`w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        formErrors.suggestedPrice ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {formErrors.suggestedPrice && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.suggestedPrice}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Factor de Absorción Fijo
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="1.0"
                    value={fixedCostWeight}
                    onChange={(e) => setFixedCostWeight(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    1.0 = tasa estándar
                  </span>
                </div>
              </div>

              {/* Recipe / Bill of Materials (BOM) Section */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-600" />
                      Relación de Materiales e Insumos (Receta / Escandallo)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Cantidades requeridas de cada costo variable por cada unidad de producto terminado
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addMaterialRow}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Agregar Insumo</span>
                  </button>
                </div>

                {formErrors.materials && (
                  <p className="text-[11px] text-rose-500 mb-2 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">
                    {formErrors.materials}
                  </p>
                )}

                {materials.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
                    <p className="text-xs text-slate-500">
                      No ha agregado insumos a la receta. Haga clic en "+ Agregar Insumo".
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-[11px] font-bold text-slate-500 px-2 uppercase">
                      <div className="col-span-5">Insumo / Materia Prima</div>
                      <div className="col-span-2 text-center">Cantidad requerida</div>
                      <div className="col-span-2 text-center">Merma / Desperdicio %</div>
                      <div className="col-span-2 text-right">Subtotal Insumo</div>
                      <div className="col-span-1 text-center">Quitar</div>
                    </div>

                    {materials.map((mat, index) => {
                      const costItem = costs.find((c) => c.id === mat.costItemId);
                      const unitCost = costItem ? costItem.amount : 0;
                      const effectiveQty = mat.quantity * (1 + (mat.wastePercentage || 0) / 100);
                      const subtotal = effectiveQty * unitCost;

                      return (
                        <div
                          key={index}
                          className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                        >
                          <div className="sm:col-span-5">
                            <select
                              value={mat.costItemId}
                              onChange={(e) => updateMaterialRow(index, 'costItemId', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                            >
                              {availableVariableCosts.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name} ({formatCurrency(c.amount, activeVenture.currency)} / {c.unit})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                step="any"
                                min="0.0001"
                                placeholder="Cant."
                                value={mat.quantity}
                                onChange={(e) =>
                                  updateMaterialRow(index, 'quantity', Math.max(0, Number(e.target.value)))
                                }
                                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-mono text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                              <span className="text-[11px] text-slate-400 font-mono shrink-0">
                                {costItem?.unit || 'u'}
                              </span>
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                step="any"
                                min="0"
                                placeholder="0%"
                                value={mat.wastePercentage}
                                onChange={(e) =>
                                  updateMaterialRow(index, 'wastePercentage', Math.max(0, Number(e.target.value)))
                                }
                                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-mono text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                              <span className="text-[11px] text-slate-400">%</span>
                            </div>
                          </div>

                          <div className="sm:col-span-2 text-right">
                            <span className="text-xs font-mono font-bold text-slate-900">
                              {formatCurrency(subtotal, activeVenture.currency)}
                            </span>
                          </div>

                          <div className="sm:col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => removeMaterialRow(index)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 mx-auto" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Real-time Calculation Summary Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 text-white shadow-lg">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center justify-between">
                  <span>Simulación de Costeo en Tiempo Real</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Base: {activeVenture.monthlyCapacityUnits.toLocaleString()} u/mes
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Total Insumos (Var.)</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {formatCurrency(previewCost.unitVariableCost, activeVenture.currency)}
                    </span>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Cuota Fija Asignada</span>
                    <span className="text-sm font-bold text-blue-400 font-mono">
                      {formatCurrency(previewCost.unitFixedCost, activeVenture.currency)}
                    </span>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Costo Total Unitario</span>
                    <span className="text-sm font-black text-white font-mono">
                      {formatCurrency(previewCost.unitTotalCost, activeVenture.currency)}
                    </span>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Margen de Ganancia</span>
                    <span
                      className={`text-sm font-black font-mono ${
                        previewCost.suggestedProfit > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {previewCost.suggestedMarginPercent.toFixed(1)}%
                    </span>
                  </div>
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
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-700/20 transition-all cursor-pointer"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Registrar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
