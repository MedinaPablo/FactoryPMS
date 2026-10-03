export type UserRole = 'root' | 'admin' | 'invitado';

export interface User {
  id: string;
  username: string;
  password: string; // Plaintext for local demonstration as requested
  role: UserRole;
  ventureId: string | null; // null for root, venture ID for admin/invitado
  name: string;
  email?: string;
  createdAt: string;
}

export type VentureIndustry = 'panaderia' | 'empanadas' | 'carteleria' | 'calzado' | 'general';

export interface Venture {
  id: string;
  name: string;
  industry: VentureIndustry;
  description: string;
  currency: string;
  monthlyCapacityUnits: number; // Base mensual estimada de producción para absorción de costos fijos
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string; // CUIT / RUT / DNI
  createdAt: string;
}

export type CostCategory = 'fijo' | 'variable';

export interface CostItem {
  id: string;
  ventureId: string;
  name: string;
  category: CostCategory;
  subcategory: string; // ej. 'Materia Prima', 'Insumos', 'Mano de Obra', 'Alquiler', 'Servicios', 'Packaging', etc.
  unit: string; // ej. 'kg', 'gr', 'litro', 'metro', 'm2', 'hora', 'mes', 'unidad', 'par', 'docena'
  amount: number; // Monto unitario para variables, monto mensual para fijos. Debe ser >= 0
  effectiveDate: string; // YYYY-MM-DD
  supplier?: string;
  notes?: string;
  createdAt: string;
}

export interface ProductMaterial {
  costItemId: string; // ID del costo variable (materia prima/insumo)
  quantity: number; // Cantidad por unidad de producto terminado (> 0)
  wastePercentage: number; // Merma/desperdicio estimado en % (>= 0)
}

export interface Product {
  id: string;
  ventureId: string;
  name: string;
  description: string;
  unit: string; // ej. 'unidad', 'docena', 'par', 'kg', 'metro'
  sku?: string;
  suggestedPrice: number; // Precio de venta sugerido (>= 0)
  fixedCostWeight: number; // Factor de absorción de costo fijo (default 1.0)
  materials: ProductMaterial[];
  createdAt: string;
}

export interface BudgetItemMaterialDetail {
  costItemId: string;
  materialName: string;
  unit: string;
  unitCost: number;
  quantityPerProduct: number;
  totalQuantity: number;
  totalCost: number;
}

export interface BudgetItem {
  productId: string;
  productName: string;
  unit: string;
  quantity: number; // > 0
  unitVariableCost: number;
  unitFixedCost: number;
  unitTotalCost: number;
  unitSalePrice: number;
  totalVariableCost: number;
  totalFixedCost: number;
  totalCost: number;
  totalSalePrice: number;
  profit: number;
  profitMarginPercent: number;
  materialsDetails: BudgetItemMaterialDetail[];
}

export type BudgetStatus = 'borrador' | 'enviado' | 'aprobado' | 'en_produccion' | 'entregado' | 'rechazado';

export interface ConsolidatedMaterial {
  materialName: string;
  unit: string;
  totalQuantity: number;
  unitCost: number;
  totalCost: number;
}

export interface Budget {
  id: string;
  code: string; // ej. PRES-2026-001
  ventureId: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  clientTaxId?: string;
  clientAddress?: string;
  issueDate: string;
  validUntil: string;
  status: BudgetStatus;
  items: BudgetItem[];
  totalVariableCost: number;
  totalFixedCost: number;
  totalProductionCost: number;
  totalSalePrice: number;
  totalProfit: number;
  profitMarginPercent: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export type ProductionStatus = 'confirmado' | 'en_proceso' | 'en_pausa' | 'terminado' | 'cancelado';

export interface ProductionMaterialItem {
  costItemId?: string;
  name: string;
  unit: string;
  quantity: number;
  isLaborHour: boolean; // Indica si son horas de trabajo/mano de obra
  category: string;
  unitCost: number;
  totalCost: number;
}

export interface ProductionPauseEntry {
  date: string;
  reason: string;
  resumedAt?: string;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string; // ej. OP-PAN-001
  ventureId: string;
  budgetId?: string;
  budgetCode?: string;
  clientName: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  status: ProductionStatus;
  confirmedAt: string;
  startedAt?: string;
  finishedAt?: string;
  currentPauseReason?: string;
  pauseHistory: ProductionPauseEntry[];
  requiredMaterials: ProductionMaterialItem[];
  totalLaborHours: number;
  assignedOperator?: string;
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  notes?: string;
  createdAt: string;
}

