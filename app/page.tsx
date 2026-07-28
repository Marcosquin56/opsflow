"use client";

import { FormEvent, useMemo, useState } from "react";

type Role = "Administrador" | "Analista" | "Solicitante";
type Status = "Nuevo" | "En análisis" | "En progreso" | "Resuelto";
type Priority = "Crítica" | "Alta" | "Media" | "Baja";
type View = "dashboard" | "requests" | "team" | "analytics";

type Activity = {
  author: string;
  action: string;
  time: string;
};

type RequestItem = {
  id: string;
  title: string;
  category: string;
  requester: string;
  requesterInitials: string;
  assignee: string;
  assigneeInitials: string;
  status: Status;
  priority: Priority;
  created: string;
  updated: string;
  due: string;
  description: string;
  activity: Activity[];
};

const team = [
  {
    name: "Marcos Quintana",
    initials: "MQ",
    role: "Administrador",
    area: "Automatización",
    active: 4,
    resolved: 18,
    color: "violet",
  },
  {
    name: "Lucía Benítez",
    initials: "LB",
    role: "Analista",
    area: "Finanzas",
    active: 3,
    resolved: 23,
    color: "blue",
  },
  {
    name: "Diego Ferreira",
    initials: "DF",
    role: "Analista",
    area: "Operaciones",
    active: 2,
    resolved: 16,
    color: "orange",
  },
  {
    name: "Sofía Acosta",
    initials: "SA",
    role: "Solicitante",
    area: "Recursos Humanos",
    active: 1,
    resolved: 7,
    color: "green",
  },
];

const initialRequests: RequestItem[] = [
  {
    id: "OPS-1842",
    title: "Automatizar conciliación del reporte mensual",
    category: "Automatización",
    requester: "Sofía Acosta",
    requesterInitials: "SA",
    assignee: "Marcos Quintana",
    assigneeInitials: "MQ",
    status: "En progreso",
    priority: "Alta",
    created: "22 jul",
    updated: "hace 18 min",
    due: "Hoy, 17:00",
    description:
      "El equipo necesita validar y consolidar tres archivos de Excel antes del cierre mensual. El proceso actual toma cerca de dos horas y genera errores de formato.",
    activity: [
      {
        author: "Marcos Quintana",
        action: "movió la solicitud a En progreso",
        time: "hace 18 min",
      },
      {
        author: "Lucía Benítez",
        action: "adjuntó el ejemplo de salida esperado",
        time: "hace 2 h",
      },
      {
        author: "Sofía Acosta",
        action: "creó la solicitud",
        time: "22 jul, 09:14",
      },
    ],
  },
  {
    id: "OPS-1841",
    title: "Error al generar facturas del proveedor",
    category: "Incidente",
    requester: "Diego Ferreira",
    requesterInitials: "DF",
    assignee: "Lucía Benítez",
    assigneeInitials: "LB",
    status: "En análisis",
    priority: "Crítica",
    created: "22 jul",
    updated: "hace 42 min",
    due: "Hoy, 14:30",
    description:
      "La generación por lote se detiene al procesar documentos con una referencia de compra duplicada. Hay 28 facturas pendientes.",
    activity: [
      {
        author: "Lucía Benítez",
        action: "comenzó el análisis del incidente",
        time: "hace 42 min",
      },
      {
        author: "Diego Ferreira",
        action: "creó la solicitud",
        time: "22 jul, 08:25",
      },
    ],
  },
  {
    id: "OPS-1839",
    title: "Nuevo acceso para el equipo de compras",
    category: "Accesos",
    requester: "Sofía Acosta",
    requesterInitials: "SA",
    assignee: "Diego Ferreira",
    assigneeInitials: "DF",
    status: "Nuevo",
    priority: "Media",
    created: "21 jul",
    updated: "hace 3 h",
    due: "Mañana, 12:00",
    description:
      "Solicitar acceso de consulta al módulo de órdenes para cuatro integrantes nuevos del equipo de compras.",
    activity: [
      {
        author: "Sofía Acosta",
        action: "creó la solicitud",
        time: "21 jul, 16:02",
      },
    ],
  },
  {
    id: "OPS-1836",
    title: "Actualizar plantilla de carga de clientes",
    category: "Mejora",
    requester: "Lucía Benítez",
    requesterInitials: "LB",
    assignee: "Marcos Quintana",
    assigneeInitials: "MQ",
    status: "En progreso",
    priority: "Media",
    created: "20 jul",
    updated: "ayer",
    due: "25 jul",
    description:
      "Agregar validaciones de país, moneda y condición de pago a la plantilla que utiliza el equipo comercial.",
    activity: [
      {
        author: "Marcos Quintana",
        action: "publicó una primera versión para pruebas",
        time: "ayer, 15:20",
      },
      {
        author: "Lucía Benítez",
        action: "creó la solicitud",
        time: "20 jul, 11:47",
      },
    ],
  },
  {
    id: "OPS-1832",
    title: "Corregir envío duplicado de notificaciones",
    category: "Incidente",
    requester: "Diego Ferreira",
    requesterInitials: "DF",
    assignee: "Marcos Quintana",
    assigneeInitials: "MQ",
    status: "Resuelto",
    priority: "Alta",
    created: "18 jul",
    updated: "19 jul",
    due: "Completado",
    description:
      "Algunos usuarios recibían dos correos cuando una solicitud cambiaba de responsable.",
    activity: [
      {
        author: "Marcos Quintana",
        action: "resolvió la solicitud",
        time: "19 jul, 10:05",
      },
      {
        author: "Diego Ferreira",
        action: "creó la solicitud",
        time: "18 jul, 14:31",
      },
    ],
  },
  {
    id: "OPS-1828",
    title: "Incorporar filtro por centro de costos",
    category: "Mejora",
    requester: "Lucía Benítez",
    requesterInitials: "LB",
    assignee: "Lucía Benítez",
    assigneeInitials: "LB",
    status: "Resuelto",
    priority: "Baja",
    created: "16 jul",
    updated: "18 jul",
    due: "Completado",
    description:
      "Agregar un filtro adicional al reporte operativo para facilitar la revisión por unidad de negocio.",
    activity: [
      {
        author: "Lucía Benítez",
        action: "resolvió la solicitud",
        time: "18 jul, 12:12",
      },
      {
        author: "Lucía Benítez",
        action: "creó la solicitud",
        time: "16 jul, 09:06",
      },
    ],
  },
];

const roleProfiles: Record<
  Role,
  { name: string; initials: string; helper: string }
> = {
  Administrador: {
    name: "Marcos Quintana",
    initials: "MQ",
    helper: "Acceso completo",
  },
  Analista: {
    name: "Lucía Benítez",
    initials: "LB",
    helper: "Gestión asignada",
  },
  Solicitante: {
    name: "Sofía Acosta",
    initials: "SA",
    helper: "Vista personal",
  },
};

const navItems: { id: View; label: string; icon: string }[] = [
  { id: "dashboard", label: "Resumen", icon: "⌂" },
  { id: "requests", label: "Solicitudes", icon: "▤" },
  { id: "team", label: "Equipo", icon: "◉" },
  { id: "analytics", label: "Métricas", icon: "↗" },
];

const statusOrder: Status[] = [
  "Nuevo",
  "En análisis",
  "En progreso",
  "Resuelto",
];

function priorityClass(priority: Priority) {
  return `priority priority-${priority.toLowerCase().replace("í", "i")}`;
}

function statusClass(status: Status) {
  return `status status-${status
    .toLowerCase()
    .replace(" ", "-")
    .replace("á", "a")}`;
}

function Avatar({
  initials,
  color = "violet",
  small = false,
}: {
  initials: string;
  color?: string;
  small?: boolean;
}) {
  return (
    <span
      className={`avatar avatar-${color}${small ? " avatar-small" : ""}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export default function Home() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [role, setRole] = useState<Role>("Administrador");
  const [requests, setRequests] = useState(initialRequests);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"Todas" | Status>("Todas");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showRoles, setShowRoles] = useState(false);
  const [toast, setToast] = useState("");

  const profile = roleProfiles[role];
  const selected = requests.find((request) => request.id === selectedId) ?? null;

  const visibleRequests = useMemo(() => {
    const roleFiltered = requests.filter((request) => {
      if (role === "Solicitante") return request.requesterInitials === "SA";
      if (role === "Analista") return request.assigneeInitials === "LB";
      return true;
    });

    return roleFiltered.filter((request) => {
      const matchesStatus = filter === "Todas" || request.status === filter;
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        request.title.toLowerCase().includes(term) ||
        request.id.toLowerCase().includes(term) ||
        request.category.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [filter, requests, role, search]);

  const metrics = useMemo(() => {
    const open = requests.filter((request) => request.status !== "Resuelto");
    const critical = open.filter((request) => request.priority === "Crítica");
    const progress = open.filter(
      (request) =>
        request.status === "En progreso" || request.status === "En análisis",
    );
    return {
      open: open.length,
      critical: critical.length,
      progress: progress.length,
      resolved: requests.filter((request) => request.status === "Resuelto").length,
    };
  }, [requests]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function changeStatus(nextStatus: Status) {
    if (!selected) return;
    setRequests((current) =>
      current.map((request) =>
        request.id === selected.id
          ? {
              ...request,
              status: nextStatus,
              updated: "ahora",
              activity: [
                {
                  author: profile.name,
                  action: `movió la solicitud a ${nextStatus}`,
                  time: "ahora",
                },
                ...request.activity,
              ],
            }
          : request,
      ),
    );
    notify(`Solicitud actualizada a “${nextStatus}”`);
  }

  function createRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nextNumber =
      Math.max(...requests.map((request) => Number(request.id.split("-")[1]))) + 1;
    const newRequest: RequestItem = {
      id: `OPS-${nextNumber}`,
      title: String(data.get("title")),
      category: String(data.get("category")),
      requester: profile.name,
      requesterInitials: profile.initials,
      assignee: "Sin asignar",
      assigneeInitials: "—",
      status: "Nuevo",
      priority: String(data.get("priority")) as Priority,
      created: "ahora",
      updated: "ahora",
      due: "Por definir",
      description: String(data.get("description")),
      activity: [
        {
          author: profile.name,
          action: "creó la solicitud",
          time: "ahora",
        },
      ],
    };

    setRequests((current) => [newRequest, ...current]);
    setShowCreate(false);
    setSelectedId(newRequest.id);
    setActiveView("requests");
    notify(`${newRequest.id} creada correctamente`);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">O</span>
          <div>
            <strong>OpsFlow</strong>
            <span>Service workspace</span>
          </div>
        </div>

        <nav className="side-nav" aria-label="Navegación principal">
          <span className="nav-label">Espacio de trabajo</span>
          {navItems.map((item) => (
            <button
              className={activeView === item.id ? "active" : ""}
              key={item.id}
              onClick={() => setActiveView(item.id)}
              type="button"
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
              {item.id === "requests" && <small>{metrics.open}</small>}
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <div className="demo-note">
          <span className="pulse-dot" />
          <div>
            <strong>Entorno demo</strong>
            <p>Datos ficticios para explorar el producto.</p>
          </div>
        </div>

        <button
          className="profile-button"
          onClick={() => setShowRoles((current) => !current)}
          type="button"
          aria-expanded={showRoles}
        >
          <Avatar initials={profile.initials} />
          <span>
            <strong>{profile.name}</strong>
            <small>{role}</small>
          </span>
          <b aria-hidden="true">⌄</b>
        </button>

        {showRoles && (
          <div className="role-menu">
            <p>Probar como</p>
            {(Object.keys(roleProfiles) as Role[]).map((item) => (
              <button
                className={role === item ? "selected" : ""}
                key={item}
                onClick={() => {
                  setRole(item);
                  setShowRoles(false);
                  setSelectedId(null);
                  notify(`Vista cambiada a ${item}`);
                }}
                type="button"
              >
                <span>{roleProfiles[item].initials}</span>
                <div>
                  <strong>{item}</strong>
                  <small>{roleProfiles[item].helper}</small>
                </div>
                {role === item && <b>✓</b>}
              </button>
            ))}
          </div>
        )}
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">O</span>
            <strong>OpsFlow</strong>
          </div>
          <label className="global-search">
            <span aria-hidden="true">⌕</span>
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por título, ID o categoría..."
              value={search}
            />
            <kbd>⌘ K</kbd>
          </label>
          <div className="top-actions">
            <span className="demo-pill">Demo interactiva</span>
            <button
              className="icon-button notification-button"
              aria-label="Notificaciones"
              type="button"
            >
              ♧
              <span />
            </button>
            <button
              className="primary-button"
              onClick={() => setShowCreate(true)}
              type="button"
            >
              <span aria-hidden="true">＋</span>
              Nueva solicitud
            </button>
          </div>
        </header>

        {activeView === "dashboard" && (
          <Dashboard
            metrics={metrics}
            requests={requests}
            setActiveView={setActiveView}
            setSelectedId={setSelectedId}
          />
        )}

        {activeView === "requests" && (
          <RequestsView
            filter={filter}
            requests={visibleRequests}
            role={role}
            setFilter={setFilter}
            setSelectedId={setSelectedId}
          />
        )}

        {activeView === "team" && <TeamView />}
        {activeView === "analytics" && <AnalyticsView requests={requests} />}
      </main>

      {selected && (
        <RequestDrawer
          close={() => setSelectedId(null)}
          onStatusChange={changeStatus}
          request={selected}
          role={role}
        />
      )}

      {showCreate && (
        <CreateModal close={() => setShowCreate(false)} submit={createRequest} />
      )}

      {toast && (
        <div className="toast" role="status">
          <span>✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}

function Dashboard({
  metrics,
  requests,
  setActiveView,
  setSelectedId,
}: {
  metrics: {
    open: number;
    critical: number;
    progress: number;
    resolved: number;
  };
  requests: RequestItem[];
  setActiveView: (view: View) => void;
  setSelectedId: (id: string) => void;
}) {
  const openRequests = requests.filter((request) => request.status !== "Resuelto");

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Martes, 28 de julio</p>
          <h1>Buenas tardes, Marcos.</h1>
          <p>Este es el estado de las operaciones en este momento.</p>
        </div>
        <div className="heading-badge">
          <span className="pulse-dot" />
          Operación estable
        </div>
      </section>

      <section className="metrics-grid" aria-label="Indicadores principales">
        <MetricCard
          detail="+2 desde ayer"
          icon="↗"
          label="Solicitudes abiertas"
          tone="violet"
          value={metrics.open}
        />
        <MetricCard
          detail="requiere atención"
          icon="!"
          label="Prioridad crítica"
          tone="red"
          value={metrics.critical}
        />
        <MetricCard
          detail="dentro del SLA"
          icon="⌁"
          label="En tratamiento"
          tone="blue"
          value={metrics.progress}
        />
        <MetricCard
          detail="esta semana"
          icon="✓"
          label="Resueltas"
          tone="green"
          value={metrics.resolved + 12}
        />
      </section>

      <section className="dashboard-grid">
        <article className="panel request-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Cola de trabajo</span>
              <h2>Solicitudes recientes</h2>
            </div>
            <button onClick={() => setActiveView("requests")} type="button">
              Ver todas <span>→</span>
            </button>
          </div>
          <div className="request-list">
            {openRequests.slice(0, 4).map((request) => (
              <button
                className="request-row"
                key={request.id}
                onClick={() => setSelectedId(request.id)}
                type="button"
              >
                <span className={priorityClass(request.priority)} />
                <span className="request-main">
                  <strong>{request.title}</strong>
                  <small>
                    {request.id} · {request.category}
                  </small>
                </span>
                <span className={statusClass(request.status)}>
                  {request.status}
                </span>
                <span className="request-owner">
                  <Avatar initials={request.assigneeInitials} small />
                  <small>{request.updated}</small>
                </span>
                <span className="row-arrow">›</span>
              </button>
            ))}
          </div>
        </article>

        <article className="panel sla-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Nivel de servicio</span>
              <h2>Cumplimiento SLA</h2>
            </div>
            <span className="period">Últimos 30 días</span>
          </div>
          <div className="sla-score">
            <div className="sla-ring">
              <span>94%</span>
              <small>objetivo 90%</small>
            </div>
            <div className="sla-copy">
              <strong>+4.8%</strong>
              <span>vs. período anterior</span>
            </div>
          </div>
          <div className="sla-breakdown">
            <div>
              <span>
                <i className="dot green" /> A tiempo
              </span>
              <strong>47</strong>
            </div>
            <div>
              <span>
                <i className="dot amber" /> En riesgo
              </span>
              <strong>3</strong>
            </div>
            <div>
              <span>
                <i className="dot red" /> Vencidas
              </span>
              <strong>1</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="dashboard-grid lower-grid">
        <article className="panel workload-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Capacidad</span>
              <h2>Carga del equipo</h2>
            </div>
          </div>
          {team.slice(0, 3).map((member, index) => (
            <div className="workload-row" key={member.name}>
              <Avatar
                color={member.color}
                initials={member.initials}
                small
              />
              <span>
                <strong>{member.name}</strong>
                <small>{member.active} solicitudes activas</small>
              </span>
              <div className="workload-bar">
                <i style={{ width: `${[72, 58, 40][index]}%` }} />
              </div>
              <b>{[72, 58, 40][index]}%</b>
            </div>
          ))}
        </article>

        <article className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Ahora</span>
              <h2>Actividad reciente</h2>
            </div>
          </div>
          <div className="activity-feed">
            {requests.slice(0, 3).map((request, index) => (
              <div key={request.id}>
                <Avatar
                  color={["violet", "blue", "orange"][index]}
                  initials={request.activity[0].author
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)}
                  small
                />
                <p>
                  <strong>{request.activity[0].author}</strong>{" "}
                  {request.activity[0].action.toLowerCase()}{" "}
                  <button
                    onClick={() => setSelectedId(request.id)}
                    type="button"
                  >
                    {request.id}
                  </button>
                  <small>{request.activity[0].time}</small>
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function MetricCard({
  detail,
  icon,
  label,
  tone,
  value,
}: {
  detail: string;
  icon: string;
  label: string;
  tone: string;
  value: number;
}) {
  return (
    <article className="metric-card">
      <span className={`metric-icon metric-${tone}`}>{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{String(value).padStart(2, "0")}</strong>
      </div>
      <small>{detail}</small>
    </article>
  );
}

function RequestsView({
  filter,
  requests,
  role,
  setFilter,
  setSelectedId,
}: {
  filter: "Todas" | Status;
  requests: RequestItem[];
  role: Role;
  setFilter: (filter: "Todas" | Status) => void;
  setSelectedId: (id: string) => void;
}) {
  const filters: ("Todas" | Status)[] = ["Todas", ...statusOrder];

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Bandeja operativa</p>
          <h1>Solicitudes</h1>
          <p>
            {role === "Administrador"
              ? "Todas las solicitudes del espacio de trabajo."
              : role === "Analista"
                ? "Solicitudes asignadas a Lucía Benítez."
                : "Solicitudes creadas por Sofía Acosta."}
          </p>
        </div>
        <div className="result-count">{requests.length} resultados</div>
      </section>

      <div className="filter-bar">
        {filters.map((item) => (
          <button
            className={filter === item ? "active" : ""}
            key={item}
            onClick={() => setFilter(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      <section className="panel table-panel">
        <div className="table-head">
          <span>Solicitud</span>
          <span>Prioridad</span>
          <span>Estado</span>
          <span>Responsable</span>
          <span>Vencimiento</span>
          <span />
        </div>
        {requests.length > 0 ? (
          requests.map((request) => (
            <button
              className="table-row"
              key={request.id}
              onClick={() => setSelectedId(request.id)}
              type="button"
            >
              <span className="table-request">
                <b>{request.title}</b>
                <small>
                  {request.id} · {request.category}
                </small>
              </span>
              <span>
                <i className={priorityClass(request.priority)} />
                {request.priority}
              </span>
              <span>
                <i className={statusClass(request.status)}>{request.status}</i>
              </span>
              <span className="table-owner">
                <Avatar initials={request.assigneeInitials} small />
                {request.assignee}
              </span>
              <span>{request.due}</span>
              <span className="row-arrow">›</span>
            </button>
          ))
        ) : (
          <div className="empty-state">
            <span>⌕</span>
            <h3>No encontramos solicitudes</h3>
            <p>Probá con otro texto o cambiá el filtro seleccionado.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function TeamView() {
  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Personas y capacidad</p>
          <h1>Equipo</h1>
          <p>Responsables que atienden y coordinan las solicitudes.</p>
        </div>
        <div className="heading-badge">
          <span className="pulse-dot" />4 integrantes activos
        </div>
      </section>

      <section className="team-grid">
        {team.map((member) => (
          <article className="member-card" key={member.name}>
            <div className="member-top">
              <Avatar color={member.color} initials={member.initials} />
              <span className="online-dot" />
            </div>
            <h2>{member.name}</h2>
            <p>
              {member.role} · {member.area}
            </p>
            <div className="member-stats">
              <span>
                <strong>{member.active}</strong>
                Activas
              </span>
              <span>
                <strong>{member.resolved}</strong>
                Resueltas
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function AnalyticsView({ requests }: { requests: RequestItem[] }) {
  const categories = ["Automatización", "Incidente", "Mejora", "Accesos"];
  const categoryValues = categories.map(
    (category) => requests.filter((request) => request.category === category).length,
  );
  const max = Math.max(...categoryValues, 1);

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Últimos 30 días</p>
          <h1>Métricas</h1>
          <p>Visibilidad sobre volumen, tiempos y calidad del servicio.</p>
        </div>
        <span className="result-count">Actualizado ahora</span>
      </section>

      <section className="analytics-grid">
        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Demanda</span>
              <h2>Solicitudes por categoría</h2>
            </div>
          </div>
          <div className="bar-chart">
            {categories.map((category, index) => (
              <div key={category}>
                <span>{category}</span>
                <i>
                  <b
                    style={{
                      width: `${Math.max((categoryValues[index] / max) * 100, 12)}%`,
                    }}
                  />
                </i>
                <strong>{categoryValues[index]}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel resolution-panel">
          <span className="panel-kicker">Eficiencia</span>
          <h2>Tiempo medio de resolución</h2>
          <strong>6.4h</strong>
          <p>
            <span>↓ 18%</span> comparado con el período anterior
          </p>
          <div className="mini-chart" aria-label="Tendencia descendente">
            {[62, 55, 58, 45, 48, 36, 31, 24].map((height, index) => (
              <i key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
        </article>

        <article className="panel quality-panel">
          <span className="panel-kicker">Calidad</span>
          <h2>Satisfacción interna</h2>
          <div className="quality-score">
            <strong>4.8</strong>
            <span>/ 5</span>
          </div>
          <div className="stars" aria-label="4.8 de 5 estrellas">
            ★★★★★
          </div>
          <p>Basado en 38 respuestas recientes.</p>
        </article>
      </section>
    </div>
  );
}

function RequestDrawer({
  close,
  onStatusChange,
  request,
  role,
}: {
  close: () => void;
  onStatusChange: (status: Status) => void;
  request: RequestItem;
  role: Role;
}) {
  return (
    <div className="drawer-layer">
      <button
        className="drawer-backdrop"
        onClick={close}
        aria-label="Cerrar detalle"
        type="button"
      />
      <aside className="drawer" aria-label={`Detalle de ${request.id}`}>
        <header className="drawer-header">
          <div>
            <span>{request.id}</span>
            <span className={statusClass(request.status)}>{request.status}</span>
          </div>
          <button onClick={close} aria-label="Cerrar" type="button">
            ×
          </button>
        </header>

        <div className="drawer-content">
          <span className={priorityClass(request.priority)}>
            {request.priority}
          </span>
          <h2>{request.title}</h2>
          <p className="drawer-description">{request.description}</p>

          <div className="detail-grid">
            <div>
              <small>Solicitante</small>
              <span>
                <Avatar initials={request.requesterInitials} small />
                {request.requester}
              </span>
            </div>
            <div>
              <small>Responsable</small>
              <span>
                <Avatar initials={request.assigneeInitials} small />
                {request.assignee}
              </span>
            </div>
            <div>
              <small>Categoría</small>
              <strong>{request.category}</strong>
            </div>
            <div>
              <small>Vencimiento</small>
              <strong>{request.due}</strong>
            </div>
          </div>

          {role !== "Solicitante" && (
            <section className="status-section">
              <span>Cambiar estado</span>
              <div>
                {statusOrder.map((status) => (
                  <button
                    className={request.status === status ? "active" : ""}
                    disabled={request.status === status}
                    key={status}
                    onClick={() => onStatusChange(status)}
                    type="button"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="timeline-section">
            <h3>Actividad</h3>
            <div className="timeline">
              {request.activity.map((item, index) => (
                <div key={`${item.author}-${item.time}-${index}`}>
                  <span />
                  <p>
                    <strong>{item.author}</strong> {item.action}
                    <small>{item.time}</small>
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function CreateModal({
  close,
  submit,
}: {
  close: () => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="modal-layer">
      <button
        className="modal-backdrop"
        onClick={close}
        aria-label="Cerrar formulario"
        type="button"
      />
      <section className="modal" aria-labelledby="create-title">
        <header>
          <div>
            <span className="panel-kicker">Nueva entrada</span>
            <h2 id="create-title">Crear solicitud</h2>
          </div>
          <button onClick={close} aria-label="Cerrar" type="button">
            ×
          </button>
        </header>
        <form onSubmit={submit}>
          <label>
            Título
            <input
              name="title"
              placeholder="Ej. Automatizar validación semanal"
              required
            />
          </label>
          <div className="form-row">
            <label>
              Categoría
              <select name="category" defaultValue="Automatización">
                <option>Automatización</option>
                <option>Incidente</option>
                <option>Mejora</option>
                <option>Accesos</option>
              </select>
            </label>
            <label>
              Prioridad
              <select name="priority" defaultValue="Media">
                <option>Crítica</option>
                <option>Alta</option>
                <option>Media</option>
                <option>Baja</option>
              </select>
            </label>
          </div>
          <label>
            Descripción
            <textarea
              name="description"
              placeholder="Describí el problema, el resultado esperado y cualquier contexto útil."
              required
              rows={5}
            />
          </label>
          <p className="form-note">
            Esta es una demo de portfolio. La solicitud permanecerá visible
            durante esta sesión.
          </p>
          <footer>
            <button className="secondary-button" onClick={close} type="button">
              Cancelar
            </button>
            <button className="primary-button" type="submit">
              Crear solicitud
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
