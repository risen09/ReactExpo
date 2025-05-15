import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface RadioButtonProps {
  value: number;
  selectedValue: number | null;
  onSelect: (value: number) => void;
  label?: string;
  disabled?: boolean;
}

function RadioButton({
  value,
  selectedValue,
  onSelect,
  label,
  disabled = false,
}: RadioButtonProps) {
  const isSelected = selectedValue === value;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onSelect(value)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.radioCircle,
          isSelected && styles.selectedRadioCircle,
          disabled && styles.disabledRadioCircle,
        ]}
      >
        {isSelected && <View style={styles.selectedRb} />}
      </View>
      {label && <Text style={[styles.label, disabled && styles.disabledLabel]}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedRadioCircle: {
    borderColor: '#2980b9',
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2980b9',
  },
  disabledRadioCircle: {
    borderColor: '#bdc3c7',
  },
  label: {
    fontSize: 14,
    color: '#333',
  },
  disabledLabel: {
    color: '#bdc3c7',
  },
});

export default RadioButton;
