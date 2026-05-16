export const resolveVariables = (text: string, variables: Record<string, string>): string => {
  if (!text) return text;
  
  return text.replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
};

export const findVariables = (text: string): string[] => {
  const matches = text.matchAll(/\{\{([a-zA-Z0-9_-]+)\}\}/g);
  return Array.from(matches).map(m => m[1]);
};
