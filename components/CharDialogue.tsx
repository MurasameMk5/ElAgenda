import React, { use, useEffect } from 'react';
import { StyleSheet, Image, Pressable, Text, View } from 'react-native';
import Animated, {useSharedValue, useAnimatedStyle, withTiming, Easing, ReduceMotion} from 'react-native-reanimated';
import { useUser } from './UserContext';
export default function CharDialogue() {
    const [phrase, setPhrase] = React.useState<string>('');
    const [chara, setChara] = React.useState();
    const {user, setUser} = useUser()
    //Images pour les personnages
    const characterImagesAless = [
        require('@/assets/images/Akuto.png'),
        require('@/assets/images/Wiless.png'),
    ];

    const characterImagesHerci = [
        require('@/assets/images/Akuto.png'),
        require('@/assets/images/Vicious.png'),
        require('@/assets/images/Squall.png'),
        require('@/assets/images/Wiless.png'),
        require('@/assets/images/Adol-min.png'),
        require('@/assets/images/Aegis-min.png'),
        require('@/assets/images/Allen-min.png'),
        require('@/assets/images/Amuro-min.png'),
        require('@/assets/images/Atobe-min.png'),
        require('@/assets/images/Elmott-min.png'),
        require('@/assets/images/Gintoki-min.png'),
        require('@/assets/images/Gokudera-min.png'),
        require('@/assets/images/Gran-min.png'),
        require('@/assets/images/Hawk-min.png'),
        require('@/assets/images/Hifumi-min.png'),
        require('@/assets/images/Hummel-min.png'),
        require('@/assets/images/Ilsa-min.png'),
        require('@/assets/images/Iori-min.png'),
        require('@/assets/images/Kuko-min.png'),
        require('@/assets/images/Lindow-min.png'),
        require('@/assets/images/Luke-min.png'),
        require('@/assets/images/Makoto-min.png'),
        require('@/assets/images/Neo-min.png'),
        require('@/assets/images/Olivier-min.png'),
        require('@/assets/images/Samatoki-min.png'),
        require('@/assets/images/Shigure-min.png'),
        require('@/assets/images/Siete-min.png'),
        require('@/assets/images/Sinbad-min.png'),
        require('@/assets/images/Soma-min.png'),
        require('@/assets/images/Utpalaka-min.png'),
        require('@/assets/images/Vane-min.png'),
        require('@/assets/images/Victor-min.png'),
        require('@/assets/images/Zeke-min.png'),
    ];
    const listePhrases = [
        "eh, vas travailler, je n'ai pas besoin d'un bon à rien.",
        "tu prépares tes tâches ? C'est bien continue comme ça.",
        "observer c'est bien, mais travailler c'est mieux !",
        "on n'est pas là pour révasser, au boulot !",
        "si tu cours, tu gagne un, mais si tu avances, tu gagnes deux.",
        "ce n'est pas en contemplant les fleurs que tu vas finir comme les grands artistes.",
        "c'est avec un pas par jour que l'on avance vers ses objectifs!",
        "tu as déjà fini ? Impressionnant...",
    ];  
    const [dialogueVisible, setDialogueVisible] = React.useState(false);

    const opacity = useSharedValue(0);
    const translateY = useSharedValue(30);

    useEffect(() => {
        setTimeout(() => {
            setPhrase(listePhrases[Math.floor(Math.random() * listePhrases.length)]);
            setChara(characterImagesAless[Math.floor(Math.random() * characterImagesAless.length)]);
        }, 100)
        //setChara(characterImagesHerci[Math.floor(Math.random() * characterImagesHerci.length)]);
        setTimeout(() => {
            dialogueStartAnimation();
        }, 500);
        

        setTimeout(() => {
            dialogueCloseAnimation();
        }, 5000);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    const dialogueCloseAnimation = () => {
        opacity.value = withTiming(0, { duration: 500 });
        translateY.value = withTiming(30, { duration: 500, easing: Easing.ease, reduceMotion: ReduceMotion.Never });
        setTimeout(() => setDialogueVisible(false), 200);
    }

    const dialogueStartAnimation = () => {
        setDialogueVisible(true);
        opacity.value = withTiming(1, { duration: 400 });
        translateY.value = withTiming(0, { duration: 800, easing: Easing.elastic(5), reduceMotion: ReduceMotion.Never });
    }

  return dialogueVisible ? (
        <Pressable style={{ height: 150, width: '90%', zIndex: 25 }} onPress={() => dialogueCloseAnimation()}>
            <Animated.View style={[{ flex: 1, flexDirection: 'row', marginTop: 20 }, animatedStyle]}>
                <Image
                    source= {chara}
                    style={{ resizeMode: 'cover', width: 300, height: 400, position: 'absolute', top: -250, left: -50 }}
                />
                <View style={styles.textContainer}>
                    <Text style={styles.dialogueText}>
                        {user.name? user.name + ", " + phrase : phrase}
                    </Text>
                </View>
            </Animated.View>
        </Pressable>
    ): null;
}

const styles = StyleSheet.create({
    textContainer: {
        flexWrap: 'wrap',
        left: 70, 
        top: 60, 
        justifyContent: 'center', 
        alignItems: 'center', 
        width: '80%',
        height: 90,
        borderColor: 'orange',
        borderWidth: 1,
        borderTopRightRadius: 30,
        borderBottomRightRadius: 30,
        borderTopLeftRadius: 30,
        borderBottomLeftRadius: 30,
        shadowColor: 'red',
        elevation: 5,
        backgroundColor: 'rgb(255, 255, 255)',
    },
    dialogueText: {
        fontSize: 16,
        color: 'black',
        margin: 5,
        textAlign: 'center',
    },
});
