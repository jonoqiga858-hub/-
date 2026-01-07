
export enum GameType {
  COLOR_CLASH = 'COLOR_CLASH',
  GRID_MEMORY = 'GRID_MEMORY',
  SCHULTE_TABLE = 'SCHULTE_TABLE',
  RULE_CATEGORIZATION = 'RULE_CATEGORIZATION',
  CONTEXT_MEMORY = 'CONTEXT_MEMORY'
}

export interface GameProps {
  onFinish: (score: number) => void;
  difficulty: number;
}
