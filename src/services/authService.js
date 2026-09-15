import { DEFAULT_BARBERSHOP_ID } from "../types/database";

const AUTH_STORAGE_KEY = "novo-visual:current_user";

const DEMO_USERS = [
  {
    id: "usr-admin-1",
    barbershop_id: DEFAULT_BARBERSHOP_ID,
    email: "admin@novovisual.com",
    name: "Administrador",
    role: "admin",
  },
  {
    id: "usr-marcos",
    barbershop_id: DEFAULT_BARBERSHOP_ID,
    email: "marcos@novovisual.com",
    name: "Marcos Almeida",
    role: "barber",
  },
];

export const authService = {
  getCurrentUser() {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async login(email, password) {
    // Simulação de autenticação (em produção, substituir por supabase.auth.signInWithPassword)
    if (!email) throw new Error("Informe o e-mail ou usuário.");
    if (!password) throw new Error("Informe a senha.");

    const normalizedEmail = email.trim().toLowerCase();
    const user =
      DEMO_USERS.find((u) => u.email.toLowerCase() === normalizedEmail) ||
      {
        id: "usr-" + Date.now(),
        barbershop_id: DEFAULT_BARBERSHOP_ID,
        email: normalizedEmail,
        name: normalizedEmail.split("@")[0] || "Gestor",
        role: "admin",
      };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  async logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    return true;
  },

  isAuthenticated() {
    return Boolean(this.getCurrentUser());
  },
};
