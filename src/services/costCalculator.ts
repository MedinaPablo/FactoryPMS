import { CostItem, Product, Venture, BudgetItem, BudgetItemMaterialDetail, ConsolidatedMaterial } from '../types';

export interface CalculatedProductCost {
  unitVariableCost: number;
  unitFixedCost: number;
  unitTotalCost: number;
  suggestedPrice: number;
  suggestedProfit: number;
  suggestedMarginPercent: number;
  materialsBreakdown: Array<{
    costItemId: string;
    name: string;
    unit: string;
    quantity: number;
    unitCost: number;
    wastePercentage: number;
    subtotal: number;
  }>;
}

/**
 * Calcula la suma total mensual de costos fijos de un emprendimiento
 */
export function calculateTotalMonthlyFixedCosts(costs: CostItem[]): number {
  return costs
    .filter((c) => c.category === 'fijo')
    .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
}

/**
 * Calcula el desglose detallado de costos de un producto terminado
 */
export function calculateProductCost(
  product: Product,
  costs: CostItem[],
  venture: Venture
): CalculatedProductCost {
  const materialsBreakdown: CalculatedProductCost['materialsBreakdown'] = [];
  let unitVariableCost = 0;

  for (const mat of product.materials) {
    const costItem = costs.find((c) => c.id === mat.costItemId);
    const unitCost = costItem ? Number(costItem.amount) || 0 : 0;
    const name = costItem ? costItem.name : 'Material no encontrado';
    const unit = costItem ? costItem.unit : 'u';
    const waste = Number(mat.wastePercentage) || 0;
    const effectiveQty = Number(mat.quantity) * (1 + waste / 100);
    const subtotal = effectiveQty * unitCost;

    materialsBreakdown.push({
      costItemId: mat.costItemId,
      name,
      unit,
      quantity: Number(mat.quantity),
      unitCost,
      wastePercentage: waste,
      subtotal,
    });

    unitVariableCost += subtotal;
  }

  // Costo fijo distribuido
  // Base mensual de unidades estimadas
  const monthlyCapacity = Number(venture.monthlyCapacityUnits) > 0 ? Number(venture.monthlyCapacityUnits) : 1000;
  const totalMonthlyFixed = calculateTotalMonthlyFixedCosts(costs);
  const fixedWeight = Number(product.fixedCostWeight) > 0 ? Number(product.fixedCostWeight) : 1;
  const unitFixedCost = (totalMonthlyFixed / monthlyCapacity) * fixedWeight;

  const unitTotalCost = unitVariableCost + unitFixedCost;
  const suggestedPrice = Number(product.suggestedPrice) || 0;
  const suggestedProfit = suggestedPrice - unitTotalCost;
  const suggestedMarginPercent = unitTotalCost > 0 ? (suggestedProfit / unitTotalCost) * 100 : 0;

  return {
    unitVariableCost,
    unitFixedCost,
    unitTotalCost,
    suggestedPrice,
    suggestedProfit,
    suggestedMarginPercent,
    materialsBreakdown,
  };
}

/**
 * Construye un item de presupuesto con todos los cálculos automáticos
 */
export function buildBudgetItem(
  product: Product,
  quantity: number,
  costs: CostItem[],
  venture: Venture,
  customSalePrice?: number
): BudgetItem {
  const calc = calculateProductCost(product, costs, venture);
  const qty = Math.max(0, Number(quantity));
  const salePrice = customSalePrice !== undefined && customSalePrice >= 0 ? customSalePrice : calc.suggestedPrice;

  const totalVariableCost = calc.unitVariableCost * qty;
  const totalFixedCost = calc.unitFixedCost * qty;
  const totalCost = totalVariableCost + totalFixedCost;
  const totalSalePrice = salePrice * qty;
  const profit = totalSalePrice - totalCost;
  const profitMarginPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0;

  const materialsDetails: BudgetItemMaterialDetail[] = calc.materialsBreakdown.map((m) => {
    const effectivePerProduct = m.quantity * (1 + m.wastePercentage / 100);
    const totalQuantity = effectivePerProduct * qty;
    return {
      costItemId: m.costItemId,
      materialName: m.name,
      unit: m.unit,
      unitCost: m.unitCost,
      quantityPerProduct: m.quantity,
      totalQuantity,
      totalCost: totalQuantity * m.unitCost,
    };
  });

  return {
    productId: product.id,
    productName: product.name,
    unit: product.unit,
    quantity: qty,
    unitVariableCost: calc.unitVariableCost,
    unitFixedCost: calc.unitFixedCost,
    unitTotalCost: calc.unitTotalCost,
    unitSalePrice: salePrice,
    totalVariableCost,
    totalFixedCost,
    totalCost,
    totalSalePrice,
    profit,
    profitMarginPercent,
    materialsDetails,
  };
}

/**
 * Agrupa los materiales consolidados para compras o preparación de fábrica
 */
export function aggregateConsolidatedMaterials(items: BudgetItem[]): ConsolidatedMaterial[] {
  const map = new Map<string, ConsolidatedMaterial>();

  for (const item of items) {
    for (const mat of item.materialsDetails) {
      const key = `${mat.materialName}___${mat.unit}`;
      const existing = map.get(key);
      if (existing) {
        existing.totalQuantity += mat.totalQuantity;
        existing.totalCost += mat.totalCost;
      } else {
        map.set(key, {
          materialName: mat.materialName,
          unit: mat.unit,
          totalQuantity: mat.totalQuantity,
          unitCost: mat.unitCost,
          totalCost: mat.totalCost,
        });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalCost - a.totalCost);
}

/**
 * Validador para asegurar que no se permitan valores negativos
 */
export function validateNonNegative(value: number | string, fieldName: string): string | null {
  const num = Number(value);
  if (isNaN(num)) {
    return `El campo "${fieldName}" debe ser un número válido.`;
  }
  if (num < 0) {
    return `El campo "${fieldName}" no puede ser un valor negativo.`;
  }
  return null;
}

/**
 * Formatea montos en moneda local
 */
export function formatCurrency(amount: number, currency: string = '$'): string {
  const val = Number(amount) || 0;
  return `${currency} ${val.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
