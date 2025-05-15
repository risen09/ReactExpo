import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
  showPercentage?: boolean;
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
  label?: string;
}

function ProgressBar({
  progress,
  showPercentage = false,
  height = 8,
  backgroundColor = '#e0e0e0',
  fillColor = '#4caf50',
  label,
}: ProgressBarProps) {
  // Ensure progress is between 0-100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.progressTrack, { height, backgroundColor }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${clampedProgress}%`,
              height,
              backgroundColor: fillColor,
            },
          ]}
        />
      </View>
      {showPercentage && <Text style={styles.percentage}>{clampedProgress}%</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  progressTrack: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
});

export default ProgressBar;
