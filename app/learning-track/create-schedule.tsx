import { useLocalSearchParams, router } from 'expo-router';
import { ChevronRight, Calendar, Clock, Save } from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import { useAuth } from '../../hooks/useAuth';
import logger from '../../utils/logger';

// Общая цветовая палитра приложения
const COLORS = {
  primary: '#5B67CA', // Основной синий/фиолетовый
  secondary: '#43C0B4', // Бирюзовый
  accent1: '#F98D51', // Оранжевый
  accent2: '#EC575B', // Красный
  accent3: '#FFCA42', // Желтый
  background: '#F2F5FF', // Светлый фон
  card: '#FFFFFF', // Белый для карточек
  text: '#25335F', // Основной текст
  textSecondary: '#7F8BB7', // Вторичный текст
  border: '#EAEDF5', // Граница
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const DAYS = [
  { value: 'monday', label: 'Понедельник' },
  { value: 'tuesday', label: 'Вторник' },
  { value: 'wednesday', label: 'Среда' },
  { value: 'thursday', label: 'Четверг' },
  { value: 'friday', label: 'Пятница' },
  { value: 'saturday', label: 'Суббота' },
  { value: 'sunday', label: 'Воскресенье' },
];

interface SessionTime {
  day: string;
  startTime: string;
  endTime: string;
}

interface ScheduleData {
  trackId: string;
  title: string;
  sessionsPerWeek: number;
  sessionDuration: number; // в минутах
  preferredTimes: SessionTime[];
  notifications: boolean;
  notes: string;
}

export default function CreateScheduleScreen() {
  const params = useLocalSearchParams<{ trackId: string }>();
  const { token, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    trackId: params.trackId || '',
    title: 'Моё расписание',
    sessionsPerWeek: 3,
    sessionDuration: 45,
    preferredTimes: [],
    notifications: true,
    notes: '',
  });

  // Форматирование времени для отображения
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Обработчик изменения количества занятий в неделю
  const handleSessionsPerWeekChange = (value: number) => {
    if (value < 1) value = 1;
    if (value > 7) value = 7;
    setScheduleData(prev => ({ ...prev, sessionsPerWeek: value }));
  };

  // Обработчик изменения длительности занятия
  const handleSessionDurationChange = (value: number) => {
    if (value < 15) value = 15;
    if (value > 120) value = 120;
    setScheduleData(prev => ({ ...prev, sessionDuration: value }));
  };

  // Добавление нового временного слота
  const addTimeSlot = () => {
    if (scheduleData.preferredTimes.length >= 7) {
      Alert.alert('Ограничение', 'Максимум 7 временных слотов (по одному на каждый день недели)');
      return;
    }

    // Находим первый неиспользованный день
    const usedDays = scheduleData.preferredTimes.map(time => time.day);
    const availableDay = DAYS.find(day => !usedDays.includes(day.value));

    if (!availableDay) {
      Alert.alert('Все дни заняты', 'Вы уже добавили слоты для всех дней недели');
      return;
    }

    const now = new Date();
    const defaultStart = new Date();
    defaultStart.setHours(10, 0, 0, 0);

    const defaultEnd = new Date();
    defaultEnd.setHours(11, 0, 0, 0);

    const newTimeSlot: SessionTime = {
      day: availableDay.value,
      startTime: formatTime(defaultStart),
      endTime: formatTime(defaultEnd),
    };

    setScheduleData(prev => ({
      ...prev,
      preferredTimes: [...prev.preferredTimes, newTimeSlot],
    }));
  };

  // Удаление временного слота
  const removeTimeSlot = (index: number) => {
    setScheduleData(prev => ({
      ...prev,
      preferredTimes: prev.preferredTimes.filter((_, i) => i !== index),
    }));
  };

  // Обработчик изменения дня недели для слота
  const handleDayChange = (index: number, day: string) => {
    const preferredTimes = [...scheduleData.preferredTimes];

    // Проверяем, не выбран ли уже этот день для другого слота
    const isDayAlreadySelected = preferredTimes.some((time, i) => time.day === day && i !== index);

    if (isDayAlreadySelected) {
      Alert.alert('День уже выбран', 'Этот день уже выбран для другого временного слота');
      return;
    }

    preferredTimes[index] = { ...preferredTimes[index], day };
    setScheduleData(prev => ({ ...prev, preferredTimes }));
  };

  // Показать выбор времени
  const showTimePicker = (index: number, type: 'start' | 'end') => {
    setSelectedDayIndex(index);
    if (type === 'start') {
      setShowStartTimePicker(true);
    } else {
      setShowEndTimePicker(true);
    }
  };

  // Обработчик выбора времени начала
  const handleStartTimeConfirm = (date: Date) => {
    if (selectedDayIndex === null) return;

    setShowStartTimePicker(false);

    const preferredTimes = [...scheduleData.preferredTimes];
    const formattedTime = formatTime(date);

    // Проверяем, не превышает ли время начала время окончания
    const endTime = preferredTimes[selectedDayIndex].endTime;
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinute = parseInt(endTime.split(':')[1]);

    const selectedHour = date.getHours();
    const selectedMinute = date.getMinutes();

    if (selectedHour > endHour || (selectedHour === endHour && selectedMinute >= endMinute)) {
      Alert.alert('Неверное время', 'Время начала должно быть раньше времени окончания');
      return;
    }

    preferredTimes[selectedDayIndex] = {
      ...preferredTimes[selectedDayIndex],
      startTime: formattedTime,
    };

    setScheduleData(prev => ({ ...prev, preferredTimes }));
  };

  // Обработчик выбора времени окончания
  const handleEndTimeConfirm = (date: Date) => {
    if (selectedDayIndex === null) return;

    setShowEndTimePicker(false);

    const preferredTimes = [...scheduleData.preferredTimes];
    const formattedTime = formatTime(date);

    // Проверяем, не предшествует ли время окончания времени начала
    const startTime = preferredTimes[selectedDayIndex].startTime;
    const startHour = parseInt(startTime.split(':')[0]);
    const startMinute = parseInt(startTime.split(':')[1]);

    const selectedHour = date.getHours();
    const selectedMinute = date.getMinutes();

    if (selectedHour < startHour || (selectedHour === startHour && selectedMinute <= startMinute)) {
      Alert.alert('Неверное время', 'Время окончания должно быть позже времени начала');
      return;
    }

    preferredTimes[selectedDayIndex] = {
      ...preferredTimes[selectedDayIndex],
      endTime: formattedTime,
    };

    setScheduleData(prev => ({ ...prev, preferredTimes }));
  };

  // Сохранение расписания
  const saveSchedule = useCallback(async () => {
    if (!token || !params.trackId) {
      Alert.alert('Ошибка', 'Не удалось идентифицировать учебный трек');
      return;
    }

    // Проверяем, все ли поля заполнены
    if (scheduleData.title.trim() === '') {
      Alert.alert('Заполните все поля', 'Укажите название расписания');
      return;
    }

    if (scheduleData.preferredTimes.length === 0) {
      Alert.alert('Добавьте временные слоты', 'Добавьте хотя бы один временной слот для занятий');
      return;
    }

    if (scheduleData.preferredTimes.length < scheduleData.sessionsPerWeek) {
      Alert.alert(
        'Недостаточно временных слотов',
        `Вы указали ${scheduleData.sessionsPerWeek} занятий в неделю, но добавили только ${scheduleData.preferredTimes.length} временных слотов. Добавьте еще слоты или уменьшите количество занятий.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/tracks/${params.trackId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        throw new Error('Failed to create schedule');
      }

      Alert.alert('Успешно', 'Расписание успешно создано', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      logger.error('Error creating schedule', error);
      Alert.alert('Ошибка', 'Не удалось создать расписание');
    } finally {
      setIsSubmitting(false);
    }
  }, [scheduleData, token, params.trackId]);

  // Получение названия дня по значению
  const getDayLabel = (dayValue: string): string => {
    const day = DAYS.find(d => d.value === dayValue);
    return day ? day.label : '';
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronRight
              size={24}
              color={COLORS.text}
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Создание расписания</Text>
            <Text style={styles.headerSubtitle}>Настройте удобное для вас расписание занятий</Text>
          </View>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.formContainer}>
            {/* Название расписания */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Название расписания</Text>
              <TextInput
                style={styles.textInput}
                value={scheduleData.title}
                onChangeText={text => setScheduleData(prev => ({ ...prev, title: text }))}
                placeholder="Например: Подготовка к экзамену"
              />
            </View>

            {/* Количество занятий в неделю */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Количество занятий в неделю</Text>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handleSessionsPerWeekChange(scheduleData.sessionsPerWeek - 1)}
                >
                  <Text style={styles.counterButtonText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.counterValue}>{scheduleData.sessionsPerWeek}</Text>

                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handleSessionsPerWeekChange(scheduleData.sessionsPerWeek + 1)}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Длительность одного занятия */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Длительность занятия (минуты)</Text>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handleSessionDurationChange(scheduleData.sessionDuration - 15)}
                >
                  <Text style={styles.counterButtonText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.counterValue}>{scheduleData.sessionDuration}</Text>

                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handleSessionDurationChange(scheduleData.sessionDuration + 15)}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Предпочтительное время занятий */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Предпочтительное время занятий</Text>

              {scheduleData.preferredTimes.map((timeSlot, index) => (
                <View key={`time-slot-${index}`} style={styles.timeSlotContainer}>
                  <View style={styles.timeSlotHeader}>
                    <Text style={styles.timeSlotTitle}>Временной слот {index + 1}</Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeTimeSlot(index)}
                    >
                      <Text style={styles.removeButtonText}>Удалить</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Выбор дня недели */}
                  <View style={styles.timeSlotRow}>
                    <Text style={styles.timeSlotLabel}>День:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.dayButtonsContainer}>
                        {DAYS.map(day => (
                          <TouchableOpacity
                            key={`day-${day.value}-${index}`}
                            style={[
                              styles.dayButton,
                              timeSlot.day === day.value && styles.selectedDayButton,
                              scheduleData.preferredTimes.some(
                                (t, i) => t.day === day.value && i !== index
                              ) && styles.disabledDayButton,
                            ]}
                            onPress={() => handleDayChange(index, day.value)}
                            disabled={scheduleData.preferredTimes.some(
                              (t, i) => t.day === day.value && i !== index
                            )}
                          >
                            <Text
                              style={[
                                styles.dayButtonText,
                                timeSlot.day === day.value && styles.selectedDayButtonText,
                                scheduleData.preferredTimes.some(
                                  (t, i) => t.day === day.value && i !== index
                                ) && styles.disabledDayButtonText,
                              ]}
                            >
                              {day.label.substring(0, 3)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  {/* Выбор времени */}
                  <View style={styles.timeSelectionContainer}>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => showTimePicker(index, 'start')}
                    >
                      <Clock size={16} color={COLORS.primary} />
                      <Text style={styles.timeButtonText}>Начало: {timeSlot.startTime}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => showTimePicker(index, 'end')}
                    >
                      <Clock size={16} color={COLORS.primary} />
                      <Text style={styles.timeButtonText}>Конец: {timeSlot.endTime}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.addButton} onPress={addTimeSlot}>
                <Calendar size={16} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Добавить временной слот</Text>
              </TouchableOpacity>
            </View>

            {/* Уведомления */}
            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.formLabel}>Уведомления о занятиях</Text>
                <Switch
                  value={scheduleData.notifications}
                  onValueChange={value =>
                    setScheduleData(prev => ({ ...prev, notifications: value }))
                  }
                  trackColor={{ false: '#CBD5E1', true: COLORS.primary + '80' }}
                  thumbColor={scheduleData.notifications ? COLORS.primary : '#F1F5F9'}
                  ios_backgroundColor="#CBD5E1"
                />
              </View>
              <Text style={styles.helperText}>
                Получать напоминания о занятиях за 30 минут до начала
              </Text>
            </View>

            {/* Заметки */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Заметки к расписанию</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={scheduleData.notes}
                onChangeText={text => setScheduleData(prev => ({ ...prev, notes: text }))}
                placeholder="Дополнительная информация о расписании..."
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Кнопка сохранения */}
            <TouchableOpacity
              style={[styles.saveButton, isSubmitting && styles.disabledButton]}
              onPress={saveSchedule}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Save size={18} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Сохранить расписание</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Модальные окна выбора времени */}
        <DateTimePickerModal
          isVisible={showStartTimePicker}
          mode="time"
          onConfirm={handleStartTimeConfirm}
          onCancel={() => setShowStartTimePicker(false)}
          confirmTextIOS="Подтвердить"
          cancelTextIOS="Отмена"
          minuteInterval={5}
        />

        <DateTimePickerModal
          isVisible={showEndTimePicker}
          mode="time"
          onConfirm={handleEndTimeConfirm}
          onCancel={() => setShowEndTimePicker(false)}
          confirmTextIOS="Подтвердить"
          cancelTextIOS="Отмена"
          minuteInterval={5}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 36,
    height: 36,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: 16,
  },
  timeSlotContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  timeSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeSlotTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  removeButton: {
    padding: 4,
  },
  removeButtonText: {
    fontSize: 14,
    color: COLORS.accent2,
    fontWeight: '500',
  },
  timeSlotRow: {
    marginBottom: 12,
  },
  timeSlotLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  dayButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedDayButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  disabledDayButton: {
    backgroundColor: '#E2E8F0',
    borderColor: '#E2E8F0',
    opacity: 0.5,
  },
  dayButtonText: {
    fontSize: 14,
    color: COLORS.text,
  },
  selectedDayButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  disabledDayButtonText: {
    color: COLORS.textSecondary,
  },
  timeSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  timeButtonText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 6,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helperText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
