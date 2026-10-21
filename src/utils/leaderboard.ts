import { LeaderboardEntry, OperationType } from '../types';

const LEADERBOARD_KEY = 'math_shooting_arcade_leaderboard_v1';

const INITIAL_SCORES: LeaderboardEntry[] = [
  {
    id: 'seed-1',
    nickname: '🚀 4반 은하수캡틴',
    score: 1850,
    mode: 'mixed',
    accuracy: 94,
    date: '2026-10-18',
    correctCount: 16,
    totalCount: 17,
    maxCombo: 8,
    shipId: 'thunderbolt'
  },
  {
    id: 'seed-2',
    nickname: '⚡ 빛의 곱셈마스터',
    score: 1620,
    mode: 'multiplication',
    accuracy: 92,
    date: '2026-10-19',
    correctCount: 14,
    totalCount: 15,
    maxCombo: 6,
    shipId: 'starfire'
  },
  {
    id: 'seed-3',
    nickname: '🛸 나눗셈 번개수호자',
    score: 1490,
    mode: 'division',
    accuracy: 90,
    date: '2026-10-20',
    correctCount: 13,
    totalCount: 14,
    maxCombo: 5,
    shipId: 'emerald'
  },
  {
    id: 'seed-4',
    nickname: '⭐ 우주암산천재',
    score: 1280,
    mode: 'mixed',
    accuracy: 85,
    date: '2026-10-20',
    correctCount: 11,
    totalCount: 13,
    maxCombo: 4,
    shipId: 'falcon'
  },
  {
    id: 'seed-5',
    nickname: '🎯 4학년 2반 민우',
    score: 1100,
    mode: 'multiplication',
    accuracy: 82,
    date: '2026-10-20',
    correctCount: 10,
    totalCount: 12,
    maxCombo: 3,
    shipId: 'thunderbolt'
  }
];

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(INITIAL_SCORES));
      return INITIAL_SCORES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => b.score - a.score);
    }
    return INITIAL_SCORES;
  } catch {
    return INITIAL_SCORES;
  }
}

export function saveLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'date'>): LeaderboardEntry {
  const current = getLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    date: new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  };

  const updated = [...current, newEntry].sort((a, b) => b.score - a.score).slice(0, 50);
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
  } catch {
    // ignore quota issues
  }
  return newEntry;
}

export function clearLeaderboard(): void {
  try {
    localStorage.removeItem(LEADERBOARD_KEY);
  } catch {
    // ignore
  }
}
