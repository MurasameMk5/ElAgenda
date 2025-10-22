import { getPowerSync } from '@/components/PowerSyncProvider'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

// ================== Pour le calendrier ==================

export const fetchAllEvents = async (userId: string) => {
  const powerSync = getPowerSync()
  const result = await powerSync.getAll(
    'SELECT * FROM events WHERE user_id = ?',
    [userId]
  )
  
  // Transformation comme avant
  return result.map((ev: any) => ({
    ...ev,
    start: { dateTime: ev.date + 'T' + ev.start, timeZone: 'local' },
    end: { dateTime: ev.date + 'T' + ev.end, timeZone: 'local' }
  }))
}

export const fetchEventById = async (id: string) => {
  const powerSync = getPowerSync()
  return await powerSync.getAll(
    'SELECT * FROM events WHERE id = ?',
    [id]
  )
}

export const fetchAllLinkedEvents = async (id: string) => {
  const powerSync = getPowerSync()
  const baseId = id.split(':')[0]
  return await powerSync.getAll(
    'SELECT * FROM events WHERE id LIKE ?',
    [baseId + ':%']
  )
}

// ================== Pour la page d'accueil ==================

export const fetchTodayEvents = async (userId: string) => {
  const powerSync = getPowerSync()
  const today = new Date().toLocaleDateString("en-CA")
  return await powerSync.getAll(
    'SELECT * FROM events WHERE date = ? AND user_id = ? ORDER BY start ASC',
    [today, userId]
  )
}

export const fetchActualEvent = async (userId: string) => {
  const powerSync = getPowerSync()
  const now = dayjs().tz('Europe/Paris').format('HH:mm:ss')
  const today = dayjs().tz('Europe/Paris').format('YYYY-MM-DD')
  
  return await powerSync.getAll(
    `SELECT * FROM events 
     WHERE start <= ? 
     AND end >= ? 
     AND date = ? 
     AND user_id = ?`,
    [now, now, today, userId]
  )
}

// ================== Mutations ==================

export const insertEvent = async (
  id: string,
  title: string,
  start: string,
  end: string,
  duration: string,
  recurrenceRule: string,
  value: string,
  color: string,
  image: string,
  textColor: string,
  notification: string,
  preNotification: string,
  userId: string
) => {
  const powerSync = getPowerSync()
  const date = start.split('T')[0]
  const startTime = start.split('T')[1]
  const endTime = end.split('T')[1]
  const createdAt = new Date().toISOString()
  
  await powerSync.execute(
    `INSERT INTO events (
      id, created_at, title, date, start, end, duration, 
      recurrence_rule, value, occurences, color, image, 
      text_color, notification, pre_notification, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, createdAt, title, date, startTime, endTime, duration,
      recurrenceRule, value, '1', color, image,
      textColor, notification, preNotification, userId
    ]
  )
  
  console.log('✅ Event inséré dans PowerSync')
}

export const updateEvent = async (
  id: string,
  title: string,
  start: string,
  end: string,
  recurrenceRule: string,
  value: string,
  color: string,
  image: string,
  textColor: string,
  notification: string,
  preNotification: string
) => {
  const powerSync = getPowerSync()
  const date = start.split('T')[0]
  const startTime = start.split('T')[1]
  const endTime = end.split('T')[1]
  
  await powerSync.execute(
    `UPDATE events SET 
      title = ?, date = ?, start = ?, end = ?, 
      recurrence_rule = ?, value = ?, color = ?, 
      image = ?, text_color = ?, notification = ?, 
      pre_notification = ?
    WHERE id = ?`,
    [
      title, date, startTime, endTime, recurrenceRule,
      value, color, image, textColor, notification,
      preNotification, id
    ]
  )
  
  console.log('✅ Event mis à jour dans PowerSync')
}

export const removeEvent = async (id: string) => {
  const powerSync = getPowerSync()
  await powerSync.execute(
    'DELETE FROM events WHERE id = ?',
    [id]
  )
  
  console.log('✅ Event supprimé de PowerSync')
}