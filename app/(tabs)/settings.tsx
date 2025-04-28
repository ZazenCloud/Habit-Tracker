import { StyleSheet, View, Text, TextInput, TouchableOpacity, Platform, Pressable, FlatList } from 'react-native';
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../../context/HabitsContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture } from 'react-native-gesture-handler';
import ReorderableList, { 
  ReorderableListReorderEvent, 
  reorderItems,
  useReorderableDrag,
  useIsActive
} from 'react-native-reorderable-list';
import { Habit } from '../../types/habit';
import * as Haptics from 'expo-haptics';
import { runOnJS } from 'react-native-reanimated';

// Create a separate component for the habit item that works with ReorderableList
const HabitListItem = React.memo(({ 
  item, 
  onDelete 
}: { 
  item: Habit; 
  onDelete: (id: string) => void 
}) => {
  const drag = useReorderableDrag();
  const isActive = useIsActive();
  
  // Simplified drag handler to be more reliable
  const onLongPressHandler = useCallback(() => {
    // Make sure drag exists before calling it
    if (typeof drag === 'function') {
      // Execute the drag function with a slight delay to ensure it registers
      setTimeout(() => {
        drag();
      }, 10);
      
      // Provide haptic feedback on drag start
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  }, [drag]);
  
  return (
    <View style={[
      styles.habitItem,
      isActive && styles.habitItemActive
    ]}>
      <View style={styles.habitItemContent}>
        <Pressable 
          onLongPress={onLongPressHandler}
          delayLongPress={200}
          style={({ pressed }) => [
            styles.dragHandleContainer,
            pressed && styles.dragHandlePressed
          ]}
        >
          <Ionicons name="reorder-three" size={28} color="#666" />
        </Pressable>
        <Text style={styles.habitName}>{item.name}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

// Web-specific draggable item component using HTML5 drag and drop
const WebDraggableItem = React.memo(({ 
  item, 
  index,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop
}: { 
  item: Habit;
  index: number;
  onDelete: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: () => void;
}) => {
  // Create refs for the drag element
  const itemRef = useRef<View>(null);
  
  useEffect(() => {
    if (Platform.OS === 'web' && itemRef.current) {
      const element = itemRef.current as unknown as HTMLElement;
      
      element.setAttribute('draggable', 'true');
      
      // Apply cursor style directly to the element
      element.style.cursor = 'grab';
      
      element.ondragstart = (e) => {
        e.dataTransfer?.setData('text/plain', index.toString());
        // Add styling to indicate drag start
        element.style.opacity = '0.6';
        element.style.cursor = 'grabbing';
        onDragStart(index);
      };
      
      element.ondragend = () => {
        // Reset styling
        element.style.opacity = '1';
        element.style.cursor = 'grab';
      };
      
      element.ondragover = (e) => {
        e.preventDefault(); // Necessary to allow drop
        onDragOver(index);
      };
      
      element.ondrop = (e) => {
        e.preventDefault();
        onDrop();
      };
    }
  }, [index, onDragStart, onDragOver, onDrop]);
  
  return (
    <View 
      ref={itemRef}
      style={styles.habitItem}
    >
      <View style={styles.habitItemContent}>
        <View style={styles.dragHandleContainer}>
          <Ionicons name="reorder-three" size={28} color="#666" />
        </View>
        <Text style={styles.habitName}>{item.name}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function SettingsScreen() {
  const { habits, addHabit, deleteHabit, reorderHabits } = useHabits();
  const [newHabitName, setNewHabitName] = useState('');
  // For web drag-and-drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const triggerHapticFeedback = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      addHabit(newHabitName.trim());
      setNewHabitName('');
    }
  };

  const handleReorder = useCallback(({ from, to }: ReorderableListReorderEvent) => {
    const reorderedHabits = reorderItems(habits, from, to);
    reorderHabits(reorderedHabits);
    
    // Provide haptic feedback when the reorder is complete
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [habits, reorderHabits]);

  // Web-specific drag handlers
  const handleWebDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);
  
  const handleWebDragOver = useCallback((index: number) => {
    setDropIndex(index);
  }, []);
  
  const handleWebDrop = useCallback(() => {
    if (draggedIndex !== null && dropIndex !== null && draggedIndex !== dropIndex) {
      // Reorder the habits
      const reorderedHabits = reorderItems(habits, draggedIndex, dropIndex);
      reorderHabits(reorderedHabits);
    }
    
    // Reset drag state
    setDraggedIndex(null);
    setDropIndex(null);
  }, [draggedIndex, dropIndex, habits, reorderHabits]);

  const onDragStart = useCallback(({ index }: { index: number }) => {
    'worklet';
    
    // Trigger haptic feedback on drag start
    runOnJS(triggerHapticFeedback)();
    console.log('Drag started at index:', index);
  }, [triggerHapticFeedback]);
  
  const onDragEnd = useCallback(({ from, to }: { from: number, to: number }) => {
    'worklet';
    
    console.log('Drag ended from:', from, 'to:', to);
  }, []);
  
  // Render function for ReorderableList
  const renderItem = useCallback(({ item }: { item: Habit }) => {
    return <HabitListItem item={item} onDelete={deleteHabit} />;
  }, [deleteHabit]);
  
  // Render function for web draggable items
  const renderWebDraggableItem = useCallback(({ item, index }: { item: Habit, index: number }) => {
    return (
      <WebDraggableItem
        item={item}
        index={index}
        onDelete={deleteHabit}
        onDragStart={handleWebDragStart}
        onDragOver={handleWebDragOver}
        onDrop={handleWebDrop}
      />
    );
  }, [deleteHabit, handleWebDragStart, handleWebDragOver, handleWebDrop]);

  // Create a pan gesture for the ReorderableList with more lenient settings
  const panGesture = useMemo(() => 
    Gesture.Pan()
      .activateAfterLongPress(250) // Slightly reduced from 300
      .minDistance(3), // Reduced from 5 for easier activation
  []);

  // Determine which list component to render based on platform
  const renderListComponent = () => {
    if (Platform.OS === 'web') {
      // Use FlatList with HTML5 drag-and-drop for web
      return (
        <FlatList
          data={habits}
          renderItem={renderWebDraggableItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      );
    } else {
      // Use ReorderableList for native platforms
      return (
        <ReorderableList
          data={habits}
          onReorder={handleReorder}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          panGesture={panGesture}
          shouldUpdateActiveItem={true}
          animationDuration={150}
          autoscrollThreshold={0.15}
          autoscrollSpeedScale={1.2}
        />
      );
    }
  };

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
          {Platform.OS === 'web' ? (
            <Text style={styles.dragInstructions}>Drag items to reorder</Text>
          ) : (
            <Text style={styles.dragInstructions}>Press and hold a habit to drag and reorder</Text>
          )}
          
          {habits.length === 0 ? (
            <Text style={styles.emptyText}>No habits added yet</Text>
          ) : (
            renderListComponent()
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
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  habitItemActive: {
    backgroundColor: '#e8f0fe',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 999,
    borderRadius: 4,
    borderColor: '#c8d6e5',
    borderWidth: 1,
  },
  habitItemPressed: {
    backgroundColor: '#f0f0f0',
  },
  habitItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  dragHandleContainer: {
    paddingHorizontal: 6,
    paddingVertical: 8,
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandlePressed: {
    backgroundColor: '#e0e0e0',
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