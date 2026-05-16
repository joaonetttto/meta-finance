const FIRST_ACCESS_KEY = "metafinance_first_access";

export function useFirstAccess() {
  const isFirstAccess = () => {
    const value = localStorage.getItem(FIRST_ACCESS_KEY);
    return value === null || value === "true";
  };

  const markAsSeen = () => {
    localStorage.setItem(FIRST_ACCESS_KEY, "false");
  };

  const reset = () => {
    localStorage.removeItem(FIRST_ACCESS_KEY);
  };

  return { isFirstAccess, markAsSeen, reset };
}
