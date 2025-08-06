import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { createContext, useContext, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

const NotificationContext = createContext(undefined);

export function NotificationsProvider({children}){
    useEffect(() => {
        const configureNotificationsAsync = async () =>{
            const {granted} = await Notifications.requestPermissionsAsync();
            if(!granted)
                Alert.alert("Permission refusée");
            
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldPlaySound: true,
                    shouldShowAlert: true,
                    shouldSetBadge: false,
                }),
            })
        }

        configureNotificationsAsync();
    }, [])

    const scheduledNotificationRef = useRef<string>("");

    const scheduleNotificationAsync = async (
        request: Notifications.NotificationRequestInput
    ) => {
        const notification = await Notifications.scheduleNotificationAsync(request);
        scheduledNotificationRef.current = notification;
        console.log("Notification scheduled:", notification);
        return notification;
    };

    const cancelNotificationAsync = async (notif: string) =>{
        await Notifications.cancelScheduledNotificationAsync(notif);
    }

    const value = {scheduleNotificationAsync, cancelNotificationAsync}; 

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotification() {
    return useContext(NotificationContext);
}