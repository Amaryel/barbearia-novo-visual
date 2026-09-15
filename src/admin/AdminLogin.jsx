import { useState } from "react";
import { authService } from "../services/authService";
import { Lock, Mail, ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react";

export default function AdminLogin({ onLoginSuccess, onBackToSite }) {
  const [email, setEmail] = useState("admin@novovisual.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await authService.login(email, password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || "Erro ao efetuar login");
    } finally {
      setLoading(false);
    }
  }

  function handleQuickAdmin() {
    setEmail("admin@novovisual.com");
    setPassword("admin123");
  }

  function handleQuickBarber() {
    setEmail("marcos@novovisual.com");
    setPassword("barber123");
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <ShieldCheck size={32} />
          </div>
          <p className="kicker">Barbearia Novo Visual</p>
          <h2>Painel Administrativo</h2>
          <p className="admin-login-sub">
            Acesso restrito para gestão de agenda, serviços, equipe e atendimentos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && <div className="admin-alert admin-alert-error">{error}</div>}

          <div className="admin-field">
            <label htmlFor="admin-email">E-mail ou Usuário</label>
            <div className="admin-input-icon-wrap">
              <Mail size={18} className="admin-input-icon" />
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@novovisual.com"
                required
              />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="admin-password">Senha de Acesso</label>
            <div className="admin-input-icon-wrap">
              <Lock size={18} className="admin-input-icon" />
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary admin-login-btn" disabled={loading}>
            {loading ? "Entrando..." : "Acessar Painel"}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="admin-quick-login">
          <p className="admin-quick-login-title">Acessos Rápidos de Demonstração:</p>
          <div className="admin-quick-buttons">
            <button type="button" onClick={handleQuickAdmin} className="admin-quick-btn">
              Gestor (Admin Geral)
            </button>
            <button type="button" onClick={handleQuickBarber} className="admin-quick-btn">
              Marcos Almeida (Barbeiro)
            </button>
          </div>
        </div>

        <div className="admin-login-footer">
          <button type="button" onClick={onBackToSite} className="admin-back-btn">
            <ArrowLeft size={16} />
            Voltar para a Landing Page
          </button>
        </div>
      </div>
    </div>
  );
}
