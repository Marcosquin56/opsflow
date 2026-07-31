"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

type Role = "Administrador" | "Analista" | "Solicitante";
type Status = "Nuevo" | "En análisis" | "En progreso" | "Resuelto" | "Bloqueado";
type Priority = "Crítica" | "Alta" | "Media" | "Baja";
type View = "dashboard" | "requests" | "automations" | "team" | "analytics";

export type CurrentUser = {
  id: string;
  name: string;
  initials: string;
  role: Role;
  area: string;
  color: string;
  email: string;
};

type Activity = {
  author: string;
  action: string;
  time: string;
};

type AutomationRule = {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  owner: string;
  ownerInitials: string;
  ownerColor: string;
  status: "active" | "paused";
  category: string;
  runsThisWeek: number;
  lastRun: string;
  impact: string;
};

type RequestItem = {
  id: string;
  title: string;
  category: string;
  requester: string;
  requesterEmail?: string;
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

type Member = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: Role;
  area: string;
  color: string;
  active: boolean;
  activeRequests: number;
  resolvedRequests: number;
};

const roleHelper: Record<Role, string> = {
  Administrador: "Acceso completo",
  Analista: "Gestión asignada",
  Solicitante: "Vista personal",
};

const navItems: { id: View; label: string; icon: IconName }[] = [
  { id: "dashboard", label: "Resumen", icon: "home" },
  { id: "requests", label: "Solicitudes", icon: "inbox" },
  { id: "automations", label: "Automatizaciones", icon: "zap" },
  { id: "team", label: "Equipo", icon: "users" },
  { id: "analytics", label: "Métricas", icon: "activity" },
];

const statusOrder: Status[] = [
  "Nuevo",
  "En análisis",
  "En progreso",
  "Bloqueado",
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

type IconName =
  | "home"
  | "inbox"
  | "users"
  | "activity"
  | "zap"
  | "search"
  | "bell"
  | "chevron-down"
  | "plus"
  | "check"
  | "arrow-right"
  | "alert-triangle"
  | "clock";

const iconPaths: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  inbox: (
    <>
      <path d="M3 5h18v10.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Z" />
      <path d="M3 12h4.5l1.5 2.5h6L16.5 12H21" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.6 2.9-6 5.5-6s5.5 2.4 5.5 6" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M15 20c0-2.8 1.6-4.8 3.5-5.3" />
    </>
  ),
  activity: <path d="M3 17l4-6 4 3 5-8 5 6" />,
  zap: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="currentColor" stroke="none" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.3-4.3" />
    </>
  ),
  bell: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8Z" />
      <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
    </>
  ),
  "chevron-down": <path d="M5 8l7 7 7-7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M4 12l5 5L20 7" />,
  "arrow-right": <path d="M4 12h14M13 6l6 6-6 6" />,
  "alert-triangle": (
    <>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 9v5" />
      <path d="M12 17.5h.01" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3.5 2" />
    </>
  ),
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      width={size}
    >
      {iconPaths[name]}
    </svg>
  );
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

export function DashboardView({ currentUser }: { currentUser: CurrentUser }) {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"Todas" | Status>("Todas");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [toast, setToast] = useState("");
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const role = currentUser.role;
  const profile = currentUser;
  const selected = requests.find((request) => request.id === selectedId) ?? null;

  const visibleRequests = useMemo(() => {
    const roleFiltered = requests.filter((request) => {
      if (role === "Solicitante") return request.requesterInitials === profile.initials;
      if (role === "Analista") return request.assigneeInitials === profile.initials;
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

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [requestsRes, automationsRes, usersRes] = await Promise.all([
          fetch("/api/requests"),
          fetch("/api/automations"),
          fetch("/api/users"),
        ]);
        const requestsData = (await requestsRes.json()) as { requests?: RequestItem[] };
        const automationsData = (await automationsRes.json()) as {
          automations?: AutomationRule[];
        };
        const usersData = (await usersRes.json()) as { users?: Member[] };
        if (cancelled) return;
        setRequests(requestsData.requests ?? []);
        setAutomations(automationsData.automations ?? []);
        setMembers(usersData.users ?? []);
      } catch {
        if (!cancelled) notify("No se pudo conectar con el backend");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleAutomation(id: string) {
    const rule = automations.find((item) => item.id === id);
    if (!rule) return;
    const response = await fetch("/api/automations/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = (await response.json()) as { automation?: AutomationRule };
    if (!data.automation) {
      notify("No se pudo actualizar la automatización");
      return;
    }
    const updated = data.automation;
    setAutomations((current) =>
      current.map((item) => (item.id === id ? updated : item)),
    );
    notify(`"${updated.name}" ${updated.status === "active" ? "activada" : "pausada"}`);
  }

  async function changeMemberRole(id: string, nextRole: Role) {
    const response = await fetch("/api/users/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role: nextRole }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      notify(data.error ?? "No se pudo cambiar el rol");
      return;
    }
    setMembers((current) =>
      current.map((member) => (member.id === id ? { ...member, role: nextRole } : member)),
    );
    notify("Rol actualizado");
  }

  async function toggleMemberActive(id: string) {
    const response = await fetch("/api/users/toggle-active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = (await response.json()) as { active?: boolean; error?: string };
    if (!response.ok || data.active === undefined) {
      notify(data.error ?? "No se pudo actualizar la cuenta");
      return;
    }
    const nextActive = data.active;
    setMembers((current) =>
      current.map((member) => (member.id === id ? { ...member, active: nextActive } : member)),
    );
    notify(nextActive ? "Cuenta activada" : "Cuenta desactivada");
  }

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setShowPalette((current) => !current);
      }
      if (event.key === "Escape") {
        setShowPalette(false);
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  async function changeStatus(nextStatus: Status) {
    if (!selected) return;
    const response = await fetch("/api/requests/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selected.id,
        status: nextStatus,
        actorName: profile.name,
      }),
    });
    const data = (await response.json()) as { request?: RequestItem };
    if (!data.request) {
      notify("No se pudo actualizar la solicitud");
      return;
    }
    const updated = data.request;
    setRequests((current) =>
      current.map((request) => (request.id === updated.id ? updated : request)),
    );
    notify(`Solicitud actualizada a “${nextStatus}”`);
  }

  async function createRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(data.get("title")),
        category: String(data.get("category")),
        priority: String(data.get("priority")),
        description: String(data.get("description")),
        requesterName: profile.name,
        requesterInitials: profile.initials,
        requesterEmail: String(data.get("requesterEmail") ?? ""),
      }),
    });
    const result = (await response.json()) as { request?: RequestItem };
    if (!result.request) {
      notify("No se pudo crear la solicitud");
      return;
    }
    const newRequest = result.request;
    setRequests((current) => [newRequest, ...current]);
    setShowCreate(false);
    setSelectedId(newRequest.id);
    setActiveView("requests");
    notify(`${newRequest.id} creada correctamente`);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
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
              <span aria-hidden="true">
                <Icon name={item.icon} />
              </span>
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
          onClick={() => setShowProfileMenu((current) => !current)}
          type="button"
          aria-expanded={showProfileMenu}
        >
          <Avatar initials={profile.initials} color={profile.color} />
          <span>
            <strong>{profile.name}</strong>
            <small>{role}</small>
          </span>
          <b aria-hidden="true">
            <Icon name="chevron-down" size={14} />
          </b>
        </button>

        {showProfileMenu && (
          <div className="role-menu">
            <p>Sesión</p>
            <div className="profile-summary">
              <span>{profile.initials}</span>
              <div>
                <strong>{profile.name}</strong>
                <small>
                  {role} · {roleHelper[role]}
                </small>
              </div>
            </div>
            <button onClick={logout} type="button">
              <span aria-hidden="true">
                <Icon name="arrow-right" size={14} />
              </span>
              <div>
                <strong>Cerrar sesión</strong>
              </div>
            </button>
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
            <span aria-hidden="true">
              <Icon name="search" size={15} />
            </span>
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por título, ID o categoría..."
              value={search}
            />
            <button
              aria-label="Abrir paleta de comandos"
              className="kbd-button"
              onClick={() => setShowPalette(true)}
              type="button"
            >
              <kbd>⌘ K</kbd>
            </button>
          </label>
          <div className="top-actions">
            <span className="demo-pill">Demo interactiva</span>
            <button
              className="icon-button notification-button"
              aria-label="Notificaciones"
              type="button"
            >
              <Icon name="bell" size={17} />
              <span />
            </button>
            <button
              className="primary-button"
              onClick={() => setShowCreate(true)}
              type="button"
            >
              <span aria-hidden="true">
                <Icon name="plus" size={16} />
              </span>
              Nueva solicitud
            </button>
          </div>
        </header>

        {loading ? (
          <div className="page">
            <div className="empty-state">
              <span className="pulse-dot" />
              <h3>Cargando datos…</h3>
              <p>Conectando con la base de datos de OpsFlow.</p>
            </div>
          </div>
        ) : (
          <>
            {activeView === "dashboard" && (
              <Dashboard
                automations={automations}
                firstName={profile.name.split(" ")[0]}
                members={members}
                metrics={metrics}
                requests={requests}
                setActiveView={setActiveView}
                setSelectedId={setSelectedId}
              />
            )}

            {activeView === "requests" && (
              <RequestsView
                filter={filter}
                name={profile.name}
                requests={visibleRequests}
                role={role}
                setFilter={setFilter}
                setSelectedId={setSelectedId}
              />
            )}

            {activeView === "automations" && (
              <AutomationsView automations={automations} toggle={toggleAutomation} />
            )}
            {activeView === "team" && (
              <TeamView
                changeMemberRole={changeMemberRole}
                currentUser={currentUser}
                members={members}
                toggleMemberActive={toggleMemberActive}
              />
            )}
            {activeView === "analytics" && <AnalyticsView requests={requests} />}
          </>
        )}
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

      {showPalette && (
        <CommandPalette
          close={() => setShowPalette(false)}
          requests={requests}
          setActiveView={setActiveView}
          setSelectedId={setSelectedId}
          setShowCreate={setShowCreate}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={14} />
          </span>
          {toast}
        </div>
      )}
    </div>
  );
}

function Dashboard({
  automations,
  firstName,
  members,
  metrics,
  requests,
  setActiveView,
  setSelectedId,
}: {
  automations: AutomationRule[];
  firstName: string;
  members: Member[];
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
  const workload = members
    .filter((member) => member.role !== "Solicitante")
    .sort((a, b) => b.activeRequests - a.activeRequests)
    .slice(0, 3);
  const activeAutomations = automations.filter((rule) => rule.status === "active");
  const openRequests = requests.filter((request) => request.status !== "Resuelto");

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Martes, 28 de julio</p>
          <h1>Buenas tardes, {firstName}.</h1>
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
          icon="activity"
          label="Solicitudes abiertas"
          tone="violet"
          value={metrics.open}
        />
        <MetricCard
          detail="requiere atención"
          icon="alert-triangle"
          label="Prioridad crítica"
          tone="red"
          value={metrics.critical}
        />
        <MetricCard
          detail="dentro del SLA"
          icon="clock"
          label="En tratamiento"
          tone="blue"
          value={metrics.progress}
        />
        <MetricCard
          detail="esta semana"
          icon="check"
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
              Ver todas
              <span>
                <Icon name="arrow-right" size={13} />
              </span>
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
          {workload.length === 0 && <p className="form-note">Todavía no hay responsables con carga asignada.</p>}
          {workload.map((member) => {
            const percent = Math.min(100, member.activeRequests * 20);
            return (
              <div className="workload-row" key={member.id}>
                <Avatar color={member.color} initials={member.initials} small />
                <span>
                  <strong>{member.name}</strong>
                  <small>{member.activeRequests} solicitudes activas</small>
                </span>
                <div className="workload-bar">
                  <i style={{ width: `${percent}%` }} />
                </div>
                <b>{percent}%</b>
              </div>
            );
          })}
        </article>

        <article className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Ahora</span>
              <h2>Actividad reciente</h2>
            </div>
          </div>
          <div className="activity-feed">
            {requests
              .filter((request) => request.activity.length > 0)
              .slice(0, 3)
              .map((request, index) => (
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

      <article className="panel automation-summary">
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">Automatización</span>
            <h2>Reglas activas</h2>
          </div>
          <button onClick={() => setActiveView("automations")} type="button">
            Ver todas
            <span>
              <Icon name="arrow-right" size={13} />
            </span>
          </button>
        </div>
        <div className="automation-summary-list">
          {activeAutomations.map((rule) => (
            <div className="automation-summary-row" key={rule.id}>
              <span className="automation-summary-icon">
                <Icon name="zap" size={14} />
              </span>
              <span className="automation-summary-main">
                <strong>{rule.name}</strong>
                <small>{rule.impact}</small>
              </span>
              <span className="automation-summary-runs mono">
                {rule.runsThisWeek} / sem.
              </span>
            </div>
          ))}
        </div>
      </article>
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
  icon: IconName;
  label: string;
  tone: string;
  value: number;
}) {
  return (
    <article className="metric-card">
      <span className={`metric-icon metric-${tone}`}>
        <Icon name={icon} size={16} />
      </span>
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
  name,
  requests,
  role,
  setFilter,
  setSelectedId,
}: {
  filter: "Todas" | Status;
  name: string;
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
                ? `Solicitudes asignadas a ${name}.`
                : `Solicitudes creadas por ${name}.`}
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
            <span>
              <Icon name="search" size={20} />
            </span>
            <h3>No encontramos solicitudes</h3>
            <p>Probá con otro texto o cambiá el filtro seleccionado.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function AutomationsView({
  automations,
  toggle,
}: {
  automations: AutomationRule[];
  toggle: (id: string) => void;
}) {
  const activeCount = automations.filter((rule) => rule.status === "active").length;

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Reglas y disparadores</p>
          <h1>Automatizaciones</h1>
          <p>Reglas que actúan sobre las solicitudes sin intervención manual.</p>
        </div>
        <div className="heading-badge">
          <span className="pulse-dot" />
          {activeCount} automatizaciones activas
        </div>
      </section>

      <section className="automation-grid">
        {automations.map((rule) => (
          <article className="automation-card" key={rule.id}>
            <div className="automation-top">
              <span className="automation-icon">
                <Icon name="zap" size={16} />
              </span>
              <button
                aria-checked={rule.status === "active"}
                aria-label={`Alternar ${rule.name}`}
                className="switch"
                data-on={rule.status === "active"}
                onClick={() => toggle(rule.id)}
                role="switch"
                type="button"
              >
                <span className="switch-thumb" />
              </button>
            </div>
            <h2>{rule.name}</h2>
            <p>{rule.description}</p>
            <div className="automation-flow">
              <span>{rule.trigger}</span>
              <Icon name="arrow-right" size={13} />
              <span>{rule.action}</span>
            </div>
            <div className="automation-meta">
              <Avatar color={rule.ownerColor} initials={rule.ownerInitials} small />
              <span>{rule.owner}</span>
            </div>
            <div className="automation-stats">
              <span>
                <strong className="mono">{rule.runsThisWeek}</strong> ejecuciones/sem.
              </span>
              <span className="mono">{rule.lastRun}</span>
            </div>
            <p className="automation-impact">{rule.impact}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function TeamView({
  changeMemberRole,
  currentUser,
  members,
  toggleMemberActive,
}: {
  changeMemberRole: (id: string, role: Role) => void;
  currentUser: CurrentUser;
  members: Member[];
  toggleMemberActive: (id: string) => void;
}) {
  const isAdmin = currentUser.role === "Administrador";
  const activeCount = members.filter((member) => member.active).length;

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Personas y capacidad</p>
          <h1>Equipo</h1>
          <p>Responsables que atienden y coordinan las solicitudes.</p>
        </div>
        <div className="heading-badge">
          <span className="pulse-dot" />
          {activeCount} {activeCount === 1 ? "integrante activo" : "integrantes activos"}
        </div>
      </section>

      <section className="team-grid">
        {members.map((member) => (
          <article
            className={`member-card${member.active ? "" : " member-inactive"}`}
            key={member.id}
          >
            <div className="member-top">
              <Avatar color={member.color} initials={member.initials} />
              <span className={member.active ? "online-dot" : "online-dot offline"} />
            </div>
            <h2>{member.name}</h2>
            <p>
              {member.role} · {member.area}
              {!member.active && " · Desactivada"}
            </p>
            <div className="member-stats">
              <span>
                <strong>{member.activeRequests}</strong>
                Activas
              </span>
              <span>
                <strong>{member.resolvedRequests}</strong>
                Resueltas
              </span>
            </div>
            {isAdmin && member.id !== currentUser.id && (
              <div className="member-admin">
                <select
                  onChange={(event) => changeMemberRole(member.id, event.target.value as Role)}
                  value={member.role}
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Analista">Analista</option>
                  <option value="Solicitante">Solicitante</option>
                </select>
                <button onClick={() => toggleMemberActive(member.id)} type="button">
                  {member.active ? "Desactivar" : "Activar"}
                </button>
              </div>
            )}
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

function CommandPalette({
  close,
  requests,
  setActiveView,
  setSelectedId,
  setShowCreate,
}: {
  close: () => void;
  requests: RequestItem[];
  setActiveView: (view: View) => void;
  setSelectedId: (id: string) => void;
  setShowCreate: (value: boolean) => void;
}) {
  const [query, setQuery] = useState("");

  const staticCommands = [
    { label: "Ir a Resumen", run: () => setActiveView("dashboard") },
    { label: "Ir a Solicitudes", run: () => setActiveView("requests") },
    { label: "Ir a Automatizaciones", run: () => setActiveView("automations") },
    { label: "Ir a Equipo", run: () => setActiveView("team") },
    { label: "Ir a Métricas", run: () => setActiveView("analytics") },
    { label: "Nueva solicitud", run: () => setShowCreate(true) },
  ];

  const term = query.trim().toLowerCase();
  const filteredCommands = staticCommands.filter((command) =>
    command.label.toLowerCase().includes(term),
  );
  const matchingRequests = term
    ? requests
        .filter(
          (request) =>
            request.title.toLowerCase().includes(term) ||
            request.id.toLowerCase().includes(term),
        )
        .slice(0, 5)
    : [];

  function runAndClose(action: () => void) {
    action();
    close();
  }

  return (
    <div className="modal-layer">
      <button
        aria-label="Cerrar"
        className="modal-backdrop"
        onClick={close}
        type="button"
      />
      <section aria-label="Paleta de comandos" className="modal command-palette">
        <div className="command-input">
          <Icon name="search" size={15} />
          <input
            autoFocus
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Escribí un comando o buscá una solicitud..."
            value={query}
          />
          <kbd>Esc</kbd>
        </div>
        <div className="command-list">
          {filteredCommands.map((command) => (
            <button
              key={command.label}
              onClick={() => runAndClose(command.run)}
              type="button"
            >
              {command.label}
            </button>
          ))}
          {matchingRequests.map((request) => (
            <button
              key={request.id}
              onClick={() =>
                runAndClose(() => {
                  setActiveView("requests");
                  setSelectedId(request.id);
                })
              }
              type="button"
            >
              <span className="mono">{request.id}</span> {request.title}
            </button>
          ))}
          {filteredCommands.length === 0 && matchingRequests.length === 0 && (
            <p className="command-empty">Sin resultados para &quot;{query}&quot;</p>
          )}
        </div>
      </section>
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
          <label>
            Tu email (para recibir novedades)
            <input
              name="requesterEmail"
              placeholder="vos@ejemplo.com"
              type="email"
            />
          </label>
          <p className="form-note">
            Esta es una demo de portfolio con backend real: la solicitud
            queda guardada, y si dejás tu email te llega un correo cuando
            cambie de estado.
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
