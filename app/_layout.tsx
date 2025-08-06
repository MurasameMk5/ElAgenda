import { Slot } from "expo-router";
import { NotificationsProvider } from "./notificationsContext";
import { EventsProvider } from "./eventsContext";

export default function RootLayout() {
  return (
    <NotificationsProvider>
        <EventsProvider>
            <Slot/>
        </EventsProvider>
    </NotificationsProvider>
  )
}