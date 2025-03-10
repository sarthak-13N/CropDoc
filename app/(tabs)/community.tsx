import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const CommunityTab = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.communitySection}>
        <Text style={styles.title}>👥 शेतकरी चर्चा मंच</Text>
        <Text style={styles.description}>
          शेतकरी आपले अनुभव आणि माहिती शेअर करू शकतात.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => console.log('Navigate to forum')}
        >
          <Text style={styles.buttonText}>चर्चा सुरू करा</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F8FF', // Light background color
  },
  communitySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2C2C2C',
  },
  description: {
    fontSize: 16,
    color: '#444444',
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#1E88E5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CommunityTab;
