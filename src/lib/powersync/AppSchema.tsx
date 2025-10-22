import { column, Schema, Table } from '@powersync/react-native'

// Définissez votre schéma de base de données locale
const events = new Table({
  created_at: column.text,
  title: column.text,
  start: column.text,
  end: column.text,
  recurrence_rule: column.text,
  value: column.text,
  occurences: column.text,
  color: column.text,
  text_color: column.text,
  image: column.text,
  notification: column.text,
  pre_notification: column.text,
  date: column.text,
  duration: column.text,
  user_id: column.text
})

const profiles = new Table({
    id: column.text,
    name: column.text,
    avatar_url: column.text,
    background_url: column.text
})

export const AppSchema = new Schema({
  events,
  profiles
})