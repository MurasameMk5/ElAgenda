import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ImageBackground } from 'react-native';
import * as Notifications from 'expo-notifications';

type props= {
  start: string;
  end: string;
  title: string;
  image?: string;
  color?: string;
  textColor?: string;
  onEnCours?: (isEnCours: boolean) => void;
}

export default function TasksMiniature(props: props) {
  const [time, setTime] = useState('');

  useEffect(()=>{
    setTime(new Date().toISOString());
    console.log("aujourd'hui: ", new Date().toLocaleTimeString(), 'start: ', props.start, 'end: ', props.end);
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      props.onEnCours && props.onEnCours(enCours());
    }, 60000); // vérifie chaque minute

    // Appel initial
    props.onEnCours && props.onEnCours(enCours());

    return () => clearInterval(interval);
  }, [props.start, props.end]);

  const enCours = () =>{
    return props.start < new Date().toLocaleTimeString('fr-Fr').slice(0, 5) && new Date().toLocaleTimeString().slice(0, 5) < props.end;
  }
  
  return (
   <View style={{ ...styles.container, backgroundColor: props.color, shadowColor: 'red', shadowOffset: { width: -5, height: 3 }, shadowOpacity: 0.3, shadowRadius: 5 }}>
    <View style={{ borderColor: 'white', borderWidth: 1, borderRadius: 10, margin: 5,padding: 5, zIndex: 10 }}>
      <View style={{backgroundColor: props.color, width: 110, height: 20, position: 'absolute', top: -6, zIndex: 25}}>
        <Text style={{ fontWeight: 'bold', fontSize: 16, left:6, top: -2, color: enCours() ? 'rgb(255, 251, 231)' : props.textColor}}>
            {props.start} à {props.end}
        </Text>
      
      </View>
      <View style={{ left: 5, top: 5, padding: 5, width: '60%', flex: 1, alignContent: 'center' }}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.7)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: '100%', height: '100%', position: 'absolute', marginTop: 5}}
        />
        <View style={{ width: '90%', justifyContent: 'center'}}>
          <Text style={{ left: 10, marginVertical: 5, flexWrap: 'wrap',}}>
            {props.title}
          </Text>
        </View>
      </View>
    </View>
    <ImageBackground
      style={styles.image}
      imageStyle={{ borderRadius: 10, width: '100%' }}
      source={{ uri: props.image }}
    />
    <LinearGradient
      colors={[props.color, 'transparent']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.image}
    />
</View>
  )
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    borderRadius: 10,
    gap: 10,
  },
  image: {
    width: "50%",
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
  }

});
