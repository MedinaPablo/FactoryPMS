import JSZip from 'jszip';

export interface BackupStats {
  venturesCount: number;
  costsCount: number;
  productsCount: number;
  budgetsCount: number;
  ordersCount: number;
  usersCount: number;
  exportedAt: string;
}

export async function exportDatabaseToZip(databaseJson: string): Promise<{ blob: Blob; filename: string; stats: BackupStats }> {
  const parsed = JSON.parse(databaseJson);
  const zip = new JSZip();

  const stats: BackupStats = {
    venturesCount: parsed.ventures?.length || 0,
    costsCount: parsed.costs?.length || 0,
    productsCount: parsed.products?.length || 0,
    budgetsCount: parsed.budgets?.length || 0,
    ordersCount: parsed.productionOrders?.length || 0,
    usersCount: parsed.users?.length || 0,
    exportedAt: parsed.exportedAt || new Date().toISOString(),
  };

  // 1. Primary restoration file
  zip.file('medina_factory_backup.json', databaseJson);

  // 2. Human-readable readme
  const dateStr = new Date().toLocaleString('es-ES', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const readme = `======================================================================
MEDINA FACTORY - COPIA DE SEGURIDAD EMPRESARIAL (.ZIP)
======================================================================
Fecha de generación: ${dateStr}
Versión del sistema: ${parsed.version || '2.5'}

CONTENIDO DEL RESPALDO:
----------------------------------------------------------------------
• Emprendimientos / Fábricas:     ${stats.venturesCount}
• Costos fijos y variables:        ${stats.costsCount}
• Productos y fórmulas (BOM):      ${stats.productsCount}
• Presupuestos comerciales:        ${stats.budgetsCount}
• Órdenes de producción en planta: ${stats.ordersCount}
• Usuarios y credenciales:         ${stats.usersCount}

INSTRUCCIONES DE RESTAURACIÓN:
----------------------------------------------------------------------
1. Inicie sesión en Medina Factory (como usuario "root" o administrador).
2. En la barra superior, haga clic en el botón con ícono de Base de Datos.
3. En la sección "Restaurar Copia de Seguridad", haga clic en "Restaurar"
   y seleccione directamente este archivo .ZIP (o el archivo JSON interno).
4. El sistema restaurará de forma íntegra e inmediata todos los datos,
   recetas, órdenes y configuraciones sin requerir software externo.

======================================================================
Medina Factory ERP © 2026 - Control de Producción y Costeo Industrial
======================================================================
`;

  zip.file('LEEME_RESPALDO.txt', readme);

  // 3. Module separation for convenient inspection
  const modFolder = zip.folder('modulos_individuales');
  if (modFolder) {
    modFolder.file('01_emprendimientos.json', JSON.stringify(parsed.ventures || [], null, 2));
    modFolder.file('02_costos_fijos_y_variables.json', JSON.stringify(parsed.costs || [], null, 2));
    modFolder.file('03_productos_y_recetas.json', JSON.stringify(parsed.products || [], null, 2));
    modFolder.file('04_presupuestos.json', JSON.stringify(parsed.budgets || [], null, 2));
    modFolder.file('05_ordenes_de_produccion.json', JSON.stringify(parsed.productionOrders || [], null, 2));
    modFolder.file('06_usuarios_del_sistema.json', JSON.stringify(parsed.users || [], null, 2));
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const filename = `MedinaFactory_Backup_${new Date().toISOString().split('T')[0]}.zip`;

  return { blob, filename, stats };
}

export async function importDatabaseFromZipOrJson(file: File): Promise<{ jsonString: string; isZip: boolean; stats: BackupStats }> {
  let jsonString = '';
  const isZip = file.name.toLowerCase().endsWith('.zip') || file.type.includes('zip');

  if (isZip) {
    const zip = await JSZip.loadAsync(file);
    let targetFile = zip.file('medina_factory_backup.json');

    // If not found with exact name, search for any root JSON file
    if (!targetFile) {
      const candidateKey = Object.keys(zip.files).find(
        (key) => key.toLowerCase().endsWith('.json') && !key.includes('/')
      );
      if (candidateKey) {
        targetFile = zip.file(candidateKey);
      }
    }

    // Fallback: search in modulos_individuales or subdirectories if someone re-packed it
    if (!targetFile) {
      const candidateKey = Object.keys(zip.files).find(
        (key) => key.toLowerCase().endsWith('.json') && key.toLowerCase().includes('backup')
      );
      if (candidateKey) {
        targetFile = zip.file(candidateKey);
      }
    }

    if (!targetFile) {
      throw new Error(
        'El archivo ZIP seleccionado no contiene una copia de seguridad válida de Medina Factory (no se encontró "medina_factory_backup.json").'
      );
    }

    jsonString = await targetFile.async('text');
  } else {
    jsonString = await file.text();
  }

  const parsed = JSON.parse(jsonString);
  if (!parsed.users || !parsed.ventures || !parsed.costs || !parsed.products) {
    throw new Error('El archivo no contiene la estructura requerida de base de datos de Medina Factory.');
  }

  const stats: BackupStats = {
    venturesCount: parsed.ventures?.length || 0,
    costsCount: parsed.costs?.length || 0,
    productsCount: parsed.products?.length || 0,
    budgetsCount: parsed.budgets?.length || 0,
    ordersCount: parsed.productionOrders?.length || 0,
    usersCount: parsed.users?.length || 0,
    exportedAt: parsed.exportedAt || new Date().toISOString(),
  };

  return { jsonString, isZip, stats };
}
