export interface PlayerStats {
  nickname: string;
  shipId: string;
  totalScore: number;
  totalSolved: number;
  totalCorrect: number;
  level: number;
  exp: number;
  nextExp: number;
  levelTitle: string;
}

const STATS_KEY = 'math_shooting_pilot_stats_v1';

const LEVEL_TITLES = [
  '우주 생도 (Space Cadet)',
  '별빛 파일럿 (Starlight Pilot)',
  '은하수 슈터 (Galaxy Shooter)',
  '연산 수호자 (Math Guardian)',
  '초공간 캡틴 (Hyper Commander)',
  '전설의 에이스 (Legendary Ace)'
];

export function calculateLevel(exp: number): { level: number; nextExp: number; title: string } {
  // Level threshold: Level 1: 0, Level 2: 300, Level 3: 800, Level 4: 1600, Level 5: 3000, Level 6: 5000
  const thresholds = [0, 300, 800, 1600, 3000, 5000, 8000, 12000];
  let level = 1;

  for (let i = 0; i < thresholds.length; i++) {
    if (exp >= thresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  const titleIndex = Math.min(level - 1, LEVEL_TITLES.length - 1);
  const nextExp = thresholds[level] || thresholds[thresholds.length - 1] + 5000;

  return {
    level,
    nextExp,
    title: LEVEL_TITLES[titleIndex]
  };
}

export function getPlayerStats(): PlayerStats {
  const defaultNickname = localStorage.getItem('math_shooting_last_nickname') || '우주수학왕';
  const defaultShip = 'thunderbolt';

  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const { level, nextExp, title } = calculateLevel(parsed.exp || 0);
      return {
        nickname: parsed.nickname || defaultNickname,
        shipId: parsed.shipId || defaultShip,
        totalScore: parsed.totalScore || 0,
        totalSolved: parsed.totalSolved || 0,
        totalCorrect: parsed.totalCorrect || 0,
        level,
        exp: parsed.exp || 0,
        nextExp,
        levelTitle: title
      };
    }
  } catch {
    // fallback
  }

  const { level, nextExp, title } = calculateLevel(0);
  const initial: PlayerStats = {
    nickname: defaultNickname,
    shipId: defaultShip,
    totalScore: 0,
    totalSolved: 0,
    totalCorrect: 0,
    level,
    exp: 0,
    nextExp,
    levelTitle: title
  };

  savePlayerStats(initial);
  return initial;
}

export function savePlayerStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    localStorage.setItem('math_shooting_last_nickname', stats.nickname);
  } catch {
    // ignore
  }
}

export function recordGameStats(score: number, correctCount: number, totalCount: number): PlayerStats {
  const current = getPlayerStats();
  const newExp = current.exp + score;
  const { level, nextExp, title } = calculateLevel(newExp);

  const updated: PlayerStats = {
    ...current,
    totalScore: current.totalScore + score,
    totalSolved: current.totalSolved + totalCount,
    totalCorrect: current.totalCorrect + correctCount,
    exp: newExp,
    level,
    nextExp,
    levelTitle: title
  };

  savePlayerStats(updated);
  return updated;
}
