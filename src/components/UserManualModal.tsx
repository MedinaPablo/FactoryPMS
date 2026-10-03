import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Download,
  Search,
  ChevronRight,
  Factory,
  DollarSign,
  Package,
  FileSpreadsheet,
  ShieldCheck,
  Server,
  UtensilsCrossed,
  Signpost,
  CheckCircle2,
  HelpCircle,
  Copy,
  Printer,
  HardHat,
  Database,
  Play,
  Pause,
  AlertTriangle
} from 'lucide-react';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManualModal: React.FC<UserManualModalProps> = ({ isOpen, onClose }) => {
  const [activeChapter, setActiveChapter] = useState<string>('intro');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadMarkdown = () => {
    fetch('/MANUAL_DE_USUARIO.md')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.text();
      })
      .then((text) => {
        const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'MANUAL_DE_USUARIO_MEDINA_FACTORY.md';
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => {
        // Fallback: download dynamically
        const a = document.createElement('a');
        a.href = '/MANUAL_DE_USUARIO.md';
        a.download = 'MANUAL_DE_USUARIO_MEDINA_FACTORY.md';
        a.click();
      });
  };

  const chapters = [
    { id: 'intro', title: '1. Introducción y Conceptos', icon: <Factory className="w-4 h-4" /> },
    { id: 'start', title: '2. Primeros Pasos y Navegación', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'costs', title: '3. Módulo de Costos', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'products', title: '4. Productos y Recetas (BOM)', icon: <Package className="w-4 h-4" /> },
    { id: 'budgets', title: '5. Creación de Presupuestos', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'production', title: '6. Producción y Control de Planta', icon: <HardHat className="w-4 h-4 text-cyan-500" /> },
    { id: 'pdf', title: '7. Exportación a PDF Oficial', icon: <Printer className="w-4 h-4" /> },
    { id: 'backup', title: '8. Respaldo de Base de Datos', icon: <Database className="w-4 h-4 text-emerald-500" /> },
    { id: 'security', title: '9. Módulo de Seguridad y Roles', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'install', title: '10. Instalación y Hosting', icon: <Server className="w-4 h-4" /> },
    { id: 'anexo-a', title: 'Anexo A: Caso Empanadas', icon: <UtensilsCrossed className="w-4 h-4 text-orange-500" /> },
    { id: 'anexo-b', title: 'Anexo B: Caso Cartelería', icon: <Signpost className="w-4 h-4 text-blue-500" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/30 text-cyan-300 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">Manual de Usuario Medina Factory</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  ESPAÑOL • v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Guía completa de costeo, presupuestos, seguridad e instalación</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Descargar archivo MANUAL_DE_USUARIO.md"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Descargar .MD</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Split: Sidebar + Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Navigation */}
          <aside className="w-64 sm:w-72 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-200">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar en el manual..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
              {chapters
                .filter((ch) => ch.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChapter(ch.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      activeChapter === ch.id
                        ? 'bg-cyan-50 text-cyan-900 border border-cyan-200 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={activeChapter === ch.id ? 'text-cyan-600' : 'text-slate-400'}>
                        {ch.icon}
                      </span>
                      <span className="truncate">{ch.title}</span>
                    </div>
                    {activeChapter === ch.id && (
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    )}
                  </button>
                ))}
            </nav>
          </aside>

          {/* Main Reading Content */}
          <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-800 leading-relaxed text-sm">
            {activeChapter === 'intro' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[11px] font-bold text-cyan-600 uppercase tracking-wider font-mono">
                    Capítulo 1
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    Introducción y Metodología de Costeo Industrial
                  </h2>
                </div>

                <p>
                  <strong>Medina Factory</strong> es una plataforma diseñada para que microempresas, talleres y fábricas
                  consolidadas puedan conocer con precisión matemática sus costos reales de fabricación y generar
                  cotizaciones profesionales de forma instantánea.
                </p>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    La Ecuación Fundamental de Medina Factory:
                  </h4>
                  <div className="font-mono text-sm bg-white p-3 rounded-lg border border-slate-200 text-slate-900 font-bold">
                    Costo Total Unitario = Costo Variable (Insumos) + Cuota Fija Distribuida
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    <li>
                      <strong>Costo Variable Unitario:</strong> Suma de materias primas e insumos necesarios para 1 unidad, considerando merma o desperdicio técnico.
                    </li>
                    <li>
                      <strong>Cuota Fija Distribuida:</strong> Porción de los gastos fijos mensuales (alquiler, sueldos fijos, servicios) absorbida por cada unidad producida, calculada en función de la capacidad mensual del taller.
                    </li>
                  </ul>
                </div>

                <h3 className="text-base font-bold text-slate-900 pt-2">Versatilidad Multi-Industria</h3>
                <p className="text-xs text-slate-600">
                  El sistema no está limitado a un único rubro. Sus unidades de medida son dinámicas (`kg`, `gr`, `litro`, `m2`, `metro lineal`, `par`, `docena`, `unidad`, `hora`), lo que le permite adaptarse con idéntica precisión a:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
                    <span className="font-bold block text-amber-900">🥖 Panadería</span>
                    <span className="text-[11px] text-amber-700">Harina, levadura, hornos</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-xs">
                    <span className="font-bold block text-orange-900">🥟 Empanadas</span>
                    <span className="text-[11px] text-orange-700">Carne, cebolla, docenas</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs">
                    <span className="font-bold block text-blue-900">🪧 Cartelería</span>
                    <span className="text-[11px] text-blue-700">Lona, vinilo, caño de hierro</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                    <span className="font-bold block text-emerald-900">👟 Calzado</span>
                    <span className="text-[11px] text-emerald-700">Cueros, suelas, pares</span>
                  </div>
                </div>
              </div>
            )}

            {activeChapter === 'start' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[11px] font-bold text-cyan-600 uppercase tracking-wider font-mono">
                    Capítulo 2
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    Primeros Pasos y Navegación
                  </h2>
                </div>

                <h3 className="text-base font-bold text-slate-900">Acceso y Cuentas Preconfiguradas</h3>
                <p>
                  Para comenzar, ingrese con cualquiera de las cuentas de demostración preconfiguradas:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Usuario</th>
                        <th className="p-2.5">Contraseña</th>
                        <th className="p-2.5">Rol</th>
                        <th className="p-2.5">Emprendimiento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      <tr className="bg-cyan-50/50">
                        <td className="p-2.5 font-bold text-cyan-950">root</td>
                        <td className="p-2.5 font-bold text-cyan-900">Adm1807++</td>
                        <td className="p-2.5 text-cyan-800">Propietario</td>
                        <td className="p-2.5 text-slate-600">Acceso a todas las fábricas</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">admin_pan</td>
                        <td className="p-2.5">Panaderia2026*</td>
                        <td className="p-2.5">Admin</td>
                        <td className="p-2.5 text-slate-600">Panadería & Pastelería "El Molino"</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">admin_empanadas</td>
                        <td className="p-2.5">Empanadas2026*</td>
                        <td className="p-2.5">Admin</td>
                        <td className="p-2.5 text-slate-600">Empanadas Criollas "Don Medina"</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">admin_carteleria</td>
                        <td className="p-2.5">Carteles2026*</td>
                        <td className="p-2.5">Admin</td>
                        <td className="p-2.5 text-slate-600">Cartelería & Gráfica "Medina Signs"</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">admin_calzado</td>
                        <td className="p-2.5">Calzado2026*</td>
                        <td className="p-2.5">Admin</td>
                        <td className="p-2.5 text-slate-600">Fábrica de Calzado "Medina Shoes"</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">invitado_pan</td>
                        <td className="p-2.5">Invitado123*</td>
                        <td className="p-2.5">Invitado</td>
                        <td className="p-2.5 text-slate-600">Panadería (solo emitir presupuestos)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-base font-bold text-slate-900 pt-2">Conmutador de Fábricas (Root)</h3>
                <p>
                  Si inicia sesión como usuario <strong>root</strong>, verá en la barra de navegación superior el botón de cambio de emprendimiento. Al hacer clic allí podrá saltar de la Panadería a la Cartelería en 1 segundo sin perder sus datos.
                </p>
              </div>
            )}

            {activeChapter === 'costs' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[11px] font-bold text-cyan-600 uppercase tracking-wider font-mono">
                    Capítulo 3
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    Módulo de Costos (Fijos y Variables)
                  </h2>
                </div>

                <p>
                  Este módulo almacena las listas de precios de materias primas y los compromisos mensuales de la empresa.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                    <span className="text-xs font-bold text-blue-900 uppercase block mb-1">
                      1. Costos Fijos (Mensuales)
                    </span>
                    <p className="text-xs text-blue-800">
                      Gastos que no dependen del volumen producido: Alquiler, sueldos fijos de planta, luz trifásica básica, gas industrial, abonos y seguros.
                    </p>
                    <span className="text-[10px] text-blue-600 font-mono block mt-2">
                      Frecuencia: `mes`
                    </span>
                  </div>

                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="text-xs font-bold text-emerald-900 uppercase block mb-1">
                      2. Costos Variables (Por Insumo)
                    </span>
                    <p className="text-xs text-emerald-800">
                      Insumos consumidos por unidad producida: harina, carnes, vinilos, suelas, tintas, cajas y packaging.
                    </p>
                    <span className="text-[10px] text-emerald-600 font-mono block mt-2">
                      Unidades: `kg`, `litro`, `m2`, `par`, `unidad`
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 pt-2">Validaciones Estrictas</h3>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  <li><strong>Sin números negativos:</strong> Montos &gt; 0 obligatorios.</li>
                  <li><strong>Campos obligatorios:</strong> Nombre, unidad de medida y fecha de vigencia.</li>
                  <li><strong>Protección de borrado:</strong> No se puede eliminar un costo variable si ya forma parte de la receta de un producto en catálogo.</li>
                </ul>
              </div>
            )}

            {activeChapter === 'products' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[11px] font-bold text-cyan-600 uppercase tracking-wider font-mono">
                    Capítulo 4
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    Productos Terminados y Fórmulas de Receta (BOM)
                  </h2>
                </div>

                <p>
                  En este módulo se configuran los productos comercializados y su <strong>escandallo</strong> de materiales.
                </p>

                <h3 className="text-base font-bold text-slate-900">Pasos para Crear un Producto:</h3>
                <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside">
                  <li>Haga clic en <strong>"+ Nuevo Producto Terminado"</strong>.</li>
                  <li>Complete el Nombre, Unidad de comercialización (`unidad`, `par`, `kg`, `docena`) y Precio de Venta Sugerido.</li>
                  <li>
                    <strong>Armar la Receta:</strong> Presione <em>"+ Agregar Insumo"</em>, elija el costo variable, ingrese la cantidad por unidad y la <strong>merma (%)</strong> estimada.
                  </li>
                  <li>
                    Observe la <strong>Tarjeta de Simulación en Tiempo Real</strong> que desglosa en vivo el costo variable, costo fijo asignado, costo total unitario y rentabilidad porcentual proyectada.
                  </li>
                  <li>Presione <strong>"Registrar Producto"</strong>.</li>
                </ol>
              </div>
            )}

            {activeChapter === 'budgets' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[11px] font-bold text-cyan-600 uppercase tracking-wider font-mono">
                    Capítulo 5
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    Creación y Emisión de Presupuestos de Producción
                  </h2>
                </div>

                <p>
                  El módulo de presupuestos genera cotizaciones en firme para sus clientes.
                </p>

                <h3 className="text-base font-bold text-slate-900">Flujo de Trabajo:</h3>
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">1. Datos del Cliente</span>
                    Nombre de la empresa o cliente (obligatorio), CUIT/RUT, teléfono, correo y validez de la oferta comercial.
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">2. Productos y Cantidades a Producir</span>
                    Seleccione los productos terminados y la cantidad deseada (ej. 200 kg de pan, 80 docenas de empanadas, 2 carteles). El sistema calcula al instante los costos totales y le permite ajustar el precio final unitario acordado con el cliente.
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">3. Desglose Automático y Requerimiento de Insumos</span>
                    Verifique el cuadro consolidado: Costos Variables, Costos Fijos, Costo Total Fabril, Total Venta y Ganancia Neta. Debajo verá la <strong>lista de materiales requeridos para comprar en planta</strong>.
                  </div>
                </div>
              </div>
            )}

            {activeChapter === 'production' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[11px] font-bold text-cyan-600 uppercase tracking-wider font-mono">
                    Capítulo 6
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    Módulo de Producción y Control de Planta
                  </h2>
                </div>

                <p className="text-xs text-slate-700">
                  El <strong>Módulo de Producción</strong> es el centro de mando operativo del taller o fábrica. Permite gestionar el flujo físico de los pedidos desde su confirmación comercial hasta la terminación en planta.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">1</span>
                      <span className="font-bold text-xs text-slate-900">Pedidos Confirmados</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Pedidos comerciales aprobados o fabricaciones para reponer stock listas para iniciar en taller. Cuentan con código de orden (ej. <code>OP-PAN-001</code>), cliente, producto y nivel de prioridad.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center text-xs">2</span>
                      <span className="font-bold text-xs text-slate-900">Insumos y Horas Requeridas</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      El panel <strong>Requerimiento Consolidado</strong> suma en vivo los kilos, metros, unidades y <strong>horas de mano de obra</strong> necesarias para abastecer las órdenes de planta activas.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">3</span>
                      <span className="font-bold text-xs text-slate-900">Comienzo de Pedidos</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Al presionar <strong>"Comenzar Pedido"</strong>, el estado pasa a <strong>En Producción</strong> con cronometraje de inicio y asignación opcional del maquinista u operario a cargo.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">4</span>
                      <span className="font-bold text-xs text-slate-900">Pausas con Registro de Motivo</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Si falta materia prima o se descalibra una máquina, presione <strong>"Pausar"</strong>. Es obligatorio indicar el motivo, el cual queda visible de inmediato y guardado en el historial de eventos.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>5. Finalización de Pedidos</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Al completarse el lote, el operario presiona <strong>"Terminar"</strong>. El sistema asienta la fecha y hora de cierre y el pedido queda listo para control de calidad, remito de entrega y facturación.
                  </p>
                </div>
              </div>
            )}

            {activeChapter === 'pdf' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[11px] font-bold text-cyan-600 uppercase tracking-wider font-mono">
                    Capítulo 7
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    Generación y Exportación a PDF Oficial
                  </h2>
                </div>

                <p className="text-xs text-slate-700">
                  Cada presupuesto guardado puede descargarse como un documento en formato PDF de alta definición con membrete formal:
                </p>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <span className="font-bold text-slate-900 block">Estructura del PDF emitido:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>Membrete institucional:</strong> Logotipo de Medina Factory, nombre del emprendimiento, fecha y código correlativo (ej. <code>PRES-PAN-001</code>).</li>
                    <li><strong>Ficha de emisor y cliente:</strong> Domicilio, CUIT, teléfono y correo electrónico.</li>
                    <li><strong>Tabla de productos y costos:</strong> Cantidades, costo variable unitario, cuota fija, costo unitario fabril, precio unitario y total.</li>
                    <li><strong>Requerimiento consolidado de materias primas:</strong> Detalle de materiales para el área de compras y producción.</li>
                    <li><strong>Cuadro financiero resumen:</strong> Costo total fabril, precio total de venta y rentabilidad sobre costo.</li>
                    <li><strong>Condiciones y firmas:</strong> Plazos de entrega, vigencia, firma del productor y firma de conformidad del cliente.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeChapter === 'backup' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[11px] font-bold text-cyan-600 uppercase tracking-wider font-mono">
                    Capítulo 8
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    Respaldo y Herramientas de Base de Datos (Soporte ZIP)
                  </h2>
                </div>

                <p className="text-xs text-slate-700">
                  En la esquina superior derecha de la barra de navegación encontrará el botón con ícono de <strong>Base de Datos</strong>.
                </p>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block mb-1">📦 Exportar como Archivo Comprimido (.ZIP)</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Genera y descarga un paquete <strong>.ZIP</strong> que contiene la base de datos completa (<code>medina_factory_backup.json</code>), un documento de texto resumen (<code>LEEME_RESPALDO.txt</code>) y carpetas con los módulos estructurados para máxima seguridad y portabilidad.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block mb-1">📥 Restauración Directa desde ZIP o JSON</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      El sistema descomprime e importa de forma transparente tanto archivos <code>.ZIP</code> como archivos <code>.JSON</code> tradicionales. Valida la integridad de los datos y reconstruye de inmediato todos los costos, productos, presupuestos y órdenes de producción.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block mb-1">🔄 Reiniciar Datos de Fábrica</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Restablece los 4 emprendimientos de muestra completos (Panadería El Molino, Empanadas Don Medina, Cartelería Medina Signs y Calzado Medina Classic) con sus recetas y órdenes de prueba.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeChapter === 'security' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[11px] font-bold text-cyan-600 uppercase tracking-wider font-mono">
                    Capítulo 9 (Seguridad)
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    Módulo de Seguridad, Roles y Aislamiento de Datos
                  </h2>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <strong>Aislamiento Estricto de Datos:</strong> Ningún costo, producto, presupuesto u orden de producción de una fábrica se mezcla con otra. Cada empresa tiene su propio espacio de datos segregado por <code>ventureId</code>.
                </div>

                <h3 className="text-base font-bold text-slate-900">Jerarquía de Usuarios</h3>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block">👑 Usuario Propietario (root)</span>
                    <span className="font-mono text-cyan-700 font-bold block mb-1">Usuario: root | Contraseña: Adm1807++</span>
                    Accede a todas las funciones del sistema. Puede crear nuevos emprendimientos, asignar administradores, alternar entre cualquier fábrica y realizar copias de seguridad de la base de datos completa.
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block">🛡️ Administrador de Emprendimiento (admin)</span>
                    Control absoluto sobre los costos, recetas, presupuestos y órdenes de planta de su propia fábrica. Puede crear y dar de baja <strong>Usuarios Invitados</strong> con sus respectivas contraseñas.
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block">👤 Usuario Invitado (invitado)</span>
                    Perfil diseñado para vendedores o personal de atención al cliente. Puede consultar el catálogo, confeccionar presupuestos, consultar el estado de fabricación y descargar PDFs oficiales, sin permisos para alterar costos de fábrica ni recetas.
                  </div>
                </div>
              </div>
            )}

            {activeChapter === 'install' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[11px] font-bold text-cyan-600 uppercase tracking-wider font-mono">
                    Capítulo 10 (Instalación)
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    Guía de Instalación en Equipo Local y Hosting Gratuito
                  </h2>
                </div>

                <h3 className="text-base font-bold text-slate-900">1. Instalación en Equipo Local (Windows, Mac o Linux)</h3>
                <p className="text-xs text-slate-600">
                  Requiere tener instalado <strong>Node.js</strong> versión 18 o superior.
                </p>

                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs space-y-2 relative">
                  <button
                    onClick={() =>
                      handleCopy(
                        '# 1. Instalar dependencias\nnpm install\n\n# 2. Iniciar servidor de desarrollo\nnpm run dev\n\n# 3. Compilar para producción\nnpm run build',
                        'install-local'
                      )
                    }
                    className="absolute right-3 top-3 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-400 rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedCode === 'install-local' ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                  <p className="text-slate-400"># 1. Instalar dependencias del proyecto</p>
                  <p className="text-cyan-300 font-bold">npm install</p>
                  <p className="text-slate-400 pt-1"># 2. Iniciar el servidor local</p>
                  <p className="text-cyan-300 font-bold">npm run dev</p>
                  <p className="text-slate-400 pt-1"># 3. Abrir navegador en:</p>
                  <p className="text-white font-bold">http://localhost:3000</p>
                </div>

                <h3 className="text-base font-bold text-slate-900 pt-2">2. Despliegue en Hosting Gratuito (Vercel / Render / Netlify)</h3>
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block mb-1">A. Despliegue en Vercel (Recomendado):</span>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600">
                      <li>Cree una cuenta gratuita en <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">vercel.com</a>.</li>
                      <li>Suba el proyecto a un repositorio en su cuenta de GitHub.</li>
                      <li>En Vercel presione <strong>"Add New Project"</strong> y seleccione el repositorio.</li>
                      <li>Comando de compilación: <code>npm run build</code> | Carpeta de salida: <code>dist</code>.</li>
                      <li>Presione <strong>"Deploy"</strong>. En menos de 1 minuto obtendrá su URL HTTPS pública gratuita.</li>
                    </ol>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="font-bold text-slate-900 block mb-1">B. Despliegue en Render:</span>
                    Seleccione <em>"New Static Site"</em>, conecte su repositorio de GitHub y configure <code>npm run build</code> como Build Command y <code>dist</code> como Publish Directory.
                  </div>
                </div>
              </div>
            )}

            {activeChapter === 'anexo-a' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider font-mono">
                    Anexo A
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    Caso Práctico Completo: Fábrica de Empanadas ("Don Medina")
                  </h2>
                </div>

                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-950">
                  <strong>Objetivo del Caso:</strong> Costear con precisión la receta de 1 docena de empanadas y cotizar un pedido corporativo de <strong>80 docenas</strong> para la empresa TechCorp SA.
                </div>

                <h3 className="text-base font-bold text-slate-900">1. Estructura de Costos Fijos de Cocina</h3>
                <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                  <li>Alquiler de Cocina de Producción: $220,000 / mes</li>
                  <li>Personal Cocinero y Repulgadores: $450,000 / mes</li>
                  <li>Energía y Cámaras Frigoríficas: $90,000 / mes</li>
                  <li><strong>Total Costos Fijos Mensuales:</strong> $760,000 / mes</li>
                  <li><strong>Capacidad Mensual Estimada:</strong> 3,500 docenas</li>
                  <li><strong>Cuota Fija por Docena:</strong> $760,000 / 3,500 = <strong>$217.14 por docena</strong></li>
                </ul>

                <h3 className="text-base font-bold text-slate-900 pt-2">2. Escandallo de Insumos (Receta x 1 Docena)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2">Insumo</th>
                        <th className="p-2 text-center">Cant.</th>
                        <th className="p-2 text-center">Merma</th>
                        <th className="p-2 text-right">Precio Insumo</th>
                        <th className="p-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      <tr>
                        <td className="p-2 font-medium">Carne Vacuna Bola de Lomo</td>
                        <td className="p-2 text-center font-mono">0.55 kg</td>
                        <td className="p-2 text-center font-mono">5%</td>
                        <td className="p-2 text-right font-mono">$6,900/kg</td>
                        <td className="p-2 text-right font-mono font-bold">$3,984.75</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Cebolla Seleccionada</td>
                        <td className="p-2 text-center font-mono">0.45 kg</td>
                        <td className="p-2 text-center font-mono">5%</td>
                        <td className="p-2 text-right font-mono">$950/kg</td>
                        <td className="p-2 text-right font-mono font-bold">$448.88</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Tapas de Empanada Rotiseras</td>
                        <td className="p-2 text-center font-mono">1.00 doc</td>
                        <td className="p-2 text-center font-mono">0%</td>
                        <td className="p-2 text-right font-mono">$1,400/doc</td>
                        <td className="p-2 text-right font-mono font-bold">$1,400.00</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Aceitunas Descarozadas</td>
                        <td className="p-2 text-center font-mono">0.08 kg</td>
                        <td className="p-2 text-center font-mono">0%</td>
                        <td className="p-2 text-right font-mono">$5,200/kg</td>
                        <td className="p-2 text-right font-mono font-bold">$416.00</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Huevos de Granja</td>
                        <td className="p-2 text-center font-mono">1.00 u</td>
                        <td className="p-2 text-center font-mono">0%</td>
                        <td className="p-2 text-right font-mono">$220/u</td>
                        <td className="p-2 text-right font-mono font-bold">$220.00</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Caja Térmica x 1 Docena</td>
                        <td className="p-2 text-center font-mono">1.00 u</td>
                        <td className="p-2 text-center font-mono">0%</td>
                        <td className="p-2 text-right font-mono">$250/u</td>
                        <td className="p-2 text-right font-mono font-bold">$250.00</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold">
                        <td colSpan={4} className="p-2 text-slate-800">Total Costo Variable Insumos:</td>
                        <td className="p-2 text-right font-mono text-emerald-700">$6,719.63</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Costo Variable por Docena:</span>
                    <span className="font-mono text-emerald-400 font-bold">$6,719.63</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cuota de Costos Fijos Cocina:</span>
                    <span className="font-mono text-blue-400 font-bold">$217.14</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t border-slate-700 pt-1">
                    <span>Costo Total Unitario:</span>
                    <span className="font-mono text-white">$6,936.77 por docena</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-1">
                    <span>Precio de Venta Sugerido:</span>
                    <span className="font-mono text-amber-400">$12,500.00 por docena</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-400">
                    <span>Margen de Ganancia Neto:</span>
                    <span className="font-mono">+$5,563.23 (80.2% sobre costo)</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 pt-2">3. Presupuesto para 80 Docenas</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-slate-100 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Costos Variables</span>
                    <span className="font-mono font-bold text-emerald-700">$537,570.40</span>
                  </div>
                  <div className="p-2.5 bg-slate-100 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Costos Fijos</span>
                    <span className="font-mono font-bold text-blue-700">$17,371.20</span>
                  </div>
                  <div className="p-2.5 bg-slate-100 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Costo Fabril</span>
                    <span className="font-mono font-bold text-slate-900">$554,941.60</span>
                  </div>
                  <div className="p-2.5 bg-slate-100 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Venta Total</span>
                    <span className="font-mono font-black text-blue-700">$1,000,000.00</span>
                  </div>
                </div>
              </div>
            )}

            {activeChapter === 'anexo-b' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider font-mono">
                    Anexo B
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    Caso Práctico Completo: Taller de Cartelería ("Medina Signs")
                  </h2>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950">
                  <strong>Objetivo del Caso:</strong> Presupuestar la confección de <strong>2 Carteles Frontlight de 2x1 metros</strong> con estructura metálica soldada para el cliente Farmacia del Sol.
                </div>

                <h3 className="text-base font-bold text-slate-900">1. Estructura de Costos Fijos del Taller</h3>
                <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                  <li>Alquiler Galpón Metalúrgico y Gráfico: $350,000 / mes</li>
                  <li>Depreciación y Mantenimiento de Plotter UV: $95,000 / mes</li>
                  <li>Energía Trifásica Maquinaria: $80,000 / mes</li>
                  <li><strong>Total Costos Fijos Taller:</strong> $525,000 / mes</li>
                  <li><strong>Capacidad Mensual Estimada:</strong> 250 unidades equivalentes</li>
                  <li><strong>Cuota Fija Base:</strong> $525,000 / 250 = $2,100 por cartel estándar</li>
                  <li><strong>Factor de Ponderación para Frontlight 2x1m:</strong> 1.5 &rarr; <strong>$3,150.00 por cartel</strong></li>
                </ul>

                <h3 className="text-base font-bold text-slate-900 pt-2">2. Composición de Materiales para 1 Cartel (2m x 1m)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2">Material / Proceso</th>
                        <th className="p-2 text-center">Cant.</th>
                        <th className="p-2 text-center">Merma</th>
                        <th className="p-2 text-right">Precio Insumo</th>
                        <th className="p-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      <tr>
                        <td className="p-2 font-medium">Lona Frontlight 440g</td>
                        <td className="p-2 text-center font-mono">2.20 m2</td>
                        <td className="p-2 text-center font-mono">5%</td>
                        <td className="p-2 text-right font-mono">$3,800/m2</td>
                        <td className="p-2 text-right font-mono font-bold">$8,778.00</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Tinta UV Ecosolvente</td>
                        <td className="p-2 text-center font-mono">2.00 m2</td>
                        <td className="p-2 text-center font-mono">5%</td>
                        <td className="p-2 text-right font-mono">$2,200/m2</td>
                        <td className="p-2 text-right font-mono font-bold">$4,620.00</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Caño Estructural 20x20 Hierro</td>
                        <td className="p-2 text-center font-mono">6.00 m</td>
                        <td className="p-2 text-center font-mono">4%</td>
                        <td className="p-2 text-right font-mono">$3,900/m</td>
                        <td className="p-2 text-right font-mono font-bold">$24,336.00</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Mano de Obra Soldador / Armado</td>
                        <td className="p-2 text-center font-mono">2.50 hs</td>
                        <td className="p-2 text-center font-mono">0%</td>
                        <td className="p-2 text-right font-mono">$5,500/h</td>
                        <td className="p-2 text-right font-mono font-bold">$13,750.00</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold">
                        <td colSpan={4} className="p-2 text-slate-800">Total Materiales y Mano de Obra:</td>
                        <td className="p-2 text-right font-mono text-blue-700">$51,484.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Costo Variable de Materiales y Taller:</span>
                    <span className="font-mono text-emerald-400 font-bold">$51,484.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cuota Fija Asignada (1.5 factor):</span>
                    <span className="font-mono text-blue-400 font-bold">$3,150.00</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t border-slate-700 pt-1">
                    <span>Costo Total Unitario de Fabricación:</span>
                    <span className="font-mono text-white">$54,634.00 por cartel</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-1">
                    <span>Precio de Venta Sugerido:</span>
                    <span className="font-mono text-amber-400">$85,000.00 por cartel</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-400">
                    <span>Margen de Ganancia Neto:</span>
                    <span className="font-mono">+$30,366.00 (55.6% sobre costo)</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 pt-2">3. Presupuesto Final para 2 Carteles</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-slate-100 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Costos Variables</span>
                    <span className="font-mono font-bold text-emerald-700">$102,968.00</span>
                  </div>
                  <div className="p-2.5 bg-slate-100 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Costos Fijos</span>
                    <span className="font-mono font-bold text-blue-700">$6,300.00</span>
                  </div>
                  <div className="p-2.5 bg-slate-100 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Costo Fabril</span>
                    <span className="font-mono font-bold text-slate-900">$109,268.00</span>
                  </div>
                  <div className="p-2.5 bg-slate-100 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Venta Total</span>
                    <span className="font-mono font-black text-blue-700">$170,000.00</span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
