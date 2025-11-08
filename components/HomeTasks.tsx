import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import TasksMiniature from './TasksMiniature';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, Easing, ReduceMotion } from 'react-native-reanimated';
import { fetchActualEvent, fetchTodayEvents } from '@/src/services/eventService';
import { useIsFocused } from '@react-navigation/native';
import { useUser } from './UserContext';

export default function HomeTasks() {
  const { user } = useUser();
  const [enCours, setEnCours] = useState(false);
  const [events, setEvents] = useState([]);
  const [actualEvent, setActualEvent] = useState(null);
  const isFocused = useIsFocused();
  const translateX = useSharedValue(0);

  // Animation du personnage (Varuo)
  const varuoState = ['Still', 'Idle1', 'Idle2', 'Idle3'];
  const [varuo, setVaruo] = useState(varuoState[0]);
  const stillTimeoutRef = useRef(null);

  const handleEnCours = (isEnCours) => {
    setEnCours(isEnCours);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  useEffect(() => {
    if (isFocused) {
      const getActualEvent = async () => {
        const res = await fetchActualEvent(user.id);
        if(res)
          setActualEvent(res[0]);
        else{
          const now = dayjs().tz('Europe/Paris').format('HH:mm:ss');
          if(now > res[0].end){
            events.map(event => {
              if(event.id == res[0].id){
                events.pop(event);
                events.push(event);
              }

            })
          }

        }
      };

      const getTodayEvents = async () => {
        const res = await fetchTodayEvents(user.id);
        if (res) setEvents(res);
      };

      getTodayEvents();
      getActualEvent();

    }
  }, [isFocused, user.id]);

  useEffect(() => {
    if (enCours) {
      translateX.value = withRepeat(
        withTiming(200, {
          duration: 2500,
          easing: Easing.inOut(Easing.poly(5)),
          reduceMotion: ReduceMotion.Never,
        }),
        -1,
        true
      );
    } else {
      translateX.value = 0;
    }
  }, [enCours]);

  useEffect(() => {
    if (enCours) {
      if (stillTimeoutRef.current) clearTimeout(stillTimeoutRef.current);
      return;
    }

    if (stillTimeoutRef.current) clearTimeout(stillTimeoutRef.current);

    const durations = {
      Idle1: 8370,
      Idle2: 4200,
      Idle3: 8370,
      Still: 4000,
    };

    if (durations[varuo]) {
      stillTimeoutRef.current = setTimeout(() => {
        setVaruo((prev) =>
          prev === 'Still'
            ? varuoState[Math.floor(Math.random() * varuoState.length)]
            : 'Still'
        );
      }, durations[varuo]);
    }

    return () => {
      if (stillTimeoutRef.current) clearTimeout(stillTimeoutRef.current);
    };
  }, [varuo, enCours]);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, borderWidth: 1, borderColor: 'orange', margin: 5, borderRadius: 20 }}>
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 10 }}>
            <Text style={styles.homeScreenFilename}>Today's tasks</Text>
            <Ionicons name="time-outline" size={30} />
            <Text style={styles.homeScreenFilename}>
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          {enCours ? (
            <Animated.View style={[{ width: 134, height: 98, marginLeft: '10%' }, animatedStyle]}>
              <Image source={require('@/assets/images/Varuo-run.gif')} style={styles.image} />
            </Animated.View>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 134, height: 98 }}>
                <Image
                  source={
                    varuo === 'Still'
                      ? require('@/assets/images/Varuo-still.gif')
                      : varuo === 'Idle1'
                      ? require('@/assets/images/Varuo-idle1.gif')
                      : varuo === 'Idle2'
                      ? require('@/assets/images/Varuo-idle2.gif')
                      : require('@/assets/images/Varuo-idle3.gif')
                  }
                  style={styles.image}
                />
              </View>
            </View>
          )}
        </View>

        {actualEvent && (
          <View>
            <Text style={{ marginLeft: 10, fontWeight: 'bold' }}>En cours</Text>
            <TasksMiniature
              key={actualEvent.id}
              id={actualEvent.id}
              start={actualEvent.start.slice(0, 5)}
              end={actualEvent.end.slice(0, 5)}
              title={actualEvent.title}
              color={actualEvent.color}
              image={actualEvent.image}
              textColor={actualEvent.text_color}
              onEnCours={handleEnCours}
              isCurrent={true}
            />
          </View>
        )}

        <Text style={{ marginLeft: 10, fontWeight: 'bold' }}>À venir</Text>
        <ScrollView contentContainerStyle={{ paddingBottom: 320 }}>
          {events.map((event) => (
            <TasksMiniature
              key={event.id}
              id={event.id}
              start={event.start.slice(0, 5)}
              end={event.end.slice(0, 5)}
              title={event.title}
              color={event.color}
              image={event.image}
              textColor={event.text_color}
              onEnCours={handleEnCours}
              isCurrent={false}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    top: '36%',
    flex: 1,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  homeScreenFilename: {
    margin: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
  image: {
    width: 244,
    height: 248,
    alignSelf: 'center',
    top: -110,
    transform: [{ scale: 0.7 }],
  },
});
