import { useState, useEffect } from "react";
import { serviceService } from "../services/serviceService";
import { storage } from "../services/storage";
import { Plus, Edit2, Trash2, Scissors, Clock, Check, X, ToggleLeft, ToggleRight } from "lucide-react";

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: "",
    is_active: true,
  });
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const list = await serviceService.getAll();
      setServices(list);
    } catch (err) {
      console.error("Erro ao carregar serviços:", err);
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
    setEditingService(null);
    setForm({
      name: "",
      description: "",
      price: "45",
      duration_minutes: "40",
      is_active: true,
    });
    setError("");
    setIsModalOpen(true);
  }

  function handleOpenEdit(srv) {
    setEditingService(srv);
    setForm({
      name: srv.name,
      description: srv.description || "",
      price: String(srv.price),
      duration_minutes: String(srv.duration_minutes),
      is_active: srv.is_active,
    });
    setError("");
    setIsModalOpen(true);
  }

  async function handleToggle(id) {
    try {
      await serviceService.toggleActive(id);
      loadData();
    } catch (err) {
      console.error("Erro ao alterar status:", err);
    }
  }

  async function handleDelete(id) {
    if (window.confirm("Deseja realmente excluir este serviço da tabela?")) {
      try {
        await serviceService.delete(id);
        loadData();
      } catch (err) {
        console.error("Erro ao excluir:", err);
      }
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Informe o nome do serviço.");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setError("Informe um preço válido maior que zero.");
      return;
    }
    if (!form.duration_minutes || Number(form.duration_minutes) < 5) {
      setError("Informe uma duração mínima de 5 minutos.");
      return;
    }

    try {
      if (editingService) {
        await serviceService.update(editingService.id, {
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          duration_minutes: Number(form.duration_minutes),
          is_active: form.is_active,
        });
      } else {
        await serviceService.create({
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          duration_minutes: Number(form.duration_minutes),
          is_active: form.is_active,
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || "Erro ao salvar serviço.");
    }
  }

  return (
    <div className="admin-services">
      <div className="admin-page-header">
        <div>
          <h2>Catálogo de Serviços</h2>
          <p className="admin-page-sub">
            Gerencie os procedimentos, preços e duração em minutos para o cálculo da agenda
          </p>
        </div>

        <div className="admin-header-actions">
          <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            Adicionar Novo Serviço
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="booking-flow__spinner" />
          <p>Carregando serviços...</p>
        </div>
      ) : (
        <div className="admin-services-grid">
          {services.map((srv) => (
            <div key={srv.id} className={`admin-service-card ${srv.is_active ? "" : "is-inactive"}`}>
              <div className="admin-service-card-top">
                <div className="admin-service-icon-box">
                  <Scissors size={20} />
                </div>
                <div className="admin-service-status-toggle">
                  <button
                    type="button"
                    className={`admin-toggle-status-btn ${srv.is_active ? "active" : "inactive"}`}
                    onClick={() => handleToggle(srv.id)}
                    title={srv.is_active ? "Clique para desativar" : "Clique para ativar"}
                  >
                    {srv.is_active ? (
                      <>
                        <ToggleRight size={22} className="text-brass" />
                        <span>Ativo no Agendamento</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={22} />
                        <span>Inativo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="admin-service-body">
                <h3>{srv.name}</h3>
                <p>{srv.description || "Sem descrição informada."}</p>
              </div>

              <div className="admin-service-meta-row">
                <div className="admin-service-price">
                  <span className="admin-meta-label">Valor</span>
                  <strong>R$ {srv.price}</strong>
                </div>

                <div className="admin-service-duration">
                  <span className="admin-meta-label">Duração</span>
                  <strong>
                    <Clock size={14} /> {srv.duration_minutes} min
                  </strong>
                </div>
              </div>

              <div className="admin-service-actions">
                <button
                  type="button"
                  className="btn btn-outline admin-btn-sm"
                  onClick={() => handleOpenEdit(srv)}
                >
                  <Edit2 size={14} />
                  Editar
                </button>
                <button
                  type="button"
                  className="btn btn-outline admin-btn-sm text-danger"
                  onClick={() => handleDelete(srv.id)}
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro / Edição */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingService ? "Editar Serviço" : "Novo Serviço"}</h3>
              <button type="button" className="admin-modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-form">
              {error && <div className="admin-alert admin-alert-error">{error}</div>}

              <div className="admin-field">
                <label>Nome do Serviço *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Corte Degradê Navalhado"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="admin-field">
                <label>Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Detalhes do que está incluso no serviço"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="admin-modal-grid">
                <div className="admin-field">
                  <label>Preço em Reais (R$) *</label>
                  <input
                    type="number"
                    step="0.50"
                    min="1"
                    required
                    placeholder="45.00"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>

                <div className="admin-field">
                  <label>Duração em Minutos *</label>
                  <input
                    type="number"
                    step="5"
                    min="5"
                    required
                    placeholder="40"
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                  />
                  <small className="admin-field-hint">
                    Usado no cálculo de disponibilidade da agenda.
                  </small>
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  <span>Disponibilizar este serviço para agendamento online</span>
                </label>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingService ? "Salvar Alterações" : "Cadastrar Serviço"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
