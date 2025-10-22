import { PowerSyncDatabase } from "@powersync/react-native";
import { AppSchema } from "./AppSchema";
import { Connector } from "./Connector";

export const powersync = new PowerSyncDatabase({
    schema: AppSchema,
    database: {
        dbFilename: 'powersync.db'
    }
});

export const setupPowerSync = async () => {
    const connector = new Connector();
    powersync.connect(connector);
};