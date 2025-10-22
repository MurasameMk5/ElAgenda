import { AbstractPowerSyncDatabase, CrudEntry, PowerSyncBackendConnector, UpdateType } from '@powersync/react-native'
import { powersyncUrl, supabase } from '../supabase'

export class Connector implements PowerSyncBackendConnector {
  async fetchCredentials() {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (!session || error) {
      throw new Error('Pas de session utilisateur')
    }

 
    return {
      endpoint: powersyncUrl,
      token: session.access_token,
      userID: session.user.id,
      token_parameters: {user_id: session.user.id}
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
    let lastOp: CrudEntry | null = null;
    try {
       for(const op of transaction.crud) {
        lastOp = op;
        const table = supabase.from(op.table);
        const record = {...op.opData, id: op.id};
        switch(op.op){
          case UpdateType.PUT:
            await table.upsert(record);
            break;
          case UpdateType.PATCH:
            await table.update(op.opData).eq('id', op.id);
            break;
          case UpdateType.DELETE:
            await table.delete().eq('id', op.id);
            break;
        }
       }
       await transaction.complete();
    } catch (error) {
        console.error('❌ Erreur upload PowerSync:', error)
        throw error
    }
    }   
}