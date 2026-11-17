export const FREE_GOAL_LIMIT = 3;

export function canUseProjections(plan: string) {
  return plan === "ouro" || plan === "diamante";
}

export function canCreateGoal(plan: string, goalCount: number) {
  return canUseProjections(plan) || goalCount < FREE_GOAL_LIMIT;
}