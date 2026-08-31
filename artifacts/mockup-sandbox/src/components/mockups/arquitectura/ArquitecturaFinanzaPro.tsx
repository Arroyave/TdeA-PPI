export default function ArquitecturaFinanzaPro() {
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#0f172a", minHeight: "100vh", padding: "32px 28px", color: "#f1f5f9" }}>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#38bdf8", letterSpacing: 1 }}>FinanzaPro — Arquitectura del Sistema</div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Patrón: Arquitectura en Capas (N-Tier) + Cliente-Servidor + REST API</div>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

        {/* ── LEFT: Physical Architecture ── */}
        <div style={{ flex: 1 }}>
          <SectionTitle>🏗 Arquitectura Física</SectionTitle>

          {/* Client tier */}
          <Tier color="#0ea5e9" label="CAPA DE PRESENTACIÓN · Cliente">
            <Node icon="🌐" title="Navegador Web" color="#0ea5e9">
              <Tag>Chrome · Firefox · Edge · Safari</Tag>
              <Tag>Dispositivo: PC / Tablet / Móvil</Tag>
              <Tag>HTTPS · TLS 1.3</Tag>
            </Node>
          </Tier>

          <Arrow label="HTTPS / TLS 1.3" />

          {/* Proxy */}
          <Tier color="#8b5cf6" label="CAPA DE RED · Proxy Reverso">
            <Node icon="🔀" title="Proxy Reverso" color="#8b5cf6">
              <Tag>Puerto :80</Tag>
              <Tag>/  →  Frontend</Tag>
              <Tag>/api/…  →  API Server</Tag>
            </Node>
          </Tier>

          <div style={{ display: "flex", gap: 10, margin: "6px 0" }}>
            <ArrowBranch label="Ruta /" />
            <ArrowBranch label="Ruta /api" />
          </div>

          {/* App tier */}
          <Tier color="#10b981" label="CAPA DE APLICACIÓN · Servidor">
            <Node icon="⚛️" title="Frontend Service" color="#10b981">
              <Tag>React 18 + Vite</Tag>
              <Tag>TypeScript 5.9</Tag>
              <Tag>TailwindCSS · Recharts</Tag>
              <Tag>Puerto dinámico</Tag>
            </Node>
            <Node icon="⚙️" title="API Server" color="#10b981">
              <Tag>Node.js 24 · Express 5</Tag>
              <Tag>TypeScript 5.9</Tag>
              <Tag>Drizzle ORM · Zod</Tag>
              <Tag>Puerto :8080</Tag>
            </Node>
          </Tier>

          <Arrow label="TCP/IP · Puerto 5432" />

          {/* Data tier */}
          <Tier color="#f59e0b" label="CAPA DE DATOS · Base de Datos">
            <Node icon="🗄️" title="PostgreSQL 15" color="#f59e0b">
              <Tag>Tabla: categories</Tag>
              <Tag>Tabla: movements</Tag>
              <Tag>Tabla: profile</Tag>
            </Node>
          </Tier>
        </div>

        {/* ── RIGHT: Logical Architecture ── */}
        <div style={{ flex: 1 }}>
          <SectionTitle>🧩 Arquitectura Lógica</SectionTitle>

          {/* Frontend layers */}
          <div style={{ marginBottom: 10 }}>
            <LayerLabel color="#0ea5e9">Frontend — React + Vite</LayerLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 6 }}>
              <LogicalNode color="#0ea5e9" title="Vistas (Pages)" items={["dashboard.tsx", "movements.tsx", "categories.tsx", "profile.tsx", "new-movement.tsx"]} />
              <LogicalNode color="#38bdf8" title="Componentes UI" items={["Layout / Sidebar", "Cards de resumen", "Gráficas (Recharts)", "Formularios", "Filtros"]} />
              <LogicalNode color="#7dd3fc" title="Gestión de Estado" items={["TanStack React Query", "Hooks auto-generados", "Caché de respuestas", "Mutaciones optimistas"]} />
              <LogicalNode color="#bae6fd" title="Utilidades (lib/)" items={["format.ts (moneda)", "Wouter (routing)", "Intl API (locale)", "cn() (clases CSS)"]} />
            </div>
          </div>

          {/* API Contract */}
          <div style={{ margin: "10px 0" }}>
            <LayerLabel color="#8b5cf6">Contrato API — OpenAPI 3.1</LayerLabel>
            <div style={{ background: "#1e1b4b", borderRadius: 8, padding: "8px 12px", marginTop: 6, border: "1px solid #4c1d95" }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["GET /api/movements", "POST /api/movements", "PUT /api/movements/:id", "DELETE /api/movements/:id",
                  "GET /api/categories", "POST /api/categories", "GET /api/profile", "PUT /api/profile",
                  "GET /api/dashboard/summary", "GET /api/dashboard/trend", "GET /api/dashboard/by-category", "GET /api/dashboard/recent"
                ].map(e => (
                  <span key={e} style={{ background: "#312e81", borderRadius: 4, padding: "2px 7px", fontSize: 10, color: "#c4b5fd", fontFamily: "monospace" }}>{e}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Backend layers */}
          <div style={{ marginBottom: 10 }}>
            <LayerLabel color="#10b981">Backend — Express 5 / Node.js</LayerLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 6 }}>
              <LogicalNode color="#10b981" title="Rutas (Routes)" items={["movements.ts", "categories.ts", "dashboard.ts", "profile.ts"]} />
              <LogicalNode color="#34d399" title="Validación (Zod)" items={["CreateMovementBody", "UpdateMovementBody", "CreateCategoryBody", "UpdateProfileBody"]} />
              <LogicalNode color="#6ee7b7" title="ORM (Drizzle)" items={["schema/movements", "schema/categories", "schema/profile", "Consultas tipadas"]} />
              <LogicalNode color="#a7f3d0" title="Generación de Código" items={["OpenAPI → Zod (api-zod)", "OpenAPI → Hooks (api-client-react)", "Orval codegen", "pnpm-workspace"]} />
            </div>
          </div>

          {/* DB schema */}
          <div>
            <LayerLabel color="#f59e0b">Base de Datos — PostgreSQL</LayerLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 6 }}>
              <DBTable title="categories" color="#f59e0b" fields={["id (PK)", "name", "type", "color", "icon", "created_at"]} />
              <DBTable title="movements" color="#fbbf24" fields={["id (PK)", "type", "amount", "description", "date", "category_id (FK)", "notes", "created_at"]} />
              <DBTable title="profile" color="#fcd34d" fields={["id (PK)", "name", "type", "currency", "email", "created_at"]} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom: Design Pattern + Legend ── */}
      <div style={{ marginTop: 20, display: "flex", gap: 16 }}>
        <div style={{ flex: 2, background: "#1e293b", borderRadius: 10, padding: "12px 16px", border: "1px solid #334155" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>📐 Patrón de Diseño Aplicado</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { name: "Arquitectura N-Tier", desc: "Separación en capas: Presentación → Aplicación → Datos" },
              { name: "Cliente-Servidor", desc: "Frontend desacoplado del backend mediante REST API" },
              { name: "Contract-First API", desc: "OpenAPI 3.1 define el contrato antes de implementar" },
              { name: "Monorepo (pnpm)", desc: "Paquetes compartidos: db, api-spec, api-zod, api-client-react" },
            ].map(p => (
              <div key={p.name} style={{ background: "#0f172a", borderRadius: 6, padding: "6px 10px", minWidth: 180, borderLeft: "3px solid #38bdf8" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8" }}>{p.name}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, background: "#1e293b", borderRadius: 10, padding: "12px 16px", border: "1px solid #334155" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>🔑 Referencias</div>
          {[
            { color: "#0ea5e9", label: "Capa de Presentación" },
            { color: "#8b5cf6", label: "Capa de Red / Proxy" },
            { color: "#10b981", label: "Capa de Aplicación" },
            { color: "#f59e0b", label: "Capa de Datos" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: l.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "#cbd5e1" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 700, color: "#cbd5e1", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "1px solid #1e293b", paddingBottom: 4 }}>
      {children}
    </div>
  );
}

function Tier({ color, label, children }: { color: string; label: string; children: React.ReactNode }) {
  return (
    <div style={{ border: `1.5px solid ${color}40`, borderRadius: 10, padding: "8px 10px", marginBottom: 2, background: `${color}08` }}>
      <div style={{ fontSize: 9, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", gap: 8 }}>{children}</div>
    </div>
  );
}

function Node({ icon, title, color, children }: { icon: string; title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, background: "#1e293b", borderRadius: 8, padding: "8px 10px", border: `1px solid ${color}50` }}>
      <div style={{ fontSize: 13, marginBottom: 4 }}>{icon} <span style={{ fontSize: 12, fontWeight: 700, color }}>{title}</span></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>{children}</div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 10, background: "#0f172a", borderRadius: 4, padding: "1px 6px", color: "#94a3b8", display: "inline-block" }}>{children}</span>;
}

function Arrow({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "4px 0" }}>
      <div style={{ width: 2, height: 14, background: "#475569" }} />
      <div style={{ fontSize: 9, color: "#64748b", background: "#1e293b", padding: "1px 6px", borderRadius: 3 }}>{label}</div>
      <div style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "7px solid #475569" }} />
    </div>
  );
}

function ArrowBranch({ label }: { label: string }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontSize: 9, color: "#64748b" }}>{label}</div>
      <div style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "7px solid #475569" }} />
    </div>
  );
}

function LayerLabel({ color, children }: { color: string; children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 0.8 }}>{children}</div>;
}

function LogicalNode({ color, title, items }: { color: string; title: string; items: string[] }) {
  return (
    <div style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px", border: `1px solid ${color}40` }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 5 }}>{title}</div>
      {items.map(i => (
        <div key={i} style={{ fontSize: 10, color: "#94a3b8", paddingLeft: 6, borderLeft: `2px solid ${color}60`, marginBottom: 2 }}>{i}</div>
      ))}
    </div>
  );
}

function DBTable({ title, color, fields }: { title: string; color: string; fields: string[] }) {
  return (
    <div style={{ background: "#1e293b", borderRadius: 8, overflow: "hidden", border: `1px solid ${color}50` }}>
      <div style={{ background: color, padding: "4px 8px", fontSize: 10, fontWeight: 700, color: "#1e293b" }}>{title}</div>
      {fields.map(f => (
        <div key={f} style={{ padding: "2px 8px", fontSize: 9, color: "#94a3b8", borderBottom: "1px solid #0f172a" }}>{f}</div>
      ))}
    </div>
  );
}
