// Server-authoritative rank thresholds.
// Gold+ requires premium — enforced here AND in RankScreen display.
export const RANKS = [
  { id: 'iron',     name: 'Iron',     color: '#A0A0C0', minStreak: 0,   minTasks: 0,   premium: false },
  { id: 'bronze',   name: 'Bronze',   color: '#C0845A', minStreak: 7,   minTasks: 0,   premium: false },
  { id: 'silver',   name: 'Silver',   color: '#C0C8DC', minStreak: 30,  minTasks: 0,   premium: false },
  { id: 'gold',     name: 'Gold',     color: '#F5C842', minStreak: 0,   minTasks: 100, premium: true  },
  { id: 'platinum', name: 'Platinum', color: '#A0C8F0', minStreak: 200, minTasks: 0,   premium: true  },
  { id: 'diamond',  name: 'Diamond',  color: '#B088F8', minStreak: 365, minTasks: 0,   premium: true  },
];

/**
 * Returns the highest rank the user has earned based on server-verified data.
 * Premium ranks are only awarded if isPremium is true.
 */
export function computeRank(streak, totalCompleted, isPremium) {
  const eligible = RANKS.filter(r => !r.premium || isPremium);
  let current = eligible[0];
  for (const rank of eligible) {
    if (streak >= rank.minStreak && totalCompleted >= rank.minTasks) {
      current = rank;
    }
  }
  return current;
}

/** Returns the next rank the user is working toward, or null if at the top. */
export function nextRank(currentRankId, isPremium) {
  const eligible = RANKS.filter(r => !r.premium || isPremium);
  const idx = eligible.findIndex(r => r.id === currentRankId);
  return idx !== -1 && idx < eligible.length - 1 ? eligible[idx + 1] : null;
}
