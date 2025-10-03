import { Alert, StyleSheet, ImageBackground, TouchableOpacity, TextInput, Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarBody, CalendarContainer, CalendarHeader, HeaderItemProps, parseDateTime } from '@howljs/calendar-kit';
import { useEffect, useState, useCallback, useRef } from 'react';
import ColorPicker, { HueSlider, Panel1, Preview } from 'reanimated-color-picker';
import { GestureHandlerRootView} from 'react-native-gesture-handler';
import { useEvents } from '../eventsContext';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ScreenOrientation from 'expo-screen-orientation';
import CalendarPicker from 'react-native-calendar-picker';
import Modal from 'react-native-modal'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import notifee, { TimestampTrigger, TriggerType, AndroidImportance, AndroidNotificationSetting } from '@notifee/react-native';

export default function TabTwoScreen() {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);  
  const calendarRef = useRef(null);
  const [agenda, setAgenda] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(()=>{
    const month = new Date().toLocaleString('fr-FR', {month: 'long'});
    return month.charAt(0).toUpperCase() + month.slice(1)
  });
  const {events, setEvents} = useEvents();
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(false);
  const [actualColor, setActualColor] = useState('');
  const [colorModal, setColorModal] = useState(false);
  const [colorModalText, setColorModalText] = useState(false);
  const [newEvent, setNewEvent] = useState({
    id: '',
    title: '',
    start: { dateTime: '' },
    end: { dateTime: '' },
    recurrenceRule: '',
    value: '',
    occurrences: 1,
    color: '#fff',
    image: '',
    textColor: '#000',
    notification: '',
    preNotification: '',
  });
  const [copiedEvent, setCopiedEvent] = useState({
    id: '',
    title: '',
    start: { dateTime: '' },
    end: { dateTime: '' },
    duree: 0,
    recurrenceRule: '',
    value: '',
    occurrences: 1,
    color: '#fff',
    image: '',
    textColor: '#000',
    notification: '',
    preNotification: '',
  });
  const [copied, setCopied] = useState(false);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('none');
  const [items, setItems] = useState([
    { label: 'Non', value: 'none' },
    { label: 'Tous les jours', value: 'everyday' },
    { label: 'Tous les jours de la semaine', value: 'every_weekdays' },
    { label: 'Chaque semaine', value: 'weekly' },
  ]);
  const insets = useSafeAreaInsets();
  let hasAlarm = false;
  
  useEffect(() => {
    if(!modalVisible){
      setNewEvent({
        id: '',
        title: '',
        start: { dateTime: '' },
        end: { dateTime: '' },
        recurrenceRule: '',
        value: '',
        occurrences: 1,
        color: '#fff',
        image: '',
        textColor: '#000',
        notification: '',
      });
      setEditingEvent(false);
    }
  }, [modalVisible]);

  useEffect(() => {
    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
      console.log('Orientation changed:', event.orientationInfo.orientation);
      if(event.orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        event.orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
      )
        setNumberOfDays(3);
      else
        setNumberOfDays(5);
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);

  useEffect(() => {
    if (calendarRef.current) {
    calendarRef.current.goToDate({ date: new Date().toISOString() });
    console.log(calendarRef.current);
  }
    const getAlarmSetting = async () => {
      const settings = await notifee.getNotificationSettings();
      hasAlarm = settings.android.alarm === AndroidNotificationSetting.ENABLED;
    }
    getAlarmSetting();
  }, [])
/*
  useEffect(() => {
  const clearEvents = async () => {
    await AsyncStorage.removeItem('events');
  };
  clearEvents();
}, []);*/

  /*
  useEffect(() => {
    const deleteChannel = async () => {
      await notifee.deleteChannel('task');
    }
    deleteChannel();
  }, []);*/
  /*
  useEffect(() => {
    events.filter(function(event) {
      return event.recurrenceRule != "none";
    }).map((event) => {
      if(event.recurrenceRule == "RRULE:FREQ=DAILY") {
        for (let i = 1; i <= 7; i++) {
          const nextEvent = { ...event, start: { ...event.start }, end: {...event.end} };
          nextEvent.start.dateTime = new Date(
            new Date(event.start.dateTime).getTime() + i * 24 * 60 * 60 * 1000
          ).toISOString();
          nextEvent.end.dateTime = new Date(
            new Date(event.end.dateTime).getTime() + i * 24 * 60 * 60 * 1000
          ).toISOString();
          setEvents([...events, nextEvent]);
          console.log('Event created:', nextEvent);
        }
    }});
  }, []);
*/
  const changeDays = () => {
    switch(numberOfDays){
      /*case 1:
        setNumberOfDays(3);
        break;*/
      case 3: 
        setNumberOfDays(5);
        break;
      case 5:
        setNumberOfDays(3);
        break;
    }
  }

    //===================Créer une notification===================

  const sendNotification = async (title: string, start: any) => {

    const channelId = await notifee.createChannel({
      id: 'tasks',
      name: 'task reminder',
      sound: 'varuo_sound',
      importance: AndroidImportance.HIGH
    });

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: new Date(start.dateTime).getTime(),
      alarmManager: hasAlarm,
    }

    
    try {  
      await notifee.createTriggerNotification(
          {
            id: `${title}-${start.dateTime}`,
            title: "Au travail !",
            body: title,
            android: {channelId},
          },
          trigger,
        );
    } catch (error) {
      console.log("Erreur lors de la création de la notification", error)
    }
  }

    //===================Créer un évènement===================

  const createEvent = (event: { start: any; end: any; }) =>{
    console.log('Event created:', event);
    setNewEvent({
      ...newEvent,
      start: event.start,
      end: event.end,
    });
    setCopiedEvent({
      ...copiedEvent,
      duree: Math.abs(new Date(copiedEvent.end.dateTime) - new Date(copiedEvent.start.dateTime)),
      start: event.start,
    });
    setModalVisible(true)
  }
  //===================Modifier un évènement===================

  const ModifyEvent = async (event: { id: string; start: any; end: any; title: string; color: string; recurrenceRule: string}) => {
    console.log("new events:", event);
    const notifId = `${event.title}-${event.start.dateTime}`;
    await sendNotification(event.title, event.start);
    const updatedEvents = events.map((ev:any) =>{
      if(ev.id === event.id){
        notifee.cancelNotification(ev.notification);
        ev = {...event, value: value, notification: notifId}
      }
      return ev;
    }
    );

    if(value != 'none'){
      setNewEvent(event);
      setTimeout(() => {
        postEvent();
      }, 0);
    }
    setEvents(updatedEvents);
    AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
    setEditingEvent(false);
    setModalVisible(false);
  }

  //===================Supprimer un évènement===================

  const deleteEvent = (event) => {
  Alert.alert(
    'Supprimer les évènements',
    'Supprimer les évènements suivants?',
    [
      {
        text: 'Annuler',
        style: 'cancel',
        onPress: () => {
          return;
        }
      },
      {
        text: 'Uniquement celui-ci',
        style: 'destructive',
        onPress: async () => {
          notifee.cancelNotification(event.notification);
          const updatedEvents = events.filter(ev => ev.id !== event.id);
          setEvents(updatedEvents);
          AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
          setModalVisible(false);
          console.log('Event deleted:', event.id);
        },
      },
      {
        text: 'Inclure les suivants ',
        onPress: () => {
          const updatedEvents = events.filter(ev => 
            ev.id.split(':')[0] !== event.id.split(':')[0] || 
            new Date(ev.start.dateTime.split('T')[0]) < new Date(event.start.dateTime.split('T')[0])
          );
          const removedEvents = events.filter(ev => 
            ev.id.split(':')[0] === event.id.split(':')[0] && 
            new Date(ev.start.dateTime.split('T')[0]) >= new Date(event.start.dateTime.split('T')[0])
          );
          removedEvents.forEach((ev) => {
            notifee.cancelNotification(ev.notification);
          });
          console.log('Removed events:', removedEvents);
          setEvents(updatedEvents);
          AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
          setModalVisible(false);
        }
      }
    ],
    { cancelable: true }
  );
};
  //===================Poster un évènement===================

  const postEvent = async () => {
    console.log(newEvent);
    if (!newEvent.title || !newEvent.start.dateTime || !newEvent.end.dateTime ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs de l\'événement.');
      return;
    }

    let recurrenceRule = '';
    switch (value) {
      case 'everyday':
        recurrenceRule = 'RRULE:FREQ=DAILY';
        break;
      case 'every_weekdays':
        recurrenceRule = 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR';
        break;
      case 'weekly':
        recurrenceRule = 'RRULE:FREQ=WEEKLY';
        break;
      default:
        recurrenceRule = 'none';
        break;
    }

    let baseId = 1;
    if (events.length > 0) {
      // Récupère le max des id numériques (avant le ':')
      baseId = Math.max(
        ...events.map(ev => parseInt(ev.id.split(':')[0], 10) || 0)
      ) + 1;
    }

    const eventsToAdd = [];
    
    if(recurrenceRule === 'none') {
      eventsToAdd.push({
        ...newEvent,
        id: String(baseId),
        recurrenceRule: 'none',
        value: 'none',
      });
    } else {
      let eventCreated = 0;
      let currentStart = new Date(newEvent.start.dateTime);
      let currentEnd = new Date(newEvent.end.dateTime);
      console.log("start", currentStart);
      if(editingEvent){
        currentStart.setDate(currentStart.getDate() + 1);
        currentEnd.setDate(currentEnd.getDate() + 1);
      }

      while (eventCreated < newEvent.occurrences) {
        // Sauter samedi (6) et dimanche (0) pour les jours de semaine
        if (value === 'every_weekdays' && (currentStart.getDay() === 0 || currentStart.getDay() === 6)) {
          currentStart.setDate(currentStart.getDate() + 1);
          currentEnd.setDate(currentEnd.getDate() + 1);
          continue;
        }

        const event = {
          ...newEvent,
          start: { dateTime: currentStart.toISOString().split('T')[0] + 'T' + newEvent.start.dateTime.split('T')[1] },
          end: { dateTime: currentEnd.toISOString().split('T')[0] + 'T' + newEvent.end.dateTime.split('T')[1] },
          recurrenceRule,
          value: value,
        };

        if (eventCreated === 0 && editingEvent) {
          // skip first if editing
        } else if (eventCreated === 0) {
          event.id = String(baseId);
        } else {
          event.id = String(baseId + ':' + eventCreated);
        }

        eventsToAdd.push(event);
        eventCreated++;

        // Avance d'un jour (ou d'une semaine si weekly)
        if (value === 'weekly') {
          currentStart.setDate(currentStart.getDate() + 7);
          currentEnd.setDate(currentEnd.getDate() + 7);
        } else {
          currentStart.setDate(currentStart.getDate() + 1);
          currentEnd.setDate(currentEnd.getDate() + 1);
        }

      }
    }
    for(const event of eventsToAdd){
      event.notification = `${event.title}-${event.start.dateTime}`
      await sendNotification(event.title, event.start);
      console.log("new event" , event);
    }
    setEvents([...events, ...eventsToAdd]);
    setValue('none');
    setModalVisible(false);
    await AsyncStorage.setItem('events', JSON.stringify([...events, ...eventsToAdd]));
  }  

    //===================Copier un évènement===================

  const copyEvent = (event) =>{
    setCopiedEvent(event);
    setCopied(true);
    console.log("Event copié!");
    setModalVisible(false);
  }

    //===================Coller un évènement===================

  const pasteEvent = async (event) => {
    const notifId = `${event.title}-${event.start.dateTime}`; 
    await sendNotification(copiedEvent.title, copiedEvent.start);
    const copyEvent = {
      ...copiedEvent,
      id: String(Math.max(
        ...events.map(ev => parseInt(ev.id.split(':')[0], 10) || 0)
      ) + 1),
      end: { dateTime: new Date(new Date(copiedEvent.start.dateTime).getTime() + copiedEvent.duree).toISOString()},
      notification: notifId,
    }

    console.log(copyEvent);
    setEvents([...events, copyEvent]);
    AsyncStorage.setItem('events', JSON.stringify([...events, copyEvent]));
    setCopiedEvent({
      id: '',
      title: '',
      start: { dateTime: '' },
      end: { dateTime: '' },
      duree: 0,
      recurrenceRule: '',
      value: '',
      occurrences: 1,
      color: '#fff',
      image: '',
      textColor: '#000',
      notification: '',
    })
    setCopied(false);
    setModalVisible(false);
  }

    //===================Déplacer un évènement===================

  const moveEventEnd = async (event:any, newStart:any, newEnd:any) => {
    const notifId = `${event.title}-${event.start.dateTime}`
    console.log("start", event.start.dateTime);
    console.log("new Event", event, newStart, newEnd);
    await sendNotification(event.title, event.start);

    const updatedEvents = events.map(ev => {
      if(ev.id === event.id){
        notifee.cancelNotification(ev.notification);
        ev = {...event, notification: notifId};
      }
      console.log("new event", ev);
      return ev;
    });

    setEvents(updatedEvents);
    AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
    setSelectedEvent(null);
};

    //===================Apparence d'un évènement===================
  const renderEvent = useCallback(
    (event) => (
      <ImageBackground
        source={{uri: event.image}}
        style={{
          height: '100%',
          backgroundColor: event.color,
          borderRadius: 10,
        }}>
        <Text style={{ color: event.textColor, fontSize: 10 }}>{event.title}</Text>
      </ImageBackground>
    ),
    []
  );
    
  const customTheme = {
    headerContainer: {
      backgroundColor: 'rgba(255, 231, 187, 0.7)',
    },
    todayNumberContainer: {
      backgroundColor: 'orange',
    },
    nowIndicatorColor: 'orange',
  }

  const customDayHeaderStyle = ({ dayOfWeek, month, year }) => {
    if(dayOfWeek <6){
      return {
        textStyle: {
          color: 'orange',
        }
      };
    }
    else{
      return {
        textStyle: {
          color: 'rgba(183, 152, 255, 1)',
        }
    }
  }
};
  return (
    <GestureHandlerRootView>
      <View style={{flex: 1, top: insets.top}}>
        <View style={{height: 50}}>
          <TouchableOpacity onPress={() => setAgenda(a => !a)} style={{top: 8, right: 15, position: 'absolute', zIndex: 10}}>
            <Ionicons name="calendar" size={30} color={'rgba(183, 152, 255, 1)'}/> 
          </TouchableOpacity>
          <Text style={{color: 'orange', fontSize:20, position: 'absolute', left: 60, top: 10, padding: 2, paddingHorizontal: 8, borderBottomColor: 'rgba(183, 152, 255, 1)', borderBottomWidth: 2, borderRadius: 10}}>
            {selectedMonth}
          </Text>
          <TouchableOpacity onPress={changeDays} style={{top: 8, left: 15, position: 'absolute', zIndex: 10, width: 35, height: 35, backgroundColor: 'rgba(183, 152, 255, 1)', borderRadius: 50}}>
            <View style={{width: '90%', height: '90%', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', top: '5%', borderColor: 'white', borderWidth: 1, borderRadius: 50, backgroundColor: 'transparent'}}>
              <Text style={{color: 'white', fontSize: 22}}> {numberOfDays} </Text>
            </View>
          </TouchableOpacity>
        </View>
        
      
        <CalendarContainer 
        ref={calendarRef}
        numberOfDays={numberOfDays}
        allowDragToCreate={true}
        allowDragToEdit={true}
        selectedEvent={selectedEvent}
        onDragCreateEventEnd={createEvent}
        onDragSelectedEventEnd={moveEventEnd}
        onPressEvent={(event)=> {setEditingEvent(true); setNewEvent(event); setModalVisible(true); console.log(events);}}
        onLongPressEvent={(event) => setSelectedEvent(event)}
        events={events}
        theme={customTheme}
        >

          {
            //--------------Calendrier supérieur--------------
          }
          {agenda && (
          <View>
            <CalendarPicker
              startFromMonday={true}
              weekdays={["L", "M", "M", "J", "V", "S", "D"]}
              months={["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"]} 
              previousTitle={"◀" }
              nextTitle="▶"  
              onDateChange={(date)=> {
                calendarRef.current?.goToDate({date: date});
                const month = date.toLocaleString('fr-FR', {month: 'long'});
                setSelectedMonth(month.charAt(0).toUpperCase() + month.slice(1)) 
              }}
              height={350}
              todayBackgroundColor={'orange'}
              todayTextStyle={{color: 'white', fontWeight: 'bold'}}
              selectedDayColor='rgba(183, 152, 255, 0.57)'
              monthTitleStyle={{color: 'orange'}}
              yearTitleStyle={{color: 'rgba(183, 152, 255, 1)'}}
              customDayHeaderStyles={customDayHeaderStyle}
            />
          </View>
          )}
            <CalendarHeader/>
            <CalendarBody renderEvent={renderEvent}/>
        </CalendarContainer>
      </View>

      {
        //--------------Modal pour la création d'évènement--------------
      }
      <View>
        <Modal 
          isVisible={modalVisible} 
          onBackButtonPress={() => setModalVisible(false)} 
          onBackdropPress={() => setModalVisible(false)}
          backdropOpacity={0.2}
          useNativeDriver
          style={{width: '100%', margin: 0}}
          >
          <View style={styles.modalBackground}>
            <View style={{width: '100%', height: '60%', borderColor: 'orange', borderWidth: 1, borderRadius: 20, shadowColor: 'red', shadowOffset: {width: 0, height: -2}, shadowOpacity: 0.3, shadowRadius: 20}}>
              
              {
                //-----------Première ligne: titre, copier, coller, supprimer-----------
              }
              <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%', padding: 10, backgroundColor: 'transparent'}}>
                <TextInput placeholder={"Titre"} defaultValue={newEvent.title} onChangeText={(text) => setNewEvent({...newEvent, title: text})} 
                  style={{width: '60%', borderBottomColor: 'rgba(183, 152, 255, 1)', borderBottomWidth: 2, fontSize: 25, borderTopLeftRadius: 10, borderTopRightRadius: 10}} />
                { editingEvent &&(
                <TouchableOpacity onPress={() => deleteEvent(newEvent)} style={{...styles.button}}> 
                  <Ionicons name='trash-outline' style={{color: 'rgba(183, 152, 255, 1)', fontSize: 25}}/>
                </TouchableOpacity>
                )}
                { editingEvent &&(
                  <TouchableOpacity onPress={() => copyEvent(newEvent)} style={{...styles.button}}> 
                    <Ionicons name='copy-outline' style={{color: 'rgba(183, 152, 255, 1)', fontSize: 25}}/> 
                  </TouchableOpacity>
                  )}
                { !editingEvent && copied && (
                <TouchableOpacity onPress={() => pasteEvent(copiedEvent)} style={{...styles.button}}>
                  <Ionicons name='clipboard-outline' style={{color: 'rgba(183, 152, 255, 1)', fontSize: 25}}/>
                </TouchableOpacity>
                )}
              </View>
              
              {
                //-----------------Date et temps----------------------
              }
              {newEvent.start.dateTime && newEvent.end.dateTime &&
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '70%', gap: 10, marginVertical: 10, left: 10 }}>
                <Text style={{ minWidth: 80, fontWeight: 'bold', fontSize: 16, color: '#B798FF' }}>
                  {newEvent.start.dateTime.split('T')[0]}
                </Text>
                <Pressable
                  onPress={() => setShowStartPicker(true)}
                  style={{
                    width: 70,
                    borderBottomWidth: 1,
                    borderColor: '#B798FF',
                    fontSize: 16,
                    textAlign: 'center',
                    borderRadius: 6,
                    backgroundColor: '#F6F6F6',
                    color: '#222',
                    padding: 4,
                    marginHorizontal: 4,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                <Text style={{ color: '#222', fontSize: 16 }}>
                  {newEvent.start.dateTime.split('T')[1]?.slice(0, 5) || 'HH:mm'}
                </Text>
              </Pressable>
              <Text style={{ fontSize: 18, color: '#B798FF', fontWeight: 'bold' }}>–</Text>
              <Pressable
                onPress={() => setShowEndPicker(true)}
                style={{
                  width: 70,
                  borderBottomWidth: 1,
                  borderColor: '#B798FF',
                  fontSize: 16,
                  textAlign: 'center',
                  borderRadius: 6,
                  backgroundColor: '#F6F6F6',
                  color: '#222',
                  padding: 4,
                  marginHorizontal: 4,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#222', fontSize: 16 }}>
                  {newEvent.end.dateTime.split('T')[1]?.slice(0, 5) || 'HH:mm'}
                </Text>
              </Pressable>
            </View>
            }
            {showStartPicker && (
              <DateTimePicker
                value={new Date(newEvent.start.dateTime || new Date())}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowStartPicker(false);
                  if (selectedDate) {
                    const date = new Date(selectedDate);
                    const dateStr = newEvent.start.dateTime.split('T')[0];
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    const newStartTime = `${dateStr}T${hours}:${minutes}:00`;
                    setNewEvent({ ...newEvent, start: { dateTime: newStartTime } });
                  }
                }}
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={new Date(newEvent.end.dateTime || new Date())}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowEndPicker(false);
                  if (selectedDate) {
                    const date = new Date(selectedDate);
                    const dateStr = newEvent.end.dateTime.split('T')[0];
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    const newEndTime = `${dateStr}T${hours}:${minutes}:00`;
                    setNewEvent({ ...newEvent, end: { dateTime: newEndTime } });
                  }
                }}
              />
            )}
              }

              {
                //----------Button séléction des couleurs----------------
              }
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 5}}>
                <Text style={{left: 10}}>Couleur de l'événement</Text>
                <TouchableOpacity onPress={() => setColorModal(true)} style={{backgroundColor: newEvent.color, width: 50, borderColor: 'black', borderWidth: 1, borderRadius: 5, right: 10}}></TouchableOpacity>
              </View>

              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 5}}>
                <Text style={{left: 10}}>Couleur du texte</Text>
                <TouchableOpacity onPress={() => setColorModalText(true)} style={{backgroundColor: newEvent.textColor, width: 50, borderColor: 'black', borderWidth: 1, borderRadius: 5, right: 10}}></TouchableOpacity>
              </View>

              {
                //----------------Button répétition de l'évènement
              }
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, alignItems: 'center'}}>
                <Text style={{left: 10, flex: 1}}>Répéter l'événement</Text>
                <View style={{right: 10, width: 150}}>
                  <DropDownPicker
                    open={open}
                    value={newEvent.value || value}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    placeholder="Non"
                  />
                </View>
              </View>
              {value !== 'none' && value !== '' &&(
                <View style={{width: 150, alignSelf: 'flex-end', right: 10, marginVertical: 5}}>
                  <TextInput placeholder= "Nb. occurrences" onChangeText={(text) => {setNewEvent({...newEvent, occurrences: parseInt(text)})}}
                    style={{borderBottomColor: 'rgba(183, 152, 255, 1)', borderBottomWidth: 1}}/>
                </View>
              )
              }

              {
                //------------Sélection de l'image-------------
              }
              <ImageBackground
                style={{height: 50, margin: 10, justifyContent: 'center', backgroundColor: 'white'}}
                source={{uri: newEvent.image}}
                imageStyle={{borderRadius: 20}}
              >
                <TouchableOpacity
                  style={{
                    alignSelf: 'center',
                    borderColor: 'rgba(183, 152, 255, 1)',
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderRadius: 15,
                    padding: 5,
                  }}
                  onPress={async () => {
                    try {
                      const result = await DocumentPicker.getDocumentAsync({
                        type: 'image/*',
                        multiple: false,
                      });
                      if (!result.canceled) {
                        const newLocation = `${FileSystem.documentDirectory}${result.assets[0].uri.split('/').pop()}`;
                        await FileSystem.copyAsync({
                          from: result.assets[0].uri,
                          to: newLocation,
                        });
                        setNewEvent({...newEvent, image: newLocation})
                      }
                    } catch (error) {
                      Alert.alert("Error lors de la récupération de l'image");
                    }
                  }}
                >
                  <Text style={{color: 'rgba(183, 152, 255, 1)'}}> Choisissez une image</Text>
                </TouchableOpacity>
              </ImageBackground>
          {
            //-------------Button annuler/modifier/créer l'énènement-------------
          }
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 10, marginBottom: 10}}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={{...styles.button, borderColor: 'rgba(183, 152, 255, 1)', borderWidth: 2, }}>
                  <Text style={{color: 'rgba(183, 152, 255, 1)'}}> Annuler </Text>
                </TouchableOpacity>
                {editingEvent && (
                  <TouchableOpacity
                    onPress={() => ModifyEvent(newEvent)} style={{...styles.button, backgroundColor: 'orange'}}>
                      <Text style={{color: 'white'}}> Modifier l'événement </Text> 
                  </TouchableOpacity>)} 
                {!editingEvent &&(
                  <TouchableOpacity onPress={postEvent} style={{...styles.button, backgroundColor: 'orange'}}>
                    <Text style={{color: 'white'}}> Créer l'événement </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      </View>

{
        //--------------Modal pour la séléction de la couleur de fond--------------
      }
      <View>
        <Modal isVisible={colorModal} backdropOpacity={0.2} onBackButtonPress={() => setColorModal(false)} onBackdropPress={() => {setColorModal(false); setNewEvent({...newEvent, color: actualColor});}}>
          <View style={{flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center'}}>
            <View style={styles.colorModal}>  
              <ColorPicker
                value={ newEvent.color || '#fff'}
                onCompleteJS={(color) => {setActualColor(color.hex);}}
                style={{width: '100%'}}
              >
                <Preview/>
                <Panel1/>
                <HueSlider/>
                <TouchableOpacity onPress={() => {setColorModal(false); setNewEvent({...newEvent, color: actualColor});}} style={{...styles.button, backgroundColor: 'orange', margin: 10}}><Text style={{color: 'white'}}>Accepter</Text></TouchableOpacity>
              </ColorPicker>
            </View>
          </View>
        </Modal>
      </View>

      {
        //--------------Modal pour la séléction de la couleur de texte--------------
      }
      <View>
        <Modal isVisible={colorModalText} backdropOpacity={0.2} onBackButtonPress={() => setColorModalText(false)} onBackdropPress={() => {setColorModalText(false); setNewEvent({...newEvent, textColor: actualColor});}}>
          <View style={{flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center'}}>
            <View style={styles.colorModal}>
              <ColorPicker
                value={newEvent.textColor || '#000'}
                onChangeJS={(color) => {setActualColor(color.hex)}}
                style={{width: '100%'}}
              >
                <Preview/>
                <Panel1/>
                <HueSlider/>
                <TouchableOpacity onPress={() => {setColorModalText(false); setNewEvent({...newEvent, textColor: actualColor});}} style={{...styles.button, backgroundColor: 'orange', margin: 10}}><Text style={{color: 'white'}}>Accepter</Text></TouchableOpacity>
              </ColorPicker>
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  modalBackground: {
    flex: 1,
    top: '45%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 10,
    borderColor: 'rgba(183, 152, 255, 1)',
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1
  },
  dateText: {
    width: 40,
    marginHorizontal: 10,
    backgroundColor: 'rgba(212, 210, 220, 0.6)',
    borderRadius: 5,
    padding: 2
  },
  button: {
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 20
  },
  colorModal: {
    alignItems: 'center', 
    justifyContent: 'center',
    width: '90%',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    borderColor: 'rgba(183, 152, 255, 1)',
    borderWidth: 1,
    
  }
});