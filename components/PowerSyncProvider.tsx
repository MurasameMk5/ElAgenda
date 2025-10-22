// components/PowerSyncProvider.tsx
import React, { useEffect, useState } from 'react'
import { PowerSyncContext } from '@powersync/react-native'
import { powersync, setupPowerSync } from '@/src/lib/powersync/system'
import { supabase } from '@/src/lib/supabase'
import { View, Text, ActivityIndicator } from 'react-native'
import {jwtDecode} from "jwt-decode";
export const PowerSyncProvider = ({ children }) => {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      console.log('🔄 Initialisation PowerSync...')
      
      const { data: { session } } = await supabase.auth.getSession()
 
      if (session) {
        await setupPowerSync() // ← Utilise votre fonction
        console.log('✅ PowerSync connecté')
      }
      
         const localEvents = await powersync.getAll("SELECT * FROM events");
console.log(localEvents);

      setReady(true)
    }

    init()

    // Gérer login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await setupPowerSync()
        } else if (event === 'SIGNED_OUT') {
          await powersync.disconnectAndClear()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Chargement...</Text>
      </View>
    )
  }

  return (
    <PowerSyncContext.Provider value={powersync}>
      {children}
    </PowerSyncContext.Provider>
  )
}