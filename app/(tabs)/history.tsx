import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useHabits } from '../../context/HabitsContext';
import { Habit } from '../../types/habit';

export default function HistoryScreen() {
  const { habits } = useHabits();
  
  // Get last 7 days
  const getDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        date,
        dateString: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
      });
    }
    
    return days;
  };
  
  const days = getDays();
  
  const isHabitCompletedOnDate = (habitId: string, dateString: string) => {
    const habit = habits.find(h => h.id === habitId);
    return habit ? habit.completedDates.includes(dateString) : false;
  };
  
  const renderHabitRow = ({ item }: { item: Habit }) => (
    <View style={styles.habitRow}>
      <Text style={styles.habitName}>{item.name}</Text>
      <View style={styles.daysContainer}>
        {days.map((day) => (
          <View
            key={day.dateString}
            style={[
              styles.dayMarker,
              isHabitCompletedOnDate(item.id, day.dateString) && styles.completedDay,
            ]}
          />
        ))}
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>Last 7 Days</Text>
      </View>
      
      <View style={styles.daysHeader}>
        <View style={styles.daysLabelContainer}>
          <Text style={styles.habitLabel}>Habit</Text>
          <View style={styles.daysContainer}>
            {days.map((day) => (
              <View key={day.dateString} style={styles.dayLabelContainer}>
                <Text style={styles.dayName}>{day.dayName}</Text>
                <Text style={styles.dayNumber}>{day.dayNumber}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      
      {habits.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No habits to show history for.</Text>
        </View>
      ) : (
        <FlatList
          data={habits}
          renderItem={renderHabitRow}
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
  daysHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  daysLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitLabel: {
    width: 100,
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  daysContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayLabelContainer: {
    alignItems: 'center',
    width: 30,
  },
  dayName: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  habitName: {
    width: 100,
    fontSize: 14,
    fontWeight: '500',
  },
  dayMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EFEFEF',
  },
  completedDay: {
    backgroundColor: '#4CD964',
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