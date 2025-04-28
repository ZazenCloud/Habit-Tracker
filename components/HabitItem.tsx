import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types/habit';

interface HabitItemProps {
  habit: Habit;
  onToggle: () => void;
  onDelete?: () => void;
  isCompletedToday: boolean;
  showDeleteButton?: boolean;
}

export default function HabitItem({ 
  habit, 
  onToggle, 
  onDelete, 
  isCompletedToday, 
  showDeleteButton = false 
}: HabitItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.habitInfo}>
        <Text style={styles.habitName}>{habit.name}</Text>
        <View style={styles.streakContainer}>
          <Ionicons name="flame" size={16} color="#FF9500" />
          <Text style={styles.streakText}>{habit.streak}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.checkButton, isCompletedToday && styles.checkButtonActive]}
          onPress={onToggle}
        >
          <Ionicons 
            name={isCompletedToday ? "checkmark-circle" : "checkmark-circle-outline"} 
            size={24} 
            color={isCompletedToday ? "#4CD964" : "#8E8E93"} 
          />
        </TouchableOpacity>
        
        {showDeleteButton && onDelete && (
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#8E8E93',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkButton: {
    marginRight: 12,
    padding: 4,
  },
  checkButtonActive: {
    opacity: 1,
  },
  deleteButton: {
    padding: 4,
  },
}); 