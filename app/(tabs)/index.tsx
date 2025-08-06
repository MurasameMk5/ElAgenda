import { StyleSheet, TouchableOpacity, Alert, Pressable, Platform} from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import HomeTasks from '@/components/HomeTasks';
import {Image} from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import CharDialogue from '@/components/CharDialogue';

export default function TabOneScreen() {
  const [paramVisible, setParamVisible] = useState(false);
  const [background, setBackground] = useState('');
  const [notificationToken, setNotificationToken] = useState('');
  const insets = useSafeAreaInsets();

  

  useEffect(()=>{
    const loadBackground = async () => {
      const fileName = await AsyncStorage.getItem('background');
      if (fileName) {
        // Vérifier si le fichier existe toujours
        const fileInfo = await FileSystem.getInfoAsync(fileName);
        if (fileInfo.exists) {
          setBackground(fileName);
        } else {
          // Si le fichier n'existe plus, nettoyer le stockage
          await AsyncStorage.removeItem('background');
        }
      }
    };
    loadBackground();
  }, [])

  
  useEffect(()=>{
    if(paramVisible){
      setTimeout(()=>{
        setParamVisible(false);
      }, 3000);
    }
  }, [paramVisible])


  const selectImage = async () =>{
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
        await AsyncStorage.setItem('background', newLocation);
        setBackground(newLocation);
      }
    } catch (error) {
      Alert.alert("Error lors de la récupération de l'image");
    }
  }

  const deleteImage = async () => {
    try {
      if(background)
        await FileSystem.deleteAsync(background);
      await AsyncStorage.removeItem('background');
      setBackground('');
    } catch(error){
      Alert.alert("Impossible de supprimer l'image");
    }
  }

return (
  <SafeAreaView style={styles.container}>
    <View style={{position: 'absolute', top: insets.top, flexDirection: 'row', justifyContent: 'flex-end', width: '100%', zIndex: 20, backgroundColor: 'transparent' }}>
      {paramVisible && background !== '' && (
        <TouchableOpacity style={{ marginRight: 16 }} onPress={deleteImage}>
          <Ionicons name='trash-outline' size={25} color={'white'} />
        </TouchableOpacity>
      )}
      {paramVisible && (
        <TouchableOpacity style={{ marginRight: 16 }} onPress={selectImage}>
          <Ionicons name='image-outline' size={30} color={'white'} />
        </TouchableOpacity>
      )}
    </View>
    <Pressable onPress={() => setParamVisible(a => !a)} style={styles.image}>
      <Image
        source={
          background && background !== ''
            ? { uri: background }
            : require('@/assets/images/Lofi-girl.gif')
        }
        style={styles.image}
      />
    </Pressable>
    <HomeTasks />
    <CharDialogue />
  </SafeAreaView>
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
  image: {
    height: '67%',
    width: '100%',
    position: 'absolute',
    top: 0,
  },
});
