import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useHabits } from '../../context/HabitsContext';
import HabitItem from '../../components/HabitItem';
import { Habit } from '../../types/habit';
import { getLocalDateString } from '../../utils/dateUtils';

export default function HabitsScreen() {
  const { habits, loading, toggleHabitCompletion } = useHabits();
  
  const today = getLocalDateString(new Date());
  
  const isHabitCompletedToday = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    return habit ? habit.completedDates.includes(today) : false;
  };

  const renderItem = ({ item }: { item: Habit }) => (
    <HabitItem
      habit={item}
      onToggle={() => toggleHabitCompletion(item.id, today)}
      isCompletedToday={isHabitCompletedToday(item.id)}
      showDeleteButton={false}
    />
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>My Habits</Text>
      </View>
      
      {habits.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No habits yet. Go to Settings to add your first habit!</Text>
        </View>
      ) : (
        <FlatList
          data={habits}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 44,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
