import { useState, useEffect } from "react";
import { barberService } from "../services/barberService";
import { storage } from "../services/storage";
import { Plus, Edit2, Trash2, User, Phone, ToggleLeft, ToggleRight, X, ShieldCheck } from "lucide-react";

export default function AdminBarbers() {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    specialties: "",
    avatar_url: "",
    is_active: true,
  });
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const list = await barberService.getAll();
      setBarbers(list);
    } catch (err) {
      console.error("Erro ao carregar barbeiros:", err);
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
    setEditingBarber(null);
    setForm({
      name: "",
      phone: "",
      specialties: "Cortes clássicos, degradê navalhado e barba na toalha quente",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
      is_active: true,
    });
    setError("");
    setIsModalOpen(true);
  }

  function handleOpenEdit(barb) {
    setEditingBarber(barb);
    setForm({
      name: barb.name,
      phone: barb.phone || "",
      specialties: barb.specialties || "",
      avatar_url: barb.avatar_url || "",
      is_active: barb.is_active,
    });
    setError("");
    setIsModalOpen(true);
  }

  async function handleToggle(id) {
    try {
      await barberService.toggleActive(id);
      loadData();
    } catch (err) {
      console.error("Erro ao alterar status do barbeiro:", err);
    }
  }

  async function handleDelete(id) {
    if (window.confirm("Deseja realmente remover este profissional da equipe?")) {
      try {
        await barberService.delete(id);
        loadData();
      } catch (err) {
        console.error("Erro ao excluir barbeiro:", err);
      }
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Informe o nome do profissional.");
      return;
    }

    try {
      if (editingBarber) {
        await barberService.update(editingBarber.id, {
          name: form.name.trim(),
          phone: form.phone.trim(),
          specialties: form.specialties.trim(),
          avatar_url: form.avatar_url.trim(),
          is_active: form.is_active,
        });
      } else {
        await barberService.create({
          name: form.name.trim(),
          phone: form.phone.trim(),
          specialties: form.specialties.trim(),
          avatar_url: form.avatar_url.trim(),
          is_active: form.is_active,
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || "Erro ao salvar profissional.");
    }
  }

  return (
    <div className="admin-barbers">
      <div className="admin-page-header">
        <div>
          <h2>Equipe de Profissionais</h2>
          <p className="admin-page-sub">
            Gerencie os barbeiros, telefones de contato, especialidades e escalas ativas
          </p>
        </div>

        <div className="admin-header-actions">
          <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            Adicionar Barbeiro
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="booking-flow__spinner" />
          <p>Carregando equipe...</p>
        </div>
      ) : (
        <div className="admin-barbers-grid">
          {barbers.map((barb) => (
            <div key={barb.id} className={`admin-barber-card ${barb.is_active ? "" : "is-inactive"}`}>
              <div className="admin-barber-top">
                <img
                  src={barb.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"}
                  alt={barb.name}
                  className="admin-barber-avatar-lg"
                />

                <div className="admin-barber-status-toggle">
                  <button
                    type="button"
                    className={`admin-toggle-status-btn ${barb.is_active ? "active" : "inactive"}`}
                    onClick={() => handleToggle(barb.id)}
                    title={barb.is_active ? "Clique para desativar escala" : "Clique para ativar"}
                  >
                    {barb.is_active ? (
                      <>
                        <ToggleRight size={22} className="text-brass" />
                        <span>Escala Ativa</span>
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

              <div className="admin-barber-body">
                <h3>{barb.name}</h3>
                <div className="admin-barber-contact">
                  <Phone size={14} />
                  <span>{barb.phone || "Sem telefone cadastrado"}</span>
                </div>
                <p className="admin-barber-specialties">
                  {barb.specialties || "Cortes e barbas em geral"}
                </p>
              </div>

              <div className="admin-barber-actions">
                <button
                  type="button"
                  className="btn btn-outline admin-btn-sm"
                  onClick={() => handleOpenEdit(barb)}
                >
                  <Edit2 size={14} />
                  Editar
                </button>
                <button
                  type="button"
                  className="btn btn-outline admin-btn-sm text-danger"
                  onClick={() => handleDelete(barb.id)}
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingBarber ? "Editar Barbeiro" : "Adicionar Barbeiro"}</h3>
              <button type="button" className="admin-modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-form">
              {error && <div className="admin-alert admin-alert-error">{error}</div>}

              <div className="admin-field">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Marcos Almeida"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="admin-field">
                <label>Telefone / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="(89) 9 9999-9999"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="admin-field">
                <label>Especialidades / Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Especialista em degradê, visagismo e barboterapia"
                  value={form.specialties}
                  onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                />
              </div>

              <div className="admin-field">
                <label>URL da Foto de Perfil</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.avatar_url}
                  onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                />
              </div>

              <div className="admin-field">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  <span>Barbeiro ativo (exibido na seleção de agendamento online)</span>
                </label>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBarber ? "Salvar Alterações" : "Cadastrar Barbeiro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
