import { requestAiChat } from "@/lib/ai";

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

const SUBJECT_LABEL: Record<string, string> = {
  portugues: "Português",
  matematica: "Matemática",
  ingles: "Inglês",
};

const SUBJECT_FOCUS: Record<string, string> = {
  portugues:
    "Pesquise e corrija dúvidas de leitura, interpretação, gramática, ortografia, acentuação e produção de texto.",
  matematica:
    "Explique números, operações, frações, geometria e porcentagem com exemplos numéricos passo a passo.",
  ingles:
    "Elabore explicações em português sobre o vocabulário e o Present Simple (com frases em inglês de exemplo).",
};

export async function tutorPtReply(
  subject: string,
  history: TutorMessage[],
  studentName: string
): Promise<string> {
  const last = history[history.length - 1]?.content ?? "";
  const label = SUBJECT_LABEL[subject] ?? "estudos";
  const system = `Você é o tutor da plataforma "Mestre do Estudo" e conversa em PORTUGUÊS do Brasil com ${studentName}, aluno de educação básica.
Matéria em foco: ${label}. ${SUBJECT_FOCUS[subject] ?? "Ajude o aluno a entender o conteúdo."}
Regras: linguagem simples e didática, no máximo 4 frases por resposta; dê um pequeno exemplo; termine desafiando o aluno a tentar ou pergunte o que mais ele quer saber.`;

  const text = await requestAiChat({
    system,
    messages: history.slice(-20),
    maxTokens: 240,
    temperature: 0.6,
  });
  if (!text) return fallbackTutorReply(subject, last);
  return text;
}

export function fallbackTutorReply(subject: string, last: string): string {
  if (subject === "matematica" && /\d/.test(last)) {
    return "Vamos passo a passo: leia o problema de novo e escreva aqui quais números você já tem. O que você acha que deve ser feito primeiro?";
  }
  if (subject === "portugues") {
    return "Ótima pergunta! Tente reler o trecho e procurar as palavras-chave. Quer que eu te dê outra prática parecida?";
  }
  return "Tudo bem! Estou aqui para ajudar. Pode repetir a pergunta com outras palavras que eu explico em detalhes.";
}