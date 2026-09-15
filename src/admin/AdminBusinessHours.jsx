import { useState, useEffect } from "react";
import { businessHoursService } from "../services/businessHoursService";
import { storage } from "../services/storage";
import { Clock, CheckCircle2, AlertCircle, Save, Coffee, Calendar } from "lucide-react";

export default function AdminBusinessHours() {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  async function loadData() {
    try {
      const list = await businessHoursService.getAll();
      setHours(list);
    } catch (err) {
      console.error("Erro ao carregar horários:", err);
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

  function handleDayChange(index, field, value) {
    const next = [...hours];
    next[index] = { ...next[index], [field]: value };
    setHours(next);
    setSavedSuccess(false);
  }

  async function handleSaveAll(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await businessHoursService.updateAll(hours);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error("Erro ao salvar horários:", err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="booking-flow__spinner" />
        <p>Carregando horários de funcionamento...</p>
      </div>
    );
  }

  return (
    <div className="admin-business-hours">
      <div className="admin-page-header">
        <div>
          <h2>Horários de Funcionamento</h2>
          <p className="admin-page-sub">
            Defina os horários de abertura, encerramento e intervalos de almoço por dia da semana
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveAll}
            disabled={saving}
          >
            <Save size={16} />
            {saving ? "Salvando..." : "Salvar Horários"}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="admin-alert admin-alert-success">
          <CheckCircle2 size={18} />
          <span>Horários de funcionamento atualizados com sucesso na agenda!</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="admin-hours-form">
        <div className="admin-hours-list">
          {hours.map((bh, idx) => (
            <div key={bh.id || idx} className={`admin-hour-row ${bh.is_open ? "" : "is-closed"}`}>
              <div className="admin-hour-day-col">
                <label className="admin-switch-wrap">
                  <input
                    type="checkbox"
                    checked={bh.is_open}
                    onChange={(e) => handleDayChange(idx, "is_open", e.target.checked)}
                  />
                  <span className="admin-switch-slider" />
                </label>
                <div>
                  <strong className="admin-hour-day-title">{bh.day_name}</strong>
                  <span className={`admin-day-status-label ${bh.is_open ? "text-success" : "text-faint"}`}>
                    {bh.is_open ? "Aberto" : "Fechado"}
                  </span>
                </div>
              </div>

              {bh.is_open ? (
                <div className="admin-hour-inputs-col">
                  <div className="admin-hour-time-group">
                    <label>Expediente</label>
                    <div className="admin-hour-time-pair">
                      <input
                        type="time"
                        value={bh.open_time || "08:00"}
                        onChange={(e) => handleDayChange(idx, "open_time", e.target.value)}
                        className="admin-time-input"
                      />
                      <span className="admin-hour-sep">às</span>
                      <input
                        type="time"
                        value={bh.close_time || "18:00"}
                        onChange={(e) => handleDayChange(idx, "close_time", e.target.value)}
                        className="admin-time-input"
                      />
                    </div>
                  </div>

                  <div className="admin-hour-time-group">
                    <label>
                      <Coffee size={12} /> Intervalo / Almoço (opcional)
                    </label>
                    <div className="admin-hour-time-pair">
                      <input
                        type="time"
                        value={bh.break_start || ""}
                        onChange={(e) => handleDayChange(idx, "break_start", e.target.value || null)}
                        className="admin-time-input"
                        placeholder="Início"
                      />
                      <span className="admin-hour-sep">às</span>
                      <input
                        type="time"
                        value={bh.break_end || ""}
                        onChange={(e) => handleDayChange(idx, "break_end", e.target.value || null)}
                        className="admin-time-input"
                        placeholder="Fim"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="admin-hour-closed-placeholder">
                  <AlertCircle size={16} />
                  <span>Não haverá expediente e os clientes não poderão agendar neste dia.</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="admin-hours-save-bar">
          <p className="admin-hours-note">
            💡 As regras de intervalos e fechamentos bloqueiam automaticamente os horários no agendamento do cliente.
          </p>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
