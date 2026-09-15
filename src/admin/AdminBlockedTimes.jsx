import { useState, useEffect } from "react";
import { blockedTimeService } from "../services/blockedTimeService";
import { barberService } from "../services/barberService";
import { formatDateBR } from "../services/appointmentService";
import { storage } from "../services/storage";
import { Plus, Trash2, Lock, Calendar, Clock, AlertCircle, X, User } from "lucide-react";

export default function AdminBlockedTimes({ initialDate = "" }) {
  const [blocks, setBlocks] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    date: initialDate || new Date().toISOString().slice(0, 10),
    is_full_day: false,
    start_time: "14:00",
    end_time: "16:00",
    barber_id: "",
    reason: "Compromisso pessoal",
  });
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [bList, barbList] = await Promise.all([
        blockedTimeService.getAll(),
        barberService.getAll(),
      ]);
      setBlocks(bList);
      setBarbers(barbList);
    } catch (err) {
      console.error("Erro ao carregar bloqueios:", err);
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

  function handleOpenCreate() {
    setForm({
      date: initialDate || new Date().toISOString().slice(0, 10),
      is_full_day: false,
      start_time: "14:00",
      end_time: "16:00",
      barber_id: "",
      reason: "",
    });
    setError("");
    setIsModalOpen(true);
  }

  async function handleDelete(id) {
    if (window.confirm("Deseja remover este bloqueio e liberar o horário?")) {
      try {
        await blockedTimeService.delete(id);
        loadData();
      } catch (err) {
        console.error("Erro ao excluir bloqueio:", err);
      }
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    if (!form.date) {
      setError("Informe a data do bloqueio.");
      return;
    }
    if (!form.is_full_day) {
      if (!form.start_time || !form.end_time) {
        setError("Informe o horário de início e fim do bloqueio.");
        return;
      }
      if (form.start_time >= form.end_time) {
        setError("O horário final deve ser posterior ao horário inicial.");
        return;
      }
    }
    if (!form.reason.trim()) {
      setError("Informe um motivo ou justificativa.");
      return;
    }

    try {
      await blockedTimeService.create({
        date: form.date,
        is_full_day: form.is_full_day,
        start_time: form.start_time,
        end_time: form.end_time,
        barber_id: form.barber_id || null,
        reason: form.reason.trim(),
      });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || "Erro ao criar bloqueio.");
    }
  }

  return (
    <div className="admin-blocked-times">
      <div className="admin-page-header">
        <div>
          <h2>Bloqueio de Horários & Indisponibilidades</h2>
          <p className="admin-page-sub">
            Bloqueie horários pontuais, intervalos de folga, manutenções ou dias inteiros para a equipe
          </p>
        </div>

        <div className="admin-header-actions">
          <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            Novo Bloqueio de Horário
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="booking-flow__spinner" />
          <p>Carregando bloqueios...</p>
        </div>
      ) : blocks.length === 0 ? (
        <div className="admin-empty-state">
          <Lock size={32} />
          <p>Nenhum horário bloqueado no momento. Toda a grade está disponível conforme o expediente.</p>
        </div>
      ) : (
        <div className="admin-blocks-grid">
          {blocks.map((blk) => {
            const barberObj = barbers.find((b) => b.id === blk.barber_id);
            return (
              <div key={blk.id} className="admin-block-item-card">
                <div className="admin-block-card-top">
                  <div className="admin-block-badge">
                    <Lock size={16} />
                    <span>{blk.is_full_day ? "Dia Inteiro" : "Intervalo"}</span>
                  </div>

                  <button
                    type="button"
                    className="admin-icon-btn text-danger"
                    onClick={() => handleDelete(blk.id)}
                    title="Remover Bloqueio"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="admin-block-card-body">
                  <div className="admin-block-date-row">
                    <Calendar size={16} />
                    <strong>{formatDateBR(blk.date)}</strong>
                  </div>

                  {!blk.is_full_day && (
                    <div className="admin-block-time-row">
                      <Clock size={16} />
                      <span>
                        {blk.start_time} às {blk.end_time}
                      </span>
                    </div>
                  )}

                  <div className="admin-block-barber-row">
                    <User size={16} />
                    <span>{barberObj ? `Barbeiro: ${barberObj.name}` : "Aplica-se a Toda a Equipe"}</span>
                  </div>

                  <div className="admin-block-reason-box">
                    <span className="admin-meta-label">Motivo</span>
                    <p>"{blk.reason}"</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Adicionar Bloqueio de Horário</h3>
              <button type="button" className="admin-modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-form">
              {error && <div className="admin-alert admin-alert-error">{error}</div>}

              <div className="admin-modal-grid">
                <div className="admin-field">
                  <label>Data do Bloqueio *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>

                <div className="admin-field">
                  <label>Profissional Afetado</label>
                  <select
                    value={form.barber_id}
                    onChange={(e) => setForm({ ...form, barber_id: e.target.value })}
                    className="admin-select"
                  >
                    <option value="">Toda a Equipe (Bloqueio Geral)</option>
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.is_full_day}
                    onChange={(e) => setForm({ ...form, is_full_day: e.target.checked })}
                  />
                  <span>Bloquear o dia inteiro (ex: Feriado, Folga total, Treinamento)</span>
                </label>
              </div>

              {!form.is_full_day && (
                <div className="admin-modal-grid">
                  <div className="admin-field">
                    <label>Horário Inicial *</label>
                    <input
                      type="time"
                      required
                      value={form.start_time}
                      onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    />
                  </div>

                  <div className="admin-field">
                    <label>Horário Final *</label>
                    <input
                      type="time"
                      required
                      value={form.end_time}
                      onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="admin-field">
                <label>Motivo ou Observação *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Consulta médica / Manutenção de cadeiras / Feriado municipal"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirmar Bloqueio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
