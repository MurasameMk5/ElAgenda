import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {

  return (
        <Tabs
          screenOptions={{
          }}>
          <Tabs.Screen
            name="index"
            options={{
              headerShown: false,
              title: 'Home',
              tabBarActiveTintColor: 'orange',
              tabBarInactiveTintColor: 'rgba(183, 152, 255, 0.5)',
              tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={30} color='rgba(183, 152, 255, 1)' />,
            }}
          />
          <Tabs.Screen
            name="calendar"
            options={{
              headerShown: false,
              title: 'Calendar',
              tabBarActiveTintColor: 'orange',
              tabBarInactiveTintColor: 'rgba(183, 152, 255, 0.5)',
              tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={30} color='rgba(183, 152, 255, 1)' />,
            }}
          />
        </Tabs>
  );
}
