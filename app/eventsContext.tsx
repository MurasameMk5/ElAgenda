import React, { createContext, use, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

const EventsContext = createContext(undefined);

export function EventsProvider({ children }) {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    const loadEvents = async () => {
        let events = await AsyncStorage.getItem('events');
        if(events) {
          setEvents(JSON.parse(events));
        }
    }
    loadEvents();
  }, []);
  return (
    <EventsContext.Provider value={{ events, setEvents }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  return useContext(EventsContext);
}