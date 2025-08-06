import React, { use, useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import {Image} from 'expo-image';
import TasksMiniature from './TasksMiniature';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEvents } from '@/app/eventsContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, {useSharedValue, useAnimatedStyle, withTiming, withRepeat, Easing, ReduceMotion} from 'react-native-reanimated';


export default function HomeTasks() {
  const {events} = useEvents();
  const [enCours, setEnCours] = useState(false)
  const translateX = useSharedValue(0);
  
  const handleEnCours = (isEnCours: boolean) => {
    setEnCours(isEnCours);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  useEffect(() => {
    if(enCours) 
      translateX.value = withRepeat(withTiming(200, { duration: 1500, easing: Easing.inOut(Easing.poly(6)), reduceMotion: ReduceMotion.Never }), -1, true);
    else
      translateX.value = 0;
  }, [enCours]);
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
          <View style={{marginLeft: '5%', alignItems: 'flex-start', justifyContent: 'flex-start'}}>
            <Animated.View style={[{width:134, height: 98, borderStyle: 'dotted', borderBottomColor: 'orange', borderBottomWidth: 2}, animatedStyle]}>
              <Image
                source={require('@/assets/images/Varuo-running.gif')}
                style={{ width: 134, height: 98, marginBottom: 0, transform: [{ scaleX: -1 }]}}
            />
          </Animated.View>
          </View>
          ) : (
            <Image
              source={require('@/assets/images/Varuo-happy.gif')}
              style={{ width: 132, height: 98, alignSelf: 'center', marginBottom: 0, transform: [{ scaleX: -1 }]}}
            />
          )
        }
      </View>
      <ScrollView contentContainerStyle={{paddingBottom: 250}}>
        {events
          .filter(event =>
            event.start &&
            event.start.dateTime.split('T')[0] === new Date().toISOString().split('T')[0]
          ).sort((a, b) =>
            new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime())
          .map((event) => (
          <TasksMiniature
            key={event.id}
            start={event.start.dateTime.split('T')[1].slice(0, 5)}
            end={event.end.dateTime.split('T')[1].slice(0, 5)}
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
});
