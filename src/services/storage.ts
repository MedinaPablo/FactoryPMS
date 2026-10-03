import { User, Venture, CostItem, Product, Budget, ProductionOrder, ProductionStatus } from '../types';

export interface DatabaseState {
  users: User[];
  ventures: Venture[];
  costs: CostItem[];
  products: Product[];
  budgets: Budget[];
  productionOrders: ProductionOrder[];
  currentUser: User | null;
  activeVentureId: string | null;
}

const STORAGE_KEY = 'medina_factory_db_v2';
const SESSION_USER_KEY = 'medina_factory_session_user';

export const INITIAL_VENTURES: Venture[] = [
  {
    id: 'venture-panaderia',
    name: 'Panadería & Pastelería "El Molino"',
    industry: 'panaderia',
    description: 'Elaboración artesanal de pan de masa madre, facturas y bollería fina.',
    currency: '$',
    monthlyCapacityUnits: 6000,
    address: 'Av. San Martín 1420',
    phone: '+54 11 4455-8899',
    email: 'contacto@elmolinopan.com',
    taxId: '30-71458920-4',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'venture-empanadas',
    name: 'Empanadas Criollas "Don Medina"',
    industry: 'empanadas',
    description: 'Empanadas premium al horno y fritas con recetas tradicionales y gourmet.',
    currency: '$',
    monthlyCapacityUnits: 3500,
    address: 'Calle Belgrano 830',
    phone: '+54 11 5566-7788',
    email: 'pedidos@donmedina.com',
    taxId: '30-72991044-8',
    createdAt: '2026-01-20T09:30:00.000Z',
  },
  {
    id: 'venture-carteleria',
    name: 'Cartelería & Gráfica "Medina Signs"',
    industry: 'carteleria',
    description: 'Diseño, impresión UV, marquesinas, letras corpóreas y carteles frontlight.',
    currency: '$',
    monthlyCapacityUnits: 250,
    address: 'Parque Industrial Sur, Lote 14',
    phone: '+54 11 4987-1234',
    email: 'proyectos@medinasigns.com',
    taxId: '30-70554433-2',
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'venture-calzado',
    name: 'Fábrica de Calzado "Medina Shoes"',
    industry: 'calzado',
    description: 'Producción de zapatillas urbanas, calzado de seguridad y botines artesanales.',
    currency: '$',
    monthlyCapacityUnits: 1200,
    address: 'Ruta 8 Km 48',
    phone: '+54 11 6789-4321',
    email: 'ventas@medinashoes.com',
    taxId: '30-73882211-9',
    createdAt: '2026-02-10T11:15:00.000Z',
  },
];

export const INITIAL_USERS: User[] = [
  // 0. Propietario Root obligatorio con contraseña Adm1807++
  {
    id: 'user-root',
    username: 'root',
    password: 'Adm1807++',
    role: 'root',
    ventureId: null,
    name: 'Propietario General (Root)',
    email: 'root@medinafactory.com',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  // Administradores para cada emprendimiento
  {
    id: 'user-admin-pan',
    username: 'admin_pan',
    password: 'Panaderia2026*',
    role: 'admin',
    ventureId: 'venture-panaderia',
    name: 'Carlos Panero (Admin Panadería)',
    email: 'admin@elmolinopan.com',
    createdAt: '2026-01-16T10:00:00.000Z',
  },
  {
    id: 'user-admin-empanadas',
    username: 'admin_empanadas',
    password: 'Empanadas2026*',
    role: 'admin',
    ventureId: 'venture-empanadas',
    name: 'Marcela Donato (Admin Empanadas)',
    email: 'admin@donmedina.com',
    createdAt: '2026-01-21T11:00:00.000Z',
  },
  {
    id: 'user-admin-carteleria',
    username: 'admin_carteleria',
    password: 'Carteles2026*',
    role: 'admin',
    ventureId: 'venture-carteleria',
    name: 'Ignacio Gráfico (Admin Cartelería)',
    email: 'admin@medinasigns.com',
    createdAt: '2026-02-02T09:00:00.000Z',
  },
  {
    id: 'user-admin-calzado',
    username: 'admin_calzado',
    password: 'Calzado2026*',
    role: 'admin',
    ventureId: 'venture-calzado',
    name: 'Esteban Zapatero (Admin Calzado)',
    email: 'admin@medinashoes.com',
    createdAt: '2026-02-11T14:00:00.000Z',
  },
  // Usuarios invitados creados por los administradores
  {
    id: 'user-invitado-pan',
    username: 'invitado_pan',
    password: 'Invitado123*',
    role: 'invitado',
    ventureId: 'venture-panaderia',
    name: 'Lucía Ventas (Invitado Panadería)',
    email: 'lucia@elmolinopan.com',
    createdAt: '2026-01-25T15:00:00.000Z',
  },
  {
    id: 'user-invitado-carteleria',
    username: 'invitado_carteles',
    password: 'Invitado123*',
    role: 'invitado',
    ventureId: 'venture-carteleria',
    name: 'Lucas Cotizador (Invitado Cartelería)',
    email: 'lucas@medinasigns.com',
    createdAt: '2026-02-05T12:00:00.000Z',
  },
];

export const INITIAL_COSTS: CostItem[] = [
  // --- COSTOS PANADERÍA ---
  {
    id: 'cost-pan-fijo-1',
    ventureId: 'venture-panaderia',
    name: 'Alquiler de Salón Comercial y Cuadra',
    category: 'fijo',
    subcategory: 'Alquiler',
    unit: 'mes',
    amount: 280000,
    effectiveDate: '2026-01-01',
    supplier: 'Inmobiliaria Central',
    notes: 'Contrato comercial anual indexado',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'cost-pan-fijo-2',
    ventureId: 'venture-panaderia',
    name: 'Sueldo Maestro Panadero y Ayudante',
    category: 'fijo',
    subcategory: 'Mano de Obra',
    unit: 'mes',
    amount: 520000,
    effectiveDate: '2026-01-01',
    notes: 'Personal de planta permanente',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'cost-pan-fijo-3',
    ventureId: 'venture-panaderia',
    name: 'Electricidad Comercial e Iluminación',
    category: 'fijo',
    subcategory: 'Servicios',
    unit: 'mes',
    amount: 85000,
    effectiveDate: '2026-01-01',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'cost-pan-fijo-4',
    ventureId: 'venture-panaderia',
    name: 'Gas Natural para Hornos Rotativos',
    category: 'fijo',
    subcategory: 'Servicios',
    unit: 'mes',
    amount: 65000,
    effectiveDate: '2026-01-01',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  // Variables Panadería
  {
    id: 'cost-pan-var-1',
    ventureId: 'venture-panaderia',
    name: 'Harina 000 de Trigo Seleccionada',
    category: 'variable',
    subcategory: 'Materia Prima',
    unit: 'kg',
    amount: 650,
    effectiveDate: '2026-01-01',
    supplier: 'Molino Cañuelas',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'cost-pan-var-2',
    ventureId: 'venture-panaderia',
    name: 'Levadura Fresca Prensada',
    category: 'variable',
    subcategory: 'Materia Prima',
    unit: 'kg',
    amount: 3400,
    effectiveDate: '2026-01-01',
    supplier: 'Distribuidora Lheritier',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'cost-pan-var-3',
    ventureId: 'venture-panaderia',
    name: 'Grasa Bovina Refinada / Manteca',
    category: 'variable',
    subcategory: 'Materia Prima',
    unit: 'kg',
    amount: 2900,
    effectiveDate: '2026-01-01',
    supplier: 'Grasería San Antonio',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'cost-pan-var-4',
    ventureId: 'venture-panaderia',
    name: 'Sal Fina Común Yodada',
    category: 'variable',
    subcategory: 'Materia Prima',
    unit: 'kg',
    amount: 450,
    effectiveDate: '2026-01-01',
    supplier: 'Salinas del Sur',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'cost-pan-var-5',
    ventureId: 'venture-panaderia',
    name: 'Bolsa de Papel Kraft Biodegradable',
    category: 'variable',
    subcategory: 'Packaging',
    unit: 'unidad',
    amount: 45,
    effectiveDate: '2026-01-01',
    supplier: 'Envases Ecológicos',
    createdAt: '2026-01-15T08:00:00.000Z',
  },

  // --- COSTOS EMPANADAS ---
  {
    id: 'cost-emp-fijo-1',
    ventureId: 'venture-empanadas',
    name: 'Alquiler Cocina de Producción',
    category: 'fijo',
    subcategory: 'Alquiler',
    unit: 'mes',
    amount: 220000,
    effectiveDate: '2026-01-01',
    createdAt: '2026-01-20T09:00:00.000Z',
  },
  {
    id: 'cost-emp-fijo-2',
    ventureId: 'venture-empanadas',
    name: 'Personal Cocinero y Repulgadores',
    category: 'fijo',
    subcategory: 'Mano de Obra',
    unit: 'mes',
    amount: 450000,
    effectiveDate: '2026-01-01',
    createdAt: '2026-01-20T09:00:00.000Z',
  },
  {
    id: 'cost-emp-fijo-3',
    ventureId: 'venture-empanadas',
    name: 'Energía Eléctrica y Cámaras Frigoríficas',
    category: 'fijo',
    subcategory: 'Servicios',
    unit: 'mes',
    amount: 90000,
    effectiveDate: '2026-01-01',
    createdAt: '2026-01-20T09:00:00.000Z',
  },
  // Variables Empanadas
  {
    id: 'cost-emp-var-1',
    ventureId: 'venture-empanadas',
    name: 'Carne Vacuna Picada Especial (Bola de Lomo)',
    category: 'variable',
    subcategory: 'Materia Prima',
    unit: 'kg',
    amount: 6900,
    effectiveDate: '2026-01-01',
    supplier: 'Frigorífico Los Amigos',
    createdAt: '2026-01-20T09:00:00.000Z',
  },
  {
    id: 'cost-emp-var-2',
    ventureId: 'venture-empanadas',
    name: 'Cebolla Seleccionada',
    category: 'variable',
    subcategory: 'Materia Prima',
    unit: 'kg',
    amount: 950,
    effectiveDate: '2026-01-01',
    supplier: 'Mercado Central',
    createdAt: '2026-01-20T09:00:00.000Z',
  },
  {
    id: 'cost-emp-var-3',
    ventureId: 'venture-empanadas',
    name: 'Tapas de Empanadas Rotiseras Hojaldradas',
    category: 'variable',
    subcategory: 'Materia Prima',
    unit: 'docena',
    amount: 1400,
    effectiveDate: '2026-01-01',
    supplier: 'Masa Criolla SRL',
    createdAt: '2026-01-20T09:00:00.000Z',
  },
  {
    id: 'cost-emp-var-4',
    ventureId: 'venture-empanadas',
    name: 'Aceitunas Verdes Descarozadas',
    category: 'variable',
    subcategory: 'Materia Prima',
    unit: 'kg',
    amount: 5200,
    effectiveDate: '2026-01-01',
    supplier: 'Olivares San Juan',
    createdAt: '2026-01-20T09:00:00.000Z',
  },
  {
    id: 'cost-emp-var-5',
    ventureId: 'venture-empanadas',
    name: 'Huevos Frescos de Campo',
    category: 'variable',
    subcategory: 'Materia Prima',
    unit: 'unidad',
    amount: 220,
    effectiveDate: '2026-01-01',
    supplier: 'Granja La Tranquera',
    createdAt: '2026-01-20T09:00:00.000Z',
  },
  {
    id: 'cost-emp-var-6',
    ventureId: 'venture-empanadas',
    name: 'Caja Térmica de Cartón x 1 Docena',
    category: 'variable',
    subcategory: 'Packaging',
    unit: 'unidad',
    amount: 250,
    effectiveDate: '2026-01-01',
    supplier: 'Cartonera Norte',
    createdAt: '2026-01-20T09:00:00.000Z',
  },

  // --- COSTOS CARTELERÍA ---
  {
    id: 'cost-cart-fijo-1',
    ventureId: 'venture-carteleria',
    name: 'Alquiler Taller Metalúrgico y Gráfico',
    category: 'fijo',
    subcategory: 'Alquiler',
    unit: 'mes',
    amount: 350000,
    effectiveDate: '2026-01-01',
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'cost-cart-fijo-2',
    ventureId: 'venture-carteleria',
    name: 'Depreciación y Mantenimiento Plotter Ecosolvente',
    category: 'fijo',
    subcategory: 'Mantenimiento',
    unit: 'mes',
    amount: 95000,
    effectiveDate: '2026-01-01',
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'cost-cart-fijo-3',
    ventureId: 'venture-carteleria',
    name: 'Energía Trifásica para Maquinaria',
    category: 'fijo',
    subcategory: 'Servicios',
    unit: 'mes',
    amount: 80000,
    effectiveDate: '2026-01-01',
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  // Variables Cartelería
  {
    id: 'cost-cart-var-1',
    ventureId: 'venture-carteleria',
    name: 'Lona Frontlight Brillante 440g',
    category: 'variable',
    subcategory: 'Materia Prima',
    unit: 'm2',
    amount: 3800,
    effectiveDate: '2026-01-01',
    supplier: 'PlotterSupplies Argentina',
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'cost-cart-var-2',
    ventureId: 'venture-carteleria',
    name: 'Vinilo Autoadhesivo Calandrado Promocional',
    category: 'variable',
    subcategory: 'Materia Prima',
    unit: 'm2',
    amount: 4600,
    effectiveDate: '2026-01-01',
    supplier: 'Oracal Distribuidora',
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'cost-cart-var-3',
    ventureId: 'venture-carteleria',
    name: 'Placa PVC Espumado 3mm Sintra',
    category: 'variable',
    subcategory: 'Materia Prima',
    unit: 'm2',
    amount: 9800,
    effectiveDate: '2026-01-01',
    supplier: 'Acrílicos y Plásticos SA',
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'cost-cart-var-4',
    ventureId: 'venture-carteleria',
    name: 'Tinta UV Ecosolvente Alta Definición',
    category: 'variable',
    subcategory: 'Insumos',
    unit: 'm2',
    amount: 2200,
    effectiveDate: '2026-01-01',
    supplier: 'InkTec Tech',
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'cost-cart-var-5',
    ventureId: 'venture-carteleria',
    name: 'Caño Estructural 20x20 para Bastidor',
    category: 'variable',
    subcategory: 'Materia Prima',
    unit: 'metro',
    amount: 3900,
    effectiveDate: '2026-01-01',
    supplier: 'Hierros Industriales',
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'cost-cart-var-6',
    ventureId: 'venture-carteleria',
    name: 'Mano de Obra Soldador / Montador',
    category: 'variable',
    subcategory: 'Mano de Obra',
    unit: 'hora',
    amount: 5500,
    effectiveDate: '2026-01-01',
    createdAt: '2026-02-01T10:00:00.000Z',
  },

  // --- COSTOS CALZADO / ZAPATILLAS ---
  {
    id: 'cost-calz-fijo-1',
    ventureId: 'venture-calzado',
    name: 'Alquiler Planta Fabril Calzado',
    category: 'fijo',
    subcategory: 'Alquiler',
    unit: 'mes',
    amount: 550000,
    effectiveDate: '2026-01-01',
    createdAt: '2026-02-10T11:00:00.000Z',
  },
  {
    id: 'cost-calz-fijo-2',
    ventureId: 'venture-calzado',
    name: 'Sueldo Fijo Supervisor y Cortador',
    category: 'fijo',
    subcategory: 'Mano de Obra',
    unit: 'mes',
    amount: 800000,
    effectiveDate: '2026-01-01',
    createdAt: '2026-02-10T11:00:00.000Z',
  },
  {
    id: 'cost-calz-fijo-3',
    ventureId: 'venture-calzado',
    name: 'Mantenimiento de Prensas y Troqueladoras',
    category: 'fijo',
    subcategory: 'Mantenimiento',
    unit: 'mes',
    amount: 110000,
    effectiveDate: '2026-01-01',
    createdAt: '2026-02-10T11:00:00.000Z',
  },
  // Variables Calzado
  {
    id: 'cost-calz-var-1',
    ventureId: 'venture-calzado',
    name: 'Cuero Sintético / Eco-Leather Premium',
    category: 'variable',
    subcategory: 'Materia Prima',
    unit: 'm2',
    amount: 9800,
    effectiveDate: '2026-01-01',
    supplier: 'Curtiembre & Cueros del Plata',
    createdAt: '2026-02-10T11:00:00.000Z',
  },
  {
    id: 'cost-calz-var-2',
    ventureId: 'venture-calzado',
    name: 'Suela de Goma TR Antideslizante Inyectada',
    category: 'variable',
    subcategory: 'Materia Prima',
    unit: 'par',
    amount: 5200,
    effectiveDate: '2026-01-01',
    supplier: 'Suelas RubberTech',
    createdAt: '2026-02-10T11:00:00.000Z',
  },
  {
    id: 'cost-calz-var-3',
    ventureId: 'venture-calzado',
    name: 'Plantilla Anatómica Termoformada EVA',
    category: 'variable',
    subcategory: 'Insumos',
    unit: 'par',
    amount: 1500,
    effectiveDate: '2026-01-01',
    supplier: 'Plantillas Confort',
    createdAt: '2026-02-10T11:00:00.000Z',
  },
  {
    id: 'cost-calz-var-4',
    ventureId: 'venture-calzado',
    name: 'Cordones de Algodón y Ojalillos Metálicos',
    category: 'variable',
    subcategory: 'Insumos',
    unit: 'par',
    amount: 800,
    effectiveDate: '2026-01-01',
    supplier: 'Avíos del Calzado',
    createdAt: '2026-02-10T11:00:00.000Z',
  },
  {
    id: 'cost-calz-var-5',
    ventureId: 'venture-calzado',
    name: 'Adhesivo de Contacto / Pegamento Poliuretánico',
    category: 'variable',
    subcategory: 'Insumos',
    unit: 'par',
    amount: 950,
    effectiveDate: '2026-01-01',
    supplier: 'Química Industrial',
    createdAt: '2026-02-10T11:00:00.000Z',
  },
  {
    id: 'cost-calz-var-6',
    ventureId: 'venture-calzado',
    name: 'Caja Impresa Individual para Zapatillas',
    category: 'variable',
    subcategory: 'Packaging',
    unit: 'unidad',
    amount: 600,
    effectiveDate: '2026-01-01',
    supplier: 'Cajas del Centro',
    createdAt: '2026-02-10T11:00:00.000Z',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  // --- PRODUCTOS PANADERÍA ---
  {
    id: 'prod-pan-1',
    ventureId: 'venture-panaderia',
    name: 'Bolsa de Pan Francés / Baguette (1 kg)',
    description: 'Pan tradicional crujiente elaborado con harina seleccionada y fermentación lenta.',
    unit: 'kg',
    sku: 'PAN-FRAN-01',
    suggestedPrice: 2200,
    fixedCostWeight: 1.0,
    materials: [
      { costItemId: 'cost-pan-var-1', quantity: 0.75, wastePercentage: 3 }, // Harina
      { costItemId: 'cost-pan-var-2', quantity: 0.025, wastePercentage: 0 }, // Levadura
      { costItemId: 'cost-pan-var-4', quantity: 0.015, wastePercentage: 0 }, // Sal
      { costItemId: 'cost-pan-var-5', quantity: 1, wastePercentage: 0 }, // Bolsa kraft
    ],
    createdAt: '2026-01-16T12:00:00.000Z',
  },
  {
    id: 'prod-pan-2',
    ventureId: 'venture-panaderia',
    name: 'Medialunas de Grasa Artesanales (Docena)',
    description: 'Docena de medialunas hojaldradas con almíbar aromático.',
    unit: 'docena',
    sku: 'PAN-MED-12',
    suggestedPrice: 4800,
    fixedCostWeight: 1.2,
    materials: [
      { costItemId: 'cost-pan-var-1', quantity: 0.5, wastePercentage: 4 }, // Harina
      { costItemId: 'cost-pan-var-3', quantity: 0.25, wastePercentage: 2 }, // Grasa
      { costItemId: 'cost-pan-var-2', quantity: 0.03, wastePercentage: 0 }, // Levadura
      { costItemId: 'cost-pan-var-4', quantity: 0.01, wastePercentage: 0 }, // Sal
      { costItemId: 'cost-pan-var-5', quantity: 1, wastePercentage: 0 }, // Bolsa
    ],
    createdAt: '2026-01-16T12:30:00.000Z',
  },

  // --- PRODUCTOS EMPANADAS ---
  {
    id: 'prod-emp-1',
    ventureId: 'venture-empanadas',
    name: 'Docena de Empanadas de Carne Suave Tradicional',
    description: 'Empanadas rellenas con carne cortada a cuchillo, cebolla dorada, huevo y aceituna.',
    unit: 'docena',
    sku: 'EMP-CARNE-12',
    suggestedPrice: 12500,
    fixedCostWeight: 1.0,
    materials: [
      { costItemId: 'cost-emp-var-1', quantity: 0.55, wastePercentage: 5 }, // Carne
      { costItemId: 'cost-emp-var-2', quantity: 0.45, wastePercentage: 5 }, // Cebolla
      { costItemId: 'cost-emp-var-3', quantity: 1.0, wastePercentage: 0 }, // Tapas docena
      { costItemId: 'cost-emp-var-4', quantity: 0.08, wastePercentage: 0 }, // Aceitunas
      { costItemId: 'cost-emp-var-5', quantity: 1.0, wastePercentage: 0 }, // Huevo
      { costItemId: 'cost-emp-var-6', quantity: 1.0, wastePercentage: 0 }, // Caja
    ],
    createdAt: '2026-01-22T10:00:00.000Z',
  },

  // --- PRODUCTOS CARTELERÍA ---
  {
    id: 'prod-cart-1',
    ventureId: 'venture-carteleria',
    name: 'Cartel Frontlight Comercial con Bastidor (2m x 1m)',
    description: 'Estructura metálica soldada con lona frontlight impresa full color tensada con zunchos.',
    unit: 'unidad',
    sku: 'CART-FRONT-2X1',
    suggestedPrice: 85000,
    fixedCostWeight: 1.5,
    materials: [
      { costItemId: 'cost-cart-var-1', quantity: 2.2, wastePercentage: 5 }, // Lona
      { costItemId: 'cost-cart-var-4', quantity: 2.0, wastePercentage: 5 }, // Tinta
      { costItemId: 'cost-cart-var-5', quantity: 6.0, wastePercentage: 4 }, // Caño hierro
      { costItemId: 'cost-cart-var-6', quantity: 2.5, wastePercentage: 0 }, // Horas montador
    ],
    createdAt: '2026-02-03T11:00:00.000Z',
  },
  {
    id: 'prod-cart-2',
    ventureId: 'venture-carteleria',
    name: 'Placa Comercial en PVC Espumado 3mm (1m x 0.5m)',
    description: 'Cartel rígido en PVC espumado con vinilo impreso laminado para interiores o marquesinas.',
    unit: 'unidad',
    sku: 'CART-PVC-1X05',
    suggestedPrice: 28000,
    fixedCostWeight: 0.8,
    materials: [
      { costItemId: 'cost-cart-var-3', quantity: 0.55, wastePercentage: 5 }, // PVC
      { costItemId: 'cost-cart-var-2', quantity: 0.55, wastePercentage: 5 }, // Vinilo
      { costItemId: 'cost-cart-var-4', quantity: 0.5, wastePercentage: 0 }, // Tinta
      { costItemId: 'cost-cart-var-6', quantity: 1.0, wastePercentage: 0 }, // Horas armador
    ],
    createdAt: '2026-02-03T11:30:00.000Z',
  },

  // --- PRODUCTOS CALZADO / ZAPATILLAS ---
  {
    id: 'prod-calz-1',
    ventureId: 'venture-calzado',
    name: 'Zapatilla Urbana Unisex "Medina Classic"',
    description: 'Zapatilla casual de caña baja con suela TR inyectada, interior acolchado y cordones reforzados.',
    unit: 'par',
    sku: 'ZAP-CLASSIC-01',
    suggestedPrice: 38000,
    fixedCostWeight: 1.0,
    materials: [
      { costItemId: 'cost-calz-var-1', quantity: 0.38, wastePercentage: 6 }, // Eco-leather
      { costItemId: 'cost-calz-var-2', quantity: 1.0, wastePercentage: 0 }, // Suela TR
      { costItemId: 'cost-calz-var-3', quantity: 1.0, wastePercentage: 0 }, // Plantilla EVA
      { costItemId: 'cost-calz-var-4', quantity: 1.0, wastePercentage: 0 }, // Cordones
      { costItemId: 'cost-calz-var-5', quantity: 1.0, wastePercentage: 0 }, // Pegamento
      { costItemId: 'cost-calz-var-6', quantity: 1.0, wastePercentage: 0 }, // Caja
    ],
    createdAt: '2026-02-12T15:00:00.000Z',
  },
];

export const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'budget-pan-1',
    code: 'PRES-PAN-001',
    ventureId: 'venture-panaderia',
    clientName: 'Restaurante Los Robles',
    clientPhone: '+54 11 4789-9988',
    clientEmail: 'compras@losroblesrestobar.com',
    clientTaxId: '30-68994422-5',
    clientAddress: 'Calle Las Heras 2100',
    issueDate: '2026-03-10',
    validUntil: '2026-03-25',
    status: 'aprobado',
    items: [
      {
        productId: 'prod-pan-1',
        productName: 'Bolsa de Pan Francés / Baguette (1 kg)',
        unit: 'kg',
        quantity: 200,
        unitVariableCost: 650,
        unitFixedCost: 158.33,
        unitTotalCost: 808.33,
        unitSalePrice: 2200,
        totalVariableCost: 130000,
        totalFixedCost: 31666,
        totalCost: 161666,
        totalSalePrice: 440000,
        profit: 278334,
        profitMarginPercent: 172.16,
        materialsDetails: [
          {
            costItemId: 'cost-pan-var-1',
            materialName: 'Harina 000 de Trigo Seleccionada',
            unit: 'kg',
            unitCost: 650,
            quantityPerProduct: 0.75,
            totalQuantity: 154.5,
            totalCost: 100425,
          },
          {
            costItemId: 'cost-pan-var-5',
            materialName: 'Bolsa de Papel Kraft Biodegradable',
            unit: 'unidad',
            unitCost: 45,
            quantityPerProduct: 1,
            totalQuantity: 200,
            totalCost: 9000,
          },
        ],
      },
      {
        productId: 'prod-pan-2',
        productName: 'Medialunas de Grasa Artesanales (Docena)',
        unit: 'docena',
        quantity: 50,
        unitVariableCost: 1180,
        unitFixedCost: 190,
        unitTotalCost: 1370,
        unitSalePrice: 4800,
        totalVariableCost: 59000,
        totalFixedCost: 9500,
        totalCost: 68500,
        totalSalePrice: 240000,
        profit: 171500,
        profitMarginPercent: 250.36,
        materialsDetails: [],
      },
    ],
    totalVariableCost: 189000,
    totalFixedCost: 41166,
    totalProductionCost: 230166,
    totalSalePrice: 680000,
    totalProfit: 449834,
    profitMarginPercent: 195.43,
    notes: 'Entrega diaria de lunes a viernes a primera hora (6:30 AM). Pago a 15 días.',
    createdBy: 'admin_pan',
    createdAt: '2026-03-10T14:30:00.000Z',
  },
  {
    id: 'budget-cart-1',
    code: 'PRES-CART-002',
    ventureId: 'venture-carteleria',
    clientName: 'Farmacia del Sol',
    clientPhone: '+54 11 5544-2211',
    clientEmail: 'gerencia@farmaciadelsol.com.ar',
    clientTaxId: '30-74112233-1',
    clientAddress: 'Av. Libertador 4500',
    issueDate: '2026-03-15',
    validUntil: '2026-03-30',
    status: 'enviado',
    items: [
      {
        productId: 'prod-cart-1',
        productName: 'Cartel Frontlight Comercial con Bastidor (2m x 1m)',
        unit: 'unidad',
        quantity: 2,
        unitVariableCost: 47250,
        unitFixedCost: 3150,
        unitTotalCost: 50400,
        unitSalePrice: 85000,
        totalVariableCost: 94500,
        totalFixedCost: 6300,
        totalCost: 100800,
        totalSalePrice: 170000,
        profit: 69200,
        profitMarginPercent: 68.65,
        materialsDetails: [],
      },
    ],
    totalVariableCost: 94500,
    totalFixedCost: 6300,
    totalProductionCost: 100800,
    totalSalePrice: 170000,
    totalProfit: 69200,
    profitMarginPercent: 68.65,
    notes: 'Incluye colocación en marquesina a 3.5 metros de altura.',
    createdBy: 'admin_carteleria',
    createdAt: '2026-03-15T16:00:00.000Z',
  },
];

export const INITIAL_PRODUCTION_ORDERS: ProductionOrder[] = [
  // --- PANADERÍA ---
  {
    id: 'op-pan-1',
    orderNumber: 'OP-PAN-001',
    ventureId: 'venture-panaderia',
    budgetId: 'budget-pan-1',
    budgetCode: 'PRES-PAN-001',
    clientName: 'Restaurante Los Robles',
    productId: 'prod-pan-1',
    productName: 'Bolsa de Pan Francés / Baguette (1 kg)',
    quantity: 200,
    unit: 'kg',
    status: 'en_proceso',
    confirmedAt: '2026-03-29T05:00:00.000Z',
    startedAt: '2026-03-29T05:30:00.000Z',
    pauseHistory: [],
    assignedOperator: 'Carlos Panero (Maestro Panadero)',
    priority: 'alta',
    notes: 'Amasado y fermentación lenta en curso. Entregar antes de las 11:30 AM.',
    totalLaborHours: 4.5,
    requiredMaterials: [
      { name: 'Harina 000 de Trigo Seleccionada', unit: 'kg', quantity: 154.5, isLaborHour: false, category: 'Materia Prima', unitCost: 650, totalCost: 100425 },
      { name: 'Levadura Fresca Prensada', unit: 'kg', quantity: 5.15, isLaborHour: false, category: 'Materia Prima', unitCost: 3400, totalCost: 17510 },
      { name: 'Sal Fina Común Yodada', unit: 'kg', quantity: 3.09, isLaborHour: false, category: 'Materia Prima', unitCost: 450, totalCost: 1390.5 },
      { name: 'Bolsa de Papel Kraft Biodegradable', unit: 'unidad', quantity: 200, isLaborHour: false, category: 'Packaging', unitCost: 45, totalCost: 9000 },
      { name: 'Horas Horno & Maestro Panadero', unit: 'hora', quantity: 4.5, isLaborHour: true, category: 'Mano de Obra', unitCost: 4000, totalCost: 18000 },
    ],
    createdAt: '2026-03-29T05:00:00.000Z',
  },
  {
    id: 'op-pan-2',
    orderNumber: 'OP-PAN-002',
    ventureId: 'venture-panaderia',
    clientName: 'Cafetería La Esquina',
    productId: 'prod-pan-2',
    productName: 'Medialunas de Grasa Artesanales (Docena)',
    quantity: 50,
    unit: 'docena',
    status: 'en_pausa',
    confirmedAt: '2026-03-29T06:00:00.000Z',
    startedAt: '2026-03-29T06:45:00.000Z',
    currentPauseReason: 'Avería temporal en termostato de horno rotativo 2. Servicio técnico convocado para las 11:30 hs.',
    pauseHistory: [
      {
        date: '2026-03-29T08:15:00.000Z',
        reason: 'Avería temporal en termostato de horno rotativo 2. Servicio técnico convocado para las 11:30 hs.',
      },
    ],
    assignedOperator: 'Ayudante de Cuadra',
    priority: 'media',
    notes: 'Masa en cámara de frío esperando reparación del horno.',
    totalLaborHours: 3.5,
    requiredMaterials: [
      { name: 'Harina 000 de Trigo Seleccionada', unit: 'kg', quantity: 26.0, isLaborHour: false, category: 'Materia Prima', unitCost: 650, totalCost: 16900 },
      { name: 'Grasa Bovina Refinada / Manteca', unit: 'kg', quantity: 12.75, isLaborHour: false, category: 'Materia Prima', unitCost: 2900, totalCost: 36975 },
      { name: 'Levadura Fresca Prensada', unit: 'kg', quantity: 1.5, isLaborHour: false, category: 'Materia Prima', unitCost: 3400, totalCost: 5100 },
      { name: 'Horas Elaboración Bollería', unit: 'hora', quantity: 3.5, isLaborHour: true, category: 'Mano de Obra', unitCost: 4000, totalCost: 14000 },
    ],
    createdAt: '2026-03-29T06:00:00.000Z',
  },
  {
    id: 'op-pan-3',
    orderNumber: 'OP-PAN-003',
    ventureId: 'venture-panaderia',
    clientName: 'Comedor Los Pinos',
    productId: 'prod-pan-1',
    productName: 'Bolsa de Pan Francés / Baguette (1 kg)',
    quantity: 120,
    unit: 'kg',
    status: 'confirmado',
    confirmedAt: '2026-03-29T09:00:00.000Z',
    pauseHistory: [],
    priority: 'media',
    notes: 'Confirmado para iniciar en turno tarde a partir de las 14:00.',
    totalLaborHours: 2.8,
    requiredMaterials: [
      { name: 'Harina 000 de Trigo Seleccionada', unit: 'kg', quantity: 92.7, isLaborHour: false, category: 'Materia Prima', unitCost: 650, totalCost: 60255 },
      { name: 'Levadura Fresca Prensada', unit: 'kg', quantity: 3.09, isLaborHour: false, category: 'Materia Prima', unitCost: 3400, totalCost: 10506 },
      { name: 'Bolsa de Papel Kraft Biodegradable', unit: 'unidad', quantity: 120, isLaborHour: false, category: 'Packaging', unitCost: 45, totalCost: 5400 },
      { name: 'Horas Panadería Turno Tarde', unit: 'hora', quantity: 2.8, isLaborHour: true, category: 'Mano de Obra', unitCost: 4000, totalCost: 11200 },
    ],
    createdAt: '2026-03-29T09:00:00.000Z',
  },
  {
    id: 'op-pan-4',
    orderNumber: 'OP-PAN-004',
    ventureId: 'venture-panaderia',
    clientName: 'Hotel Plaza San Martín',
    productId: 'prod-pan-2',
    productName: 'Medialunas de Grasa Artesanales (Docena)',
    quantity: 30,
    unit: 'docena',
    status: 'terminado',
    confirmedAt: '2026-03-28T04:00:00.000Z',
    startedAt: '2026-03-28T04:30:00.000Z',
    finishedAt: '2026-03-28T08:00:00.000Z',
    pauseHistory: [],
    assignedOperator: 'Carlos Panero',
    priority: 'alta',
    notes: 'Lote horneado, dorado y empacado con éxito. Control de calidad aprobado.',
    totalLaborHours: 2.0,
    requiredMaterials: [
      { name: 'Harina 000 de Trigo Seleccionada', unit: 'kg', quantity: 15.6, isLaborHour: false, category: 'Materia Prima', unitCost: 650, totalCost: 10140 },
      { name: 'Grasa Bovina Refinada', unit: 'kg', quantity: 7.65, isLaborHour: false, category: 'Materia Prima', unitCost: 2900, totalCost: 22185 },
      { name: 'Horas Horneado y Almíbar', unit: 'hora', quantity: 2.0, isLaborHour: true, category: 'Mano de Obra', unitCost: 4000, totalCost: 8000 },
    ],
    createdAt: '2026-03-28T04:00:00.000Z',
  },

  // --- EMPANADAS ---
  {
    id: 'op-emp-1',
    orderNumber: 'OP-EMP-001',
    ventureId: 'venture-empanadas',
    clientName: 'TechCorp SA (Evento Corporativo)',
    productId: 'prod-emp-1',
    productName: 'Docena de Empanadas de Carne Suave Tradicional',
    quantity: 80,
    unit: 'docena',
    status: 'en_proceso',
    confirmedAt: '2026-03-29T07:30:00.000Z',
    startedAt: '2026-03-29T08:00:00.000Z',
    pauseHistory: [],
    assignedOperator: 'Marcela Donato (Chef)',
    priority: 'urgente',
    notes: 'Relleno enfriado en cámara. 3 ayudantes en repulgue y cerrado de tapas.',
    totalLaborHours: 10.0,
    requiredMaterials: [
      { name: 'Carne Vacuna Picada Especial', unit: 'kg', quantity: 46.2, isLaborHour: false, category: 'Materia Prima', unitCost: 6900, totalCost: 318780 },
      { name: 'Cebolla Seleccionada', unit: 'kg', quantity: 37.8, isLaborHour: false, category: 'Materia Prima', unitCost: 950, totalCost: 35910 },
      { name: 'Tapas de Empanadas Rotiseras', unit: 'docena', quantity: 80, isLaborHour: false, category: 'Materia Prima', unitCost: 1400, totalCost: 112000 },
      { name: 'Aceitunas Verdes Descarozadas', unit: 'kg', quantity: 6.4, isLaborHour: false, category: 'Materia Prima', unitCost: 5200, totalCost: 33280 },
      { name: 'Huevos Frescos de Campo', unit: 'unidad', quantity: 80, isLaborHour: false, category: 'Materia Prima', unitCost: 220, totalCost: 17600 },
      { name: 'Caja Térmica x 1 Docena', unit: 'unidad', quantity: 80, isLaborHour: false, category: 'Packaging', unitCost: 250, totalCost: 20000 },
      { name: 'Horas Cocina y Repulgue', unit: 'hora', quantity: 10.0, isLaborHour: true, category: 'Mano de Obra', unitCost: 3500, totalCost: 35000 },
    ],
    createdAt: '2026-03-29T07:30:00.000Z',
  },
  {
    id: 'op-emp-2',
    orderNumber: 'OP-EMP-002',
    ventureId: 'venture-empanadas',
    clientName: 'Club Atlético Central',
    productId: 'prod-emp-1',
    productName: 'Docena de Empanadas de Carne Suave Tradicional',
    quantity: 35,
    unit: 'docena',
    status: 'en_pausa',
    confirmedAt: '2026-03-29T08:30:00.000Z',
    startedAt: '2026-03-29T09:00:00.000Z',
    currentPauseReason: 'Falta de entrega de lote de cajas térmicas por el transportista. Reprogramado para las 14:30.',
    pauseHistory: [
      {
        date: '2026-03-29T10:15:00.000Z',
        reason: 'Falta de entrega de lote de cajas térmicas por el transportista. Reprogramado para las 14:30.',
      },
    ],
    assignedOperator: 'Equipo Cocina 2',
    priority: 'media',
    notes: 'Pausado hasta recibir packaging térmico.',
    totalLaborHours: 4.5,
    requiredMaterials: [
      { name: 'Carne Vacuna Picada Especial', unit: 'kg', quantity: 20.2, isLaborHour: false, category: 'Materia Prima', unitCost: 6900, totalCost: 139380 },
      { name: 'Tapas de Empanadas Rotiseras', unit: 'docena', quantity: 35, isLaborHour: false, category: 'Materia Prima', unitCost: 1400, totalCost: 49000 },
      { name: 'Horas Cocina', unit: 'hora', quantity: 4.5, isLaborHour: true, category: 'Mano de Obra', unitCost: 3500, totalCost: 15750 },
    ],
    createdAt: '2026-03-29T08:30:00.000Z',
  },
  {
    id: 'op-emp-3',
    orderNumber: 'OP-EMP-003',
    ventureId: 'venture-empanadas',
    clientName: 'Rotisería del Centro',
    productId: 'prod-emp-1',
    productName: 'Docena de Empanadas de Carne Suave Tradicional',
    quantity: 25,
    unit: 'docena',
    status: 'terminado',
    confirmedAt: '2026-03-28T10:00:00.000Z',
    startedAt: '2026-03-28T10:30:00.000Z',
    finishedAt: '2026-03-28T13:00:00.000Z',
    pauseHistory: [],
    priority: 'media',
    notes: 'Horneadas a 220°C y despachadas calientes.',
    totalLaborHours: 3.0,
    requiredMaterials: [
      { name: 'Carne Vacuna Picada', unit: 'kg', quantity: 14.4, isLaborHour: false, category: 'Materia Prima', unitCost: 6900, totalCost: 99360 },
      { name: 'Tapas de Empanadas', unit: 'docena', quantity: 25, isLaborHour: false, category: 'Materia Prima', unitCost: 1400, totalCost: 35000 },
      { name: 'Horas Cocina', unit: 'hora', quantity: 3.0, isLaborHour: true, category: 'Mano de Obra', unitCost: 3500, totalCost: 10500 },
    ],
    createdAt: '2026-03-28T10:00:00.000Z',
  },

  // --- CARTELERÍA ---
  {
    id: 'op-cart-1',
    orderNumber: 'OP-CART-001',
    ventureId: 'venture-carteleria',
    budgetId: 'budget-cart-1',
    budgetCode: 'PRES-CART-002',
    clientName: 'Farmacia del Sol',
    productId: 'prod-cart-1',
    productName: 'Cartel Frontlight Comercial con Bastidor (2m x 1m)',
    quantity: 2,
    unit: 'unidad',
    status: 'en_proceso',
    confirmedAt: '2026-03-29T08:00:00.000Z',
    startedAt: '2026-03-29T08:30:00.000Z',
    pauseHistory: [],
    assignedOperator: 'Ignacio Gráfico / Taller Soldadura',
    priority: 'alta',
    notes: 'Lonas impresas en secado. Bastidores de caño 20x20 cortados y en soldadura de escuadras.',
    totalLaborHours: 5.0,
    requiredMaterials: [
      { name: 'Lona Frontlight Brillante 440g', unit: 'm2', quantity: 4.62, isLaborHour: false, category: 'Materia Prima', unitCost: 3800, totalCost: 17556 },
      { name: 'Tinta UV Ecosolvente', unit: 'm2', quantity: 4.2, isLaborHour: false, category: 'Insumos', unitCost: 2200, totalCost: 9240 },
      { name: 'Caño Estructural 20x20 para Bastidor', unit: 'metro', quantity: 12.48, isLaborHour: false, category: 'Materia Prima', unitCost: 3900, totalCost: 48672 },
      { name: 'Mano de Obra Soldador / Montador', unit: 'hora', quantity: 5.0, isLaborHour: true, category: 'Mano de Obra', unitCost: 5500, totalCost: 27500 },
    ],
    createdAt: '2026-03-29T08:00:00.000Z',
  },
  {
    id: 'op-cart-2',
    orderNumber: 'OP-CART-002',
    ventureId: 'venture-carteleria',
    clientName: 'Estudio Jurídico Alvear',
    productId: 'prod-cart-2',
    productName: 'Placa Comercial en PVC Espumado 3mm (1m x 0.5m)',
    quantity: 4,
    unit: 'unidad',
    status: 'en_pausa',
    confirmedAt: '2026-03-29T09:30:00.000Z',
    startedAt: '2026-03-29T10:00:00.000Z',
    currentPauseReason: 'Cliente solicitó cambio de último momento en el logotipo antes de iniciar el corte y rotulación.',
    pauseHistory: [
      {
        date: '2026-03-29T11:00:00.000Z',
        reason: 'Cliente solicitó cambio de último momento en el logotipo antes de iniciar el corte y rotulación.',
      },
    ],
    assignedOperator: 'Lucas Cotizador (Diseño y Corte)',
    priority: 'media',
    notes: 'Placas PVC cortadas; en espera de vector definitivo aprobado por el cliente.',
    totalLaborHours: 4.0,
    requiredMaterials: [
      { name: 'Placa PVC Espumado 3mm Sintra', unit: 'm2', quantity: 2.31, isLaborHour: false, category: 'Materia Prima', unitCost: 9800, totalCost: 22638 },
      { name: 'Vinilo Autoadhesivo Calandrado', unit: 'm2', quantity: 2.31, isLaborHour: false, category: 'Materia Prima', unitCost: 4600, totalCost: 10626 },
      { name: 'Mano de Obra Armado y Vinilado', unit: 'hora', quantity: 4.0, isLaborHour: true, category: 'Mano de Obra', unitCost: 5500, totalCost: 22000 },
    ],
    createdAt: '2026-03-29T09:30:00.000Z',
  },
  {
    id: 'op-cart-3',
    orderNumber: 'OP-CART-003',
    ventureId: 'venture-carteleria',
    clientName: 'Supermercado Los Primos',
    productId: 'prod-cart-1',
    productName: 'Cartel Frontlight Comercial con Bastidor (2m x 1m)',
    quantity: 3,
    unit: 'unidad',
    status: 'confirmado',
    confirmedAt: '2026-03-29T11:30:00.000Z',
    pauseHistory: [],
    priority: 'alta',
    notes: 'Confirmado por gerencia. Programado para iniciar el lunes a primera hora.',
    totalLaborHours: 7.5,
    requiredMaterials: [
      { name: 'Lona Frontlight Brillante 440g', unit: 'm2', quantity: 6.93, isLaborHour: false, category: 'Materia Prima', unitCost: 3800, totalCost: 26334 },
      { name: 'Caño Estructural 20x20 para Bastidor', unit: 'metro', quantity: 18.72, isLaborHour: false, category: 'Materia Prima', unitCost: 3900, totalCost: 73008 },
      { name: 'Horas Taller Soldadura', unit: 'hora', quantity: 7.5, isLaborHour: true, category: 'Mano de Obra', unitCost: 5500, totalCost: 41250 },
    ],
    createdAt: '2026-03-29T11:30:00.000Z',
  },
  {
    id: 'op-cart-4',
    orderNumber: 'OP-CART-004',
    ventureId: 'venture-carteleria',
    clientName: 'Inmobiliaria Belgrano',
    productId: 'prod-cart-2',
    productName: 'Placa Comercial en PVC Espumado 3mm (1m x 0.5m)',
    quantity: 2,
    unit: 'unidad',
    status: 'terminado',
    confirmedAt: '2026-03-28T09:00:00.000Z',
    startedAt: '2026-03-28T09:30:00.000Z',
    finishedAt: '2026-03-28T12:00:00.000Z',
    pauseHistory: [],
    priority: 'media',
    notes: 'Terminado con laminado UV mate y perforaciones para embellecedores.',
    totalLaborHours: 2.0,
    requiredMaterials: [
      { name: 'Placa PVC Espumado 3mm Sintra', unit: 'm2', quantity: 1.15, isLaborHour: false, category: 'Materia Prima', unitCost: 9800, totalCost: 11270 },
      { name: 'Horas Armado', unit: 'hora', quantity: 2.0, isLaborHour: true, category: 'Mano de Obra', unitCost: 5500, totalCost: 11000 },
    ],
    createdAt: '2026-03-28T09:00:00.000Z',
  },

  // --- CALZADO ---
  {
    id: 'op-calz-1',
    orderNumber: 'OP-CALZ-001',
    ventureId: 'venture-calzado',
    clientName: 'Distribuidora Calzados del Plata',
    productId: 'prod-calz-1',
    productName: 'Zapatilla Urbana Unisex "Medina Classic"',
    quantity: 120,
    unit: 'par',
    status: 'en_proceso',
    confirmedAt: '2026-03-29T06:00:00.000Z',
    startedAt: '2026-03-29T07:00:00.000Z',
    pauseHistory: [],
    assignedOperator: 'Esteban Zapatero & Línea Armado',
    priority: 'urgente',
    notes: 'Corte de piezas completado al 100%. En pegado de suelas TR y aparado de capelladas.',
    totalLaborHours: 36.0,
    requiredMaterials: [
      { name: 'Cuero Sintético / Eco-Leather Premium', unit: 'm2', quantity: 48.33, isLaborHour: false, category: 'Materia Prima', unitCost: 9800, totalCost: 473634 },
      { name: 'Suela de Goma TR Antideslizante Inyectada', unit: 'par', quantity: 120, isLaborHour: false, category: 'Materia Prima', unitCost: 5200, totalCost: 624000 },
      { name: 'Plantilla Anatómica Termoformada EVA', unit: 'par', quantity: 120, isLaborHour: false, category: 'Insumos', unitCost: 1500, totalCost: 180000 },
      { name: 'Cordones de Algodón y Ojalillos Metálicos', unit: 'par', quantity: 120, isLaborHour: false, category: 'Insumos', unitCost: 800, totalCost: 96000 },
      { name: 'Adhesivo de Contacto / Poliuretánico', unit: 'par', quantity: 120, isLaborHour: false, category: 'Insumos', unitCost: 950, totalCost: 114000 },
      { name: 'Caja Impresa Individual para Zapatillas', unit: 'unidad', quantity: 120, isLaborHour: false, category: 'Packaging', unitCost: 600, totalCost: 72000 },
      { name: 'Horas de Planta / Cortadores y Armadores', unit: 'hora', quantity: 36.0, isLaborHour: true, category: 'Mano de Obra', unitCost: 4500, totalCost: 162000 },
    ],
    createdAt: '2026-03-29T06:00:00.000Z',
  },
];

class StorageService {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): DatabaseState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const sessionUser = this.getSessionUser();
        return {
          users: parsed.users || INITIAL_USERS,
          ventures: parsed.ventures || INITIAL_VENTURES,
          costs: parsed.costs || INITIAL_COSTS,
          products: parsed.products || INITIAL_PRODUCTS,
          budgets: parsed.budgets || INITIAL_BUDGETS,
          productionOrders: parsed.productionOrders || INITIAL_PRODUCTION_ORDERS,
          currentUser: sessionUser || parsed.currentUser || null,
          activeVentureId: parsed.activeVentureId || 'venture-panaderia',
        };
      }
    } catch (e) {
      console.warn('Error loading localStorage, using initial seed data', e);
    }

    return {
      users: INITIAL_USERS,
      ventures: INITIAL_VENTURES,
      costs: INITIAL_COSTS,
      products: INITIAL_PRODUCTS,
      budgets: INITIAL_BUDGETS,
      productionOrders: INITIAL_PRODUCTION_ORDERS,
      currentUser: null,
      activeVentureId: 'venture-panaderia',
    };
  }

  private persist() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          users: this.state.users,
          ventures: this.state.ventures,
          costs: this.state.costs,
          products: this.state.products,
          budgets: this.state.budgets,
          productionOrders: this.state.productionOrders,
          currentUser: this.state.currentUser,
          activeVentureId: this.state.activeVentureId,
        })
      );
    } catch (e) {
      console.error('Error persisting state to localStorage', e);
    }
  }

  // --- SESSION & AUTH ---
  getSessionUser(): User | null {
    try {
      const u = localStorage.getItem(SESSION_USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: User | null) {
    this.state.currentUser = user;
    if (user) {
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
      // Si el usuario es de un emprendimiento específico, fijar ese como activo
      if (user.ventureId) {
        this.state.activeVentureId = user.ventureId;
      }
    } else {
      localStorage.removeItem(SESSION_USER_KEY);
    }
    this.persist();
  }

  getCurrentUser(): User | null {
    return this.state.currentUser;
  }

  setActiveVentureId(ventureId: string) {
    this.state.activeVentureId = ventureId;
    this.persist();
  }

  getActiveVentureId(): string {
    return this.state.activeVentureId || this.state.ventures[0]?.id || 'venture-panaderia';
  }

  getActiveVenture(): Venture | null {
    const id = this.getActiveVentureId();
    return this.state.ventures.find((v) => v.id === id) || this.state.ventures[0] || null;
  }

  // --- VENTURES ---
  getVentures(): Venture[] {
    return this.state.ventures;
  }

  saveVenture(venture: Venture) {
    const idx = this.state.ventures.findIndex((v) => v.id === venture.id);
    if (idx >= 0) {
      this.state.ventures[idx] = venture;
    } else {
      this.state.ventures.push(venture);
    }
    this.persist();
  }

  deleteVenture(id: string) {
    this.state.ventures = this.state.ventures.filter((v) => v.id !== id);
    this.state.costs = this.state.costs.filter((c) => c.ventureId !== id);
    this.state.products = this.state.products.filter((p) => p.ventureId !== id);
    this.state.budgets = this.state.budgets.filter((b) => b.ventureId !== id);
    this.state.users = this.state.users.filter((u) => u.ventureId !== id || u.role === 'root');
    if (this.state.activeVentureId === id) {
      this.state.activeVentureId = this.state.ventures[0]?.id || null;
    }
    this.persist();
  }

  // --- USERS ---
  getUsers(ventureIdFilter?: string | null): User[] {
    if (ventureIdFilter === undefined) {
      return this.state.users;
    }
    if (ventureIdFilter === null) {
      return this.state.users.filter((u) => u.role === 'root');
    }
    return this.state.users.filter((u) => u.ventureId === ventureIdFilter);
  }

  saveUser(user: User) {
    const idx = this.state.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      this.state.users[idx] = user;
    } else {
      this.state.users.push(user);
    }
    // If the saved user is the currently logged-in user, keep session in sync
    if (this.state.currentUser && this.state.currentUser.id === user.id) {
      this.state.currentUser = { ...user };
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(this.state.currentUser));
    }
    this.persist();
  }

  updateUserPassword(userId: string, newPassword: string): User {
    const user = this.state.users.find((u) => u.id === userId);
    if (!user) {
      throw new Error('Usuario no encontrado.');
    }
    user.password = newPassword;
    if (this.state.currentUser && this.state.currentUser.id === userId) {
      this.state.currentUser = { ...user };
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(this.state.currentUser));
    }
    this.persist();
    return user;
  }

  deleteUser(id: string) {
    // Proteger usuario root
    const user = this.state.users.find((u) => u.id === id);
    if (user && user.role === 'root') {
      throw new Error('No se puede eliminar al usuario propietario root.');
    }
    this.state.users = this.state.users.filter((u) => u.id !== id);
    this.persist();
  }

  // --- COSTS ---
  getCosts(ventureId: string): CostItem[] {
    return this.state.costs.filter((c) => c.ventureId === ventureId);
  }

  saveCost(cost: CostItem) {
    const idx = this.state.costs.findIndex((c) => c.id === cost.id);
    if (idx >= 0) {
      this.state.costs[idx] = cost;
    } else {
      this.state.costs.push(cost);
    }
    this.persist();
  }

  deleteCost(id: string) {
    // Validar si algún producto usa este costo en su receta
    const isUsed = this.state.products.some((p) =>
      p.materials.some((m) => m.costItemId === id)
    );
    if (isUsed) {
      throw new Error('No se puede eliminar este costo porque está asignado a uno o más productos terminados.');
    }
    this.state.costs = this.state.costs.filter((c) => c.id !== id);
    this.persist();
  }

  // --- PRODUCTS ---
  getProducts(ventureId: string): Product[] {
    return this.state.products.filter((p) => p.ventureId === ventureId);
  }

  saveProduct(product: Product) {
    const idx = this.state.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      this.state.products[idx] = product;
    } else {
      this.state.products.push(product);
    }
    this.persist();
  }

  deleteProduct(id: string) {
    this.state.products = this.state.products.filter((p) => p.id !== id);
    this.persist();
  }

  // --- BUDGETS ---
  getBudgets(ventureId: string): Budget[] {
    return this.state.budgets.filter((b) => b.ventureId === ventureId);
  }

  saveBudget(budget: Budget) {
    const idx = this.state.budgets.findIndex((b) => b.id === budget.id);
    if (idx >= 0) {
      this.state.budgets[idx] = budget;
    } else {
      this.state.budgets.unshift(budget);
    }
    this.persist();
  }

  deleteBudget(id: string) {
    this.state.budgets = this.state.budgets.filter((b) => b.id !== id);
    this.persist();
  }

  getNextBudgetCode(ventureId: string): string {
    const venture = this.state.ventures.find((v) => v.id === ventureId);
    const prefix = venture ? venture.industry.substring(0, 4).toUpperCase() : 'MED';
    const ventureBudgets = this.getBudgets(ventureId);
    const num = ventureBudgets.length + 1;
    return `PRES-${prefix}-${String(num).padStart(3, '0')}`;
  }

  // --- PRODUCTION ORDERS (MÓDULO DE PRODUCCIÓN) ---
  getProductionOrders(ventureId: string): ProductionOrder[] {
    return (this.state.productionOrders || []).filter((o) => o.ventureId === ventureId);
  }

  saveProductionOrder(order: ProductionOrder) {
    if (!this.state.productionOrders) {
      this.state.productionOrders = [];
    }
    const idx = this.state.productionOrders.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      this.state.productionOrders[idx] = order;
    } else {
      this.state.productionOrders.unshift(order);
    }
    this.persist();
  }

  deleteProductionOrder(id: string) {
    if (this.state.productionOrders) {
      this.state.productionOrders = this.state.productionOrders.filter((o) => o.id !== id);
      this.persist();
    }
  }

  startProductionOrder(id: string, operatorName?: string) {
    const order = (this.state.productionOrders || []).find((o) => o.id === id);
    if (order) {
      order.status = 'en_proceso';
      order.startedAt = new Date().toISOString();
      if (operatorName) {
        order.assignedOperator = operatorName;
      }
      this.persist();
    }
  }

  pauseProductionOrder(id: string, reason: string) {
    const order = (this.state.productionOrders || []).find((o) => o.id === id);
    if (order) {
      order.status = 'en_pausa';
      order.currentPauseReason = reason.trim() || 'Pausa no especificada';
      if (!order.pauseHistory) {
        order.pauseHistory = [];
      }
      order.pauseHistory.unshift({
        date: new Date().toISOString(),
        reason: reason.trim() || 'Pausa operativa',
      });
      this.persist();
    }
  }

  resumeProductionOrder(id: string) {
    const order = (this.state.productionOrders || []).find((o) => o.id === id);
    if (order) {
      order.status = 'en_proceso';
      if (order.pauseHistory && order.pauseHistory.length > 0 && !order.pauseHistory[0].resumedAt) {
        order.pauseHistory[0].resumedAt = new Date().toISOString();
      }
      order.currentPauseReason = undefined;
      this.persist();
    }
  }

  finishProductionOrder(id: string) {
    const order = (this.state.productionOrders || []).find((o) => o.id === id);
    if (order) {
      order.status = 'terminado';
      order.finishedAt = new Date().toISOString();
      this.persist();
    }
  }

  getNextProductionOrderCode(ventureId: string): string {
    const venture = this.state.ventures.find((v) => v.id === ventureId);
    const prefix = venture ? venture.industry.substring(0, 4).toUpperCase() : 'MED';
    const orders = this.getProductionOrders(ventureId);
    const num = orders.length + 1;
    return `OP-${prefix}-${String(num).padStart(3, '0')}`;
  }

  // --- DATABASE TOOLS ---
  resetToFactoryDefaults() {
    this.state = {
      users: INITIAL_USERS,
      ventures: INITIAL_VENTURES,
      costs: INITIAL_COSTS,
      products: INITIAL_PRODUCTS,
      budgets: INITIAL_BUDGETS,
      productionOrders: INITIAL_PRODUCTION_ORDERS,
      currentUser: INITIAL_USERS[0], // Log in as root
      activeVentureId: 'venture-panaderia',
    };
    this.persist();
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(INITIAL_USERS[0]));
  }

  exportDatabase(): string {
    return JSON.stringify(
      {
        version: '2.5',
        exportedAt: new Date().toISOString(),
        users: this.state.users,
        ventures: this.state.ventures,
        costs: this.state.costs,
        products: this.state.products,
        budgets: this.state.budgets,
        productionOrders: this.state.productionOrders || [],
      },
      null,
      2
    );
  }

  importDatabase(jsonString: string) {
    const parsed = JSON.parse(jsonString);
    if (!parsed.users || !parsed.ventures || !parsed.costs || !parsed.products) {
      throw new Error('El archivo no contiene un formato de respaldo válido de Medina Factory.');
    }
    this.state.users = parsed.users;
    this.state.ventures = parsed.ventures;
    this.state.costs = parsed.costs;
    this.state.products = parsed.products;
    this.state.budgets = parsed.budgets || [];
    this.state.productionOrders = parsed.productionOrders || [];
    this.persist();
  }
}

export const storage = new StorageService();
