# FinanzaPro — Guía de ejecución local

## 1. Requisitos

Instala en tu equipo:

- **Node.js 24 LTS** o una versión compatible reciente.
- **pnpm 10 o superior**.
- **PostgreSQL 13 o superior**.
- **Visual Studio Code** (recomendado).

Verifica las instalaciones:

```bash
node --version
pnpm --version
psql --version
```

## 2. Descargar y abrir el proyecto

1. Descarga `finanzapro-vscode.zip`.
2. Descomprímelo en una carpeta de trabajo.
3. Abre esa carpeta desde Visual Studio Code.
4. Abre una terminal en la carpeta raíz del proyecto.

La carpeta raíz es la que contiene `package.json`, `pnpm-workspace.yaml` y las carpetas `artifacts` y `lib`.

## 3. Crear la base de datos

En PostgreSQL crea una base de datos, por ejemplo:

```sql
CREATE DATABASE finanzapro;
```

Después ejecuta los scripts incluidos en `scripts/sql`, en este orden:

```bash
psql -U postgres -d finanzapro -f scripts/sql/01_crear_tablas.sql
psql -U postgres -d finanzapro -f scripts/sql/02_insertar_datos.sql
```

Si tu instalación requiere especificar el servidor o el puerto:

```bash
psql -h localhost -p 5432 -U postgres -d finanzapro -f scripts/sql/01_crear_tablas.sql
psql -h localhost -p 5432 -U postgres -d finanzapro -f scripts/sql/02_insertar_datos.sql
```

## 4. Configurar la conexión

Define estas variables de entorno en la terminal.

### Windows PowerShell

```powershell
$env:DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/finanzapro"
$env:PORT="3001"
```

### macOS o Linux

```bash
export DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/finanzapro"
export PORT="3001"
```

Reemplaza `TU_PASSWORD` por la contraseña configurada en PostgreSQL.

## 5. Instalar dependencias

Desde la raíz del proyecto:

```bash
pnpm install
```

El instalador del proyecto está preparado para Windows y no requiere tener
instalado Git Bash, WSL ni otro intérprete de comandos Unix.

### Si aparece `Cannot find module @rollup/rollup-win32-x64-msvc`

Este mensaje indica que las dependencias se instalaron con una versión anterior
del proyecto que no incluía el binario de Rollup para Windows. En PowerShell,
desde la carpeta raíz, elimina únicamente las dependencias instaladas y vuelve
a instalarlas:

```powershell
Remove-Item -Recurse -Force node_modules
pnpm install
```

No elimines `pnpm-lock.yaml`. La configuración actual permite que pnpm instale
automáticamente el paquete nativo correcto para Windows.

### Si pnpm muestra `ERR_PNPM_IGNORED_BUILDS`

Las versiones recientes de pnpm bloquean por seguridad los scripts nativos de
algunas dependencias. En este proyecto solo es necesario autorizar `esbuild`.
Desde la carpeta raíz, ejecuta:

```powershell
pnpm approve-builds
```

En la pantalla interactiva selecciona `esbuild` con la barra espaciadora y
confirma con `Enter`. Después ejecuta:

```powershell
pnpm rebuild esbuild
pnpm install
```

No es necesario habilitar todos los scripts de todas las dependencias.

## 6. Ejecutar la aplicación

Necesitas dos terminales abiertas en la raíz del proyecto.

### Terminal 1 — API

Configura `DATABASE_URL` y `PORT` como se indica arriba y ejecuta:

```bash
pnpm --filter @workspace/api-server run dev
```

El comando de desarrollo de la API es compatible con Windows; no requiere
Git Bash, WSL ni el comando Unix `export`.

La API quedará disponible en:

```text
http://localhost:3001/api
```

### Terminal 2 — Frontend

En la segunda terminal define las variables del frontend:

#### Windows PowerShell

```powershell
$env:PORT="5173"
$env:BASE_PATH="/"
$env:API_URL="http://localhost:3001"
```

#### macOS o Linux

```bash
export PORT="5173"
export BASE_PATH="/"
export API_URL="http://localhost:3001"
```

Ejecuta:

```bash
pnpm --filter @workspace/finanzapro run dev
```

Abre en el navegador la dirección que muestre Vite, normalmente:

```text
http://localhost:5173
```

## 7. Comandos útiles

Comprobar tipos:

```bash
pnpm run typecheck
```

Crear una compilación de producción del frontend:

```bash
pnpm --filter @workspace/finanzapro run build
```

Si modificas el contrato OpenAPI:

```bash
pnpm --filter @workspace/api-spec run codegen
```

## 8. Problemas frecuentes

- **`DATABASE_URL must be set`**: configura la variable de entorno en la misma terminal donde inicias la API.
- **Error de conexión a PostgreSQL**: confirma que el servicio de PostgreSQL está iniciado, que el puerto es `5432` y que la contraseña es correcta.
- **`PORT environment variable is required`**: define `PORT=3001` antes de iniciar la API.
- **El frontend no muestra datos**: inicia primero la API y confirma que la base de datos tenga las tablas y los datos de ejemplo.
- **`pnpm` no se reconoce**: instala pnpm o habilítalo con `corepack enable`.

### Verificar la base de datos desde Windows

En una terminal PowerShell independiente, confirma que PostgreSQL responde:

```powershell
psql -h localhost -p 5432 -U postgres -d finanzapro -c "SELECT current_database(), current_user;"
```

Confirma que existan las tablas:

```powershell
psql -h localhost -p 5432 -U postgres -d finanzapro -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
```

Confirma que existan movimientos:

```powershell
psql -h localhost -p 5432 -U postgres -d finanzapro -c "SELECT COUNT(*) AS movimientos FROM movements;"
```

Si la tabla `movements` no existe, ejecuta nuevamente los scripts, en este orden:

```powershell
psql -h localhost -p 5432 -U postgres -d finanzapro -f scripts/sql/01_crear_tablas.sql
psql -h localhost -p 5432 -U postgres -d finanzapro -f scripts/sql/02_insertar_datos.sql
```

La base de datos local es independiente de la base de datos del entorno
original. Los movimientos del entorno original no aparecen automáticamente en
PostgreSQL local; debes importarlos mediante el segundo script o registrarlos
desde la aplicación.