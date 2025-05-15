import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';

import COLORS from '@/app/config/colors';

const LoadingScreen = ({ text = 'Загрузка...' }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{text}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default LoadingScreen;
