import { supabase } from "../lib/supabase";

export const signUpUser = async (nom: string, email: string, password: string) => {
    let { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                name: nom,
            },
        },
    });
    return data;
}

export const signInUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if(error)
        console.log("Erreur de connexion :", error.message);
    
    return data;
}

export const signOutUser = async () => {
    let { error } = await supabase.auth.signOut();
}

export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export const getUserProfile = async (userId: string) => {
    let { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    console.log("Profil utilisateur :", profile);

    if(error)
        console.log("Erreur lors de la récupération du profil :", error.message);
    return profile;
}

export const updateUserProfile = async (userId: string, updates: {name?: string, avatar_url?: string, background_url?: string}) => {
    const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
    if(error)
        console.log("Erreur lors de la mise à jour du profil :", error.message);   
    return data;
}
