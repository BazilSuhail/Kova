// App.js or HomeScreen.js
import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ✅ Dummy data (can be fetched or imported from a JSON file)
const dashboardData = {
  tasks: [
    { id: '1', title: 'Submit assignment', category: 'Academics' },
    { id: '2', title: 'Buy groceries', category: 'Personal' },
  ],
  mood: {
    status: 'Stressed',
    note: 'Felt overwhelmed with project work'
  },
  reminders: [
    { id: 'r1', title: 'Doctor appointment at 6 PM' }
  ],
};

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome Back 👋</Text>

      {/* Task Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Tasks</Text>
        <FlatList
          data={dashboardData.tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color="gray" />
              <Text style={styles.itemText}>{item.title} <Text style={styles.tag}>({item.category})</Text></Text>
            </View>
          )}
        />
      </View>

      {/* Mood Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mood Journal</Text>
        <View style={styles.itemRow}>
          <Ionicons name="happy-outline" size={20} color="orange" />
          <Text style={styles.itemText}>{dashboardData.mood.status} - {dashboardData.mood.note}</Text>
        </View>
      </View>

      {/* Reminder Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reminders</Text>
        {dashboardData.reminders.map((reminder) => (
          <View key={reminder.id} style={styles.itemRow}>
            <Ionicons name="notifications-outline" size={20} color="blue" />
            <Text style={styles.itemText}>{reminder.title}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text style={styles.actionText}>Add Task</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="happy" size={20} color="white" />
          <Text style={styles.actionText}>Log Mood</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="document-text-outline" size={20} color="white" />
          <Text style={styles.actionText}>Add Note</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemText: {
    marginLeft: 10,
    fontSize: 16,
  },
  tag: {
    color: 'gray',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionBtn: {
    backgroundColor: '#4a90e2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
});