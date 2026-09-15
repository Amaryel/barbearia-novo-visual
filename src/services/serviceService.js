import { storage, STORAGE_KEYS } from "./storage";
import { DEFAULT_BARBERSHOP_ID } from "../types/database";

/**
 * Serviço de gerenciamento de Serviços da Barbearia
 * Preparado para substituir internamente por chamadas Supabase:
 * const { data, error } = await supabase.from('services').select('*').eq('barbershop_id', barbershopId);
 */
export const serviceService = {
  async getAll(onlyActive = false) {
    const list = storage.get(STORAGE_KEYS.SERVICES, []);
    if (onlyActive) {
      return list.filter((s) => s.is_active);
    }
    return list;
  },

  async getActive() {
    return this.getAll(true);
  },

  async getById(id) {
    const list = storage.get(STORAGE_KEYS.SERVICES, []);
    return list.find((s) => s.id === id) || null;
  },

  async create(serviceData) {
    const list = storage.get(STORAGE_KEYS.SERVICES, []);
    const newService = {
      id: "srv-" + (crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Date.now()),
      barbershop_id: serviceData.barbershop_id || DEFAULT_BARBERSHOP_ID,
      name: serviceData.name.trim(),
      description: serviceData.description ? serviceData.description.trim() : "",
      price: Number(serviceData.price) || 0,
      duration_minutes: Number(serviceData.duration_minutes) || 30,
      is_active: serviceData.is_active !== undefined ? Boolean(serviceData.is_active) : true,
      created_at: new Date().toISOString(),
    };
    list.push(newService);
    storage.set(STORAGE_KEYS.SERVICES, list);
    return newService;
  },

  async update(id, updates) {
    const list = storage.get(STORAGE_KEYS.SERVICES, []);
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Serviço não encontrado");

    const updated = {
      ...list[index],
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : list[index].price,
      duration_minutes:
        updates.duration_minutes !== undefined
          ? Number(updates.duration_minutes)
          : list[index].duration_minutes,
      is_active:
        updates.is_active !== undefined ? Boolean(updates.is_active) : list[index].is_active,
    };
    list[index] = updated;
    storage.set(STORAGE_KEYS.SERVICES, list);
    return updated;
  },

  async delete(id) {
    const list = storage.get(STORAGE_KEYS.SERVICES, []);
    const filtered = list.filter((s) => s.id !== id);
    storage.set(STORAGE_KEYS.SERVICES, filtered);
    return true;
  },

  async toggleActive(id) {
    const service = await this.getById(id);
    if (!service) throw new Error("Serviço não encontrado");
    return this.update(id, { is_active: !service.is_active });
  },
};
