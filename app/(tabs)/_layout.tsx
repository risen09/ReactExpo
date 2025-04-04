import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { 
  BookOpen, 
  MessageCircle, 
  User, 
  Home
} from 'lucide-react-native';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import BurgerMenu from '../components/BurgerMenu';

export default function TabLayout() {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <>
      <BurgerMenu 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)} 
      />
      
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: '#333333',
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
          tabBarActiveTintColor: '#4A6CFA',
          tabBarInactiveTintColor: '#9E9E9E',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerRight: () => (
            <TouchableOpacity onPress={toggleMenu} style={styles.headerRight}>
              <View style={styles.burgerMenu}>
                <View style={styles.burgerLine} />
                <View style={styles.burgerLine} />
                <View style={styles.burgerLine} />
              </View>
            </TouchableOpacity>
          ),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Главная',
            tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
            headerTitle: 'Главная',
          }}
        />
        <Tabs.Screen
          name="lessons"
          options={{
            title: 'Уроки',
            tabBarIcon: ({ size, color }) => <BookOpen size={size} color={color} />,
            headerTitle: 'Уроки',
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Чат',
            tabBarIcon: ({ size, color }) => <MessageCircle size={size} color={color} />,
            headerTitle: 'Чат',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Профиль',
            tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
            headerTitle: 'Профиль',
          }}
        />
        {/* Hide the following screens from tab bar but keep them accessible via direct navigation */}
        <Tabs.Screen
          name="subjects"
          options={{
            href: null, // This prevents the tab from appearing in the tab bar
          }}
        />
        <Tabs.Screen
          name="leaderboard"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="practice"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="achievements"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            href: null,
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
  burgerMenu: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  burgerLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#333333',
    borderRadius: 4,
  },
});