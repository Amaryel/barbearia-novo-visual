import { useState, useEffect, useMemo } from "react";
import { appointmentService, buildAdminToClientWhatsappLink, formatDateBR } from "../services/appointmentService";
import { barberService } from "../services/barberService";
import { blockedTimeService } from "../services/blockedTimeService";
import { storage } from "../services/storage";
import { ChevronLeft, ChevronRight, User, Scissors, Plus, Lock, MessageCircle, CheckCircle2 } from "lucide-react";

function getIsoDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const HOURS_GRID = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00"
];

export default function AdminCalendar({ onNewAppointment, onNewBlock }) {
  const [viewMode, setViewMode] = useState("day");
  const [selectedDate, setSelectedDate] = useState(getIsoDate(new Date()));
  const [selectedBarberId, setSelectedBarberId] = useState("all");
  const [barbers, setBarbers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState([]);

  async function loadData() {
    try {
      const [barbList, aptList, blkList] = await Promise.all([
        barberService.getAll(),
        appointmentService.getAll(),
        blockedTimeService.getAll(),
      ]);
      setBarbers(barbList);
      setAppointments(aptList);
      setBlockedTimes(blkList);
    } catch (err) {
      console.error("Erro ao carregar dados da agenda:", err);
    }
  }

  useEffect(() => {
    loadData();
    const unsubscribe = storage.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, []);

  function handlePrev() {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - (viewMode === "week" ? 7 : 1));
    setSelectedDate(getIsoDate(date));
  }

  function handleNext() {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + (viewMode === "week" ? 7 : 1));
    setSelectedDate(getIsoDate(date));
  }

  function handleToday() {
    setSelectedDate(getIsoDate(new Date()));
  }

  const weekDays = useMemo(() => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const curr = new Date(y, m - 1, d);
    const dayOfWeek = curr.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() + distanceToMonday);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      days.push({
        dateStr: getIsoDate(nextDate),
        dayName: nextDate.toLocaleDateString("pt-BR", { weekday: "short" }),
        dayNum: nextDate.getDate(),
        monthName: nextDate.toLocaleDateString("pt-BR", { month: "short" }),
        isToday: getIsoDate(nextDate) === getIsoDate(new Date()),
        isSelected: getIsoDate(nextDate) === selectedDate,
      });
    }
    return days;
  }, [selectedDate]);

  const dayAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (a.date !== selectedDate) return false;
      if (a.status === "cancelled") return false;
      if (selectedBarberId !== "all" && a.barber_id !== selectedBarberId) return false;
      return true;
    });
  }, [appointments, selectedDate, selectedBarberId]);

  const dayBlocks = useMemo(() => {
    return blockedTimes.filter((b) => {
      if (b.date !== selectedDate) return false;
      if (selectedBarberId !== "all" && b.barber_id && b.barber_id !== selectedBarberId) return false;
      return true;
    });
  }, [blockedTimes, selectedDate, selectedBarberId]);

  return (
    <div className="admin-calendar">
      <div className="admin-page-header">
        <div>
          <h2>Agenda da Equipe</h2>
          <p className="admin-page-sub">
            Visualize horários ocupados, disponíveis e bloqueios por profissional
          </p>
        </div>

        <div className="admin-header-actions">
          <button type="button" className="btn btn-outline" onClick={() => onNewBlock(selectedDate)}>
            <Lock size={16} />
            Bloquear Horário
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onNewAppointment(selectedDate)}>
            <Plus size={16} />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="admin-calendar-toolbar">
        <div className="admin-calendar-nav-group">
          <button type="button" className="btn btn-outline admin-btn-sm" onClick={handleToday}>
            Hoje
          </button>
          <div className="admin-nav-arrows">
            <button type="button" className="admin-icon-btn" onClick={handlePrev} aria-label="Anterior">
              <ChevronLeft size={18} />
            </button>
            <span className="admin-current-date-label">
              {formatDateBR(selectedDate)}
            </span>
            <button type="button" className="admin-icon-btn" onClick={handleNext} aria-label="Próximo">
              <ChevronRight size={18} />
            </button>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="admin-calendar-picker-input"
          />
        </div>

        <div className="admin-calendar-filters">
          <div className="admin-filter-item">
            <label htmlFor="calendar-barber-select">Barbeiro:</label>
            <select
              id="calendar-barber-select"
              value={selectedBarberId}
              onChange={(e) => setSelectedBarberId(e.target.value)}
              className="admin-select"
            >
              <option value="all">Todos os Profissionais</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-view-toggle">
            <button
              type="button"
              className={`admin-toggle-btn ${viewMode === "day" ? "is-active" : ""}`}
              onClick={() => setViewMode("day")}
            >
              Dia
            </button>
            <button
              type="button"
              className={`admin-toggle-btn ${viewMode === "week" ? "is-active" : ""}`}
              onClick={() => setViewMode("week")}
            >
              Semana
            </button>
          </div>
        </div>
      </div>

      {/* Week Selector Bar */}
      {viewMode === "week" && (
        <div className="admin-week-strip">
          {weekDays.map((day) => {
            const dayApts = appointments.filter(
              (a) => a.date === day.dateStr && a.status !== "cancelled" && (selectedBarberId === "all" || a.barber_id === selectedBarberId)
            );
            return (
              <button
                type="button"
                key={day.dateStr}
                className={`admin-week-day-card ${day.isSelected ? "is-selected" : ""} ${day.isToday ? "is-today" : ""}`}
                onClick={() => setSelectedDate(day.dateStr)}
              >
                <span className="admin-week-day-name">{day.dayName}</span>
                <strong className="admin-week-day-num">{day.dayNum}</strong>
                <span className="admin-week-day-count">
                  {dayApts.length} {dayApts.length === 1 ? "agendamento" : "agendamentos"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Timeline View */}
      <div className="admin-timeline-panel">
        <div className="admin-timeline-header">
          <h3>
            Agenda de {formatDateBR(selectedDate)} · {selectedBarberId === "all" ? "Equipe Toda" : barbers.find(b => b.id === selectedBarberId)?.name}
          </h3>
          <span className="admin-timeline-count">
            {dayAppointments.length} clientes agendados · {dayBlocks.length} bloqueios
          </span>
        </div>

        {dayBlocks.length > 0 && (
          <div className="admin-day-blocks-list">
            {dayBlocks.map((blk) => (
              <div key={blk.id} className="admin-block-card">
                <Lock size={16} />
                <div>
                  <strong>
                    {blk.is_full_day ? "Dia Inteiro Bloqueado" : `${blk.start_time} às ${blk.end_time}`}
                  </strong>
                  <span> — {blk.reason}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="admin-timeline-grid">
          {HOURS_GRID.map((timeSlot) => {
            const slotApts = dayAppointments.filter(
              (a) => a.start_time <= timeSlot && a.end_time > timeSlot
            );
            const isSlotBlocked = dayBlocks.some(
              (b) => b.is_full_day || (b.start_time && b.end_time && b.start_time <= timeSlot && b.end_time > timeSlot)
            );

            return (
              <div
                key={timeSlot}
                className={`admin-timeline-row ${slotApts.length > 0 ? "has-apt" : ""} ${isSlotBlocked ? "is-blocked" : ""}`}
              >
                <div className="admin-timeline-time">{timeSlot}</div>

                <div className="admin-timeline-slot-content">
                  {isSlotBlocked && (
                    <div className="admin-slot-block-tag">
                      <Lock size={12} />
                      <span>Horário Bloqueado</span>
                    </div>
                  )}

                  {slotApts.length > 0 ? (
                    <div className="admin-slot-appointments">
                      {slotApts.map((apt) => (
                        <div key={apt.id} className={`admin-apt-chip status-${apt.status}`}>
                          <div className="admin-apt-chip-header">
                            <span className="admin-apt-chip-time">
                              {apt.start_time} - {apt.end_time}
                            </span>
                            <span className={`admin-status-badge status-${apt.status}`}>
                              {apt.status === "completed" ? "Concluído" : apt.status === "confirmed" ? "Confirmado" : "Pendente"}
                            </span>
                          </div>

                          <div className="admin-apt-chip-body">
                            <strong>{apt.customer_name}</strong>
                            <span className="admin-apt-chip-service">
                              <Scissors size={12} /> {apt.service_name} (R$ {apt.service_price})
                            </span>
                            <span className="admin-apt-chip-barber">
                              <User size={12} /> {apt.barber_name}
                            </span>
                          </div>

                          <div className="admin-apt-chip-actions">
                            <a
                              href={buildAdminToClientWhatsappLink(apt)}
                              target="_blank"
                              rel="noreferrer"
                              className="admin-chip-action-btn"
                              title="WhatsApp"
                            >
                              <MessageCircle size={14} />
                            </a>
                            {apt.status !== "completed" && (
                              <button
                                type="button"
                                className="admin-chip-action-btn"
                                onClick={async () => {
                                  await appointmentService.updateStatus(apt.id, "completed");
                                  loadData();
                                }}
                                title="Concluir"
                              >
                                <CheckCircle2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !isSlotBlocked ? (
                    <span className="admin-slot-available-text">Livre</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
