# Manual de Usuario: Sistema de Presupuestos y Producción "Medina Factory"

Bienvenido a la documentación oficial y manual de usuario de **Medina Factory**, la solución web integral diseñada para calcular con precisión industrial los costos, elaborar presupuestos de fabricación y controlar el flujo de producción en planta para cualquier manufactura: panadería, empanadas, cartelería, calzado o talleres a medida.

---

## Índice General

1. [Capítulo 1: Introducción y Conceptos Clave](#capítulo-1-introducción-y-conceptos-clave)
2. [Capítulo 2: Primeros Pasos y Navegación](#capítulo-2-primeros-pasos-y-navegación)
3. [Capítulo 3: Módulo de Costos (Fijos y Variables)](#capítulo-3-módulo-de-costos-fijos-y-variables)
4. [Capítulo 4: Módulo de Productos y Fórmulas de Receta (BOM)](#capítulo-4-módulo-de-productos-y-fórmulas-de-receta-bom)
5. [Capítulo 5: Módulo de Presupuestos de Producción](#capítulo-5-módulo-de-presupuestos-de-producción)
6. [Capítulo 6: Módulo de Producción y Control de Planta](#capítulo-6-módulo-de-producción-y-control-de-planta)
7. [Capítulo 7: Generación y Exportación a PDF](#capítulo-7-generación-y-exportación-a-pdf)
8. [Capítulo 8: Respaldo y Herramientas de Base de Datos](#capítulo-8-respaldo-y-herramientas-de-base-de-datos)
9. [Capítulo 9: Módulo de Seguridad y Control de Usuarios](#capítulo-9-módulo-de-seguridad-y-control-de-usuarios)
10. [Capítulo 10: Guía de Instalación (Local y Hosting Gratuito)](#capítulo-10-guía-de-instalación-local-y-hosting-gratuito)
11. [Anexo A: Caso Práctico Detallado — Fábrica de Empanadas ("Don Medina")](#anexo-a-caso-práctico-detallado--fábrica-de-empanadas-don-medina)
12. [Anexo B: Caso Práctico Detallado — Taller de Cartelería ("Medina Signs")](#anexo-b-caso-práctico-detallado--taller-de-cartelería-medina-signs)

---

## Capítulo 1: Introducción y Conceptos Clave

### 1.1 ¿Qué es Medina Factory?
Medina Factory es un sistema ERP de costeo, presupuestación y control de fabricación basado en la **metodología de costeo por absorción industrial**. Su objetivo primordial es responder a dos preguntas críticas para todo fabricante o taller:

> 1. *"¿Cuánto me cuesta exactamente fabricar una unidad o un lote de mi producto, considerando tanto los materiales directos como el alquiler, la luz y los sueldos fijos de mi taller, y cuánto debo cobrar para obtener una ganancia real?"*
> 2. *"¿Qué insumos y cuántas horas de trabajo necesito exactamente en planta para fabricar los pedidos confirmados, cuáles están en proceso, cuáles se han pausado por algún motivo y cuáles ya fueron terminados?"*

### 1.2 La Ecuación de Costeo Medina Factory
El sistema calcula el costo total de cualquier producto bajo la siguiente regla contable:

$$\text{Costo Total Unitario} = \text{Costo Variable Unitario (Insumos)} + \text{Cuota de Costo Fijo Distribuido}$$

1. **Costo Variable Unitario**: La suma matemática de todos los materiales, materias primas o insumos directos necesarios para elaborar una unidad del producto, ponderada por su merma o desperdicio técnico.
2. **Cuota de Costo Fijo Distribuido**: La porción de los gastos mensuales estructurales (alquiler del local, sueldos fijos de planta, gas o luz industrial, internet) que le corresponde absorber a cada unidad producida:
$$\text{Cuota Fija} = \left(\frac{\text{Total Costos Fijos Mensuales}}{\text{Capacidad Mensual Estimada del Emprendimiento}}\right) \times \text{Factor de Ponderación}$$
3. **Margen de Ganancia**:
$$\text{Ganancia Neta} = \text{Precio de Venta Sugerido} - \text{Costo Total de Producción}$$
$$\text{Rentabilidad (\%)} = \left(\frac{\text{Ganancia Neta}}{\text{Costo Total de Producción}}\right) \times 100$$

---

## Capítulo 2: Primeros Pasos y Navegación

### 2.1 Pantalla de Acceso (Login)
Al ingresar al sistema se presenta la pantalla de autenticación. Medina Factory cuenta con usuarios preconfigurados listos para ser probados con un solo clic:

- **Usuario Propietario (`root`)**:
  - Usuario: `root`
  - Contraseña: `Adm1807++`
  - *Tiene acceso irrestricto a todas las fábricas, creación de emprendimientos y asignación de administradores.*
- **Administrador de Panadería**: `admin_pan` / `Panaderia2026*`
- **Administrador de Empanadas**: `admin_empanadas` / `Empanadas2026*`
- **Administrador de Cartelería**: `admin_carteleria` / `Carteles2026*`
- **Administrador de Calzado**: `admin_calzado` / `Calzado2026*`
- **Usuario Invitado**: `invitado_pan` / `Invitado123*`

### 2.2 Barra de Navegación Superior
En la parte superior encontrará:
- **Logo Medina Factory**: Vuelve al Resumen Principal.
- **Selector de Emprendimiento (Multi-Tenant)**: Si ingresa como `root`, puede alternar instantáneamente entre la Panadería, Empanadas, Cartelería o Calzado. Si entra como Administrador o Invitado, verá el nombre de su emprendimiento asignado.
- **Menú de Módulos (en orden de flujo operativo)**:
  1. **Resumen**: Panel de control con métricas clave, KPIs y accesos directos.
  2. **Presupuestos**: Emisión, cálculo comercial y descarga en PDF de cotizaciones para clientes.
  3. **Producción**: Seguimiento en planta de pedidos confirmados, insumos/horas requeridas, inicios, pausas con motivo y finalizaciones.
  4. **Productos & Recetas**: Catálogo de productos terminados y fórmulas / escandallos (BOM).
  5. **Costos Fijos & Var.**: Registro y catálogo de gastos estructurales e insumos directos.
  - **Emprendimientos** *(Solo visible para Root)*: Creación y gestión de fábricas.
  - **Usuarios** *(Solo visible para Root y Admin)*: Gestión de accesos y creación de invitados.
- **Perfil de Usuario**: Despliega el menú para acceder a las **Herramientas de Base de Datos (Copias de Seguridad ZIP/JSON)**, al **Manual de Usuario Completo** o cerrar sesión.

---

## Capítulo 3: Módulo de Costos (Fijos y Variables)

El módulo de costos es el cimiento de la fábrica. Aquí se definen los precios vigentes de todo lo que compra o paga la empresa.

### 3.1 Diferencia entre Costo Fijo y Costo Variable

| Tipo de Costo | Definición | Ejemplos | Unidad Típica |
| :--- | :--- | :--- | :--- |
| **Costo Fijo (Mensual)** | Gastos estructurales que se pagan mes a mes independientemente de si se produce mucho o poco. | Alquiler de nave, sueldos fijos, luz trifásica básica, abono de software, seguro contra incendio. | `mes` |
| **Costo Variable (Por Insumo)** | Gastos que aumentan o disminuyen en directa proporción al volumen elaborado. | Harina, carne picada, vinilo adhesivo, cuero sintético, suelas, cajas de cartón, horas de mano de obra directa. | `kg`, `litro`, `m2`, `metro`, `unidad`, `par`, `hora` |

### 3.2 Paso a Paso: Cómo Registrar un Nuevo Costo
1. Vaya a la pestaña **Costos Fijos & Var.**.
2. En la esquina superior derecha, haga clic en:
   - **`+ Costo Fijo`** para gastos mensuales de infraestructura.
   - **`+ Costo Variable / Insumo`** para materiales de recetas.
3. Complete los campos del formulario:
   - **Nombre del Costo**: Sea específico (ej. *"Harina 000 de Trigo Seleccionada"* o *"Alquiler Taller de Impresión"*).
   - **Subcategoría**: Elija entre Materia Prima, Insumos, Packaging, Mano de Obra, Alquiler, Servicios, etc.
   - **Unidad de Medida**: Seleccione del menú (`kg`, `gr`, `litro`, `metro`, `m2`, `hora`, `unidad`, `par`, `docena`) o elija *"+ Otra unidad..."* para escribir una personalizada (ej. `rollo`, `bobina`, `placa`).
   - **Monto Vigente ($)**: Ingrese el valor numérico positivo. **El sistema no admite números negativos ni cero**.
   - **Fecha de Vigencia**: Fecha a partir de la cual rige este precio (por defecto, la fecha de hoy).
   - **Proveedor y Notas (Opcionales)**: Para control de compras o condiciones de pago.
4. Presione **"Registrar Costo"**.

> **Protección de Integridad:** Si un costo variable ya está siendo utilizado dentro de la fórmula de un producto terminado, el sistema impedirá su eliminación para evitar dejar productos huérfanos sin costeo.

---

## Capítulo 4: Módulo de Productos y Fórmulas de Receta (BOM)

En este módulo se dan de alta los **Productos Terminados** que la empresa ofrece al mercado y se construye su **Escandallo / Bill of Materials (BOM)**.

### 4.1 Campos de un Producto
- **Nombre**: Denominación comercial (ej. *"Cartel Frontlight Comercial 2x1m"*).
- **Código SKU / Referencia**: Identificador interno (ej. *"CART-FRONT-2X1"*).
- **Descripción**: Características constructivas, terminación y uso.
- **Unidad de Medida**: Unidad en la que se comercializa (`unidad`, `kg`, `docena`, `par`, `m2`).
- **Precio de Venta Sugerido ($)**: Precio de lista al público o cliente.
- **Factor de Absorción Fijo**: Multiplicador de costos fijos (por defecto `1.0`). Si un producto requiere el doble de tiempo de maquinaria que el promedio, se le puede colocar `2.0` para que absorba una proporción doble de costos fijos.

### 4.2 Creación de la Receta / Relación de Materiales
Al crear o editar un producto, encontrará la sección **"Relación de Materiales e Insumos (Receta / Escandallo)"**:
1. Haga clic en **`+ Agregar Insumo`**.
2. Seleccione de la lista desplegable el costo variable registrado previamente (ej. *Harina 000* o *Vinilo Autoadhesivo*).
3. Escriba la **Cantidad Requerida por Unidad** (ej. `0.75` kg para 1 kg de pan, o `2.2` m2 para un cartel).
4. Indique la **Merma / Desperdicio (%)**: Porcentaje técnico estimado que se pierde en cortes, horneado o manipulación (ej. `5`%).
5. **Cálculo en Vivo**: Inmediatamente el sistema muestra el subtotal de cada insumo.
6. En la parte inferior, la **Tarjeta de Simulación en Tiempo Real** le mostrará:
   - Total Insumos (Variables)
   - Cuota Fija Asignada
   - Costo Total de Producción
   - Margen de Ganancia proyectado ($ y %)

---

## Capítulo 5: Módulo de Presupuestos de Producción

El módulo de presupuestos permite cotizar pedidos reales a clientes calculando de forma automática todos los costos, precios y márgenes de ganancia.

### 5.1 Paso a Paso: Crear un Presupuesto
1. Vaya a la pestaña **Presupuestos**.
2. Haga clic en el botón azul **`+ Nuevo Presupuesto de Producción`**.
3. **Datos del Cliente**:
   - **Cliente / Destinatario**: Nombre de la empresa o persona (obligatorio).
   - **CUIT / RUT / DNI**: Documento fiscal.
   - **Teléfono y Correo Electrónico**: Medios de contacto.
   - **Fechas**: Fecha de emisión y validez de la oferta (por defecto 15 días corridos).
4. **Selección de Productos y Cantidades**:
   - Elija el producto terminado del catálogo.
   - Indique la **Cantidad a Producir** (ej. `50` docenas o `3` carteles).
   - El sistema cargará el costo unitario fabril y el precio sugerido. Puede **ajustar el precio de venta unitario** si desea ofrecer un descuento por volumen o cobrar un recargo especial.
   - Si el pedido contiene más de un tipo de producto, presione **`+ Agregar Producto`** para añadir tantas líneas como requiera.
5. **Revisión del Desglose Económico Automático**:
   En tiempo real, la ventana totalizará:
   - **Total de Costos Variables Aplicados**: Suma de insumos directos consumidos por el lote completo.
   - **Total de Costos Fijos Aplicados**: Proporción de la estructura fabril consumida durante la producción.
   - **Costo Total de Producción**: El costo neto que tendrá la fábrica para ejecutar el pedido.
   - **Precio Total de Venta**: Monto facturado al cliente.
   - **Margen de Ganancia Neto ($ y %)**: La utilidad limpia y la rentabilidad sobre el costo.
6. **Requerimiento Consolidado de Materiales (Planta)**:
   Debajo del cuadro económico verá el consolidado de insumos. Esto le indica al jefe de producción **exactamente cuántos kilos, metros o unidades de cada materia prima deben comprarse o retirarse del depósito** para cumplir con la orden.
7. **Condiciones Comerciales**:
   Escriba plazos de entrega, forma de pago (ej. *"50% anticipo, saldo contra entrega"*) y estado del presupuesto (`Borrador`, `Enviado`, `Aprobado`, `En Producción`, `Entregado`).
8. Presione **"Guardar Presupuesto"**.

---

## Capítulo 6: Módulo de Producción y Control de Planta

El **Módulo de Producción** es el centro de control operativo del taller o fábrica. Administra las órdenes de trabajo desde que un pedido se confirma hasta que el producto terminado sale de planta con su control de calidad.

### 6.1 Los Pedidos Confirmados para Producción
En esta vista se concentran todas las órdenes de trabajo que han sido aprobadas comercialmente y están a la espera de ingresar a las líneas de armado, hornos o mesas de corte.
- **Origen de la Orden**: Se puede generar directamente a partir de un presupuesto aprobado del cliente (botón *"+ Nueva Orden de Fabricación"* &rarr; *"Desde Presupuesto"*) o darse de alta como orden de fabricación directa para reponer inventario de salón de ventas.
- Cada orden confirmada cuenta con su número correlativo (ej. `OP-PAN-001`, `OP-CART-001`), cliente asignado, producto, cantidad a elaborar y nivel de prioridad (`baja`, `media`, `alta`, `urgente`).

### 6.2 Detalle de Insumos, Materia Prima y Horas Requeridas
En la parte superior del módulo de producción se ubica el panel **Requerimiento Consolidado de Planta**:
- **Horas Hombre Totales Requeridas**: Suma acumulada de las horas de operarios, panaderos, soldadores o cortadores necesarias para cumplir con los pedidos activos.
- **Consolidado de Insumos Físicos**: Totaliza en tiempo real los kilos de harina, carne picada, metros cuadrados de vinilo, metros lineales de caños de hierro o pares de suelas que los operarios deben retirar del almacén.
- **Ficha Técnica Individual**: Al presionar **"Ver Ficha Técnica"** en cualquier tarjeta de pedido, se abre una tabla detallada con cada insumo y hora requerida para esa orden específica, su costo unitario y su costo total.

### 6.3 Los Pedidos que se Comienzan (En Producción)
Cuando el equipo de trabajo inicia la fabricación:
1. El encargado presiona el botón **`Comenzar Pedido`**.
2. El estado pasa automáticamente a **`En Producción`** con indicador visual azul de actividad en curso.
3. El sistema registra internamente la **fecha y hora exacta de inicio** (`startedAt`) y permite dejar asentado el nombre del operario o maquinista a cargo.

### 6.4 Los Pedidos que Entran en Pausa y su Motivo
En la manufactura real surgen imprevistos (falta de stock de un proveedor, averías eléctricas, demoras en aprobación de diseño). Medina Factory gestiona estas contingencias con **registro obligatorio de motivo**:
1. En la orden en curso se presiona el botón **`Pausar`**.
2. Se abre una ventana emergente que exige indicar la causa de la detención.
3. Se puede seleccionar un motivo frecuente rápido (*"Falta de materia prima en depósito"*, *"Avería mecánica / mantenimiento"*, *"Espera de aprobación de diseño del cliente"*, *"Corte de energía / gas"*) o redactar una explicación detallada personalizada.
4. El pedido pasa al estado **`En Pausa`** con un badge de advertencia rojo y el texto del motivo visible de inmediato en la tarjeta.
5. El sistema guarda un **historial cronológico de pausas** (`pauseHistory`) con fecha, hora y razón.
6. Cuando se resuelve el problema, el operario presiona **`Reanudar Pedido`**, registrando la hora de reactivación y volviendo al estado activo.

### 6.5 Los Pedidos que se Terminan
Una vez que el lote ha sido elaborado, horneado, ensamblado o empacado:
1. El responsable presiona el botón verde **`Terminar`**.
2. La orden cambia al estado **`Terminado / Completado`**, registrando la fecha y hora de finalización (`finishedAt`).
3. El pedido queda listo para su entrega o retiro por parte del cliente, descontándose de la carga de trabajo pendiente del taller.

---

## Capítulo 7: Generación y Exportación a PDF

Cada presupuesto guardado puede descargarse como un documento oficial en PDF de alta calidad:

1. En la tabla de presupuestos, ubique la fila deseada.
2. Haga clic en el ícono de **Descarga (PDF)** o haga clic en el ícono del **Ojo (Ver)** y luego en **"Descargar PDF"**.
3. El sistema generará automáticamente un archivo con nombre estructurado:
   `Presupuesto_PRES-PAN-001_MedinaFactory.pdf`

### 7.1 Contenido del Documento PDF Generado
El PDF incluye:
- **Cabecera Industrial**: Logotipo Medina Factory, nombre del emprendimiento, fecha y código correlativo.
- **Cuadros de Emisor y Receptor**: CUIT, domicilio, teléfono y datos completos del cliente.
- **Tabla 1: Desglose de Productos y Costos**: Muestra cantidad, costo variable unitario, costo fijo unitario, costo total, precio unitario, total facturado y margen.
- **Tabla 2: Requerimiento Consolidado de Materias Primas**: Lista total de materiales necesarios para planta y compras.
- **Cuadro Resumen Financiero**: Resumen de costos variables, fijos, costo fabril total, precio de venta y rentabilidad en porcentaje.
- **Observaciones y Condiciones**: Términos de entrega y validez.
- **Espacios para Firma**: Línea para firma del emisor de fábrica y línea de aceptación del cliente.

---

## Capítulo 8: Respaldo y Herramientas de Base de Datos

En la barra superior encontrará el ícono de **Base de Datos** (`Database`). Este panel centraliza el mantenimiento y salvaguarda de la información fabril:

### 8.1 Exportación de Copia de Seguridad en Formato ZIP
Medina Factory permite exportar la base de datos completa como un archivo comprimido **`.ZIP`** (opción recomendada) o como archivo `.JSON` directo:
- **Estructura del archivo ZIP generado**:
  - `medina_factory_backup.json`: Contiene la base de datos completa (emprendimientos, costos, productos, presupuestos, órdenes de producción y usuarios).
  - `LEEME_RESPALDO.txt`: Resumen ejecutivo con fecha de emisión, versión y total de registros respaldados.
  - Carpeta `modulos_individuales/`: Archivos JSON organizados por módulo (`01_emprendimientos.json`, `02_costos_fijos_y_variables.json`, `03_productos_y_recetas.json`, etc.) para auditoría o consulta rápida.

### 8.2 Restauración desde Archivo ZIP o JSON
- Puede restaurar el sistema cargando directamente el archivo **`.ZIP`** o un archivo `.JSON` tradicional.
- El sistema descomprime, valida la integridad de la información y reconstruye en segundos todos los emprendimientos, recetas, órdenes y presupuestos con total fidelidad.

### 8.3 Reiniciar Datos de Fábrica
- Restablece los 4 emprendimientos de muestra completos (Panadería El Molino, Empanadas Don Medina, Cartelería Medina Signs y Calzado Medina Classic) con sus costos, fórmulas y órdenes de producción originales.

---

## Capítulo 9: Módulo de Seguridad y Control de Usuarios

### 9.1 Niveles de Acceso y Jerarquía de Roles

```
        ┌───────────────────────────────────────────────┐
        │                 USUARIO ROOT                  │
        │             Usuario: root                     │
        │             Contraseña: Adm1807++             │
        │  • Gestiona todos los emprendimientos        │
        │  • Crea administradores                      │
        │  • Respaldo global y conmutación de datos     │
        └───────────────────────┬───────────────────────┘
                                │ Crea y Asigna
                                ▼
        ┌───────────────────────────────────────────────┐
        │            ADMINISTRADOR DE FÁBRICA           │
        │  (ej. admin_pan, admin_empanadas, etc.)       │
        │  • Control total sobre su propia fábrica      │
        │  • Carga costos, productos y presupuestos     │
        │  • Administra órdenes de producción en planta │
        │  • Crea usuarios invitados con contraseña    │
        │  • Aislamiento: NO puede ver otras fábricas   │
        └───────────────────────┬───────────────────────┘
                                │ Crea
                                ▼
        ┌───────────────────────────────────────────────┐
        │               USUARIO INVITADO                │
        │  (ej. vendedores de mostrador, cotizadores)   │
        │  • Consulta catálogo y recetas                │
        │  • Genera presupuestos y exporta en PDF       │
        │  • Consulta estado de órdenes de producción   │
        │  • NO puede borrar costos ni alterar fórmulas │
        └───────────────────────────────────────────────┘
```

### 9.2 Aislamiento Estricto de Datos
Cada emprendimiento funciona como una entidad completamente independiente identificada por su `ventureId`. Ningún dato de costos, fórmulas o pedidos de Panadería se mezcla con Empanadas o Cartelería.

### 9.3 Cómo el Administrador Crea Usuarios Invitados
1. Inicie sesión con la cuenta de administrador de su fábrica (ej. `admin_empanadas`).
2. Diríjase a la pestaña **Usuarios**.
3. Haga clic en **`+ Crear Usuario Invitado`**.
4. Ingrese el Nombre Completo, Nombre de Usuario y Contraseña personal.
5. Presione **Guardar Usuario**. El invitado ya podrá ingresar con sus credenciales y estará restringido únicamente a su fábrica.

---

## Capítulo 10: Guía de Instalación (Local y Hosting Gratuito)

### 10.1 Instalación en Equipo Local (Windows, macOS o Linux)

#### Requisitos Previos:
- Tener instalado **Node.js** (versión 18 o superior) descargable gratuitamente desde [nodejs.org](https://nodejs.org).
- Navegador web moderno (Chrome, Edge, Firefox, Safari).

#### Pasos de Instalación:
1. **Descargar el código fuente**:
   Descargue o clone el repositorio en una carpeta de su computadora (ej. `C:\MedinaFactory`).
2. **Abrir la terminal de comandos**:
   Abra PowerShell, CMD o Terminal y navegue hasta la carpeta del proyecto:
   ```bash
   cd ruta/a/MedinaFactory
   ```
3. **Instalar dependencias**:
   Ejecute el siguiente comando para descargar e instalar todas las librerías necesarias:
   ```bash
   npm install
   ```
4. **Iniciar el servidor de desarrollo local**:
   Inicie la aplicación con:
   ```bash
   npm run dev
   ```
5. **Abrir en el navegador**:
   El sistema le indicará que está activo en:
   `http://localhost:3000`
   Abra esa dirección en su navegador web para comenzar a utilizar Medina Factory.
6. **Compilar para producción local**:
   Si desea generar los archivos estáticos optimizados:
   ```bash
   npm run build
   ```

---

### 10.2 Despliegue en Hosting Gratuito

Medina Factory está construido sobre arquitectura SPA moderna (Vite + React + Tailwind CSS), lo que permite alojarlo **100% gratis** en las mejores plataformas en la nube:

#### Opción A: Despliegue en Vercel (Recomendado - 2 minutos)
1. Cree una cuenta gratuita en [vercel.com](https://vercel.com) vinculada con su cuenta de GitHub.
2. Suba el código de Medina Factory a un repositorio en su cuenta de GitHub.
3. En Vercel, haga clic en **"Add New Project"** y seleccione el repositorio de Medina Factory.
4. Vercel detectará automáticamente que es un proyecto **Vite**:
   - *Build Command*: `npm run build`
   - *Output Directory*: `dist`
5. Haga clic en **"Deploy"**. En 45 segundos obtendrá una URL pública segura HTTPS (ej. `https://medina-factory.vercel.app`) accesible desde cualquier computadora, tablet o teléfono celular.

#### Opción B: Despliegue en Netlify
1. Cree una cuenta gratuita en [netlify.com](https://netlify.com).
2. Conecte su repositorio de GitHub o arrastre la carpeta `dist` directamente al panel de Netlify.
3. En configuración de compilación, especifique:
   - *Build Command*: `npm run build`
   - *Publish Directory*: `dist`
4. Guarde y despliegue para obtener su enlace público inmediato.

#### Opción C: Despliegue en Render
1. Cree una cuenta gratuita en [render.com](https://render.com).
2. Seleccione **"New Static Site"**.
3. Conecte su repositorio de GitHub.
4. Establezca:
   - *Build Command*: `npm run build`
   - *Publish Directory*: `dist`
5. Haga clic en **"Create Static Site"**.

---

## Anexo A: Caso Práctico Detallado — Fábrica de Empanadas ("Don Medina")

En este anexo recorreremos paso a paso cómo un fabricante gastronómico utiliza Medina Factory para costear, presupuestar y ejecutar en planta un pedido de **80 docenas de empanadas** para un evento corporativo de la empresa TechCorp SA.

### Paso 1: Configuración de la Fábrica de Empanadas
- **Nombre**: Empanadas Criollas "Don Medina"
- **Capacidad Mensual Estimada**: `3,500` docenas/mes.
- **Costos Fijos Registrados en la Cocina**:
  1. *Alquiler Cocina de Producción*: $220,000 / mes
  2. *Personal Cocinero y Repulgadores*: $450,000 / mes
  3. *Energía y Cámaras Frigoríficas*: $90,000 / mes
  - **Total Costos Fijos Mensuales**: **$760,000 / mes**
  - **Incidencia Fija por Docena**: $\frac{\$760,000}{3,500} = \mathbf{\$217.14 \text{ por docena}}$.

### Paso 2: Costos Variables de Ingredientes (Por Insumo)
- Carne Vacuna Bola de Lomo: $6,900 / kg
- Cebolla Seleccionada: $950 / kg
- Tapas de Empanadas Rotiseras Hojaldradas: $1,400 / docena
- Aceitunas Verdes Descarozadas: $5,200 / kg
- Huevos Frescos de Granja: $220 / unidad
- Caja Térmica x 1 Docena: $250 / unidad

### Paso 3: Ficha Técnica de la "Docena de Empanadas de Carne Suave"
La receta para elaborar **1 Docena de Empanadas** se compone de:

| Insumo | Cantidad Requerida | Merma % | Costo Unitario Insumo | Subtotal Insumo |
| :--- | :---: | :---: | :---: | :---: |
| Carne Vacuna Picada | 0.55 kg | 5% | $6,900 / kg | $3,984.75 |
| Cebolla Picada | 0.45 kg | 5% | $950 / kg | $448.88 |
| Tapas de Empanadas | 1.00 doc | 0% | $1,400 / doc | $1,400.00 |
| Aceitunas Descarozadas | 0.08 kg | 0% | $5,200 / kg | $416.00 |
| Huevos | 1.00 u | 0% | $220 / u | $220.00 |
| Caja Térmica | 1.00 u | 0% | $250 / u | $250.00 |
| **Total Costo Variable Insumos** | — | — | — | **$6,719.63 / docena** |

**Cálculo Unitario Final por Docena**:
- Costo Variable: $6,719.63
- Cuota Costo Fijo Cocina: $217.14
- **Costo Total Unitario**: **$6,936.77 por docena**
- Precio de Venta Sugerido: **$12,500.00 por docena**
- Margen de Ganancia Unitario: **+$5,563.23 (80.2% de rentabilidad)**.

### Paso 4: Creación del Presupuesto Comercial
- **Cliente**: TechCorp SA
- **Pedido**: 80 docenas de Empanadas de Carne Suave
- **Precio Presupuestado**: $12,500 por docena
- **Total Cotizado**: $1,000,000 | **Costo Total Fabril**: $554,941.60 | **Ganancia Neta**: +$445,058.40 (80.2%)

### Paso 5: Gestión del Pedido en el Módulo de Producción (Planta)
1. **Pase a Producción**: El presupuesto se aprueba y se genera la orden **`OP-EMP-001`** con estado inicial **Confirmado**.
2. **Requerimiento Consolidado de Insumos y Horas para Cocina**:
   - Carne Vacuna Bola de Lomo: **46.2 kg**
   - Cebolla Seleccionada: **37.8 kg**
   - Tapas Rotiseras: **80 docenas**
   - Aceitunas Descarozadas: **6.4 kg**
   - Huevos Frescos: **80 unidades**
   - Cajas Térmicas: **80 unidades**
   - Mano de Obra: **10.0 horas de cocineros y repulgadores**
3. **Inicio del Pedido**: El chef presiona **`Comenzar Pedido`** a las 08:00 AM, pasando el pedido a estado **En Producción**.
4. **Pausa Operativa por Insumos**: A las 10:15 AM surge una demora en la entrega de cajas térmicas por el transportista. El operario presiona **`Pausar`** y selecciona el motivo *"Falta de entrega de lote de cajas térmicas por el transportista. Reprogramado para las 14:30"*. La orden queda identificada en rojo con su motivo visible.
5. **Reanudación y Finalización**: A las 14:30 llegan las cajas, se presiona **`Reanudar Pedido`** y a las 16:45 se hornean y empaquetan las 80 docenas, presionando **`Terminar`** para despachar el pedido al cliente.

---

## Anexo B: Caso Práctico Detallado — Taller de Cartelería ("Medina Signs")

En este anexo veremos cómo un taller de gráfica comercial y metalúrgica utiliza Medina Factory para presupuestar y fabricar **2 Carteles Frontlight Comerciales de 2m x 1m con Bastidor Metálico** para el cliente Farmacia del Sol.

### Paso 1: Configuración del Taller de Cartelería
- **Nombre**: Cartelería & Gráfica "Medina Signs"
- **Capacidad Mensual Estimada**: `250` unidades de cartel o m2 equivalentes al mes.
- **Costos Fijos Mensuales del Taller**:
  1. *Alquiler Taller Metalúrgico y Gráfico*: $350,000 / mes
  2. *Depreciación y Service Plotter UV*: $95,000 / mes
  3. *Energía Trifásica de Maquinaria*: $80,000 / mes
  - **Total Costos Fijos Mensuales**: **$525,000 / mes**
  - **Cuota Fija Base**: $\frac{\$525,000}{250} = \mathbf{\$2,100 \text{ por unidad base}}$.

### Paso 2: Costos Variables de Materiales y Mano de Obra
- Lona Frontlight Brillante 440g: $3,800 / m2
- Vinilo Autoadhesivo Calandrado: $4,600 / m2
- Placa PVC Espumado 3mm: $9,800 / m2
- Tinta UV Ecosolvente: $2,200 / m2 impreso
- Caño Estructural de Hierro 20x20: $3,900 / metro lineal
- Mano de Obra Armador / Soldador: $5,500 / hora

### Paso 3: Ficha Técnica del "Cartel Frontlight con Bastidor (2m x 1m)"
- Factor de Absorción Fijo: `1.5` (requiere un 50% más de tiempo de taller que el cartel promedio).
- Cuota Fija Asignada: $\$2,100 \times 1.5 = \mathbf{\$3,150.00}$.

**Composición de Materiales para 1 Cartel de 2x1m**:

| Insumo / Material | Cantidad | Merma % | Costo Unitario Insumo | Subtotal Material |
| :--- | :---: | :---: | :---: | :---: |
| Lona Frontlight (impresión y dobladillo) | 2.20 m2 | 5% | $3,800 / m2 | $8,778.00 |
| Tinta UV Ecosolvente | 2.00 m2 | 5% | $2,200 / m2 | $4,620.00 |
| Caño Estructural 20x20 (perímetro 6m) | 6.00 m | 4% | $3,900 / m | $24,336.00 |
| Mano de Obra Soldador / Armado | 2.50 hs | 0% | $5,500 / hora | $13,750.00 |
| **Total Costo Variable** | — | — | — | **$51,484.00 / cartel** |

**Cálculo Unitario Final por Cartel**:
- Costo Variable de Materiales y Taller: $51,484.00
- Cuota Costo Fijo Taller: $3,150.00
- **Costo Total Unitario de Fabricación**: **$54,634.00 por cartel**
- Precio de Venta Sugerido: **$85,000.00 por cartel**
- Margen de Ganancia Unitario: **+$30,366.00 (55.6% de margen)**.

### Paso 4: Creación del Presupuesto Comercial
- **Cliente**: Farmacia del Sol
- **Detalle**: Fabricación de 2 Carteles Frontlight con Bastidor Metálico (2m x 1m)
- **Precio Presupuestado**: $85,000 por cartel
- **Venta Total**: $170,000 | **Costo Total Producción**: $109,268 | **Ganancia Neta**: +$60,732 (55.6%)

### Paso 5: Gestión del Pedido en el Módulo de Producción (Taller)
1. **Creación de la Orden de Trabajo**: Se genera la orden **`OP-CART-001`** con prioridad **Alta**.
2. **Requerimiento Consolidado de Insumos y Horas para Taller**:
   - Caño Estructural 20x20 de Hierro: **12.48 metros lineales**
   - Lona Frontlight Brillante 440g: **4.62 m2**
   - Tinta UV Ecosolvente: **4.20 m2 equivalentes**
   - Mano de Obra Metalúrgica: **5.0 horas hombre de soldador / montador**
3. **Inicio de Producción**: A las 08:30 AM el soldador corta los perfiles y manda a imprimir la lona en el plotter UV, cambiando el estado a **`En Producción`**.
4. **Pausa Técnica**: Si el cliente llama solicitando un cambio de última hora en el número de teléfono impreso antes de montar la lona en el bastidor, se presiona **`Pausar`** y se registra el motivo *"Cliente solicita cambio en teléfono impreso antes del tensado"*.
5. **Finalización y Entrega**: Se aprueba el diseño final, se remachan los zunchos de la lona en el bastidor y se presiona **`Terminar`**. El cartel queda listo para instalación en marquesina con el PDF firmado de remito de entrega.

---

**Medina Factory ERP &copy; 2026** — *La solución definitiva para control de costos, presupuestos y seguimiento de producción en planta.*
