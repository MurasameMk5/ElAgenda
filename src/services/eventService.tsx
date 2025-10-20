import { supabase } from "../lib/supabase";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// ================== Pour le calendrier ==================
export const fetchAllEvents = async (userId: string) =>{
    let { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    if(event){
        event = event.map((ev) => ({
            ...ev,
            start: {dateTime: ev.date + 'T' + ev.start, timeZone: 'local'},
            end: {dateTime: ev.date + 'T' + ev.end, timeZone: 'local'}
        }))
    }
    return event;
}

export const fetchEventById = async (id: string) =>{
    let { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    return event;
}

export const fetchAllLinkedEvents = async (id: string) =>{
    const baseId = id.split(':')[0];
    let { data: event, error } = await supabase
    .from('events')
    .select('*')
    .like('id', baseId + ':%')
    return event;
}

// ================== Pour la page d'accueil ==================
export const fetchTodayEvents = async (userId: string) =>{
    let {data: event, error} = await supabase
    .from('events')
    .select('*')
    .eq('date', new Date().toLocaleDateString("en-CA"))
    .eq('user_id', userId)
    .order('start', {ascending: true})
    return event;
}

export const fetchActualEvent = async (userId: string) =>{
    const now = dayjs().tz('Europe/Paris').format('HH:mm:ss');
    let {data, error} = await supabase
    .from('events')
    .select('*')
    .lte('start', now)
    .gte('end', now)
    .eq('date', dayjs().tz('Europe/Paris').format('YYYY-MM-DD'))
    .eq('user_id', userId)
    console.log('now: ', data);
    console.log(now);
    return data;
}

export const insertEvent = async (id, title, start, end, duration, recurrenceRule, value, color, image, textColor, notification, preNotification, userId: string) =>{
    const date = start.split('T')[0];
    const startTime = start.split('T')[1];
    const endTime = end.split('T')[1];
    const { data, error } = await supabase
    .from('events')
    .insert([
      { id: id, title: title, date: date, start: startTime, end: endTime, duration: duration, recurrence_rule: recurrenceRule, value: value, color: color, image: image, text_color: textColor, notification: notification, pre_notification: preNotification, user_id: userId }
    ])
    .select()
    console.log("Inserted event: ", data, error);
}

export const updateEvent = async (id, title, start, end, recurrenceRule, value, color, image, textColor, notification, preNotification) =>{
    console.log("Updating event id:", start);
    const date = start.split('T')[0] ;
    const startTime = start.split('T')[1];
    const endTime = end.split('T')[1] ;
    const { data, error } = await supabase
    .from('events')
    .update({ title: title, date: date, start: startTime, end: endTime, recurrence_rule: recurrenceRule, value: value, color: color, image: image, text_color: textColor, notification: notification, pre_notification: preNotification })
    .eq('id', id)
    .select()
}

export const removeEvent = async (id) =>{
    const {error} = await supabase
    .from('events')
    .delete()
    .eq('id', id)
}