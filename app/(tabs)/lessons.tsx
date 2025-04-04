import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  FlatList,
  Dimensions
} from 'react-native';
import { Search, BookOpen, Clock, ChevronRight, User, Book, Star, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Общая цветовая палитра приложения
const COLORS = {
  primary: '#5B67CA',     // Основной синий/фиолетовый
  secondary: '#43C0B4',   // Бирюзовый
  accent1: '#F98D51',     // Оранжевый
  accent2: '#EC575B',     // Красный
  accent3: '#FFCA42',     // Желтый
  background: '#F2F5FF',  // Светлый фон
  card: '#FFFFFF',        // Белый для карточек
  text: '#25335F',        // Основной текст
  textSecondary: '#7F8BB7',  // Вторичный текст
  border: '#EAEDF5'       // Граница
};

interface Category {
  id: string;
  name: string;
  active: boolean;
}

interface Course {
  id: string;
  title: string;
  author: string;
  duration: string;
  lessons: number;
  image: any;
  color: string;
  progress: number;
}

export default function LessonsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Все', active: true },
    { id: '2', name: 'Математика', active: false },
    { id: '3', name: 'Физика', active: false },
    { id: '4', name: 'Программирование', active: false },
    { id: '5', name: 'Иностранные языки', active: false },
  ]);

  const popularCourses: Course[] = [
    {
      id: '1',
      title: 'Основы математики',
      author: 'Иван Петров',
      duration: '8 недель',
      lessons: 24,
      image: require('../../assets/images/icon.png'), // Используем доступное изображение
      color: '#EEF0FF',
      progress: 65
    },
    {
      id: '2',
      title: 'Программирование на Python',
      author: 'Анна Иванова',
      duration: '6 недель',
      lessons: 18,
      image: require('../../assets/images/icon.png'), // Используем доступное изображение
      color: '#FFF0E8',
      progress: 30
    },
  ];

  const recommendedCourses: Course[] = [
    {
      id: '3',
      title: 'Английский для начинающих',
      author: 'Мария Сидорова',
      duration: '12 недель',
      lessons: 36,
      image: require('../../assets/images/icon.png'), // Используем доступное изображение
      color: '#E6F8F6',
      progress: 45
    },
    {
      id: '4',
      title: 'Основы физики',
      author: 'Алексей Смирнов',
      duration: '10 недель',
      lessons: 30,
      image: require('../../assets/images/icon.png'), // Используем доступное изображение
      color: '#FFF8E8',
      progress: 10
    },
  ];

  const selectCategory = (id: string) => {
    setCategories(
      categories.map(category => ({
        ...category,
        active: category.id === id,
      }))
    );
  };

  const renderCourseItem = (item: Course) => (
    <TouchableOpacity
      style={[styles.courseCard, { backgroundColor: item.color }]}
      key={item.id}
    >
      <View style={styles.courseImageContainer}>
        <Image source={item.image} style={styles.courseImage} />
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{item.title}</Text>
        <Text style={styles.courseAuthor}>{item.author}</Text>
        
        {/* Progress bar */}
        {item.progress && (
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${item.progress}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{item.progress}%</Text>
          </View>
        )}
        
        <View style={styles.courseMetaContainer}>
          <View style={styles.courseMeta}>
            <Clock size={14} color={COLORS.textSecondary} />
            <Text style={styles.courseMetaText}>{item.duration}</Text>
          </View>
          <View style={styles.courseMeta}>
            <BookOpen size={14} color={COLORS.textSecondary} />
            <Text style={styles.courseMetaText}>{item.lessons} уроков</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.courseArrow}>
        <ArrowRight size={20} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Доброе утро!</Text>
          <Text style={styles.nameText}>Александр</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <User size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск курсов..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                category.active && styles.activeCategoryButton,
              ]}
              onPress={() => selectCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  category.active && styles.activeCategoryButtonText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Популярные курсы</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllButtonText}>Все</Text>
            <ChevronRight size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {popularCourses.map(renderCourseItem)}
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Рекомендованные</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllButtonText}>Все</Text>
            <ChevronRight size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {recommendedCourses.map(renderCourseItem)}
      </View>

      {/* Featured course banner */}
      <View style={styles.sectionContainer}>
        <TouchableOpacity style={styles.featuredCourseCard}>
          <LinearGradient
            colors={[COLORS.primary, '#424D9D']}
            style={styles.featuredCourseGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.featuredCourseContent}>
              <View style={styles.featuredBadge}>
                <Star size={12} color="#FFFFFF" />
                <Text style={styles.featuredBadgeText}>Популярный</Text>
              </View>
              
              <Text style={styles.featuredCourseTitle}>Продвинутый курс MBTI</Text>
              <Text style={styles.featuredCourseDescription}>
                Глубокое изучение типов личности и их влияния на коммуникацию
              </Text>
              
              <View style={styles.featuredCourseStats}>
                <View style={styles.featuredCourseStat}>
                  <BookOpen size={16} color="#FFFFFF" />
                  <Text style={styles.featuredCourseStatText}>24 урока</Text>
                </View>
                <View style={styles.featuredCourseStat}>
                  <Clock size={16} color="#FFFFFF" />
                  <Text style={styles.featuredCourseStatText}>12 часов</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.featuredCourseButton}>
                <Text style={styles.featuredCourseButtonText}>Начать обучение</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.featuredCourseImageContainer}>
              <Image 
                source={require('../../assets/images/icon.png')} 
                style={styles.featuredCourseImage} 
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesScrollContainer: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    marginRight: 10,
  },
  activeCategoryButton: {
    backgroundColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  activeCategoryButtonText: {
    color: '#FFFFFF',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 4,
  },
  courseCard: {
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  courseImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    marginRight: 16,
  },
  courseImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  courseInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  courseAuthor: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  progressBarContainer: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  courseMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  courseMetaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  courseArrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredCourseCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  featuredCourseGradient: {
    padding: 20,
    flexDirection: 'row',
  },
  featuredCourseContent: {
    flex: 1.5,
    paddingRight: 16,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  featuredCourseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  featuredCourseDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    lineHeight: 20,
  },
  featuredCourseStats: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  featuredCourseStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  featuredCourseStatText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  featuredCourseButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  featuredCourseButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  featuredCourseImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredCourseImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 10,
  },
  bottomPadding: {
    height: 20,
  },
});