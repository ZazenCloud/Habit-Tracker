export interface Habit {
  id: string;
  name: string;
  created: Date;
  streak: number;
  completedDates: string[]; // dates in ISO format
  position: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // ISO format
  completed: boolean;
} 