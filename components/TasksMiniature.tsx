import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ImageBackground } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  ReduceMotion,
} from 'react-native-reanimated';

type props = {
  id: string;
  start: string;
  end: string;
  title: string;
  image?: string;
  color?: string;
  textColor?: string;
  onEnCours: (isEnCours: boolean) => void;
  isCurrent?: boolean;
};

export default function TasksMiniature(props: props) {
  const [enCours, setEnCours] = useState(props.isCurrent ?? false);
  const scale = useSharedValue(1);

  useEffect(() => {
    const current = props.isCurrent ?? false;
    setEnCours(current);
    props.onEnCours(current);

    if (current) {
      scale.value = withRepeat(
        withTiming(1.05, {
          duration: 800,
          easing: Easing.inOut(Easing.poly(5)),
          reduceMotion: ReduceMotion.Never,
        }),
        -1,
        true
      );
    } else {
      scale.value = 1;
    }
  }, [props.isCurrent]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          ...styles.container,
          backgroundColor: props.color,
          shadowColor: enCours ? 'gold' : 'black',
          shadowOffset: { width: -5, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
        },
        animatedStyle,
      ]}
    >
      <View style={{ borderColor: 'white', borderWidth: 1, borderRadius: 10, margin: 5, padding: 5 }}>
        <View
          style={{
            backgroundColor: props.color,
            width: 110,
            height: 20,
            position: 'absolute',
            top: -6,
            zIndex: 25,
          }}
        >
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 16,
              left: 6,
              top: -2,
              color: enCours ? 'rgb(255, 242, 178)' : props.textColor,
            }}
          >
            {props.start} à {props.end}
          </Text>
        </View>

        <View style={{ left: 5, top: 5, padding: 5, width: '60%', flex: 1, alignContent: 'center' }}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.7)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: '100%', height: '100%', position: 'absolute', marginTop: 5 }}
          />
          <View style={{ width: '90%', justifyContent: 'center' }}>
            <Text style={{ left: 10, marginVertical: 5, flexWrap: 'wrap', fontWeight: enCours ? 'bold' : 'normal' }}>
              {props.title}
            </Text>
          </View>
        </View>
      </View>

      {props.image ? (
        <ImageBackground
          style={styles.image}
          imageStyle={{ borderRadius: 10, width: '100%' }}
          source={{ uri: props.image }}
        />
      ) : null}

      <LinearGradient
        colors={[props.color, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.image}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    borderRadius: 10,
    gap: 10,
  },
  image: {
    width: '50%',
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
