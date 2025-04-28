import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AddHabitFormProps {
  onAddHabit: (name: string) => void;
}

export default function AddHabitForm({ onAddHabit }: AddHabitFormProps) {
  const [habitName, setHabitName] = useState('');

  const handleAddHabit = () => {
    if (habitName.trim()) {
      onAddHabit(habitName.trim());
      setHabitName('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter a new habit..."
        value={habitName}
        onChangeText={setHabitName}
        returnKeyType="done"
        onSubmitEditing={handleAddHabit}
      />
      <TouchableOpacity 
        style={[styles.addButton, !habitName.trim() && styles.disabledButton]} 
        onPress={handleAddHabit}
        disabled={!habitName.trim()}
      >
        <Ionicons name="add-circle" size={24} color="#FFFFFF" />
        <Text style={styles.buttonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    minWidth: 80,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
  },
}); 