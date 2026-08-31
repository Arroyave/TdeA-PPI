-- ============================================================
-- FinanzaPro - Script de inserción de datos iniciales
-- ============================================================
-- Ejecutar DESPUÉS del script 01_crear_tablas.sql
-- Incluye categorías predeterminadas, perfil inicial y
-- movimientos de ejemplo para el mes actual.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Categorías predeterminadas
-- ------------------------------------------------------------
INSERT INTO categories (name, type, color, icon) VALUES
    ('Salario',         'income',  '#10b981', 'briefcase'),
    ('Freelance',       'income',  '#6366f1', 'laptop'),
    ('Inversiones',     'income',  '#f59e0b', 'trending-up'),
    ('Alimentación',    'expense', '#ef4444', 'utensils'),
    ('Transporte',      'expense', '#f97316', 'car'),
    ('Servicios',       'expense', '#8b5cf6', 'zap'),
    ('Entretenimiento', 'expense', '#ec4899', 'film'),
    ('Salud',           'expense', '#14b8a6', 'heart'),
    ('Educación',       'both',    '#3b82f6', 'book')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 2. Perfil del usuario (un solo registro)
-- ------------------------------------------------------------
INSERT INTO profile (name, type, currency, email) VALUES
    ('Usuario FinanzaPro', 'personal', 'COP', NULL)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 3. Movimientos de ejemplo
-- ------------------------------------------------------------
-- Mes actual (abril 2026)
INSERT INTO movements (type, amount, description, date, category_id, notes) VALUES
    ('income',  3500000.00, 'Salario mensual',                  '2026-04-01', 1, 'Nómina de abril'),
    ('income',   800000.00, 'Proyecto freelance - sitio web',   '2026-04-03', 2, 'Cliente García & Co'),
    ('expense',  120000.00, 'Supermercado',                     '2026-04-02', 4, NULL),
    ('expense',   45000.00, 'Gasolina',                         '2026-04-04', 5, NULL),
    ('expense',   60000.00, 'Electricidad y agua',              '2026-04-05', 6, 'Factura mensual'),
    ('expense',   35000.00, 'Netflix y Spotify',                '2026-04-05', 7, NULL),
    ('income',   250000.00, 'Dividendos',                       '2026-04-06', 3, 'Cartera de inversión'),
    ('expense',   80000.00, 'Consulta médica',                  '2026-04-06', 8, NULL),
    ('expense',  200000.00, 'Curso online',                     '2026-04-06', 9, 'Curso de finanzas personales'),
    ('expense',   95000.00, 'Restaurante',                      '2026-04-04', 7, 'Cena familiar');

-- Mes anterior (marzo 2026)
INSERT INTO movements (type, amount, description, date, category_id, notes) VALUES
    ('income',  3500000.00, 'Salario mensual',          '2026-03-01', 1, 'Nómina de marzo'),
    ('expense',  110000.00, 'Supermercado',             '2026-03-10', 4, NULL),
    ('expense',   40000.00, 'Transporte público',       '2026-03-15', 5, NULL),
    ('income',   500000.00, 'Freelance - diseño',       '2026-03-20', 2, NULL),
    ('expense',   55000.00, 'Farmacia',                 '2026-03-25', 8, NULL);
