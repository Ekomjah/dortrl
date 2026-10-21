export const queryKeys = {
  links: ["links"] as const,
  linkStats: (code: string) => ["linkStats", code] as const,
};
