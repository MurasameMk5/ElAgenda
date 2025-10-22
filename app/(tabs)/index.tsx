import { StyleSheet, TouchableOpacity, Alert, Pressable, View, StatusBar, TextInput, Text} from 'react-native';
import HomeTasks from '@/components/HomeTasks';
import {Image} from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import CharDialogue from '@/components/CharDialogue';
import Modal from 'react-native-modal';
import LoginPage from '@/components/LoginPage';
import { useUser } from '@/components/UserContext';
import { signOutUser, updateUserProfile } from '@/src/services/userService';
import Animated, {useSharedValue, useAnimatedStyle, withTiming, withRepeat, Easing, ReduceMotion} from 'react-native-reanimated';

export default function TabOneScreen() {
  const {user, setUser} = useUser();
  const insets = useSafeAreaInsets();
  const [paramVisible, setParamVisible] = useState(false);
  const [background, setBackground] = useState('');
  const [userImage, setUserImage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [logoutPopupVisible, setLogoutPopupVisible] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);  
  const logoutX = useSharedValue(0);
  const logoutY = useSharedValue(0);
  const brushX = useSharedValue(0);
  const brushY = useSharedValue(0);
  const trashX = useSharedValue(0);
  const trashY = useSharedValue(0);
  const hidePopupTimeout = useRef(null);
  const handleLogin = useCallback(() => {
    setLoggedIn(true);
    setModalVisible(false);
  }, [])

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

    const loadUserImage = async () => {
      const fileName = await AsyncStorage.getItem('userImage');
      if (fileName) {
        // Vérifier si le fichier existe toujours
        const fileInfo = await FileSystem.getInfoAsync(fileName);
        if (fileInfo.exists) {
          setUserImage(fileName);
        } else {
          // Si le fichier n'existe plus, nettoyer le stockage
          await AsyncStorage.removeItem('userImage');
        }
      }
    };
    loadUserImage();
  }, [])
  

  
  useEffect(()=>{
    if(paramVisible){
      setTimeout(()=>{
        setParamVisible(false);
      }, 3000);
    }
  }, [paramVisible])

  useEffect(() => {
    if (logoutPopupVisible) {
      logoutX.value = withTiming(-10, { duration: 300 });
      logoutY.value = withTiming(-50, { duration: 300 });

      // Trash : diagonale haut droite
      trashX.value = withTiming(50, { duration: 300 });
      trashY.value = withTiming(-40, { duration: 300 }); 
      
      // Brush : vers la droite
      brushX.value = withTiming(70, { duration: 300 });
      brushY.value = withTiming(20, { duration: 300 });
      
      hidePopupTimeout.current = setTimeout(()=>{
        setLogoutPopupVisible(false);
      }, 3000);
    } else {
      if (hidePopupTimeout.current) {
        clearTimeout(hidePopupTimeout.current);
      }

      logoutX.value = withTiming(0, { duration: 300 });
      logoutY.value = withTiming(0, { duration: 300 });

      brushX.value = withTiming(0, { duration: 300 });
      brushY.value = withTiming(0, { duration: 300 });

      trashX.value = withTiming(0, { duration: 300 });
      trashY.value = withTiming(0, { duration: 300 });
    }
    return () => {
    if (hidePopupTimeout.current) {
      clearTimeout(hidePopupTimeout.current);
    }
  };
  }, [logoutPopupVisible]);

  const loginButton = () => {
    if(!user.id){
      setModalVisible(a => !a);
    }
    else{
      setLogoutPopupVisible(a=> !a);
    }
  }

  const logout = async () => {
    await signOutUser();
    setLogoutPopupVisible(false);
    setUser("");
    setLoggedIn(false);
  }

  const changeUserImage = async () => {
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
        await AsyncStorage.setItem('userImage', newLocation);
        setUserImage(newLocation);
        setLogoutPopupVisible(false);
        await updateUserProfile(user.id, {avatar_url: newLocation});
      }
    } catch (error) {
      Alert.alert("Error lors de la récupération de l'image");
    }
  }

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
        await updateUserProfile(user.id, {background_url: newLocation});
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
      await updateUserProfile(user.id, {background_url: background});
    } catch(error){
      Alert.alert("Impossible de supprimer l'image");
    }
  }

  const deleteUserImage = async () => {
    try {
      if(background)
        await FileSystem.deleteAsync(userImage);
      await AsyncStorage.removeItem('userImage');
      setUserImage('');
      await updateUserProfile(user.id, {avatar_url: userImage});
    } catch(error){
      Alert.alert("Impossible de supprimer l'image");
    }
  }

  const logoutStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: logoutX.value }, { translateY: logoutY.value }],
  }));

  const brushStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: brushX.value }, { translateY: brushY.value }],
  }));

  const trashStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: trashX.value }, { translateY: trashY.value }],
  }));

return (
  <>
  <SafeAreaView style={styles.container}>
    <View style={{position: 'absolute', top: '35%', flexDirection: 'row', justifyContent: 'flex-start', width: '100%', zIndex: 20, backgroundColor: 'transparent' }}>
      {paramVisible && (
        <TouchableOpacity style={{ marginLeft: 16 }} onPress={selectImage}>
          <Ionicons name='image-outline' size={30} color={'white'} />
        </TouchableOpacity>
      )}
      {paramVisible && background !== '' && (
        <TouchableOpacity style={{ marginLeft: 16 }} onPress={deleteImage}>
          <Ionicons name='trash-outline' size={25} color={'white'} />
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
    <Pressable onPress={loginButton} style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 20, backgroundColor: 'white', borderRadius: 50 }}>
        {user.id? (
          userImage && userImage !== '' ? (
            <Image
          source={{ uri: userImage }}
          style={{ width: 60, height: 60, borderRadius: 50, resizeMode: 'cover', borderColor: 'rgba(183, 152, 255, 1', borderWidth: 1 }}
          
          />
          ):
          (<View style={{backgroundColor: 'rgba(183, 152, 255, 0.5)', borderColor: 'orange', borderWidth: 1, width: 60, height: 60, borderRadius: 50,alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{fontSize: 25, color: 'orange'}}> {user.name.charAt(0)} </Text>
          </View>
          )
        ):
        (
          <Ionicons name='person-circle-outline' size={60} color={'rgba(183, 152, 255, 1)'} />
        )
        }
    </Pressable>
    {
      //------------------logout Popup Buttons-------------------
    }
      <Animated.View style={[{...styles.logoutPopup, bottom: 40, left: 25, zIndex: 10, backgroundColor: 'rgba(255, 154, 171, 0.81)' }, logoutStyle]}>
        <TouchableOpacity onPress={logout}>
          <Ionicons name='log-out-outline' size={25} color={'white'} />
        </TouchableOpacity>
      </Animated.View>
    
      <Animated.View style={[{...styles.logoutPopup, bottom: 40, left: 25, zIndex: 10, backgroundColor: 'rgba(159, 255, 154, 0.81)'}, brushStyle]}>
        <TouchableOpacity onPress={changeUserImage}>
          <Ionicons name='brush-outline' size={25} color={'rgba(183, 152, 255, 1'} />
        </TouchableOpacity>
      </Animated.View>
      
      <Animated.View style={[{...styles.logoutPopup, bottom: 40, left: 25, zIndex: 10, backgroundColor: 'rgba(238, 237, 231, 0.9)'}, trashStyle]}>
        <TouchableOpacity onPress={deleteUserImage}>
          <Ionicons name='trash' size={25} color={'rgba(183, 152, 255, 1'} />
        </TouchableOpacity>
      </Animated.View>
    <HomeTasks />
    <CharDialogue />
  </SafeAreaView>
  {LoginPage &&
  <Modal 
    isVisible={modalVisible} 
    onBackButtonPress={() => {setModalVisible(false)}} 
    style={{ margin: 0 }}
    >
    <LoginPage loggedIn={loggedIn} handleLogin={handleLogin}/>

  </Modal>
  }
    

  </>
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'orange',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F9F9F9',
  },
  inputIcon: {
    marginRight: 12,
  },
  modalInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: 'orange',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },
  registerButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText:{
    color: 'rgba(183, 152, 255, 1)',
    fontWeight: 'bold',
  },
  logoutPopup: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 5,
    borderRadius: 50,
    alignContent: 'center',
    justifyContent: 'center',
  },
});
