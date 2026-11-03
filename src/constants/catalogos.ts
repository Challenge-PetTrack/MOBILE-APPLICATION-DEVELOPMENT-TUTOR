import type { Ionicons } from "@expo/vector-icons";

export interface VacinaCatalogoItem {
  id: string;
  nome: string;
  descricao: string;
  recomendacao: string;
  reforcoDias: number;
}

export const CATALOGO_VACINAS: VacinaCatalogoItem[] = [
  {
    id: "v10",
    nome: "V8 / V10 (Múltipla Canina)",
    descricao:
      "Protege contra Cinomose, Parvovirose, Hepatite Infecciosa, Adenovirose, Coronavirose, Parainfluenza e Leptospirose.",
    recomendacao: "Cães",
    reforcoDias: 365,
  },
  {
    id: "raiva",
    nome: "Antirrábica",
    descricao:
      "Vacina obrigatória por lei. Protege contra o vírus da Raiva, uma doença fatal e transmissível para humanos.",
    recomendacao: "Cães e Gatos",
    reforcoDias: 365,
  },
  {
    id: "gripe",
    nome: "Gripe Canina (Tosse dos Canis)",
    descricao:
      "Protege contra a Bordetella bronchiseptica e o vírus da Parainfluenza, que causam problemas respiratórios.",
    recomendacao: "Cães",
    reforcoDias: 365,
  },
  {
    id: "giardia",
    nome: "Giárdia",
    descricao:
      "Ajuda na prevenção de infecções intestinais causadas pelo protozoário Giardia lamblia.",
    recomendacao: "Cães",
    reforcoDias: 365,
  },
  {
    id: "leishmaniose",
    nome: "Leishmaniose",
    descricao:
      "Protege contra o calazar (Leishmaniose Visceral Canina), doença grave transmitida por mosquito.",
    recomendacao: "Cães",
    reforcoDias: 365,
  },
  {
    id: "v5",
    nome: "V4 / V5 (Múltipla Felina)",
    descricao:
      "Protege contra Panleucopenia, Rinotraqueíte, Calicivirose, Clamidiose e Leucemia Felina (apenas na V5).",
    recomendacao: "Gatos",
    reforcoDias: 365,
  },
];

export const VACINAS_NOMES: Record<string, string> = Object.fromEntries(
  CATALOGO_VACINAS.map((v) => [v.id, v.nome])
);

export interface CuidadoCatalogoItem {
  id: string;
  nome: string;
  icone: keyof typeof Ionicons.glyphMap;
  intervaloDias: number;
  color: string;
}

export const CATALOGO_CUIDADOS: CuidadoCatalogoItem[] = [
  { id: "antipulgas", nome: "Antipulgas e Carrapatos", icone: "bug", intervaloDias: 30, color: "#ec4899" },
  { id: "vermifugo", nome: "Vermífugo", icone: "medical", intervaloDias: 90, color: "#8b5cf6" },
  { id: "banho", nome: "Banho e Tosa", icone: "water", intervaloDias: 15, color: "#0ea5e9" },
  { id: "checkup", nome: "Check-up Anual", icone: "heart", intervaloDias: 365, color: "#10b981" },
];

export interface CategoriaGasto {
  id: string;
  nome: string;
  icone: keyof typeof Ionicons.glyphMap;
  cor: string;
}

export const CATEGORIAS_GASTO: CategoriaGasto[] = [
  { id: "veterinario", nome: "Veterinário", icone: "medical", cor: "#ef4444" },
  { id: "racao", nome: "Ração", icone: "restaurant", cor: "#f59e0b" },
  { id: "banho", nome: "Banho & Tosa", icone: "water", cor: "#0ea5e9" },
  { id: "brinquedos", nome: "Brinquedos", icone: "tennisball", cor: "#8b5cf6" },
  { id: "outros", nome: "Outros", icone: "cart", cor: "#10b981" },
];

export function getCategoriaGasto(id: string): CategoriaGasto {
  return CATEGORIAS_GASTO.find((c) => c.id === id) ?? CATEGORIAS_GASTO[4];
}

export interface TarefaRotina {
  id: string;
  title: string;
  points: number;
  icon: keyof typeof Ionicons.glyphMap;
}

export const TAREFAS_ROTINA: TarefaRotina[] = [
  { id: "passeio", title: "Passeio Diário", points: 30, icon: "walk" },
  { id: "alimentacao", title: "Alimentação Saudável", points: 20, icon: "restaurant" },
  { id: "agua", title: "Água Fresca Trocada", points: 15, icon: "water" },
  { id: "brincadeiras", title: "Brincadeiras e Estímulo", points: 25, icon: "tennisball" },
  { id: "escovacao", title: "Escovação e Higiene", points: 10, icon: "brush" },
];

export const FREQUENCIAS_MEDICAMENTO = [
  { label: "A cada 6h", value: 6 },
  { label: "A cada 8h", value: 8 },
  { label: "A cada 12h", value: 12 },
  { label: "1x ao dia (24h)", value: 24 },
] as const;

export const FAQS_TUTOR = [
  {
    q: "Como agendar uma consulta pelo app?",
    a: "Na tela inicial, toque em 'Agendar Consulta', escolha o pet, informe data, horário e motivo. Assim que o veterinário confirmar ou concluir o atendimento, você receberá uma notificação no celular.",
  },
  {
    q: "Como funcionam os lembretes de medicamentos e vacinas?",
    a: "Ao cadastrar um tratamento em 'Medicamentos' ou aplicar uma vacina em 'Vacinas', o PetTrack agenda notificações locais automáticas nos horários das doses e nas datas de reforço. Toque na notificação para abrir diretamente o item.",
  },
  {
    q: "Como gero o RG e a Ficha Clínica do meu pet?",
    a: "Acesse 'Meu Pet', toque em 'Ficha Clínica & Diário' no card do animal e pressione o botão 'RG' no topo para gerar e compartilhar o documento em PDF.",
  },
  {
    q: "Como funciona o Score do Pet?",
    a: "O Score mede de 0 a 100 a rotina diária de bem-estar de cada pet (passeio, alimentação, água fresca, brincadeiras e higiene), ficando salvo na nuvem dia a dia.",
  },
];

export const FAQS_VET = [
  {
    q: "Como gerar um receituário em PDF?",
    a: "Abra uma consulta na aba 'Agenda', preencha o diagnóstico e a prescrição médica e toque em 'Gerar Receita em PDF'. O tutor também poderá visualizar o prontuário no próprio aplicativo.",
  },
  {
    q: "Posso anexar exames na consulta?",
    a: "Sim! Nos detalhes da consulta você pode anexar até 3 imagens de exames ou laudos diretamente ao prontuário do paciente.",
  },
  {
    q: "Como o faturamento mensal é calculado?",
    a: "O painel Financeiro soma os valores das consultas concluídas no mês atual, utilizando o valor registrado no atendimento ou o 'Valor Padrão da Consulta' configurado em Ajustes.",
  },
  {
    q: "Como recebo avisos de novos agendamentos?",
    a: "Sempre que um tutor solicitar uma consulta, o aplicativo sincroniza em tempo real via Cloud Firestore, exibe o badge na Agenda e dispara uma notificação que leva direto ao agendamento.",
  },
];

export const WHATSAPP_SUPORTE_TUTOR = "5511962108253";
export const WHATSAPP_SUPORTE_VET = "5511962108253";
