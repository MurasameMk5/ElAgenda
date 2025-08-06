import React from 'react';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import {Image} from 'expo-image';
import TasksMiniature from './TasksMiniature';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEvents } from '@/app/eventsContext';
import { Ionicons } from '@expo/vector-icons';


export default function HomeTasks() {
  const {events} = useEvents();
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
        <Image
          source={require('@/assets/images/cat-anim.gif')}
          style={{ width: '90%', height: 100, alignSelf: 'center', marginBottom: 0 }}
        />
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
