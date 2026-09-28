// 🔒 이 파일은 Supabase MCP generate_typescript_types 도구로 자동 생성됩니다.
// 수동으로 수정하지 마세요. DB 스키마 변경 시 재생성하세요.
// 마지막 생성: 2026-09-28

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
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
          custom_intervals: number[] | null
          id: string
          interval_minutes: number | null
          is_active: boolean | null
          is_triggered: boolean | null
          patient: string
          repeat_count: number | null
          repeat_mode: string
          trigger_time: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          custom_intervals?: number[] | null
          id?: string
          interval_minutes?: number | null
          is_active?: boolean | null
          is_triggered?: boolean | null
          patient: string
          repeat_count?: number | null
          repeat_mode?: string
          trigger_time: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          custom_intervals?: number[] | null
          id?: string
          interval_minutes?: number | null
          is_active?: boolean | null
          is_triggered?: boolean | null
          patient?: string
          repeat_count?: number | null
          repeat_mode?: string
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
      clinical_documents: {
        Row: {
          category: string
          created_at: string | null
          id: string
          publication_year: string | null
          source_agency: string
          source_url: string | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          publication_year?: string | null
          source_agency: string
          source_url?: string | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          publication_year?: string | null
          source_agency?: string
          source_url?: string | null
          title?: string
        }
        Relationships: []
      }
      clinical_knowledge_chunks: {
        Row: {
          content: string
          created_at: string | null
          document_id: string | null
          embedding: string | null
          id: string
          keywords: string[] | null
          metadata: Json | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          keywords?: string[] | null
          metadata?: Json | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          keywords?: string[] | null
          metadata?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_knowledge_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "clinical_documents"
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
          is_off: boolean | null
          name: string
          text_color: string | null
          user_id: string
        }
        Insert: {
          code: string
          color: string
          created_at?: string | null
          id?: string
          is_off?: boolean | null
          name: string
          text_color?: string | null
          user_id: string
        }
        Update: {
          code?: string
          color?: string
          created_at?: string | null
          id?: string
          is_off?: boolean | null
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
      inquiries: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          images: Json | null
          status: string
          title: string
          updated_at: string
          user_email: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          images?: Json | null
          status?: string
          title: string
          updated_at?: string
          user_email: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          images?: Json | null
          status?: string
          title?: string
          updated_at?: string
          user_email?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: []
      }
      inquiry_replies: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          inquiry_id: string
          is_admin: boolean
          user_id: string | null
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          id?: string
          inquiry_id: string
          is_admin?: boolean
          user_id?: string | null
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          inquiry_id?: string
          is_admin?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_replies_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
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
      membership_event_config: {
        Row: {
          config: Json
          id: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config: Json
          id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config?: Json
          id?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_event_config_updated_by_fkey"
            columns: ["updated_by"]
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
          is_notice: boolean | null
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
          is_notice?: boolean | null
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
          is_notice?: boolean | null
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
          email: string | null
          experience_years: number | null
          gender: string | null
          hospital_name: string | null
          id: string
          is_active: boolean | null
          mbti: string | null
          name: string
          nickname: string | null
          push_token: string | null
          role: string | null
          updated_at: string | null
          user_code: string | null
          ward_name: string | null
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          birth_time?: string | null
          calendar_type?: string | null
          created_at?: string | null
          email?: string | null
          experience_years?: number | null
          gender?: string | null
          hospital_name?: string | null
          id: string
          is_active?: boolean | null
          mbti?: string | null
          name?: string
          nickname?: string | null
          push_token?: string | null
          role?: string | null
          updated_at?: string | null
          user_code?: string | null
          ward_name?: string | null
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          birth_time?: string | null
          calendar_type?: string | null
          created_at?: string | null
          email?: string | null
          experience_years?: number | null
          gender?: string | null
          hospital_name?: string | null
          id?: string
          is_active?: boolean | null
          mbti?: string | null
          name?: string
          nickname?: string | null
          push_token?: string | null
          role?: string | null
          updated_at?: string | null
          user_code?: string | null
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
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          is_earlybird: boolean
          is_trial: boolean
          plan_type: string
          platform: string
          price: number
          product_id: string
          purchased_at: string | null
          raw_response: Json | null
          status: string
          store_transaction_id: string
          trial_end_date: string | null
          updated_at: string
          user_id: string
          verified_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          is_earlybird?: boolean
          is_trial?: boolean
          plan_type: string
          platform: string
          price?: number
          product_id: string
          purchased_at?: string | null
          raw_response?: Json | null
          status: string
          store_transaction_id: string
          trial_end_date?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          is_earlybird?: boolean
          is_trial?: boolean
          plan_type?: string
          platform?: string
          price?: number
          product_id?: string
          purchased_at?: string | null
          raw_response?: Json | null
          status?: string
          store_transaction_id?: string
          trial_end_date?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          created_at: string
          department_or_major: string | null
          document_name: string | null
          document_url: string | null
          hospital_or_school: string | null
          id: string
          license_number: string | null
          organization_name: string | null
          reject_reason: string | null
          reviewed_at: string | null
          status: string
          target_role: string
          updated_at: string
          user_email: string | null
          user_id: string | null
          user_name: string
          verification_type: string
        }
        Insert: {
          created_at?: string
          department_or_major?: string | null
          document_name?: string | null
          document_url?: string | null
          hospital_or_school?: string | null
          id?: string
          license_number?: string | null
          organization_name?: string | null
          reject_reason?: string | null
          reviewed_at?: string | null
          status?: string
          target_role: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string
          verification_type: string
        }
        Update: {
          created_at?: string
          department_or_major?: string | null
          document_name?: string | null
          document_url?: string | null
          hospital_or_school?: string | null
          id?: string
          license_number?: string | null
          organization_name?: string | null
          reject_reason?: string | null
          reviewed_at?: string | null
          status?: string
          target_role?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string
          verification_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string | null
          email: string
          id: string
          source: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          source?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          source?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_duty_swap: { Args: { p_message_id: string }; Returns: Json }
      admin_approve_verification_request: {
        Args: { p_request_id: string; p_target_role: string }
        Returns: boolean
      }
      admin_get_dashboard_stats: { Args: never; Returns: Json }
      admin_get_users: {
        Args: {
          p_page?: number
          p_page_size?: number
          p_role?: string
          p_search?: string
        }
        Returns: Json
      }
      admin_get_waitlist_entries: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          source: string
          status: string
        }[]
      }
      admin_handle_report: {
        Args: {
          p_hide_target?: boolean
          p_new_status: string
          p_report_id: string
        }
        Returns: Json
      }
      admin_reject_verification_request: {
        Args: { p_reason: string; p_request_id: string }
        Returns: boolean
      }
      admin_update_user_role: {
        Args: {
          p_is_active?: boolean
          p_new_role: string
          p_target_user_id: string
        }
        Returns: Json
      }
      check_is_admin: { Args: never; Returns: boolean }
      delete_user_account: { Args: never; Returns: undefined }
      generate_unique_user_code: { Args: never; Returns: string }
      get_admin_analytics: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: Json
      }
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
      search_clinical_knowledge: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding?: string
          query_text?: string
        }
        Returns: {
          chunk_id: string
          content: string
          document_id: string
          publication_year: string
          similarity: number
          source_agency: string
          title: string
        }[]
      }
      submit_waitlist_email: { Args: { p_email: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
