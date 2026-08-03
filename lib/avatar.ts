export interface AvatarStage {
  id: number;
  name: string;
  emoji: string;
  minLevel: number;
  description: string;
}

export const AVATAR_STAGES: AvatarStage[] = [
  { id: 1, name: "Ovo", emoji: "🥚", minLevel: 1, description: "Todo mestre começa de um ovo." },
  { id: 2, name: "Filhote", emoji: "🐣", minLevel: 3, description: "Seu mestre está despertando!" },
  { id: 3, name: "Jovem", emoji: "🦉", minLevel: 6, description: "Ganhando sabedoria a cada acerto." },
  { id: 4, name: "Sênior", emoji: "🦅", minLevel: 10, description: "Raro de se ver por aqui." },
  { id: 5, name: "Mestre", emoji: "👑", minLevel: 15, description: "O topo da sabedoria." },
];

export function avatarStageForLevel(level: number): AvatarStage {
  let current = AVATAR_STAGES[0];
  for (const s of AVATAR_STAGES) {
    if (level >= s.minLevel) current = s;
  }
  return current;
}

export function nextAvatarStage(level: number): AvatarStage | null {
  return AVATAR_STAGES.find((s) => level < s.minLevel) ?? null;
}
