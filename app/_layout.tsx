import { Slot } from "expo-router";
import { EventsProvider } from "./eventsContext";
import { UserProvider } from "@/components/UserContext";

export default function RootLayout() {
  return (
    <UserProvider>
        <EventsProvider>
            <Slot/>
        </EventsProvider>
    </UserProvider>
  )
}