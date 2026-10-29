import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RoleCard({ 
  iconName, 
  iconSize = 28, 
  title, 
  subtitle, 
  onPress 
}) {
  return (
    <TouchableOpacity 
      style={styles.roleCard} 
      activeOpacity={0.7} 
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={iconName} size={iconSize} color="#2623D3" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.roleTitle}>{title}</Text>
        <Text style={styles.roleSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  roleCard: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 24,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2623D3',

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,

    elevation:  4,
    gap: 12,
  },
  iconContainer: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
    height: 56,
    backgroundColor: '#EEF2FF',
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: '#2623D3',
  },
  textContainer: {
    alignItems: 'center',
    gap: 4,
  },
  roleTitle: {
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.2,
    color: '#111827',
    textAlign: 'center',
  },
  roleSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});