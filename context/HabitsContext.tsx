import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { db, auth } from '../app/config/firebase';
import { Habit } from '../types/habit';
import { useAuth } from './AuthContext';

interface HabitsContextProps {
  habits: Habit[];
  loading: boolean;
  addHabit: (name: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: string) => Promise<void>;
  reorderHabits: (reorderedHabits: Habit[]) => Promise<void>;
}

const HabitsContext = createContext<HabitsContextProps | undefined>(undefined);

export const useHabits = () => {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
};

interface HabitsProviderProps {
  children: ReactNode;
}

export const HabitsProvider = ({ children }: HabitsProviderProps) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHabits = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setHabits([]);
        return;
      }
      
      const habitsCollection = collection(db, 'habits');
      const habitSnapshot = await getDocs(
        query(
          habitsCollection, 
          where('userId', '==', user.uid),
          orderBy('position', 'asc')
        )
      );
      
      const habitsList = habitSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        position: doc.data().position || 0,
        created: doc.data().created?.toDate() || new Date(),
      })) as Habit[];
      
      setHabits(habitsList);
    } catch (error) {
      console.error('Error fetching habits: ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHabits();
    } else {
      setHabits([]);
      setLoading(false);
    }
  }, [user]);

  const addHabit = async (name: string) => {
    try {
      if (!user) return;
      
      const maxPosition = habits.length > 0 
        ? Math.max(...habits.map(h => h.position || 0)) 
        : 0;
        
      const habitsCollection = collection(db, 'habits');
      await addDoc(habitsCollection, {
        name,
        userId: user.uid,
        created: Timestamp.now(),
        streak: 0,
        completedDates: [],
        position: maxPosition + 1,
      });
      fetchHabits();
    } catch (error) {
      console.error('Error adding habit: ', error);
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      if (!user) return;
      
      const habitDoc = doc(db, 'habits', id);
      await deleteDoc(habitDoc);
      setHabits(habits.filter(habit => habit.id !== id));
    } catch (error) {
      console.error('Error deleting habit: ', error);
    }
  };

  const reorderHabits = async (reorderedHabits: Habit[]) => {
    try {
      if (!user) return;
      
      setHabits(reorderedHabits);
      
      const updates = reorderedHabits.map(async (habit, index) => {
        const habitRef = doc(db, 'habits', habit.id);
        return updateDoc(habitRef, { position: index });
      });
      
      await Promise.all(updates);
    } catch (error) {
      console.error('Error reordering habits: ', error);
      fetchHabits();
    }
  };

  const toggleHabitCompletion = async (habitId: string, date: string) => {
    try {
      if (!user) return;
      
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const habitRef = doc(db, 'habits', habit.id);
      const completedDates = [...habit.completedDates];
      
      const dateIndex = completedDates.findIndex(d => d === date);
      
      if (dateIndex >= 0) {
        completedDates.splice(dateIndex, 1);
      } else {
        completedDates.push(date);
      }
      
      const sortedDates = [...completedDates].sort();
      let streak = 0;
      
      const today = new Date().toISOString().split('T')[0];
      if (sortedDates.includes(today)) {
        streak = 1;
        let checkDate = new Date();
        
        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          const dateStr = checkDate.toISOString().split('T')[0];
          if (sortedDates.includes(dateStr)) {
            streak++;
          } else {
            break;
          }
        }
      }
      
      await updateDoc(habitRef, {
        completedDates,
        streak,
      });
      
      setHabits(habits.map(h => 
        h.id === habitId 
          ? { ...h, completedDates, streak } 
          : h
      ));
    } catch (error) {
      console.error('Error updating habit: ', error);
    }
  };

  return (
    <HabitsContext.Provider
      value={{
        habits,
        loading,
        addHabit,
        deleteHabit,
        toggleHabitCompletion,
        reorderHabits,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
}; 