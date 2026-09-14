// Dados de exemplo do estabelecimento.
// Preços, horários e endereço são fictícios — substituir pelos dados reais do cliente.

export const BUSINESS = {
  name: "Barbearia Novo Visual",
  city: "Picos, PI",
  phoneDisplay: "(89) 9 9436-7235",
  whatsappNumber: "5589994367235", // formato internacional, sem espaços/símbolos — exigido pelo wa.me
  address: "Rua Coronel José Fernandes, 210 — Centro, Picos - PI, 64600-000", // endereço de exemplo
  hours: [
    { days: "Segunda a sábado", time: "09h às 19h" },
    { days: "Domingo", time: "Fechado" },
  ],
  mapsEmbedSrc:
    "https://www.google.com/maps?q=Picos,PI&output=embed", // trocar pelo embed exato do endereço real
  socials: [
    { label: "Instagram", href: "#" },
    { label: "Facebook", href: "#" },
  ],
};

export const SERVICES = [
  {
    id: "corte",
    name: "Corte clássico",
    description: "Corte na tesoura e máquina, com acabamento navalhado e finalização.",
    price: 45,
    duration: 40,
  },
  {
    id: "barba",
    name: "Barba completa",
    description: "Toalha quente, navalha e hidratação para um acabamento preciso.",
    price: 35,
    duration: 30,
  },
  {
    id: "sobrancelha",
    name: "Design de sobrancelha",
    description: "Alinhamento e limpeza para uma expressão mais nítida.",
    price: 20,
    duration: 15,
  },
  {
    id: "combo",
    name: "Combo corte + barba",
    description: "O ritual completo — corte, barba e toalha quente em uma sessão.",
    price: 70,
    duration: 65,
  },
  {
    id: "tratamento",
    name: "Tratamento capilar",
    description: "Hidratação profunda e massagem para couro cabeludo e fios saudáveis.",
    price: 55,
    duration: 45,
  },
];

export const BARBERS = [
  { id: "qualquer", name: "Qualquer disponível" },
  { id: "marcos", name: "Marcos Almeida" },
  { id: "diego", name: "Diego Ferreira" },
  { id: "junior", name: "Júnior Santos" },
];

// Horários fixos de exemplo, de hora em hora
export const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00",
  "14:00", "15:00", "16:00", "17:00", "18:00",
];

// Simula horários já ocupados por data (chave: "YYYY-MM-DD", valor: array de horários)
// Em produção, isso viria de uma consulta ao backend/banco de dados.
export function getMockedOccupiedSlots(dateKey) {
  if (!dateKey) return [];
  // gera uma ocupação pseudo-aleatória, porém estável, a partir da data
  let seed = 0;
  for (let i = 0; i < dateKey.length; i += 1) seed += dateKey.charCodeAt(i);
  const occupied = TIME_SLOTS.filter((_, index) => (seed + index * 7) % 5 === 0);
  return occupied;
}
