import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Dimensions, Modal, ScrollView, StatusBar, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// Mock task data
const initialTask = {
  id: 'task_001',
  title: 'Finish AI Report',
  description: 'Summarize case studies and finalize references for the comprehensive artificial intelligence research project.',
  category: 'Academics',
  dueDate: '2025-07-22T18:00:00Z',
  isCompleted: false,
  priority: 'High',
  checklist: [
    { id: '1', title: 'Complete draft', done: true },
    { id: '2', title: 'Revise figures and charts', done: false },
    { id: '3', title: 'Finalize references', done: false },
    { id: '4', title: 'Submit PDF', done: false },
  ],
};

const CustomDatePicker = ({ visible, onClose, onDateSelect, initialDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date(initialDate));
  const [selectedDate, setSelectedDate] = useState(new Date(initialDate));

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const buildCalendarGrid = (date) => {
    const days = getDaysInMonth(date);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const grid = [];
    let currentRow = [];

    for (let i = 0; i < firstDay; i++) {
      currentRow.push(null);
    }

    days.forEach((day) => {
      currentRow.push(day);
      if (currentRow.length === 7) {
        grid.push(currentRow);
        currentRow = [];
      }
    });

    while (currentRow.length < 7) {
      currentRow.push(null);
    }
    grid.push(currentRow);

    while (grid.length < 6) {
      grid.push(Array(7).fill(null));
    }

    return grid;
  };

  const calendarGrid = buildCalendarGrid(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDatePress = (date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  const formatMonthYear = (date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date &&
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date) => {
    return (
      date &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{ 
          backgroundColor: 'white', 
          borderTopLeftRadius: 24, 
          borderTopRightRadius: 24, 
          padding: 24,
          maxHeight: '80%'
        }}>
          {/* Header */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: 24 
          }}>
            <TouchableOpacity onPress={prevMonth} style={{ 
              width: 44, 
              height: 44, 
              borderRadius: 22, 
              backgroundColor: '#F3F4F6', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Ionicons name="chevron-back" size={20} color="#6366F1" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>
              {formatMonthYear(currentDate)}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={{ 
              width: 44, 
              height: 44, 
              borderRadius: 22, 
              backgroundColor: '#F3F4F6', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Ionicons name="chevron-forward" size={20} color="#6366F1" />
            </TouchableOpacity>
          </View>

          {/* Weekdays */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <Text
                key={index}
                style={{ 
                  fontSize: 12,
                  fontWeight: '500',
                  color: '#9CA3AF',
                  flex: 1,
                  textAlign: 'center'
                }}
              >
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View>
            {calendarGrid.map((week, rowIndex) => (
              <View key={rowIndex} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                {week.map((day, colIndex) => (
                  <View key={colIndex} style={{ flex: 1, alignItems: 'center' }}>
                    {day ? (
                      <TouchableOpacity
                        onPress={() => handleDatePress(day)}
                        style={{
                          width: 36,
                          height: 36,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 18,
                          backgroundColor: isSelected(day) 
                            ? '#6366F1' 
                            : isToday(day) 
                            ? '#EEF2FF' 
                            : 'transparent'
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            color: isSelected(day)
                              ? 'white'
                              : isToday(day)
                              ? '#6366F1'
                              : '#374151',
                            fontWeight: isSelected(day) || isToday(day) ? '600' : '400'
                          }}
                        >
                          {day.getDate()}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={{ width: 36, height: 36 }} />
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* Done Button */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: '#6366F1',
              paddingVertical: 16,
              paddingHorizontal: 32,
              borderRadius: 16,
              alignSelf: 'center',
              marginTop: 24,
              minWidth: 120
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, textAlign: 'center' }}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Reusable Card Component
const Card = ({ children, style = {} }) => (
  <View style={{
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    ...style
  }}>
    {children}
  </View>
);

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
      case 'medium': return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
      case 'low': return { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' };
      default: return { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' };
    }
  };

  const colors = getPriorityColor(priority);

  return (
    <View style={{
      backgroundColor: colors.bg,
      borderColor: colors.border,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: 'flex-start'
    }}>
      <Text style={{ 
        color: colors.text, 
        fontSize: 12, 
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5
      }}>
        {priority} Priority
      </Text>
    </View>
  );
};

// Progress Bar Component
const ProgressBar = ({ completed, total }) => {
  const progress = total > 0 ? (completed / total) * 100 : 0;
  
  return (
    <View>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
      }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: '#6B7280' }}>
          Progress
        </Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#6366F1' }}>
          {completed}/{total} completed
        </Text>
      </View>
      <View style={{
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden'
      }}>
        <View style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: '#6366F1',
          borderRadius: 4
        }} />
      </View>
    </View>
  );
};

export default function TaskDetailsScreen() {
  const [task, setTask] = useState(initialTask);
  const [completed, setCompleted] = useState(task.isCompleted);
  const [checklist, setChecklist] = useState(task.checklist);
  const [hasChanged, setHasChanged] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    dueDate: new Date(task.dueDate),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const toggleChecklistItem = (id) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    setChecklist(updated);
    setHasChanged(true);
  };

  const handleUpdateTask = () => {
    const updatedTask = {
      ...task,
      title: editData.title,
      description: editData.description,
      dueDate: editData.dueDate.toISOString(),
      isCompleted: completed,
      checklist: checklist,
    };
    
    setTask(updatedTask);
    console.log('Updated task:', updatedTask);
    setIsEditing(false);
    setHasChanged(false);
    Alert.alert('Success', 'Task updated successfully!');
  };

  const handleDateSelect = (selectedDate) => {
    setEditData({ ...editData, dueDate: selectedDate });
    setHasChanged(true);
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const completedItems = checklist.filter(item => item.done).length;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <ScrollView 
        style={{ flex: 1, backgroundColor: '#FAFAFA' }} 
        contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            {isEditing ? (
              <TextInput
                style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: '#111827',
                  borderBottomWidth: 2,
                  borderBottomColor: '#6366F1',
                  paddingBottom: 8,
                  flex: 1,
                  marginRight: 16
                }}
                value={editData.title}
                onChangeText={(text) => {
                  setEditData({ ...editData, title: text });
                  setHasChanged(true);
                }}
                placeholder="Task title"
                multiline
              />
            ) : (
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 28, fontWeight: '700', color: '#111827', lineHeight: 36 }}>
                  {task.title}
                </Text>
              </View>
            )}
            
            <TouchableOpacity style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'white',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2
            }}>
              <Ionicons name="bookmark-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                backgroundColor: '#EEF2FF',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                marginRight: 12
              }}>
                <Text style={{ color: '#6366F1', fontSize: 12, fontWeight: '600' }}>
                  {task.category}
                </Text>
              </View>
              <PriorityBadge priority={task.priority} />
            </View>
          </View>
        </View>

        {/* Progress Card */}
        <Card>
          <ProgressBar completed={completedItems} total={checklist.length} />
        </Card>

        {/* Description Card */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="document-text-outline" size={20} color="#6366F1" />
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginLeft: 8 }}>
              Description
            </Text>
          </View>
          
          {isEditing ? (
            <TextInput
              style={{
                fontSize: 14,
                color: '#6B7280',
                lineHeight: 20,
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 8,
                padding: 12,
                minHeight: 80
              }}
              multiline
              value={editData.description}
              onChangeText={(text) => {
                setEditData({ ...editData, description: text });
                setHasChanged(true);
              }}
              placeholder="Add a description..."
            />
          ) : (
            <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 20 }}>
              {task.description}
            </Text>
          )}
          
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginTop: 16,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6'
          }}>
            <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
            {isEditing ? (
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Text style={{ fontSize: 12, color: '#6366F1', marginLeft: 6, fontWeight: '500' }}>
                  Due: {formatDate(editData.dueDate)}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 6 }}>
                Due: {formatDate(task.dueDate)}
              </Text>
            )}
          </View>
        </Card>

        {/* Checklist Card */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="list-outline" size={20} color="#6366F1" />
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginLeft: 8 }}>
                Checklist
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
              {completedItems} of {checklist.length}
            </Text>
          </View>
          
          {checklist.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => toggleChecklistItem(item.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 12,
                backgroundColor: item.done ? '#F9FAFB' : 'transparent',
                borderRadius: 12,
                marginBottom: index < checklist.length - 1 ? 8 : 0,
                borderWidth: 1,
                borderColor: item.done ? '#E5E7EB' : 'transparent'
              }}
            >
              <View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: item.done ? '#6366F1' : '#D1D5DB',
                backgroundColor: item.done ? '#6366F1' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                {item.done && <Ionicons name="checkmark" size={12} color="white" />}
              </View>
              <Text style={{
                fontSize: 14,
                color: item.done ? '#9CA3AF' : '#374151',
                textDecorationLine: item.done ? 'line-through' : 'none',
                flex: 1
              }}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Status Toggle Card */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#6366F1" />
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827', marginLeft: 8 }}>
                Mark as Completed
              </Text>
            </View>
            <Switch 
              value={completed} 
              onValueChange={(value) => {
                setCompleted(value);
                setHasChanged(true);
              }}
              trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
              thumbColor={completed ? 'white' : '#F3F4F6'}
            />
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={{ marginTop: 8 }}>
          {hasChanged && (
            <TouchableOpacity
              onPress={handleUpdateTask}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#6366F1',
                paddingVertical: 16,
                borderRadius: 16,
                marginBottom: 12,
                shadowColor: '#6366F1',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              <Ionicons name="save-outline" size={20} color="white" />
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginLeft: 8 }}>
                {isEditing ? 'Save Changes' : 'Update Task'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              onPress={() => {
                if (isEditing) {
                  setEditData({
                    title: task.title,
                    description: task.description,
                    dueDate: new Date(task.dueDate),
                  });
                  setHasChanged(false);
                }
                setIsEditing(!isEditing);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isEditing ? '#F3F4F6' : '#F0F9FF',
                paddingVertical: 16,
                borderRadius: 16,
                flex: 1,
                borderWidth: 1,
                borderColor: isEditing ? '#E5E7EB' : '#BAE6FD'
              }}
            >
              <Ionicons 
                name={isEditing ? "close-outline" : "create-outline"} 
                size={20} 
                color={isEditing ? '#6B7280' : '#0284C7'} 
              />
              <Text style={{ 
                color: isEditing ? '#6B7280' : '#0284C7', 
                fontWeight: '600', 
                fontSize: 16, 
                marginLeft: 8 
              }}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FEF2F2',
                paddingVertical: 16,
                borderRadius: 16,
                flex: 1,
                borderWidth: 1,
                borderColor: '#FECACA'
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
              <Text style={{ color: '#DC2626', fontWeight: '600', fontSize: 16, marginLeft: 8 }}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Custom Date Picker Modal */}
        <CustomDatePicker
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onDateSelect={handleDateSelect}
          initialDate={editData.dueDate}
        />
      </ScrollView>
    </>
  );
}