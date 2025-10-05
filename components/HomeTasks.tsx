import React, { use, useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import {Image} from 'expo-image';
import TasksMiniature from './TasksMiniature';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEvents } from '@/app/eventsContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, {useSharedValue, useAnimatedStyle, withTiming, withRepeat, Easing, ReduceMotion} from 'react-native-reanimated';
import {fetchActualEvent, fetchTodayEvents } from '@/src/services/eventService';
import { useIsFocused } from '@react-navigation/native';


export default function HomeTasks() {
  //const {events} = useEvents();
  const [enCours, setEnCours] = useState(false)
  const varuoState = ["Still", "Idle1", "Idle2", "Idle3"]
  const [varuo, setVaruo] = useState(varuoState[0]);
  const translateX = useSharedValue(0);
  const [events, setEvents] = useState([]);
  const handleEnCours = (isEnCours: boolean) => {
    setEnCours(isEnCours);
  };
  const isFocused = useIsFocused();
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  useEffect(() => {
    if(isFocused){
      const getTodayEvents = async () => {
        let res = await fetchTodayEvents();
        if(res)
          setEvents(res);
      }
      getTodayEvents();      
    }
  }, [isFocused]);

  useEffect(() => {
    if(enCours) 
      translateX.value = withRepeat(withTiming(200, { duration: 2500, easing: Easing.inOut(Easing.poly(5)), reduceMotion: ReduceMotion.Never }), -1, true);
    else
      translateX.value = 0;
  }, [enCours]);

  useEffect(() => {
    let stillTimeoutId;
    if(varuo === "Idle1") {
      setTimeout(() => {
        setVaruo('Still');
      }, 8370);
    } else if(varuo === "Idle2") {
      setTimeout(() => {
        setVaruo('Still');
      }, 4200);
    } else if(varuo === "Idle3") {
      setTimeout(() => {
        setVaruo('Still');
      }, 8370);
    } else if(varuo === "Still") {
      stillTimeoutId = setTimeout(() => {
        setVaruo(varuoState[Math.floor(Math.random() * varuoState.length)]);
      }, 4000);
    } else if(enCours)
        clearTimeout(stillTimeoutId);
    console.log(enCours)
  }, [varuo]);


  return (
    <View style={styles.container}>
      <View style={{flex: 1, borderWidth: 1, borderColor: 'orange', margin: 5, borderRadius: 20}} >
      <View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 10}}>
          <Text style={styles.homeScreenFilename}>
            Today's tasks
          </Text>
          <Ionicons name='time-outline' size={30}/>
          <Text style={styles.homeScreenFilename}>
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        {
          enCours ? (
          <Animated.View style={[{width:134, height: 98, marginLeft: '10%'}, animatedStyle]}>
              <Image
                source={require('@/assets/images/Varuo-run.gif')}
                style={styles.image}
            />
          </Animated.View>
          
          ) : (
            <View style={{alignItems: 'center'}}>
            {
            varuo === "Still" ? (
              <View style={{width:134, height: 98}}>
                <Image
                  source={require('@/assets/images/Varuo-still.gif')}
                  style={styles.image}
                  />
              </View>
            ) : varuo === "Idle1" ? (
              <View style={{width:134, height: 98}}>
              <Image
                source={require('@/assets/images/Varuo-idle1.gif')}
                style={styles.image}
                />
                </View>
            ) : varuo === "Idle2" ? (
              <View style={{width:134, height: 98}}>
              <Image
                source={require('@/assets/images/Varuo-idle2.gif')}
                style={styles.image}
                />
                </View>
            ) : varuo === "Idle3" ? (
              <View style={{width:134, height: 98}}>
              <Image
                source={require('@/assets/images/Varuo-idle3.gif')}
                style={styles.image}
                />
                </View>
            ) : null
            }
          </View>
          )
        }
      </View>
      <ScrollView contentContainerStyle={{paddingBottom: 250}}>
        {events && events
          .map((event) => (
          <TasksMiniature
            key={event.id}
            id= {event.id}
            start={event.start.slice(0,5)}
            end={event.end.slice(0,5)}
            title={event.title}
            color={event.color}
            image={event.image}
            textColor={event.textColor}
            onEnCours={handleEnCours}
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
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  homeScreenFilename: {
    margin: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
  codeHighlightContainer: {
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  helpContainer: {
    marginTop: 15,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    textAlign: 'center',
  },
  image: {
    width: 244, 
    height: 248, 
    alignSelf: 'center', 
    top: -110, 
    transform: [{ scale: 0.7}],
  }
});
