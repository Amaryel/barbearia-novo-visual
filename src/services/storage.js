import { DEFAULT_BARBERSHOP_ID } from "../types/database";

const STORAGE_KEYS = {
  SERVICES: "novo-visual:services",
  BARBERS: "novo-visual:barbers",
  APPOINTMENTS: "novo-visual:appointments",
  BUSINESS_HOURS: "novo-visual:business_hours",
  BLOCKED_TIMES: "novo-visual:blocked_times",
  SETTINGS: "novo-visual:settings",
  AUTH: "novo-visual:auth",
};

const EVENT_NAME = "novo_visual_store_updated";

function getTodayFormatted(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const INITIAL_SERVICES = [
  {
    id: "srv-corte",
    barbershop_id: DEFAULT_BARBERSHOP_ID,
    name: "Corte clássico",
    description: "Corte na tesoura e máquina, com acabamento navalhado e finalização.",
    price: 45,
    duration_minutes: 40,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "srv-barba",
    barbershop_id: DEFAULT_BARBERSHOP_ID,
    name: "Barba completa",
    description: "Toalha quente, navalha e hidratação para um acabamento preciso.",
    price: 35,
    duration_minutes: 30,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "srv-sobrancelha",
    barbershop_id: DEFAULT_BARBERSHOP_ID,
    name: "Design de sobrancelha",
    description: "Alinhamento e limpeza para uma expressão mais nítida.",
    price: 20,
    duration_minutes: 15,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "srv-combo",
    barbershop_id: DEFAULT_BARBERSHOP_ID,
    name: "Combo corte + barba",
    description: "O ritual completo — corte, barba e toalha quente em uma única sessão.",
    price: 70,
    duration_minutes: 70,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "srv-tratamento",
    barbershop_id: DEFAULT_BARBERSHOP_ID,
    name: "Tratamento capilar",
    description: "Hidratação profunda e massagem para couro cabeludo e fios saudáveis.",
    price: 55,
    duration_minutes: 45,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const INITIAL_BARBERS = [
  {
    id: "barb-leandro",
    barbershop_id: DEFAULT_BARBERSHOP_ID,
    name: "Leandro",
    phone: "(89) 9 9436-7235",
    specialties: "Cortes clássicos, degradê navalhado, barba na toalha quente e visagismo",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const INITIAL_BUSINESS_HOURS = [
  {
    id: "bh-0",
    barbershop_id: DEFAULT_BARBERSHOP_ID,
    day_of_week: 0,
    day_name: "Domingo",
    is_open: false,
    open_time: "09:00",
    close_time: "14:00",
    break_start: null,
    break_end: null,
  },
  {
    id: "bh-1",
    barbershop_id: DEFAULT_BARBERSHOP_ID,
    day_of_week: 1,
    day_name: "Segunda-feira",
    is_open: true,
    open_time: "08:00",
    close_time: "18:00",
    break_start: "12:00",
    break_end: "13:00",
  },
  {
    id: "bh-2",
    barbershop_id: DEFAULT_BARBERSHOP_ID,
    day_of_week: 2,
    day_name: "Terça-feira",
    is_open: true,
    open_time: "08:00",
    close_time: "18:00",
    break_start: "12:00",
    break_end: "13:00",
  },
  {
    id: "bh-3",
    barbershop_id: DEFAULT_BARBERSHOP_ID,
    day_of_week: 3,
    day_name: "Quarta-feira",
    is_open: true,
    open_time: "08:00",
    close_time: "18:00",
    break_start: "12:00",
    break_end: "13:00",
  },
  {
    id: "bh-4",
    barbershop_id: DEFAULT_BARBERSHOP_ID,
    day_of_week: 4,
    day_name: "Quinta-feira",
    is_open: true,
    open_time: "08:00",
    close_time: "18:00",
    break_start: "12:00",
    break_end: "13:00",
  },
  {
    id: "bh-5",
    barbershop_id: DEFAULT_BARBERSHOP_ID,
    day_of_week: 5,
    day_name: "Sexta-feira",
    is_open: true,
    open_time: "08:00",
    close_time: "18:00",
    break_start: "12:00",
    break_end: "13:00",
  },
  {
    id: "bh-6",
    barbershop_id: DEFAULT_BARBERSHOP_ID,
    day_of_week: 6,
    day_name: "Sábado",
    is_open: true,
    open_time: "08:00",
    close_time: "18:00",
    break_start: "12:00",
    break_end: "13:00",
  },
];

const INITIAL_BLOCKED_TIMES = [];

const INITIAL_APPOINTMENTS = [
  {
    id: "apt-1",
    barbershop_id: DEFAULT_BARBERSHOP_ID,
    customer_id: "cust-1",
    customer_name: "Rafael Martins",
    customer_phone: "(89) 9 9988-7711",
    service_id: "srv-combo",
    service_name: "Combo corte + barba",
    service_price: 70,
    duration_minutes: 70,
    barber_id: "barb-leandro",
    barber_name: "Leandro",
    date: getTodayFormatted(0),
    start_time: "09:00",
    end_time: "10:10",
    status: "confirmed",
    notes: "Cliente pontual, prefere degradê médio.",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "apt-2",
    barbershop_id: DEFAULT_BARBERSHOP_ID,
    customer_id: "cust-2",
    customer_name: "Lucas Fontes",
    customer_phone: "(89) 9 9911-4455",
    service_id: "srv-corte",
    service_name: "Corte clássico",
    service_price: 45,
    duration_minutes: 40,
    barber_id: "barb-leandro",
    barber_name: "Leandro",
    date: getTodayFormatted(0),
    start_time: "10:30",
    end_time: "11:10",
    status: "confirmed",
    notes: "Primeira visita.",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

class LocalStorageStore {
  constructor() {
    this.init();
  }

  init() {
    if (typeof window === "undefined") return;

    if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
      this.set(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BARBERS)) {
      this.set(STORAGE_KEYS.BARBERS, INITIAL_BARBERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BUSINESS_HOURS)) {
      this.set(STORAGE_KEYS.BUSINESS_HOURS, INITIAL_BUSINESS_HOURS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BLOCKED_TIMES)) {
      this.set(STORAGE_KEYS.BLOCKED_TIMES, INITIAL_BLOCKED_TIMES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      this.set(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    }
  }

  get(key, fallback = []) {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error(`Erro ao ler ${key}:`, e);
      return fallback;
    }
  }

  set(key, value) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify(key);
    } catch (e) {
      console.error(`Erro ao salvar ${key}:`, e);
    }
  }

  notify(key) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { key } }));
    }
  }

  subscribe(callback) {
    if (typeof window === "undefined") return () => {};
    const listener = (event) => callback(event.detail);
    window.addEventListener(EVENT_NAME, listener);
    return () => window.removeEventListener(EVENT_NAME, listener);
  }

  resetDefaults() {
    this.set(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    this.set(STORAGE_KEYS.BARBERS, INITIAL_BARBERS);
    this.set(STORAGE_KEYS.BUSINESS_HOURS, INITIAL_BUSINESS_HOURS);
    this.set(STORAGE_KEYS.BLOCKED_TIMES, INITIAL_BLOCKED_TIMES);
    this.set(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  }
}

export const storage = new LocalStorageStore();
export { STORAGE_KEYS };
