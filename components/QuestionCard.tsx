import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import RadioButton from './RadioButton';
import { MBTIQuestion } from '../types/personalityTest';

interface QuestionCardProps {
  question: MBTIQuestion;
  selectedValue: number | null;
  onSelect: (value: number) => void;
  disabled?: boolean;
}

function QuestionCard({ question, selectedValue, onSelect, disabled = false }: QuestionCardProps) {
  // Labels for our 5-point Likert scale
  const labels = [
    'Совсем не согласен',
    'Скорее не согласен',
    'Нейтрально',
    'Скорее согласен',
    'Полностью согласен',
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.questionText}>{question.text}</Text>

      <View style={styles.optionsContainer}>
        <View style={styles.labelsRow}>
          <Text style={styles.labelText}>{labels[0]}</Text>
          <Text style={styles.labelText}>{labels[4]}</Text>
        </View>

        <View style={styles.radioGroup}>
          {[1, 2, 3, 4, 5].map(value => (
            <View key={value} style={styles.radioOption}>
              <RadioButton
                value={value}
                selectedValue={selectedValue}
                onSelect={onSelect}
                disabled={disabled}
              />
              <Text style={styles.valueText}>{value}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    color: '#333',
  },
  optionsContainer: {
    marginTop: 8,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  labelText: {
    fontSize: 12,
    color: '#666',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radioOption: {
    alignItems: 'center',
  },
  valueText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default QuestionCard;
