import React, { useEffect, useState, useRef } from 'react'
import { PowerSyncContext, PowerSyncDatabase } from '@powersync/react-native'
import { AppSchema } from '@/src/lib/powersync/AppSchema'
import { SupabaseConnector } from '@/src/lib/powersync/SupabaseConnector'
import { supabase } from '@/src/lib/supabase'
import { View, Text, ActivityIndicator } from 'react-native'

// Créer les instances en dehors du composant pour éviter les re-créations
let powerSyncInstance: PowerSyncDatabase | null = null
let connectorInstance: SupabaseConnector | null = null

const getPowerSync = () => {
  if (!powerSyncInstance) {
    console.log('🔨 Création de l\'instance PowerSync...')
    powerSyncInstance = new PowerSyncDatabase({
      schema: AppSchema,
      database: {
        dbFilename: 'powersync.db'
      }
    })
    console.log('✅ Instance PowerSync créée')
  }
  return powerSyncInstance
}

const getConnector = () => {
  if (!connectorInstance) {
    console.log('🔨 Création du Connector...')
    connectorInstance = new SupabaseConnector()
    console.log('✅ Connector créé')
  }
  return connectorInstance
}

export const PowerSyncProvider = ({ children }) => {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const powerSyncRef = useRef(getPowerSync())
  const connectorRef = useRef(getConnector())

  useEffect(() => {
    let mounted = true
    const powerSync = powerSyncRef.current
    const connector = connectorRef.current

    const init = async () => {
      try {
        console.log('🔄 Initialisation PowerSync...')
        
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          console.log('🔌 Connexion à PowerSync...')
          await powerSync.connect(connector)
          console.log('✅ PowerSync connecté')
        } else {
          console.log('⚠️ Pas de session, PowerSync en attente')
        }
        
        if (mounted) {
          setReady(true)
        }
      } catch (err) {
        console.error('❌ Erreur PowerSync:', err)
        if (mounted) {
          setError(err?.message || 'Erreur inconnue')
          setReady(true)
        }
      }
    }

    const timeout = setTimeout(() => {
      console.warn('⏱️ Timeout PowerSync - affichage forcé')
      if (mounted) {
        setError('Timeout de connexion')
        setReady(true)
      }
    }, 10000)

    init().finally(() => clearTimeout(timeout))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth event:', event)
        
        if (event === 'SIGNED_IN' && session) {
          try {
            await powerSync.connect(connector)
            console.log('✅ PowerSync connecté après login')
            setError(null)
          } catch (err) {
            console.error('❌ Erreur connexion PowerSync:', err)
            setError(err?.message)
          }
        } else if (event === 'SIGNED_OUT') {
          try {
            await powerSync.disconnectAndClear()
            console.log('✅ PowerSync déconnecté')
          } catch (err) {
            console.error('❌ Erreur déconnexion PowerSync:', err)
          }
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
      
      // Déconnexion sécurisée
      if (powerSync && typeof powerSync.disconnect === 'function') {
        powerSync.disconnect().catch(err => 
          console.warn('Erreur lors de la déconnexion:', err)
        )
      }
    }
  }, [])

  if (!ready) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#fff' 
      }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 20, fontSize: 16 }}>
          Initialisation...
        </Text>
      </View>
    )
  }

  if (error) {
    console.warn('⚠️ App démarre avec erreur PowerSync:', error)
  }

  return (
    <PowerSyncContext.Provider value={powerSyncRef.current}>
      {error && (
        <View style={{ 
          backgroundColor: '#ff9800', 
          padding: 10 
        }}>
          <Text style={{ color: '#fff', fontSize: 12 }}>
            ⚠️ Mode offline uniquement: {error}
          </Text>
        </View>
      )}
      {children}
    </PowerSyncContext.Provider>
  )
}

// Export pour utiliser ailleurs si besoin
export { getPowerSync, getConnector }