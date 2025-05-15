import { Tabs } from 'expo-router';
import { BookOpen, MessageCircle, User, Home, AlignRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import BurgerMenu from '../../components/BurgerMenu';

const COLORS = {
  primary: '#5B67CA', // Основной синий/фиолетовый
  secondary: '#43C0B4', // Бирюзовый
  accent1: '#F98D51', // Оранжевый
  accent2: '#EC575B', // Красный
  background: '#F2F5FF', // Светлый фон
  text: '#25335F', // Основной текст
  textSecondary: '#7F8BB7', // Вторичный текст
  border: '#EAEDF5', // Граница
};

export default function TabLayout() {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <>
      <BurgerMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: COLORS.text,
          },
          headerShadowVisible: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#F0F0F0',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          // headerRight: () => (
          //   <TouchableOpacity onPress={toggleMenu} style={styles.headerRight}>
          //     <AlignRight size={24} color={COLORS.text} />
          //   </TouchableOpacity>
          // ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Главная',
            tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="learning-tracks"
          options={{
            title: 'Треки',
            tabBarIcon: ({ size, color }) => <BookOpen size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Приветствие',
            tabBarIcon: ({ size, color }) => <MessageCircle size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Профиль',
            tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
          }}
        />
        {/* Hide the following screens from tab bar but keep them accessible via direct navigation */}
        <Tabs.Screen
          name="lessons"
          options={{
            href: null, // This prevents the tab from appearing in the tab bar
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    marginRight: 16,
    padding: 8,
  },
});
