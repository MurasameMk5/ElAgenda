import { supabase } from "../lib/supabase";

// ================== Pour le calendrier ==================
export const fetchAllEvents = async () =>{
    let { data: event, error } = await supabase
    .from('event')
    .select('*')
    if(event){
        event = event.map((ev) => ({
            ...ev,
            start: {dateTime: ev.date + 'T' + ev.start, timeZone: 'local'},
            end: {dateTime: ev.date + 'T' + ev.end, timeZone: 'local'}
        }))
    }
    return event;
}

// ================== Pour la page d'accueil ==================
export const fetchTodayEvents = async () =>{
    let {data: event, error} = await supabase
    .from('event')
    .select('*')
    .eq('date', new Date().toLocaleDateString("en-CA"))
    .order('start', {ascending: true})
    return event;
}

export const fetchActualEvent = async () =>{
    const now = new Date().toTimeString().slice(0, 5);
    let {data, error} = await supabase
    .from('event')
    .select('*')
    .lte('start', now)
    .gte('end', now)
    .eq('date', new Date().toLocaleDateString("en-CA"))
    console.log('now: ', data);
    return data;
}

export const insertEvent = async (id, title, start, end, recurrenceRule, value, color, image, textColor, notification, preNotification) =>{
    const date = start.split('T')[0];
    const startTime = start.split('T')[1];
    const endTime = end.split('T')[1];
    const { data, error } = await supabase
    .from('event')
    .insert([
      { id: id, title: title, date: date, start: startTime, end: endTime, recurrence_rule: recurrenceRule, value: value, color: color, image: image, text_color: textColor, notification: notification, pre_notification: preNotification }
    ])
    .select()
}

export const updateEvent = async (id, title, start, end, recurrenceRule, value, color, image, textColor, notification, preNotification) =>{
    const date = start.split('T')[0];
    const startTime = start.split('T')[1];
    const endTime = end.split('T')[1];
    const { data, error } = await supabase
    .from('event')
    .update({ title: title, date: date, start: startTime, end: endTime, recurrence_rule: recurrenceRule, value: value, color: color, image: image, text_color: textColor, notification: notification, pre_notification: preNotification })
    .eq('id', id)
    .select()
}

export const deleteEvent = async (id) =>{
    const {error} = await supabase
    .from('event')
    .delete()
    .eq('id', id)
}