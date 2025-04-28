import { StyleSheet, View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../../context/HabitsContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { Habit } from '../../types/habit';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const { habits, addHabit, deleteHabit, reorderHabits } = useHabits();
  const [newHabitName, setNewHabitName] = useState('');

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      addHabit(newHabitName.trim());
      setNewHabitName('');
    }
  };

  const onDragBegin = () => {
    // Provide haptic feedback when drag begins
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Habit>) => (
    <ScaleDecorator>
      <TouchableOpacity
        onLongPress={() => {
          drag();
        }}
        disabled={isActive}
        style={[styles.habitItem, isActive && styles.habitItemActive]}
        activeOpacity={0.7}
      >
        <View style={styles.habitItemContent}>
          <Ionicons name="reorder-three" size={22} color="#999" style={styles.dragHandle} />
          <Text style={styles.habitName}>{item.name}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteHabit(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </ScaleDecorator>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.addHabitSection}>
          <Text style={styles.sectionTitle}>Add New Habit</Text>
          <View style={styles.addHabitForm}>
            <TextInput
              style={styles.input}
              placeholder="Enter habit name"
              value={newHabitName}
              onChangeText={setNewHabitName}
              returnKeyType="done"
              onSubmitEditing={handleAddHabit}
            />
            <TouchableOpacity 
              style={[styles.addButton, !newHabitName.trim() && styles.disabledButton]} 
              onPress={handleAddHabit}
              disabled={!newHabitName.trim()}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.manageHabitsSection}>
          <Text style={styles.sectionTitle}>Manage Habits</Text>
          <Text style={styles.dragInstructions}>Press and hold to drag habits and reorder them</Text>
          
          {habits.length === 0 ? (
            <Text style={styles.emptyText}>No habits added yet</Text>
          ) : (
            <DraggableFlatList
              data={habits}
              onDragBegin={onDragBegin}
              onDragEnd={({ data }) => reorderHabits(data)}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              activationDistance={10}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  dragInstructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  addHabitSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addHabitForm: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    backgroundColor: '#007AFF',
    height: 44,
    width: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  manageHabitsSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listContent: {
    flexGrow: 1,
  },
  habitItem: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  habitItemActive: {
    backgroundColor: '#f8f8f8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  habitItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  dragHandle: {
    marginRight: 10,
    padding: 2,
  },
  habitName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
}); 