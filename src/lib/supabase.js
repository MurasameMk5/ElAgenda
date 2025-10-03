import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://mffygzfcvbuyorjsmvov.supabase.co"
const supabasePublishableKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZnlnemZjdmJ1eW9yanNtdm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzAwMzUsImV4cCI6MjA3NDc0NjAzNX0.pVIef3oGL63Zs2jqvvUyaTpwjU0d7NePjSfE7UnueM0"

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {  
    auth: {    
        storage: AsyncStorage,    
        autoRefreshToken: true,    
        persistSession: true,    
        detectSessionInUrl: false,  
    },
})