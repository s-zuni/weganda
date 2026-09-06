// 🔒 이 파일은 Supabase MCP generate_typescript_types 도구로 자동 생성됩니다.
// 수동으로 수정하지 마세요. DB 스키마 변경 시 재생성하세요.
// 마지막 생성: 2026-09-05

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_chat_history: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string | null
          id: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          is_swap_request: boolean | null
          receiver_id: string
          sender_id: string
          swap_my_date: string | null
          swap_my_shift: string | null
          swap_status: string | null
          swap_their_date: string | null
          swap_their_shift: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_swap_request?: boolean | null
          receiver_id: string
          sender_id: string
          swap_my_date?: string | null
          swap_my_shift?: string | null
          swap_status?: string | null
          swap_their_date?: string | null
          swap_their_shift?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_swap_request?: boolean | null
          receiver_id?: string
          sender_id?: string
          swap_my_date?: string | null
          swap_my_shift?: string | null
          swap_status?: string | null
          swap_their_date?: string | null
          swap_their_shift?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_alarms: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_triggered: boolean | null
          patient: string
          trigger_time: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_triggered?: boolean | null
          patient: string
          trigger_time: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_triggered?: boolean | null
          patient?: string
          trigger_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_alarms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          is_hidden: boolean | null
          likes_count: number | null
          parent_id: string | null
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_hidden?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_hidden?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_shift_codes: {
        Row: {
          code: string
          color: string
          created_at: string | null
          id: string
          name: string
          text_color: string | null
          user_id: string
        }
        Insert: {
          code: string
          color: string
          created_at?: string | null
          id?: string
          name: string
          text_color?: string | null
          user_id: string
        }
        Update: {
          code?: string
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          text_color?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_shift_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_notes: {
        Row: {
          created_at: string | null
          date: string
          diagnosis: string | null
          id: string
          note: string
          patient: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          diagnosis?: string | null
          id?: string
          note: string
          patient: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          diagnosis?: string | null
          id?: string
          note?: string
          patient?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fortune_cache: {
        Row: {
          created_at: string | null
          date: string
          fortune_type: string
          id: string
          result: Json
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          fortune_type: string
          id?: string
          result: Json
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          fortune_type?: string
          id?: string
          result?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fortune_cache_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string | null
          id: string
          is_favorite: boolean | null
          requester_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          addressee_id: string
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          requester_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          addressee_id?: string
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          requester_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friendships_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          category: string
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          images: string[] | null
          is_anonymous: boolean | null
          is_hidden: boolean | null
          likes_count: number | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id: string
          category: string
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          images?: string[] | null
          is_anonymous?: boolean | null
          is_hidden?: boolean | null
          likes_count?: number | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string
          category?: string
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          images?: string[] | null
          is_anonymous?: boolean | null
          is_hidden?: boolean | null
          likes_count?: number | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          birth_time: string | null
          calendar_type: string | null
          created_at: string | null
          experience_years: number | null
          gender: string | null
          hospital_name: string | null
          id: string
          is_active: boolean | null
          name: string
          nickname: string | null
          push_token: string | null
          role: string | null
          updated_at: string | null
          ward_name: string | null
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          birth_time?: string | null
          calendar_type?: string | null
          created_at?: string | null
          experience_years?: number | null
          gender?: string | null
          hospital_name?: string | null
          id: string
          is_active?: boolean | null
          name?: string
          nickname?: string | null
          push_token?: string | null
          role?: string | null
          updated_at?: string | null
          ward_name?: string | null
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          birth_time?: string | null
          calendar_type?: string | null
          created_at?: string | null
          experience_years?: number | null
          gender?: string | null
          hospital_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          nickname?: string | null
          push_token?: string | null
          role?: string | null
          updated_at?: string | null
          ward_name?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reporter_id: string
          status: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reporter_id: string
          status?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          status?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string | null
          date: string
          end_time: string | null
          id: string
          memo: string | null
          shift_code: string
          source: string | null
          start_time: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          end_time?: string | null
          id?: string
          memo?: string | null
          shift_code: string
          source?: string | null
          start_time?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          end_time?: string | null
          id?: string
          memo?: string | null
          shift_code?: string
          source?: string | null
          start_time?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_guides: {
        Row: {
          category: string
          content: string
          created_at: string | null
          icon: string | null
          id: string
          is_new: boolean | null
          read_time: string | null
          sort_order: number | null
          summary: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_new?: boolean | null
          read_time?: string | null
          sort_order?: number | null
          summary: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_new?: boolean | null
          read_time?: string | null
          sort_order?: number | null
          summary?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_matching_off_days: {
        Args: { p_friend_id: string; p_user_id: string; p_year_month: string }
        Returns: {
          date: string
          friend_shift: string
          user_shift: string
        }[]
      }
      get_monthly_stats: {
        Args: { p_user_id: string; p_year_month: string }
        Returns: Json
      }
      increment_view_count: { Args: { p_post_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ─── 편의 타입 헬퍼 ───
type PublicSchema = Database["public"]

/** 테이블 Row 타입 추출 헬퍼 */
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]
/** 테이블 Insert 타입 추출 헬퍼 */
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"]
/** 테이블 Update 타입 추출 헬퍼 */
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"]
/** RPC 함수 타입 추출 헬퍼 */
export type Functions<T extends keyof PublicSchema["Functions"]> = PublicSchema["Functions"][T]
