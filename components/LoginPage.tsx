import Modal from "react-native-modal";
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { signUpUser, signInUser } from "@/src/services/userService";
import { useUser } from "./UserContext";
export default function LoginPage({handleLogin}) {
  const {refreshUser} = useUser();
  const [register, setRegister] = useState(false);
  const [samePassword, setSamePassword] = useState(false);
  const [registerRequierement, setRegisterRequierement] = useState(false);
  const [loginRequierement, setLoginRequierement] = useState(false);
  const [user, setUser] = useState({
      nom: '',
      email: '',
      password: '',
      confirmPassword: ''
  });

  
  useEffect(() => {
    if(register){
      const passwordsMatch = user.confirmPassword === user.password && user.password !== "";
      setSamePassword(passwordsMatch);

      const allRequirementsMet =
        passwordsMatch &&
        user.nom.trim() !== "" &&
        user.email.includes("@");
      setRegisterRequierement(allRequirementsMet);
    }
    else{
      const loginRequirementsMet =
        user.email.includes("@") && 
        user.password.trim() !== "";
      setLoginRequierement(loginRequirementsMet);
      }
    }, [user.confirmPassword, user.password, user.nom, user.email]);

    useEffect(() => {
        setUser({ nom: '', email: '', password: '', confirmPassword: '' });
        setSamePassword(false);
        setRegisterRequierement(false);
        setLoginRequierement(false);
    }, [register]);

    const loginFunction = async () => {
        if(register && registerRequierement){
            let promise = await signUpUser(user.nom, user.email, user.password);
            if(promise){
                console.log("User registered: ", promise);
            }
            setRegister(false);
        }
        else if(register && !registerRequierement){
            console.log("Inscription échouée. Veuillez vérifier les informations saisies.");
        }
        else if(!register){
          if(loginRequierement){
            let promise = await signInUser(user.email, user.password);
            if(promise){
              console.log("User logged in: ", promise);
              await refreshUser();
              handleLogin();
            }
          }
        }
    }

    return (
            <View style={[styles.modalContainer]}>
            <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                <Ionicons name='person' size={60} color={'white'} />
                </View>
            </View>

            <Text style={styles.modalTitle}>
                {register ? "S'inscrire" : "Se connecter"}
                </Text>
            <Text style={styles.modalSubtitle}>Connectez-vous pour synchroniser vos données</Text>

            <View key={register? 'register' : 'login'} style={styles.formContainer}>
                {register && (
                <View style={styles.inputContainer}>
                <Ionicons name='mail-outline' size={20} color={'#B798FF'} style={styles.inputIcon} />
                <TextInput
                    style={styles.modalInput}
                    placeholder="Nom d'utilisateur"
                    placeholderTextColor="#999"
                    onChangeText={(text) => setUser({...user, nom: text})}
                />
                </View>
                )}
                <View style={styles.inputContainer}>
                <Ionicons name='mail-outline' size={20} color={'#B798FF'} style={styles.inputIcon} />
                <TextInput
                    style={styles.modalInput}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    onChangeText={(text) => setUser({...user, email: text})}
                />
                </View>

                <View style={styles.inputContainer}>
                <Ionicons name='lock-closed-outline' size={20} color={'#B798FF'} style={styles.inputIcon} />
                <TextInput
                    style={styles.modalInput}
                    placeholder="Mot de passe"
                    placeholderTextColor="#999"
                    onChangeText={(text) => setUser({...user, password: text})}
                />
                </View>
                {register && (
                <View style={styles.inputContainer}>
                <Ionicons name='lock-closed-outline' size={20} color={'#B798FF'} style={styles.inputIcon} />
                <TextInput
                    style={styles.modalInput}
                    placeholder="Confirmer le mot de passe"
                    placeholderTextColor="#999"
                    onChangeText={(text) => setUser({...user, confirmPassword: text})}
                />
                <Ionicons name={samePassword? "checkmark-circle-outline" : "close-circle-outline"} size={20} color={samePassword ? 'green' : 'red'} />
                </View>
                )}

                <TouchableOpacity style={{...styles.submitButton, backgroundColor: !registerRequierement&&register? 'rgb(196, 185, 161)': 'orange'}} onPress={loginFunction}>
                <Text style={styles.submitButtonText}>
                    {register ? " S'inscrire " : "Se connecter"}
                    </Text>
                </TouchableOpacity>
                    <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>OU</Text>
                    <View style={styles.divider} />
                    </View>
        
                    <TouchableOpacity style={styles.registerButton} onPress={() => setRegister(a => !a)}>
                    <Text style={styles.registerButtonText}> 
                        {register ? " Se connecter " : "S'inscrire"}
                    </Text>
                    </TouchableOpacity>
                </View>
            </View>
    )
}

const styles = StyleSheet.create({
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
  }
});
