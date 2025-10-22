import { AbstractPowerSyncDatabase, PowerSyncBackendConnector } from '@powersync/react-native'
import { powersyncUrl, supabase } from '../supabase'

export class SupabaseConnector implements PowerSyncBackendConnector {
  async fetchCredentials() {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (!session || error) {
      throw new Error('Pas de session utilisateur')
    }

    return {
      endpoint: powersyncUrl,
      token: session.access_token
    }
  }

  async uploadData(database: AbstractPowerSyncDatabase) {
    console.log('📤 uploadData() appelé')
    
    const transaction = await database.getNextCrudTransaction()
    
    if (!transaction) {
        console.log('⚠️ Pas de transaction en attente')
        return
    }
    
    console.log('📦 Transaction trouvée:', transaction.crud.length, 'opérations')

    try {
        for (const op of transaction.crud) {
        console.log('🔧 Opération:', op.op, 'sur table:', op.table, 'id:', op.id)
        await this.applyCrudOperation(op)
        }
        await transaction.complete()
        console.log('✅ Upload terminé')
    } catch (error) {
        console.error('❌ Erreur upload PowerSync:', error)
        throw error
    }
    }   
}