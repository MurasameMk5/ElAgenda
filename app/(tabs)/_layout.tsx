import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            // Disable the static render of the header on web
            // to prevent a hydration error in React Navigation v6.
            headerShown: useClientOnlyValue(false, true),
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
