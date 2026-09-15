import { storage, STORAGE_KEYS } from "./storage";
import { DEFAULT_BARBERSHOP_ID } from "../types/database";

/**
 * Serviço de gerenciamento de Barbeiros / Profissionais
 * Preparado para substituir por: supabase.from('barbers')
 */
export const barberService = {
  async getAll(onlyActive = false) {
    const list = storage.get(STORAGE_KEYS.BARBERS, []);
    if (onlyActive) {
      return list.filter((b) => b.is_active);
    }
    return list;
  },

  async getActive() {
    return this.getAll(true);
  },

  async getById(id) {
    if (id === "qualquer") {
      return { id: "qualquer", name: "Qualquer disponível" };
    }
    const list = storage.get(STORAGE_KEYS.BARBERS, []);
    return list.find((b) => b.id === id) || null;
  },

  async create(barberData) {
    const list = storage.get(STORAGE_KEYS.BARBERS, []);
    const newBarber = {
      id: "barb-" + (crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Date.now()),
      barbershop_id: barberData.barbershop_id || DEFAULT_BARBERSHOP_ID,
      name: barberData.name.trim(),
      phone: barberData.phone ? barberData.phone.trim() : "",
      specialties: barberData.specialties ? barberData.specialties.trim() : "",
      avatar_url:
        barberData.avatar_url ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
      is_active: barberData.is_active !== undefined ? Boolean(barberData.is_active) : true,
      created_at: new Date().toISOString(),
    };
    list.push(newBarber);
    storage.set(STORAGE_KEYS.BARBERS, list);
    return newBarber;
  },

  async update(id, updates) {
    const list = storage.get(STORAGE_KEYS.BARBERS, []);
    const index = list.findIndex((b) => b.id === id);
    if (index === -1) throw new Error("Barbeiro não encontrado");

    const updated = {
      ...list[index],
      ...updates,
      is_active:
        updates.is_active !== undefined ? Boolean(updates.is_active) : list[index].is_active,
    };
    list[index] = updated;
    storage.set(STORAGE_KEYS.BARBERS, list);
    return updated;
  },

  async delete(id) {
    const list = storage.get(STORAGE_KEYS.BARBERS, []);
    const filtered = list.filter((b) => b.id !== id);
    storage.set(STORAGE_KEYS.BARBERS, filtered);
    return true;
  },

  async toggleActive(id) {
    const barber = await this.getById(id);
    if (!barber) throw new Error("Barbeiro não encontrado");
    return this.update(id, { is_active: !barber.is_active });
  },
};
