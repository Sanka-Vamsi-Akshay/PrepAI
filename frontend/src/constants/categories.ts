export const CATEGORIES = ['Coding', 'SQL', 'Behavioral', 'System Design'] as const;
export type Category = typeof CATEGORIES[number];

export const TOPICS = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Trees',
  'Graphs',
  'DP',
  'SQL',
  'Behavioral',
  'System Design',
] as const;
export type Topic = typeof TOPICS[number];
