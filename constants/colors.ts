// Основная цветовая палитра приложения
export const COLORS = {
  // Основные цвета
  primary: '#5271FF', // Основной цвет приложения (синий)
  primaryLight: '#95A9FF', // Светлый вариант основного цвета
  primaryDark: '#3A5CBF', // Темный вариант основного цвета

  // Акцентные цвета
  secondary: '#FF7A52', // Вторичный цвет (оранжевый)
  secondaryLight: '#FFA98D', // Светлый вариант вторичного цвета
  secondaryDark: '#BF4F25', // Темный вариант вторичного цвета

  // Градиенты
  primaryGradient: ['#5271FF', '#95A9FF'], // Градиент основного цвета
  secondaryGradient: ['#FF7A52', '#FFA98D'], // Градиент вторичного цвета

  // Фоновые цвета
  background: '#F8F9FA', // Основной фон приложения
  card: '#FFFFFF', // Фон для карточек
  backgroundDark: '#E9ECEF', // Темный фон (например, для выделения секций)

  // Цвета текста
  text: '#343A40', // Основной цвет текста
  textSecondary: '#6C757D', // Вторичный цвет текста
  textLight: '#ADB5BD', // Светлый цвет текста

  // Цвета состояний
  success: '#52C41A', // Успешное действие
  warning: '#FAAD14', // Предупреждение
  error: '#FF4D4F', // Ошибка
  info: '#1890FF', // Информация

  // Дополнительные цвета
  border: '#E1E4E8', // Рамки элементов
  disabled: '#CED4DA', // Отключенные элементы
  overlay: 'rgba(0, 0, 0, 0.5)', // Затемнение для модальных окон
  white: '#FFFFFF', // Белый цвет
  black: '#000000', // Черный цвет
};

// Типы для градиентов (для TypeScript)
export type GradientType = [string, string];

// Предопределенные градиенты для различных типов контента
export const GRADIENTS = {
  blue: ['#5271FF', '#95A9FF'] as GradientType,
  orange: ['#FF7A52', '#FFA98D'] as GradientType,
  green: ['#52C41A', '#85E04C'] as GradientType,
  purple: ['#7A52FF', '#A98DFF'] as GradientType,
  turquoise: ['#00C6BB', '#5DFFE6'] as GradientType,
};

// Карта типов личности MBTI и их градиентов
export const PERSONALITY_GRADIENTS: Record<string, GradientType> = {
  // Аналитики
  INTJ: GRADIENTS.purple,
  INTP: GRADIENTS.purple,
  ENTJ: GRADIENTS.purple,
  ENTP: GRADIENTS.purple,

  // Дипломаты
  INFJ: GRADIENTS.green,
  INFP: GRADIENTS.green,
  ENFJ: GRADIENTS.green,
  ENFP: GRADIENTS.green,

  // Стражи
  ISTJ: GRADIENTS.blue,
  ISFJ: GRADIENTS.blue,
  ESTJ: GRADIENTS.blue,
  ESFJ: GRADIENTS.blue,

  // Исследователи
  ISTP: GRADIENTS.orange,
  ISFP: GRADIENTS.orange,
  ESTP: GRADIENTS.orange,
  ESFP: GRADIENTS.orange,
};
