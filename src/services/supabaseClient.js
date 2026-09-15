/**
 * ============================================================================
 * GUIA DE INTEGRAÇÃO FUTURA COM O SUPABASE
 * ============================================================================
 * 
 * Este arquivo serve como o ponto único de conexão para quando o Supabase for integrado.
 * 
 * PASSOS PARA CONECTAR O SUPABASE NA PRÓXIMA ETAPA:
 * 
 * 1. Instalar o SDK oficial do Supabase:
 *    npm install @supabase/supabase-js
 * 
 * 2. Adicionar as variáveis no arquivo .env:
 *    VITE_SUPABASE_URL=https://seu-projeto.supabase.co
 *    VITE_SUPABASE_ANON_KEY=sua-anon-key
 * 
 * 3. Descomentar a inicialização abaixo:
 * 
 *    import { createClient } from '@supabase/supabase-js';
 *    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
 *    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
 *    export const supabase = createClient(supabaseUrl, supabaseAnonKey);
 * 
 * 4. Substituir os métodos nos arquivos em `/src/services/*.js`:
 *    - `serviceService.js`        -> `supabase.from('services')`
 *    - `barberService.js`         -> `supabase.from('barbers')`
 *    - `appointmentService.js`    -> `supabase.from('appointments')`
 *    - `businessHoursService.js`  -> `supabase.from('business_hours')`
 *    - `blockedTimeService.js`    -> `supabase.from('blocked_times')`
 *    - `authService.js`           -> `supabase.auth`
 * 
 * Como toda a aplicação consome exclusivamente os métodos dessas classes de serviço,
 * NENHUM componente React precisará ser alterado ao ligar o Supabase!
 * ============================================================================
 */

export const isSupabaseConfigured = false;

export const supabasePlaceholder = {
  notice: "Modo Local/Mock Ativo. Pronto para conexão com Supabase.",
};
