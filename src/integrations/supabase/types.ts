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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      circle_memberships: {
        Row: {
          circle_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          circle_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          circle_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_memberships_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "group_circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      group_circles: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          topics: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          topics?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          topics?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_circles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_posts: {
        Row: {
          boost_count: number | null
          boost_until: string | null
          content: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_deleted: boolean | null
          is_featured: boolean | null
          is_public: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          boost_count?: number | null
          boost_until?: string | null
          content?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_deleted?: boolean | null
          is_featured?: boolean | null
          is_public?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          boost_count?: number | null
          boost_until?: string | null
          content?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_deleted?: boolean | null
          is_featured?: boolean | null
          is_public?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_posts: {
        Row: {
          categories: string[] | null
          content: string
          created_at: string | null
          deleted_at: string | null
          id: string
          is_deleted: boolean | null
          is_public: boolean | null
          is_time_capsule: boolean | null
          location: Json | null
          media_type: string | null
          media_urls: string[] | null
          release_date: string | null
          release_status: string | null
          subcategory: string | null
          title: string
          updated_at: string | null
          user_id: string
          visibility: string
        }
        Insert: {
          categories?: string[] | null
          content: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_public?: boolean | null
          is_time_capsule?: boolean | null
          location?: Json | null
          media_type?: string | null
          media_urls?: string[] | null
          release_date?: string | null
          release_status?: string | null
          subcategory?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          visibility?: string
        }
        Update: {
          categories?: string[] | null
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_public?: boolean | null
          is_time_capsule?: boolean | null
          location?: Json | null
          media_type?: string | null
          media_urls?: string[] | null
          release_date?: string | null
          release_status?: string | null
          subcategory?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "legacy_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      media_files: {
        Row: {
          bucket: string
          created_at: string | null
          deleted_at: string | null
          id: string
          owner_id: string
          path: string
          size_bytes: number
        }
        Insert: {
          bucket: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          owner_id: string
          path: string
          size_bytes?: number
        }
        Update: {
          bucket?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          owner_id?: string
          path?: string
          size_bytes?: number
        }
        Relationships: []
      }
      mentee_profiles: {
        Row: {
          created_at: string | null
          current_projects: string[] | null
          goals: string[] | null
          id: string
          interests: string[] | null
          progress_notes: Json | null
          seeking_help_with: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_projects?: string[] | null
          goals?: string[] | null
          id: string
          interests?: string[] | null
          progress_notes?: Json | null
          seeking_help_with?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_projects?: string[] | null
          goals?: string[] | null
          id?: string
          interests?: string[] | null
          progress_notes?: Json | null
          seeking_help_with?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentee_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_bookings: {
        Row: {
          created_at: string | null
          feedback: string | null
          id: string
          mentee_id: string
          rating: number | null
          session_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          mentee_id: string
          rating?: number | null
          session_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          mentee_id?: string
          rating?: number | null
          session_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_bookings_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_bookings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mentor_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_mentee_matches: {
        Row: {
          created_at: string | null
          id: string
          match_score: number | null
          mentee_id: string
          mentor_id: string
          status: boolean
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_score?: number | null
          mentee_id: string
          mentor_id: string
          status?: boolean
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          match_score?: number | null
          mentee_id?: string
          mentor_id?: string
          status?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      mentor_profiles: {
        Row: {
          calendar_url: string | null
          created_at: string | null
          experience_years: number | null
          expertise: string[] | null
          id: string
          industries: string[] | null
          monthly_availability: number | null
          updated_at: string | null
          wisdom_rating: number | null
        }
        Insert: {
          calendar_url?: string | null
          created_at?: string | null
          experience_years?: number | null
          expertise?: string[] | null
          id: string
          industries?: string[] | null
          monthly_availability?: number | null
          updated_at?: string | null
          wisdom_rating?: number | null
        }
        Update: {
          calendar_url?: string | null
          created_at?: string | null
          experience_years?: number | null
          expertise?: string[] | null
          id?: string
          industries?: string[] | null
          monthly_availability?: number | null
          updated_at?: string | null
          wisdom_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_sessions: {
        Row: {
          capacity: number | null
          created_at: string | null
          current_attendees: number | null
          description: string | null
          end_time: string
          id: string
          mentee_id: string | null
          mentor_id: string
          recording_url: string | null
          session_type: string
          start_time: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          current_attendees?: number | null
          description?: string | null
          end_time: string
          id?: string
          mentee_id?: string | null
          mentor_id: string
          recording_url?: string | null
          session_type: string
          start_time: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          current_attendees?: number | null
          description?: string | null
          end_time?: string
          id?: string
          mentee_id?: string | null
          mentor_id?: string
          recording_url?: string | null
          session_type?: string
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_sessions_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_badges: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          description: string
          id: string
          metadata: Json | null
          read: boolean
          timestamp: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          description: string
          id?: string
          metadata?: Json | null
          read?: boolean
          timestamp?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          description?: string
          id?: string
          metadata?: Json | null
          read?: boolean
          timestamp?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_configurations: {
        Row: {
          annual_price: number | null
          created_at: string | null
          description: string
          features: Json
          id: string
          is_popular: boolean | null
          lifetime_price: number | null
          monthly_price: number | null
          name: string
          plan_id: string
          stripe_price_id_annual: string | null
          stripe_price_id_lifetime: string | null
          stripe_price_id_monthly: string | null
          updated_at: string | null
        }
        Insert: {
          annual_price?: number | null
          created_at?: string | null
          description: string
          features?: Json
          id?: string
          is_popular?: boolean | null
          lifetime_price?: number | null
          monthly_price?: number | null
          name: string
          plan_id: string
          stripe_price_id_annual?: string | null
          stripe_price_id_lifetime?: string | null
          stripe_price_id_monthly?: string | null
          updated_at?: string | null
        }
        Update: {
          annual_price?: number | null
          created_at?: string | null
          description?: string
          features?: Json
          id?: string
          is_popular?: boolean | null
          lifetime_price?: number | null
          monthly_price?: number | null
          name?: string
          plan_id?: string
          stripe_price_id_annual?: string | null
          stripe_price_id_lifetime?: string | null
          stripe_price_id_monthly?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      plan_id: {
        Row: {
          plan_id: string | null
        }
        Insert: {
          plan_id?: string | null
        }
        Update: {
          plan_id?: string | null
        }
        Relationships: []
      }
      plan_limits: {
        Row: {
          created_at: string | null
          id: string
          limit_value: number | null
          mentorship_value:
            | Database["public"]["Enums"]["mentorship_access"]
            | null
          period: Database["public"]["Enums"]["limit_period"] | null
          plan_id: string
          resource: Database["public"]["Enums"]["resource_key"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          limit_value?: number | null
          mentorship_value?:
            | Database["public"]["Enums"]["mentorship_access"]
            | null
          period?: Database["public"]["Enums"]["limit_period"] | null
          plan_id: string
          resource: Database["public"]["Enums"]["resource_key"]
        }
        Update: {
          created_at?: string | null
          id?: string
          limit_value?: number | null
          mentorship_value?:
            | Database["public"]["Enums"]["mentorship_access"]
            | null
          period?: Database["public"]["Enums"]["limit_period"] | null
          plan_id?: string
          resource?: Database["public"]["Enums"]["resource_key"]
        }
        Relationships: [
          {
            foreignKeyName: "plan_limits_plan_fk"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plan_configurations"
            referencedColumns: ["plan_id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          post_type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          post_type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          post_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          post_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          post_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          post_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          full_name: string | null
          id: string
          is_mentor: boolean | null
          location: string | null
          phone: string | null
          profile_completion: string[] | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          full_name?: string | null
          id: string
          is_mentor?: boolean | null
          location?: string | null
          phone?: string | null
          profile_completion?: string[] | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          full_name?: string | null
          id?: string
          is_mentor?: boolean | null
          location?: string | null
          phone?: string | null
          profile_completion?: string[] | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          mentee_id: string
          related_session_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          mentee_id: string
          related_session_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          mentee_id?: string
          related_session_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_notes_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_notes_related_session_id_fkey"
            columns: ["related_session_id"]
            isOneToOne: false
            referencedRelation: "mentor_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          billing_interval: string | null
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          email: string
          id: string
          plan_id: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          stripe_subscription_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_interval?: string | null
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          email: string
          id?: string
          plan_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_interval?: string | null
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          email?: string
          id?: string
          plan_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      timeless_messages: {
        Row: {
          content: Json
          created_at: string | null
          deleted_at: string | null
          delivery_date: string | null
          delivery_event: string | null
          delivery_type: string
          id: string
          is_deleted: boolean | null
          is_recurring: boolean | null
          media_type: string | null
          recipient_emails: Json | null
          recipients: Json | null
          recurrence_custom_days: number[] | null
          recurrence_end_date: string | null
          recurrence_frequency: string | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: Json
          created_at?: string | null
          deleted_at?: string | null
          delivery_date?: string | null
          delivery_event?: string | null
          delivery_type?: string
          id?: string
          is_deleted?: boolean | null
          is_recurring?: boolean | null
          media_type?: string | null
          recipient_emails?: Json | null
          recipients?: Json | null
          recurrence_custom_days?: number[] | null
          recurrence_end_date?: string | null
          recurrence_frequency?: string | null
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          deleted_at?: string | null
          delivery_date?: string | null
          delivery_event?: string | null
          delivery_type?: string
          id?: string
          is_deleted?: boolean | null
          is_recurring?: boolean | null
          media_type?: string | null
          recipient_emails?: Json | null
          recipients?: Json | null
          recurrence_custom_days?: number[] | null
          recurrence_end_date?: string | null
          recurrence_frequency?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeless_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_media: {
        Row: {
          bytes: number
          created_at: string
          id: string
          mime_type: string | null
          post_id: string | null
          post_type: string | null
          url: string
          user_id: string
        }
        Insert: {
          bytes?: number
          created_at?: string
          id?: string
          mime_type?: string | null
          post_id?: string | null
          post_type?: string | null
          url: string
          user_id: string
        }
        Update: {
          bytes?: number
          created_at?: string
          id?: string
          mime_type?: string | null
          post_id?: string | null
          post_type?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_media_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          awarded_at: string | null
          awarded_by: string | null
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string | null
          awarded_by?: string | null
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string | null
          awarded_by?: string | null
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "mentorship_badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      wisdom_resources: {
        Row: {
          approved: boolean | null
          boost_count: number | null
          boost_until: string | null
          created_at: string | null
          created_by: string
          deleted_at: string | null
          description: string | null
          experience: string | null
          file_path: string | null
          id: string
          is_deleted: boolean | null
          is_featured: boolean | null
          is_public: boolean | null
          published_status: string | null
          resource_type: string
          resource_url: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          approved?: boolean | null
          boost_count?: number | null
          boost_until?: string | null
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          description?: string | null
          experience?: string | null
          file_path?: string | null
          id?: string
          is_deleted?: boolean | null
          is_featured?: boolean | null
          is_public?: boolean | null
          published_status?: string | null
          resource_type: string
          resource_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          approved?: boolean | null
          boost_count?: number | null
          boost_until?: string | null
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          description?: string | null
          experience?: string | null
          file_path?: string | null
          id?: string
          is_deleted?: boolean | null
          is_featured?: boolean | null
          is_public?: boolean | null
          published_status?: string | null
          resource_type?: string
          resource_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wisdom_resources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_users: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string | null
          role: string | null
        }
        Relationships: []
      }
      mentor_applications_view: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          experience_years: number | null
          expertise: string[] | null
          full_name: string | null
          id: string | null
          industries: string[] | null
          is_verified: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_verification_status: {
        Row: {
          avatar_url: string | null
          experience_years: number | null
          expertise: string[] | null
          full_name: string | null
          id: string | null
          industries: string[] | null
          is_verified: boolean | null
          wisdom_rating: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      v_storage_usage: {
        Row: {
          used_bytes: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_media_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      v_user_active_plan: {
        Row: {
          current_period_end: string | null
          current_period_start: string | null
          plan_id: string | null
          status: string | null
          subscription_tier: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      v_user_storage_usage: {
        Row: {
          used_bytes: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      active_plan_id: {
        Args: { p_user: string }
        Returns: string
      }
      approve_mentor_verification: {
        Args: { mentor_id: string }
        Returns: Json
      }
      can_create: {
        Args: {
          p_resource: Database["public"]["Enums"]["resource_key"]
          p_user: string
        }
        Returns: boolean
      }
      create_subscriber: {
        Args: { customer_id: string; price_id: string }
        Returns: Json
      }
      current_access: {
        Args: { p_user?: string }
        Returns: {
          can_post_wisdom: boolean
          can_see_progress_tracker: boolean
          can_view_mentorship: boolean
          mentorship: Database["public"]["Enums"]["mentorship_access"]
        }[]
      }
      get_mentor_matches: {
        Args: { mentee_id: string }
        Returns: {
          avatar_url: string
          experience_years: number
          expertise: string[]
          full_name: string
          industries: string[]
          match_score: number
          mentor_id: string
          wisdom_rating: number
        }[]
      }
      get_plan_limit: {
        Args: {
          p_plan_id: string
          p_resource: Database["public"]["Enums"]["resource_key"]
        }
        Returns: {
          limit_value: number
          mentorship_value: Database["public"]["Enums"]["mentorship_access"]
          period: Database["public"]["Enums"]["limit_period"]
        }[]
      }
      get_public_plan_configurations: {
        Args: Record<PropertyKey, never>
        Returns: {
          annual_price: number | null
          created_at: string | null
          description: string
          features: Json
          id: string
          is_popular: boolean | null
          lifetime_price: number | null
          monthly_price: number | null
          name: string
          plan_id: string
          stripe_price_id_annual: string | null
          stripe_price_id_lifetime: string | null
          stripe_price_id_monthly: string | null
          updated_at: string | null
        }[]
      }
      get_user_emails_for_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          user_id: string
        }[]
      }
      get_user_roles: {
        Args: { input_user_id: string }
        Returns: string[]
      }
      has_role: {
        Args:
          | {
              _role: Database["public"]["Enums"]["user_role"]
              _user_id: string
            }
          | { _role: string; _user_id: string }
        Returns: boolean
      }
      insert_mentor_mentee_matches: {
        Args: { mentee_id: string; mentor_id: string; status: boolean }
        Returns: Json
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      refresh_profile_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      request_mentor_verification: {
        Args: {
          experience_years: number
          expertise: string[]
          industries: string[]
          monthly_availability: number
        }
        Returns: Json
      }
      super_admin_exists: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_user_role: {
        Args: { new_role: string; user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "user" | "admin" | "mentor"
      limit_period: "total" | "per_month"
      mentorship_access: "none" | "mentee" | "both"
      resource_key:
        | "legacy_posts"
        | "idea_posts"
        | "timeless_messages"
        | "wisdom_resources"
        | "storage_bytes"
        | "progress_tracker"
        | "trial_access"
        | "mentorship_access"
      user_role: "admin" | "mentor" | "disciple" | "guest"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin", "mentor"],
      limit_period: ["total", "per_month"],
      mentorship_access: ["none", "mentee", "both"],
      resource_key: [
        "legacy_posts",
        "idea_posts",
        "timeless_messages",
        "wisdom_resources",
        "storage_bytes",
        "progress_tracker",
        "trial_access",
        "mentorship_access",
      ],
      user_role: ["admin", "mentor", "disciple", "guest"],
    },
  },
} as const
