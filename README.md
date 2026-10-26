# FinanzaPro

Aplicación web de gestión financiera para personas y pequeños negocios: permite registrar ingresos y gastos, organizarlos por categorías y consultar un resumen del estado financiero. Proyecto desarrollado para el PPI (Tecnológico de Antioquia).

## Funcionalidades

- **Panel (Dashboard):** balance, ingresos y gastos totales, tendencia mensual, distribución por categoría y movimientos recientes.
- **Movimientos:** crear, editar y eliminar ingresos y gastos, con filtros por fecha, categoría, tipo y búsqueda de texto.
- **Categorías:** crear y eliminar categorías con nombre, tipo (Ingreso, Gasto o Ambos) y color.
- **Perfil:** nombre, tipo de cuenta (personal o empresarial), moneda y correo.

## Arquitectura

Monorepo con **pnpm workspaces** y TypeScript (Node.js 24, pnpm 10+).

| Paquete | Ruta | Descripción |
| --- | --- | --- |
| Frontend | `artifacts/finanzapro` | React + Vite + TailwindCSS + Recharts + Wouter (rutas `/`, `/movements`, `/movements/new`, `/categories`, `/profile`) |
| API | `artifacts/api-server` | Express 5 + Drizzle ORM, expuesta en `http://localhost:3001/api` |
| Base de datos | PostgreSQL 16 | Tablas `categories`, `movements` y `profile`; scripts en `scripts/sql` |
| Librerías | `lib/` | `db` (esquema Drizzle), `api-spec` (OpenAPI), `api-zod` y `api-client-react` (código generado) |

## Puesta en marcha

Resumen (detalle completo en [GUIA_EJECUCION_LOCAL.md](GUIA_EJECUCION_LOCAL.md) y [COMANDOS_LEVANTAR_APP.txt](COMANDOS_LEVANTAR_APP.txt)). Requiere Node.js, pnpm y Docker Desktop.

```powershell
pnpm install

# 1) Base de datos
docker start finanzapro-postgres        # primera vez: ver la guía para crearla

# 2) API (terminal 1)
$env:DATABASE_URL="postgresql://postgres:finanzapro@localhost:5432/finanzapro"
$env:PORT="3001"
pnpm --filter @workspace/api-server run dev

# 3) Frontend (terminal 2)
$env:PORT="5173"; $env:BASE_PATH="/"; $env:API_URL="http://localhost:3001"
pnpm --filter @workspace/finanzapro run dev
```

La aplicación queda en <http://localhost:5173>.

## Pruebas automatizadas con Cypress (módulo de Categorías)

Las pruebas de caja negra del módulo de Gestión de Categorías están en `artifacts/finanzapro/cypress/e2e/` (Cypress 13.17, configuración en `artifacts/finanzapro/cypress.config.cjs`, `baseUrl` `http://localhost:5173`). Requieren la base, la API y el frontend en ejecución.

| Spec | Contenido | Resultado esperado |
| --- | --- | --- |
| `categorias.cy.js` | 29 casos de caja negra: partición de equivalencia, valores límite, transición de estados y tablas de decisión | 29 passing |
| `categorias-checklist.cy.js` | **CP-CHK-CAT-01**: flujo de extremo a extremo de 14 pasos | 1 passing |
| `categorias-duplicado.cy.js` | **CP-CHK-CAT-02**: rechazo de nombre duplicado (defecto BUG-05-03) | 1 failing (intencional) |

```powershell
cd artifacts/finanzapro
$env:ELECTRON_RUN_AS_NODE=$null
npx cypress run --spec cypress/e2e/categorias-checklist.cy.js
npx cypress run --spec cypress/e2e/categorias-duplicado.cy.js
npx cypress run --spec cypress/e2e/categorias.cy.js
```

### CP-CHK-CAT-01 — flujo completo (pasa)

Navega a `/categories` y valida URL exacta, título de la pestaña (`FinanzaPro`), enlaces del menú, encabezado y subtítulo, y estilos CSS del `<h1>` (`font-family: Inter, sans-serif`, `color: rgb(15, 23, 41)`). Abre el formulario "Nueva Categoría", verifica sus campos y el dropdown de Tipo (Ingreso, Gasto, Ambos), selecciona "Gasto", llena nombre y color, guarda y comprueba el mensaje "Categoría creada correctamente" y el `background-color` del círculo creado. Por último reabre el formulario y guarda sin escribir nada: debe mostrarse "El nombre es obligatorio" con el diálogo todavía abierto.

**Ejecución en el Test Runner:**

![Ejecución de CP-CHK-CAT-01 en el Test Runner](evidencias/categorias/01_ejecucion_cypress.png)

**Creación exitosa** (toast de confirmación):

![Categoría creada correctamente](evidencias/categorias/02_exito_creacion.png)

**Envío vacío** (validación de nombre obligatorio):

![Error de nombre obligatorio](evidencias/categorias/03_error_nombre_obligatorio.png)

### CP-CHK-CAT-02 — nombre duplicado (falla, defecto BUG-05-03)

Crea por API la categoría `ChecklistDuplicada01`, intenta crear otra con el mismo nombre desde la interfaz y espera el mensaje "Ya existe una categoría con ese nombre". La aplicación **no valida nombres duplicados**: acepta el registro y muestra "Categoría creada correctamente", por lo que la aserción final falla. Ese fallo es la evidencia automatizada del defecto y no debe "arreglarse" en la prueba.

**Ejecución en el Test Runner (falla en la aserción del mensaje):**

![Ejecución de CP-CHK-CAT-02 con falla](evidencias/categorias/04_ejecucion_duplicado_falla.png)

**Duplicado aceptado** (dos tarjetas `ChecklistDuplicada01` en el listado):

![Duplicado aceptado por la aplicación](evidencias/categorias/05_duplicado_aceptado.png)

### Limpieza de datos

Los dos specs nuevos borran por API, en `before` y `after`, solo las categorías cuyo nombre empieza con `Checklist`. `categorias.cy.js` no limpia los datos que crea.

### Capturas de evidencia

Las generan `cy.screenshot` y se guardan en `evidencias/categorias/`.
