export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          streak_count: number
          last_post_date: string | null
          notification_daily_reminder: boolean
          notification_new_content: boolean
          notification_streak_alert: boolean
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          streak_count?: number
          last_post_date?: string | null
          notification_daily_reminder?: boolean
          notification_new_content?: boolean
          notification_streak_alert?: boolean
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          streak_count?: number
          last_post_date?: string | null
          notification_daily_reminder?: boolean
          notification_new_content?: boolean
          notification_streak_alert?: boolean
        }
      }
      posts: {
        Row: {
          id: string
          timestamp: string
          username: string
          media_url: string
          media_type: 'image' | 'video'
          caption: string
          avatar_url: string
          family_id: string
          user_id: string
          streak_count: number
          is_favorite: boolean
        }
        Insert: {
          id?: string
          timestamp?: string
          username: string
          media_url: string
          media_type: 'image' | 'video'
          caption: string
          avatar_url: string
          family_id: string
          user_id: string
          streak_count?: number
          is_favorite?: boolean
        }
        Update: {
          id?: string
          timestamp?: string
          username?: string
          media_url?: string
          media_type?: 'image' | 'video'
          caption?: string
          avatar_url?: string
          family_id?: string
          user_id?: string
          streak_count?: number
          is_favorite?: boolean
        }
      }
      reactions: {
        Row: {
          id: string
          post_id: string
          user_id: string
          reaction_type: 'LIKE' | 'COMMENT' | 'SLIDESHOW'
          emoji_type?: 'LOVE' | 'SMILE' | 'HUG' | 'PROUD'
          comment?: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          reaction_type: 'LIKE' | 'COMMENT' | 'SLIDESHOW'
          emoji_type?: 'LOVE' | 'SMILE' | 'HUG' | 'PROUD'
          comment?: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          reaction_type?: 'LIKE' | 'COMMENT' | 'SLIDESHOW'
          emoji_type?: 'LOVE' | 'SMILE' | 'HUG' | 'PROUD'
          comment?: string
          created_at?: string
        }
      }
      families: {
        Row: {
          id: string
          name: string
          display_name: string
          color: string
          join_code: string
          family_picture: string | null
          slideshow_photo_limit: number
          slideshow_speed: number
        }
        Insert: {
          id?: string
          name: string
          display_name?: string
          color?: string
          join_code: string
          family_picture?: string | null
          slideshow_photo_limit?: number
          slideshow_speed?: number
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          color?: string
          join_code?: string
          family_picture?: string | null
          slideshow_photo_limit?: number
          slideshow_speed?: number
        }
      }
      reminders: {
        Row: {
          id: string
          family_id: string
          user_id: string
          description: string
          date: string
          time: string | null
          target_audience: 'ELDER' | 'FAMILY'
          recurrence_type: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
          recurrence_day: number | null
          is_acknowledged: boolean
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          user_id: string
          description: string
          date: string
          time?: string | null
          target_audience: 'ELDER' | 'FAMILY'
          recurrence_type: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
          recurrence_day?: number | null
          is_acknowledged?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          user_id?: string
          description?: string
          date?: string
          time?: string | null
          target_audience?: 'ELDER' | 'FAMILY'
          recurrence_type?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
          recurrence_day?: number | null
          is_acknowledged?: boolean
          created_at?: string
        }
      }
    }
  }
}