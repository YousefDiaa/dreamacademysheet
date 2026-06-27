export interface Student {
  email: string;
  password?: string;
  name: string;
  category?: 'هندسة' | 'حاسبات';
  warningsCount: number;
  latesCount: number;
  warningsList: string[]; // List of specific warnings/reasons
  latesList: string[];    // List of specific lates/reasons
  completedLessons: string[]; // List of completed lesson IDs
  isAdmin?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Unit {
  id: string;
  title: string;
  chapters?: Chapter[]; // Unit can have chapters or lessons directly
  lessons?: Lesson[];
}

export interface Subject {
  id: string;
  title: string;
  units: Unit[];
}

export interface AppsScriptConfig {
  webAppUrl: string;
  isConfigured: boolean;
}
