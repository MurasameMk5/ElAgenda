import { Slot } from "expo-router";
import { EventsProvider } from "./eventsContext";

export default function RootLayout() {
  return (
        <EventsProvider>
            <Slot/>
        </EventsProvider>
  )
}