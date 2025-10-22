import { Slot } from "expo-router";
import { EventsProvider } from "./eventsContext";
import { UserProvider } from "@/components/UserContext";
import { PowerSyncProvider } from "@/components/PowerSyncProvider";

export default function RootLayout() {
  return (
    <PowerSyncProvider>
      <UserProvider>
          <EventsProvider>
              <Slot/>
          </EventsProvider>
      </UserProvider>
    </PowerSyncProvider>
  )
}