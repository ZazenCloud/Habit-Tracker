import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useHabits } from '../../context/HabitsContext';
import { Habit } from '../../types/habit';
import { getLocalDateString } from '../../utils/dateUtils'; // Import the helper

// Time period options
const TIME_PERIODS = {
  WEEK: 'Last 7 Days',
  THREE_MONTHS: 'Last 3 Months'
} as const;

// Type for our time periods
type TimePeriod = typeof TIME_PERIODS[keyof typeof TIME_PERIODS];

export default function HistoryScreen() {
  const { habits } = useHabits();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(TIME_PERIODS.WEEK);
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [expandedHabits, setExpandedHabits] = useState<Record<string, boolean>>(() => {
    // Initialize all habits as expanded by default
    const initialState: Record<string, boolean> = {};
    habits.forEach(habit => {
      initialState[habit.id] = true;
    });
    return initialState;
  });
  
  // Get days based on selected period
  const getDays = (daysCount = 7) => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < daysCount; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        date,
        dateString: getLocalDateString(date), // Use local date string
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
      });
    }
    
    return days;
  };
  
  // Get three month calendar data
  const getThreeMonthsData = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    
    // Create months data array (current month and 2 previous)
    const monthsData = [];
    
    for (let monthOffset = 0; monthOffset >= -2; monthOffset--) {
      // Calculate year and month with overflow handling
      let targetMonth = currentMonth + monthOffset;
      let targetYear = currentYear;
      
      if (targetMonth < 0) {
        targetMonth += 12;
        targetYear -= 1;
      }
      
      const monthName = new Date(targetYear, targetMonth, 1).toLocaleDateString('en-US', { month: 'long' });
      const year = targetYear;
      
      // Get days in month
      const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
      
      // --- Refactored week generation logic ---
      const allCellsInMonthGrid: ({ day: number; date: Date; dateString: string } | null)[] = [];
      const firstDayOfMonthWeekDay = new Date(targetYear, targetMonth, 1).getDay(); // 0=Sun

      // Add leading nulls for the first week
      for (let i = 0; i < firstDayOfMonthWeekDay; i++) {
        allCellsInMonthGrid.push(null);
      }

      // Add day objects or nulls for future days
      for (let day = 1; day <= daysInMonth; day++) {
        // If it's the current month and the day is in the future, add null
        if (monthOffset === 0 && day > currentDay) {
          allCellsInMonthGrid.push(null);
        } else {
          // Otherwise, add the day object
          const date = new Date(targetYear, targetMonth, day);
          const dateString = getLocalDateString(date); // Use local date string
          allCellsInMonthGrid.push({
            day,
            date,
            dateString,
          });
        }
      }

      // Chunk the flat array into weeks
      const weeks: ({ day: number; date: Date; dateString: string } | null)[][] = [];
      for (let i = 0; i < allCellsInMonthGrid.length; i += 7) {
          weeks.push(allCellsInMonthGrid.slice(i, i + 7));
      }

      // Pad the last week with nulls if it's not full
      const lastWeek = weeks[weeks.length - 1];
      if (lastWeek && lastWeek.length < 7) {
          while (lastWeek.length < 7) {
              lastWeek.push(null);
          }
      }
      // --- End refactored logic ---
      
      monthsData.push({
        year,
        month: targetMonth,
        monthName,
        weeks,
      });
    }
    
    return monthsData.reverse(); // Show oldest to newest
  };
  
  const days = getDays(7);
  const threeMonthsData = selectedPeriod === TIME_PERIODS.THREE_MONTHS ? getThreeMonthsData() : [];
  
  const isHabitCompletedOnDate = (habitId: string, dateString: string) => {
    const habit = habits.find(h => h.id === habitId);
    return habit ? habit.completedDates.includes(dateString) : false;
  };
  
  // Toggle habit card expansion
  const toggleHabitExpansion = (habitId: string) => {
    setExpandedHabits(prevState => ({
      ...prevState,
      [habitId]: !prevState[habitId]
    }));
  };
  
  // Weekly view component
  const WeeklyView = () => {
    return (
      <>
        <View style={styles.daysHeader}>
          <View style={styles.daysLabelContainer}>
            <Text style={styles.habitLabel}>Habit</Text>
            <View style={styles.daysContainer}>
              {days.map((day) => (
                <View key={day.dateString} style={styles.dayMarkerWrapper}>
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
            renderItem={({ item }: { item: Habit }) => (
              <View style={styles.habitRow}>
                <Text style={styles.habitName}>{item.name}</Text>
                <View style={styles.daysContainer}>
                  {days.map((day) => (
                    <View key={day.dateString} style={styles.dayMarkerWrapper}>
                      <View
                        style={[
                          styles.dayMarker,
                          isHabitCompletedOnDate(item.id, day.dateString) && styles.completedDay,
                        ]}
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}
      </>
    );
  };
  
  // Three Months Github-like Heatmap view with simplified layout
  const ThreeMonthsView = () => {
    if (habits.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No habits to show history for.</Text>
        </View>
      );
    }
    
    return (
      <ScrollView>
        <View style={styles.threeMonthsContainer}>
          {habits.map(habit => (
            <View key={habit.id} style={styles.habitCard}>
              <TouchableOpacity 
                style={styles.habitCardHeaderTouchable} 
                onPress={() => toggleHabitExpansion(habit.id)}
                activeOpacity={0.7} // Optional: visual feedback on press
              >
                <View style={styles.habitCardHeader}>
                  <Text style={styles.habitCardTitle}>{habit.name}</Text>
                  <View style={styles.headerRightContainer}>
                    {habit.streak && habit.streak > 0 ? (
                      <View style={styles.streakBadge}>
                        <Text style={styles.streakText}>🔥 {habit.streak}</Text>
                      </View>
                    ) : null}
                    <Text style={styles.collapseIndicator}>
                      {expandedHabits[habit.id] ? '▲' : '▼'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              
              {expandedHabits[habit.id] &&
                  threeMonthsData.map((monthData, monthIndex) => (
                    <View key={`month-${monthIndex}`} style={styles.monthSection}>
                      <Text style={styles.monthTitle}>
                        {monthData.monthName} {monthData.year}
                      </Text>
                      <View style={styles.calendarGrid}>
                        <View style={styles.dayLabelsRow}>
                          <Text style={styles.dayLabelSmall}>S</Text>
                          <Text style={styles.dayLabelSmall}>M</Text>
                          <Text style={styles.dayLabelSmall}>T</Text>
                          <Text style={styles.dayLabelSmall}>W</Text>
                          <Text style={styles.dayLabelSmall}>T</Text>
                          <Text style={styles.dayLabelSmall}>F</Text>
                          <Text style={styles.dayLabelSmall}>S</Text>
                        </View><View style={styles.daysGrid}>
                          {monthData.weeks.map((week, weekIndex) => (
                            <View key={`week-${weekIndex}`} style={styles.calendarWeekRow}>
                              {week.map((day, dayIndex) => {
                                const cellKey = `cell-${monthIndex}-${weekIndex}-${dayIndex}`;
                                if (!day) {
                                  // Render an empty cell placeholder
                                  return <View key={cellKey} style={styles.emptyCell} />;
                                }
                                const completed = isHabitCompletedOnDate(habit.id, day.dateString);
                                return (
                                  <View
                                    key={cellKey}
                                    style={[
                                      styles.calendarCell,
                                      completed && styles.completedCell
                                    ]}
                                  />
                                );
                              })}
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  ))
              } 
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.periodSelector}
          onPress={() => setShowPeriodMenu(!showPeriodMenu)}
        >
          <Text style={styles.title}>{selectedPeriod}</Text>
          <Text style={styles.dropdownIndicator}>▼</Text>
        </TouchableOpacity>
        
        {showPeriodMenu && (
          <View style={styles.periodMenu}>
            {Object.values(TIME_PERIODS).map(period => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodOption,
                  selectedPeriod === period && styles.selectedPeriodOption
                ]}
                onPress={() => {
                  setSelectedPeriod(period);
                  setShowPeriodMenu(false);
                }}
              >
                <Text style={[
                  styles.periodOptionText,
                  selectedPeriod === period && styles.selectedPeriodOptionText
                ]}>
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      
      {selectedPeriod === TIME_PERIODS.WEEK && <WeeklyView />}
      {selectedPeriod === TIME_PERIODS.THREE_MONTHS && <ThreeMonthsView />}
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
    position: 'relative',
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 44,
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownIndicator: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    marginTop: 44,
  },
  periodMenu: {
    position: 'absolute',
    top: 90,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 100,
  },
  periodOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  selectedPeriodOption: {
    backgroundColor: '#F1F8FF',
  },
  periodOptionText: {
    fontSize: 16,
  },
  selectedPeriodOptionText: {
    color: '#007AFF',
    fontWeight: '500',
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
    width: 80,
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  daysContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 10,
  },
  dayMarkerWrapper: {
    width: 32,
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
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
    width: 80,
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
  
  // Three Months view new styles
  threeMonthsContainer: {
    padding: 16,
  },
  habitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  habitCardHeaderTouchable: {
    padding: 16,
  },
  habitCardHeader: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between',
  },
  habitCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
    marginRight: 8,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakBadge: {
    backgroundColor: '#FF4759',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  monthSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 30,
  },
  calendarGrid: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  dayLabelsRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
  },
  dayLabelSmall: {
    textAlign: 'center',
    fontSize: 10,
    color: '#8E8E93',
    width: 14,
  },
  daysGrid: {
    backgroundColor: '#F8F8FA',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 30,
  },
  calendarWeekRow: {
    flexDirection: 'row',
    marginBottom: 2,
    justifyContent: 'space-between',
  },
  calendarCell: {
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: '#EFEFEF',
  },
  completedCell: {
    backgroundColor: '#4CD964',
  },
  emptyCell: {
    width: 16,
    height: 16,
    opacity: 0,
  },
  collapseIndicator: {
    fontSize: 14,
    color: '#8E8E93',
  },
  dayColumn: {
    alignItems: 'center',
    marginHorizontal: 1,
  },
}); 