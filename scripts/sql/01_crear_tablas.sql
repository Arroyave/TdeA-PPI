-- ============================================================
-- FinanzaPro - Script de creación de base de datos
-- ============================================================
-- Ejecutar este script primero para crear la estructura de tablas.
-- Compatible con PostgreSQL 13+
-- ============================================================

-- Tabla: categorías
-- Almacena las categorías para clasificar los movimientos financieros.
CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    type        TEXT NOT NULL DEFAULT 'both',   -- 'income' | 'expense' | 'both'
    color       TEXT NOT NULL DEFAULT '#6366f1',
    icon        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla: perfil de usuario
-- Almacena la configuración general del usuario o empresa.
-- Solo se usa un registro (perfil único).
CREATE TABLE IF NOT EXISTS profile (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    type        TEXT NOT NULL DEFAULT 'personal',  -- 'personal' | 'business'
    currency    TEXT NOT NULL DEFAULT 'COP',
    email       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla: movimientos financieros
-- Registra cada ingreso o gasto del usuario.
CREATE TABLE IF NOT EXISTS movements (
    id          SERIAL PRIMARY KEY,
    type        TEXT NOT NULL,                     -- 'income' | 'expense'
    amount      NUMERIC(14, 2) NOT NULL,
    description TEXT NOT NULL,
    date        TEXT NOT NULL,                     -- Formato YYYY-MM-DD
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para mejorar el rendimiento de consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_movements_type      ON movements(type);
CREATE INDEX IF NOT EXISTS idx_movements_date      ON movements(date);
CREATE INDEX IF NOT EXISTS idx_movements_category  ON movements(category_id);
