import { supabase } from "../lib/supabase";
export const fetchAllTasks = async () =>{
    let { data: Event, error } = await supabase
    .from('event')
    .select('*')

    console.log("events: ", Event);
}