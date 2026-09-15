import { useState, useEffect } from "react";
import { authService } from "../services/authService";
import { storage } from "../services/storage";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import AdminCalendar from "./AdminCalendar";
import AdminAppointments from "./AdminAppointments";
import AdminServices from "./AdminServices";
import AdminBusinessHours from "./AdminBusinessHours";
import AdminBlockedTimes from "./AdminBlockedTimes";
import AdminBarbers from "./AdminBarbers";
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Scissors,
  Clock,
  Lock,
  Users,
  LogOut,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import "./Admin.css";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "calendar", label: "Agenda", icon: Calendar },
  { id: "appointments", label: "Agendamentos", icon: ClipboardList },
  { id: "services", label: "Serviços", icon: Scissors },
  { id: "business_hours", label: "Horários", icon: Clock },
  { id: "blocked_times", label: "Bloqueios", icon: Lock },
  { id: "barbers", label: "Barbeiros", icon: Users },
];

export default function AdminApp({ onBackToSite }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState("");

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  function handleLoginSuccess(user) {
    setCurrentUser(user);
  }

  async function handleLogout() {
    await authService.logout();
    setCurrentUser(null);
  }

  function handleResetDemoData() {
    if (
      window.confirm(
        "Deseja restaurar os dados de demonstração (serviços, barbeiros, horários e agendamentos padrão)?"
      )
    ) {
      storage.resetDefaults();
      window.location.reload();
    }
  }

  if (!currentUser) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} onBackToSite={onBackToSite} />;
  }

  return (
    <div className="admin-layout">
      {/* Top Navbar */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <button
            type="button"
            className="admin-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu administrativo"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="admin-brand" onClick={() => setActiveTab("dashboard")}>
            <span className="admin-brand-mark" />
            <div>
              <span className="admin-brand-title">Novo Visual</span>
              <span className="admin-brand-tag">Gestão & Agenda</span>
            </div>
          </div>
        </div>

        <div className="admin-topbar-right">
          <button
            type="button"
            onClick={handleResetDemoData}
            className="admin-topbar-action-btn text-muted"
            title="Restaurar dados iniciais de demonstração"
          >
            <RotateCcw size={16} />
            <span className="hide-mobile">Restaurar Mock</span>
          </button>

          <button
            type="button"
            onClick={onBackToSite}
            className="admin-topbar-action-btn"
            title="Ir para o site público"
          >
            <ExternalLink size={16} />
            <span className="hide-mobile">Ver Site</span>
          </button>

          <div className="admin-user-pill">
            <div className="admin-user-avatar">
              <ShieldCheck size={14} />
            </div>
            <div className="admin-user-info hide-mobile">
              <strong>{currentUser.name}</strong>
              <span>{currentUser.role === "admin" ? "Administrador" : "Barbeiro"}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="admin-logout-btn"
            title="Sair do painel"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="admin-body">
        {/* Navigation Sidebar / Tabs */}
        <aside className={`admin-sidebar ${mobileMenuOpen ? "is-open" : ""}`}>
          <nav className="admin-nav" aria-label="Menu do painel">
            <p className="admin-nav-section-title">Navegação Principal</p>
            <ul>
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <li key={tab.id}>
                    <button
                      type="button"
                      className={`admin-nav-item ${isActive ? "is-active" : ""}`}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icon size={18} />
                      <span>{tab.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="admin-sidebar-footer">
              <div className="admin-supabase-ready-badge">
                <span className="admin-dot-ready" />
                <div>
                  <strong>Pronto para Supabase</strong>
                  <p>Camada de dados isolada em /services</p>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="admin-content">
          {activeTab === "dashboard" && (
            <AdminDashboard
              onNavigateToAppointments={() => setActiveTab("appointments")}
              onNavigateToCalendar={() => setActiveTab("calendar")}
            />
          )}

          {activeTab === "calendar" && (
            <AdminCalendar
              onNewAppointment={(date) => {
                setPrefilledDate(date);
                setActiveTab("appointments");
              }}
              onNewBlock={(date) => {
                setPrefilledDate(date);
                setActiveTab("blocked_times");
              }}
            />
          )}

          {activeTab === "appointments" && (
            <AdminAppointments initialDateFilter={prefilledDate} />
          )}

          {activeTab === "services" && <AdminServices />}

          {activeTab === "business_hours" && <AdminBusinessHours />}

          {activeTab === "blocked_times" && (
            <AdminBlockedTimes initialDate={prefilledDate} />
          )}

          {activeTab === "barbers" && <AdminBarbers />}
        </main>
      </div>
    </div>
  );
}
