import { useState, useEffect, useMemo } from "react";
import { appointmentService, buildAdminToClientWhatsappLink, formatDateBR } from "../services/appointmentService";
import { barberService } from "../services/barberService";
import { serviceService } from "../services/serviceService";
import { storage } from "../services/storage";
import { Plus, Search, MessageCircle, Trash2, Edit2, Calendar, X } from "lucide-react";

export default function AdminAppointments({ initialDateFilter = "" }) {
  const [appointments, setAppointments] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [barberFilter, setBarberFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(initialDateFilter);

  // Modal de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState(null);
  const [modalForm, setModalForm] = useState({
    customer_name: "",
    customer_phone: "",
    service_id: "",
    barber_id: "",
    date: new Date().toISOString().slice(0, 10),
    start_time: "09:00",
    status: "confirmed",
    notes: "",
  });
  const [modalError, setModalError] = useState("");

  async function loadData() {
    try {
      const [aptList, barbList, srvList] = await Promise.all([
        appointmentService.getAll(),
        barberService.getAll(),
        serviceService.getAll(),
      ]);
      setAppointments(aptList);
      setBarbers(barbList);
      setServices(srvList);
    } catch (err) {
      console.error("Erro ao carregar agendamentos:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const unsubscribe = storage.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (barberFilter !== "all" && a.barber_id !== barberFilter) return false;
      if (dateFilter && a.date !== dateFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchesName = (a.customer_name || "").toLowerCase().includes(q);
        const matchesPhone = (a.customer_phone || "").includes(q);
        const matchesService = (a.service_name || "").toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesService) return false;
      }
      return true;
    });
  }, [appointments, statusFilter, barberFilter, dateFilter, search]);

  function handleOpenCreate() {
    setEditingApt(null);
    setModalForm({
      customer_name: "",
      customer_phone: "",
      service_id: services.length > 0 ? services[0].id : "",
      barber_id: barbers.length > 0 ? barbers[0].id : "qualquer",
      date: dateFilter || new Date().toISOString().slice(0, 10),
      start_time: "10:00",
      status: "confirmed",
      notes: "",
    });
    setModalError("");
    setIsModalOpen(true);
  }

  function handleOpenEdit(apt) {
    setEditingApt(apt);
    setModalForm({
      customer_name: apt.customer_name,
      customer_phone: apt.customer_phone,
      service_id: apt.service_id,
      barber_id: apt.barber_id,
      date: apt.date,
      start_time: apt.start_time,
      status: apt.status,
      notes: apt.notes || "",
    });
    setModalError("");
    setIsModalOpen(true);
  }

  async function handleSaveModal(e) {
    e.preventDefault();
    setModalError("");

    if (!modalForm.customer_name.trim()) {
      setModalError("Informe o nome do cliente.");
      return;
    }
    if (!modalForm.service_id) {
      setModalError("Selecione um serviço.");
      return;
    }

    const selectedSrv = services.find((s) => s.id === modalForm.service_id);
    const selectedBarb = barbers.find((b) => b.id === modalForm.barber_id) || { id: "qualquer", name: "Qualquer disponível" };

    try {
      if (editingApt) {
        await appointmentService.update(editingApt.id, {
          customer_name: modalForm.customer_name.trim(),
          customer_phone: modalForm.customer_phone.trim(),
          service_id: selectedSrv.id,
          service_name: selectedSrv.name,
          service_price: selectedSrv.price,
          duration_minutes: selectedSrv.duration_minutes,
          barber_id: selectedBarb.id,
          barber_name: selectedBarb.name,
          date: modalForm.date,
          start_time: modalForm.start_time,
          status: modalForm.status,
          notes: modalForm.notes.trim(),
        });
      } else {
        await appointmentService.create({
          customer_name: modalForm.customer_name.trim(),
          customer_phone: modalForm.customer_phone.trim(),
          service_id: selectedSrv.id,
          service_name: selectedSrv.name,
          service_price: selectedSrv.price,
          duration_minutes: selectedSrv.duration_minutes,
          barber_id: selectedBarb.id,
          barber_name: selectedBarb.name,
          date: modalForm.date,
          start_time: modalForm.start_time,
          status: modalForm.status,
          notes: modalForm.notes.trim(),
        });
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setModalError(err.message || "Erro ao salvar agendamento.");
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await appointmentService.updateStatus(id, newStatus);
      loadData();
    } catch (err) {
      console.error("Erro ao alterar status:", err);
    }
  }

  async function handleDelete(id) {
    if (window.confirm("Deseja realmente excluir este agendamento?")) {
      try {
        await appointmentService.delete(id);
        loadData();
      } catch (err) {
        console.error("Erro ao excluir:", err);
      }
    }
  }

  return (
    <div className="admin-appointments">
      <div className="admin-page-header">
        <div>
          <h2>Gestão de Agendamentos</h2>
          <p className="admin-page-sub">
            Consulte, confirme, edite ou cancele os agendamentos cadastrados
          </p>
        </div>

        <div className="admin-header-actions">
          <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            Novo Agendamento Manual
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="admin-filters-card">
        <div className="admin-filter-search">
          <Search size={18} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Buscar por cliente, WhatsApp ou serviço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="admin-clear-search">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="admin-filters-row">
          <div className="admin-filter-select-wrap">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-select">
              <option value="all">Todos os Status</option>
              <option value="confirmed">Confirmados</option>
              <option value="pending">Pendentes</option>
              <option value="completed">Concluídos</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>

          <div className="admin-filter-select-wrap">
            <label>Barbeiro:</label>
            <select value={barberFilter} onChange={(e) => setBarberFilter(e.target.value)} className="admin-select">
              <option value="all">Todos os Profissionais</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-filter-select-wrap">
            <label>Data:</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="admin-select"
            />
            {dateFilter && (
              <button type="button" className="btn btn-outline admin-btn-sm" onClick={() => setDateFilter("")}>
                Limpar Data
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-panel-section">
        <div className="admin-section-header">
          <h3>
            Lista de Agendamentos ({filteredAppointments.length}{" "}
            {filteredAppointments.length === 1 ? "resultado" : "resultados"})
          </h3>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="booking-flow__spinner" />
            <p>Carregando agendamentos...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="admin-empty-state">
            <Calendar size={32} />
            <p>Nenhum agendamento encontrado com os filtros selecionados.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Data e Horário</th>
                  <th>Cliente</th>
                  <th>Contato</th>
                  <th>Serviço</th>
                  <th>Barbeiro</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className={`status-row-${apt.status}`}>
                    <td>
                      <div className="admin-cell-datetime">
                        <strong className="font-mono">{formatDateBR(apt.date)}</strong>
                        <span className="admin-table-sub font-mono">
                          {apt.start_time} - {apt.end_time}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-table-customer">
                        <strong>{apt.customer_name}</strong>
                        {apt.notes && <span className="admin-table-sub">"{apt.notes}"</span>}
                      </div>
                    </td>
                    <td>
                      <div className="admin-cell-phone">
                        <span>{apt.customer_phone}</span>
                        <a
                          href={buildAdminToClientWhatsappLink(apt)}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-whatsapp-badge"
                          title="Conversar no WhatsApp"
                        >
                          <MessageCircle size={14} /> WhatsApp
                        </a>
                      </div>
                    </td>
                    <td>
                      <span className="admin-service-pill">{apt.service_name}</span>
                    </td>
                    <td>{apt.barber_name}</td>
                    <td className="font-mono font-bold">R$ {apt.service_price}</td>
                    <td>
                      <select
                        value={apt.status}
                        onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                        className={`admin-status-dropdown status-${apt.status}`}
                      >
                        <option value="confirmed">Confirmado</option>
                        <option value="pending">Pendente</option>
                        <option value="completed">Concluído</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                    <td>
                      <div className="admin-table-actions" style={{ justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="admin-action-icon"
                          onClick={() => handleOpenEdit(apt)}
                          title="Editar Agendamento"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          className="admin-action-icon text-danger"
                          onClick={() => handleDelete(apt.id)}
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Criação / Edição */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingApt ? "Editar Agendamento" : "Novo Agendamento Manual"}</h3>
              <button type="button" className="admin-modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="admin-modal-form">
              {modalError && <div className="admin-alert admin-alert-error">{modalError}</div>}

              <div className="admin-modal-grid">
                <div className="admin-field">
                  <label>Nome do Cliente *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.customer_name}
                    onChange={(e) => setModalForm({ ...modalForm, customer_name: e.target.value })}
                    placeholder="Nome completo"
                  />
                </div>

                <div className="admin-field">
                  <label>WhatsApp / Telefone *</label>
                  <input
                    type="tel"
                    required
                    value={modalForm.customer_phone}
                    onChange={(e) => setModalForm({ ...modalForm, customer_phone: e.target.value })}
                    placeholder="(89) 9 9999-9999"
                  />
                </div>

                <div className="admin-field">
                  <label>Serviço *</label>
                  <select
                    value={modalForm.service_id}
                    onChange={(e) => setModalForm({ ...modalForm, service_id: e.target.value })}
                    className="admin-select"
                    required
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (R$ {s.price} · {s.duration_minutes} min)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-field">
                  <label>Profissional</label>
                  <select
                    value={modalForm.barber_id}
                    onChange={(e) => setModalForm({ ...modalForm, barber_id: e.target.value })}
                    className="admin-select"
                  >
                    <option value="qualquer">Qualquer disponível</option>
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-field">
                  <label>Data *</label>
                  <input
                    type="date"
                    required
                    value={modalForm.date}
                    onChange={(e) => setModalForm({ ...modalForm, date: e.target.value })}
                  />
                </div>

                <div className="admin-field">
                  <label>Horário de Início *</label>
                  <input
                    type="time"
                    required
                    value={modalForm.start_time}
                    onChange={(e) => setModalForm({ ...modalForm, start_time: e.target.value })}
                  />
                </div>

                <div className="admin-field">
                  <label>Status do Atendimento</label>
                  <select
                    value={modalForm.status}
                    onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                    className="admin-select"
                  >
                    <option value="confirmed">Confirmado</option>
                    <option value="pending">Pendente</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>

                <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Observações</label>
                  <textarea
                    rows={2}
                    value={modalForm.notes}
                    onChange={(e) => setModalForm({ ...modalForm, notes: e.target.value })}
                    placeholder="Preferências do corte ou avisos internos"
                  />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingApt ? "Salvar Alterações" : "Criar Agendamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
