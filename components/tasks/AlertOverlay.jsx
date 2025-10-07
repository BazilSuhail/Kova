import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const AlertOverlay = ({ visible, onClose, title, message }) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.alertBox}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DummyComponent = () => {
  const [alertVisible, setAlertVisible] = React.useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dummy Component</Text>
      
      <TouchableOpacity 
        style={styles.triggerButton}
        onPress={() => setAlertVisible(true)}
      >
        <Text style={styles.triggerButtonText}>Show Alert</Text>
      </TouchableOpacity>

      <Text style={styles.content}>
        This is content behind the overlay. The alert will appear on top of this.
      </Text>

      <Text style={styles.content}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </Text>

      <AlertOverlay
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title="Alert Title"
        message="This is an important message displayed in the alert overlay!"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  content: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    marginTop: 20,
    lineHeight: 24,
  },
  triggerButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 10,
  },
  triggerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  alertBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default DummyComponent;
