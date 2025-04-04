import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from './hooks/useAuth';

const COLORS = {
  primary: '#5B67CA',
  secondary: '#43C0B4',
  accent1: '#F98D51',
  accent2: '#EC575B',
  background: '#F2F5FF',
  card: '#FFFFFF',
  text: '#25335F',
  textSecondary: '#7F8BB7',
  border: '#EAEDF5',
};

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { changePassword } = useAuth();

  const validateForm = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Пожалуйста, заполните все поля');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Новый пароль и подтверждение не совпадают');
      return false;
    }
    
    if (newPassword.length < 6) {
      setError('Новый пароль должен содержать не менее 6 символов');
      return false;
    }
    
    return true;
  };

  const handleChangePassword = async () => {
    setError(null);
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const success = await changePassword(currentPassword, newPassword);
      
      if (success) {
        router.back();
      }
    } catch (err) {
      setError('Не удалось изменить пароль. Возможно, текущий пароль введен неверно.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Изменить пароль',
          headerTitleStyle: { 
            color: COLORS.text, 
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerStyle: {
            backgroundColor: COLORS.card,
          },
        }} 
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.description}>
            Для изменения пароля, пожалуйста, введите свой текущий пароль и новый пароль дважды для подтверждения.
          </Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Текущий пароль</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Введите текущий пароль"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff size={20} color={COLORS.textSecondary} />
                ) : (
                  <Eye size={20} color={COLORS.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Новый пароль</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Введите новый пароль"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff size={20} color={COLORS.textSecondary} />
                ) : (
                  <Eye size={20} color={COLORS.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Подтверждение пароля</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Подтвердите новый пароль"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={COLORS.textSecondary} />
                ) : (
                  <Eye size={20} color={COLORS.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.passwordRequirements}>
            Пароль должен содержать не менее 6 символов
          </Text>
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Изменить пароль</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 24,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(236, 87, 91, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: COLORS.accent2,
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  eyeIcon: {
    padding: 8,
  },
  passwordRequirements: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
}); 