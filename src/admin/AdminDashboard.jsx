import { useState, useEffect } from "react";
import { appointmentService, buildAdminToClientWhatsappLink, formatDateBR } from "../services/appointmentService";
import { availabilityService } from "../services/availabilityService";
import { storage } from "../services/storage";
import { Calendar, Clock, CheckCircle2, UserCheck, Scissors, MessageCircle, AlertCircle, TrendingUp } from "lucide-react";

export default function AdminDashboard({ onNavigateToAppointments, onNavigateToCalendar }) {
  const [metrics, setMetrics] = useState({
    todayCount: 0,
    completedCount: 0,
    pendingCount: 0,
    nextAppointment: null,
    revenueToday: 0,
    potentialRevenueToday: 0,
    todayList: [],
  });
  const [availableSlotsCount, setAvailableSlotsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().slice(0, 10);

  async function loadDashboardData() {
    try {
      const data = await appointmentService.getDashboardMetrics(todayStr);
      setMetrics(data);

      const slotsRes = await availabilityService.getAvailableSlots(todayStr, null, "qualquer");
      setAvailableSlotsCount(slotsRes.slots ? slotsRes.slots.length : 0);
    } catch (err) {
      console.error("Erro ao carregar métricas do dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
    const unsubscribe = storage.subscribe(() => {
      loadDashboardData();
    });
    return unsubscribe;
  }, []);

  async function handleQuickStatus(id, newStatus) {
    try {
      await appointmentService.updateStatus(id, newStatus);
      await loadDashboardData();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="booking-flow__spinner" />
        <p>Carregando métricas do dia...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <div>
          <h2>Visão Geral do Dia</h2>
          <p className="admin-page-sub">
            Hoje é {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })} ({formatDateBR(todayStr)})
          </p>
        </div>
        <div className="admin-header-actions">
          <button type="button" className="btn btn-outline" onClick={onNavigateToCalendar}>
            <Calendar size={16} />
            Ver Grade Completa
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="admin-metric-icon icon-brass">
            <Calendar size={22} />
          </div>
          <div className="admin-metric-content">
            <span className="admin-metric-label">Agendamentos Hoje</span>
            <strong className="admin-metric-value">{metrics.todayCount}</strong>
            <span className="admin-metric-sub">{metrics.pendingCount} pendentes / confirmados</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon icon-success">
            <CheckCircle2 size={22} />
          </div>
          <div className="admin-metric-content">
            <span className="admin-metric-label">Atendimentos Concluídos</span>
            <strong className="admin-metric-value">{metrics.completedCount}</strong>
            <span className="admin-metric-sub">
              {metrics.todayCount > 0
                ? `${Math.round((metrics.completedCount / metrics.todayCount) * 100)}% da meta do dia`
                : "Sem atendimentos"}
            </span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon icon-info">
            <Clock size={22} />
          </div>
          <div className="admin-metric-content">
            <span className="admin-metric-label">Vagas Restantes Hoje</span>
            <strong className="admin-metric-value">{availableSlotsCount}</strong>
            <span className="admin-metric-sub">Horários livres na grade</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon icon-revenue">
            <TrendingUp size={22} />
          </div>
          <div className="admin-metric-content">
            <span className="admin-metric-label">Faturamento do Dia</span>
            <strong className="admin-metric-value">R$ {metrics.revenueToday}</strong>
            <span className="admin-metric-sub">Previsto total: R$ {metrics.potentialRevenueToday}</span>
          </div>
        </div>
      </div>

      {/* Next Appointment Callout */}
      {metrics.nextAppointment ? (
        <div className="admin-next-appointment-banner">
          <div className="admin-next-badge">
            <UserCheck size={18} />
            <span>Próximo Atendimento</span>
          </div>

          <div className="admin-next-info">
            <div className="admin-next-time">
              <strong>{metrics.nextAppointment.start_time}</strong>
              <span>às {metrics.nextAppointment.end_time}</span>
            </div>

            <div className="admin-next-details">
              <h4>{metrics.nextAppointment.customer_name}</h4>
              <p>
                <Scissors size={14} /> {metrics.nextAppointment.service_name} · <strong>{metrics.nextAppointment.barber_name}</strong>
              </p>
            </div>

            <div className="admin-next-contact">
              <span>{metrics.nextAppointment.customer_phone}</span>
              {metrics.nextAppointment.notes && (
                <span className="admin-notes-hint">Obs: {metrics.nextAppointment.notes}</span>
              )}
            </div>
          </div>

          <div className="admin-next-actions">
            <a
              href={buildAdminToClientWhatsappLink(metrics.nextAppointment)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline admin-btn-sm"
              title="Avisar cliente no WhatsApp"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>

            {metrics.nextAppointment.status !== "completed" && (
              <button
                type="button"
                className="btn btn-primary admin-btn-sm"
                onClick={() => handleQuickStatus(metrics.nextAppointment.id, "completed")}
              >
                <CheckCircle2 size={16} />
                Concluir
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="admin-no-next-banner">
          <AlertCircle size={20} />
          <span>Nenhum atendimento pendente para as próximas horas de hoje.</span>
        </div>
      )}

      {/* Today Appointments List */}
      <div className="admin-panel-section">
        <div className="admin-section-header">
          <h3>Fila de Atendimento de Hoje</h3>
          <button type="button" className="btn btn-outline admin-btn-sm" onClick={onNavigateToAppointments}>
            Gerenciar Todos os Agendamentos
          </button>
        </div>

        {metrics.todayList.length === 0 ? (
          <div className="admin-empty-state">
            <p>Nenhum agendamento registrado para hoje.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Cliente</th>
                  <th>Telefone</th>
                  <th>Serviço</th>
                  <th>Barbeiro</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações Rápidas</th>
                </tr>
              </thead>
              <tbody>
                {metrics.todayList.map((apt) => (
                  <tr key={apt.id} className={`status-row-${apt.status}`}>
                    <td className="font-mono font-bold">
                      {apt.start_time} - {apt.end_time}
                    </td>
                    <td>
                      <div className="admin-table-customer">
                        <strong>{apt.customer_name}</strong>
                        {apt.notes && <span className="admin-table-sub">"{apt.notes}"</span>}
                      </div>
                    </td>
                    <td>{apt.customer_phone}</td>
                    <td>{apt.service_name}</td>
                    <td>{apt.barber_name}</td>
                    <td className="font-mono">R$ {apt.service_price}</td>
                    <td>
                      <span className={`admin-status-badge status-${apt.status}`}>
                        {apt.status === "confirmed" && "Confirmado"}
                        {apt.status === "pending" && "Pendente"}
                        {apt.status === "completed" && "Concluído"}
                        {apt.status === "cancelled" && "Cancelado"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <a
                          href={buildAdminToClientWhatsappLink(apt)}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-action-icon"
                          title="Abrir WhatsApp"
                        >
                          <MessageCircle size={16} />
                        </a>
                        {apt.status !== "completed" && (
                          <button
                            type="button"
                            className="admin-action-icon text-success"
                            onClick={() => handleQuickStatus(apt.id, "completed")}
                            title="Marcar como Concluído"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
