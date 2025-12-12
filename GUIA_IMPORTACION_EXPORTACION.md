# Guía de Importación/Exportación de Empleados

## Descripción General

El sistema permite importar y exportar empleados usando archivos CSV o Excel (.xlsx). Esta funcionalidad se encuentra en la página de Empleados, mediante el botón "Importar / Exportar".

## Formatos Soportados

- **CSV** (.csv) - Archivo de texto con valores separados por comas
- **Excel** (.xlsx) - Archivo de Microsoft Excel

## Exportar Empleados

1. Haga clic en el botón de "Importar / Exportar" (icono de subida)
2. En el diálogo, en la sección "Exportar Datos", haga clic en "Descargar Empleados"
3. Seleccione el formato deseado:
   - **Formato CSV (.csv)** - Compatible con Excel, Google Sheets, y cualquier editor de texto
   - **Formato Excel (.xlsx)** - Formato nativo de Microsoft Excel

El archivo descargado contendrá todos los empleados del sistema con todas sus columnas.

## Importar Empleados

### Preparar el Archivo

El archivo debe contener las siguientes columnas (en español):

| Columna | Descripción | Obligatorio | Formato/Ejemplo |
|---------|-------------|-------------|-----------------|
| Cédula | Número de cédula | ✅ Sí | 1-2345-6789 |
| Primer Nombre | Nombre | ✅ Sí | Juan |
| Primer Apellido | Apellido paterno | ✅ Sí | Pérez |
| Segundo Apellido | Apellido materno | No | González |
| Nacionalidad | País de origen | No | Costarricense |
| Fecha Nacimiento | Fecha de nacimiento | ✅ Sí | 1990-05-15 (yyyy-mm-dd) |
| Estado Civil | Estado civil | No | Casado, Soltero, etc. |
| Educación | Nivel educativo | No | Licenciatura, Bachillerato, etc. |
| Teléfono | Número telefónico | ✅ Sí | 8888-8888 |
| Correo | Email | ✅ Sí | juan.perez@example.com |
| Dirección | Dirección residencial | No | San José, Costa Rica |
| Contacto Emergencia | Contacto de emergencia | No | Ana Pérez - 8888-7777 |
| Fecha Contratación | Fecha de inicio | ✅ Sí | 2020-01-15 (yyyy-mm-dd) |
| Puesto | Cargo/posición | No | Desarrollador |
| Estado | Estado del empleado | No | active o inactive |
| Talla Camisa | Talla de camisa | No | S, M, L, XL |
| Talla Zapato | Talla de zapato | No | 38, 42, etc. |
| Cuenta Bancaria | Número de cuenta bancaria | No | CR123456789 |
| Notas | Observaciones adicionales | No | Cualquier texto |

**Notas importantes:**
- Las fechas deben estar en formato ISO: `yyyy-mm-dd` (ej: 2020-01-15)
- Las columnas obligatorias son: Cédula, Primer Nombre, Primer Apellido, Fecha Nacimiento, Teléfono, Correo, Fecha Contratación
- El sistema también acepta nombres de columnas en inglés (documentId, firstName, etc.) si el archivo fue creado programáticamente

### Archivo de Plantilla

Puede encontrar un archivo de plantilla de ejemplo en: `plantilla_empleados.csv`

### Estrategias de Importación

Al importar, debe seleccionar una estrategia:

#### 1. Omitir duplicados (Recomendado)
- Importa solo empleados nuevos
- Los empleados existentes (con la misma cédula) se mantienen sin cambios
- Es la opción más segura para agregar empleados sin afectar los existentes

#### 2. Actualizar existentes
- Importa empleados nuevos
- Actualiza los empleados existentes con los datos del archivo
- Útil cuando necesita actualizar información de empleados que ya existen
- ⚠️ Los datos del archivo sobrescribirán los datos actuales

#### 3. Reemplazar todo ⚠️ PELIGROSO
- **ELIMINA** todos los empleados existentes
- Importa todos los empleados del archivo
- **SOLO use esta opción si está seguro de querer borrar toda la base de datos**
- Se recomienda hacer una exportación antes de usar esta opción

### Pasos para Importar

1. Prepare su archivo CSV o Excel con el formato correcto
2. Haga clic en el botón "Importar / Exportar"
3. En la sección "Importar Datos", haga clic en "Seleccionar archivo CSV o Excel"
4. Seleccione su archivo
5. Elija la estrategia de importación adecuada
6. Revise la advertencia si seleccionó "Reemplazar todo"
7. Haga clic en "Importar"

### Resultados de la Importación

Después de la importación, verá un resumen con:
- **Nuevos**: Empleados que se crearon
- **Actualizados**: Empleados existentes que se actualizaron
- **Omitidos**: Empleados que ya existían y no se modificaron
- **Errores**: Empleados que no se pudieron importar (con detalles del error)

## Google Sheets

Para importar desde Google Sheets:

1. En Google Sheets, vaya a **Archivo > Descargar**
2. Seleccione **Valores separados por comas (.csv)** o **Microsoft Excel (.xlsx)**
3. Use el archivo descargado en el sistema

## Consejos y Mejores Prácticas

- ✅ Siempre exporte sus datos antes de hacer una importación masiva
- ✅ Verifique el formato de las fechas (yyyy-mm-dd)
- ✅ Use "Omitir duplicados" cuando solo quiera agregar nuevos empleados
- ✅ Use "Actualizar existentes" cuando necesite modificar empleados existentes
- ✅ Revise los errores después de la importación y corrija los registros problemáticos
- ⚠️ Nunca use "Reemplazar todo" sin tener un respaldo actualizado

## Solución de Problemas

### Error: "Formato de archivo no soportado"
- Asegúrese de usar archivos .csv o .xlsx
- Algunos archivos .xls antiguos no son compatibles (conviértalos a .xlsx)

### Error: "Faltan campos obligatorios"
- Verifique que todas las columnas obligatorias estén presentes
- Asegúrese de que cada fila tenga valores en: Cédula, Primer Nombre, Primer Apellido, Teléfono, Correo, Fecha Nacimiento, Fecha Contratación

### Error: "dob must be in yyyy-mm-dd format"
- Las fechas deben estar en formato ISO: año-mes-día
- Ejemplo correcto: 1990-05-15
- Ejemplo incorrecto: 15/05/1990 o 05-15-1990

### Error: "Email inválido"
- Asegúrese de que los correos tengan un formato válido
- Ejemplo: usuario@dominio.com

## Soporte

Para asistencia adicional, contacte al administrador del sistema.
