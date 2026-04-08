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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agency_clients: {
        Row: {
          agency_id: string
          client_id: string
          created_at: string
          id: string
          relationship_type: string | null
          status: string | null
        }
        Insert: {
          agency_id: string
          client_id: string
          created_at?: string
          id?: string
          relationship_type?: string | null
          status?: string | null
        }
        Update: {
          agency_id?: string
          client_id?: string
          created_at?: string
          id?: string
          relationship_type?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_clients_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          created_at: string
          currency: string | null
          description: string | null
          id: string
          image_url: string | null
          metadata: Json | null
          name: string
          organization_id: string | null
          price: number | null
          status: string | null
          type: Database["public"]["Enums"]["product_type"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name: string
          organization_id?: string | null
          price?: number | null
          status?: string | null
          type?: Database["public"]["Enums"]["product_type"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name?: string
          organization_id?: string | null
          price?: number | null
          status?: string | null
          type?: Database["public"]["Enums"]["product_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      proposals: {
        Row: {
          brand_id: string | null
          budget: number | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          planner_id: string | null
          status: string | null
          target_moment_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          budget?: number | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          planner_id?: string | null
          status?: string | null
          target_moment_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          budget?: number | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          planner_id?: string | null
          status?: string | null
          target_moment_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      affiliate_conversions: {
        Row: {
          affiliate_link_id: string
          affiliate_user_id: string
          commission_earned: number
          conversion_type: string
          converted_user_id: string | null
          created_at: string
          id: string
          is_paid: boolean | null
          order_value: number | null
          paid_at: string | null
        }
        Insert: {
          affiliate_link_id: string
          affiliate_user_id: string
          commission_earned: number
          conversion_type: string
          converted_user_id?: string | null
          created_at?: string
          id?: string
          is_paid?: boolean | null
          order_value?: number | null
          paid_at?: string | null
        }
        Update: {
          affiliate_link_id?: string
          affiliate_user_id?: string
          commission_earned?: number
          conversion_type?: string
          converted_user_id?: string | null
          created_at?: string
          id?: string
          is_paid?: boolean | null
          order_value?: number | null
          paid_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_conversions_affiliate_link_id_fkey"
            columns: ["affiliate_link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_links: {
        Row: {
          brand_id: string | null
          campaign_id: string | null
          click_count: number | null
          commission_percent: number | null
          commission_type: string | null
          conversion_count: number | null
          created_at: string
          destination_url: string
          fixed_commission: number | null
          id: string
          is_active: boolean | null
          link_code: string
          moment_id: string | null
          total_earnings: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          campaign_id?: string | null
          click_count?: number | null
          commission_percent?: number | null
          commission_type?: string | null
          conversion_count?: number | null
          created_at?: string
          destination_url: string
          fixed_commission?: number | null
          id?: string
          is_active?: boolean | null
          link_code: string
          moment_id?: string | null
          total_earnings?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string | null
          campaign_id?: string | null
          click_count?: number | null
          commission_percent?: number | null
          commission_type?: string | null
          conversion_count?: number | null
          created_at?: string
          destination_url?: string
          fixed_commission?: number | null
          id?: string
          is_active?: boolean | null
          link_code?: string
          moment_id?: string | null
          total_earnings?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_links_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_links_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_ambassadors: {
        Row: {
          ambassador_code: string | null
          approved_at: string | null
          approved_by: string | null
          bio: string | null
          brand_id: string
          commission_rate: number | null
          created_at: string
          id: string
          monthly_target: number | null
          perks: Json | null
          social_links: Json | null
          status: Database["public"]["Enums"]["ambassador_status"] | null
          total_earnings: number | null
          total_referrals: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ambassador_code?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          brand_id: string
          commission_rate?: number | null
          created_at?: string
          id?: string
          monthly_target?: number | null
          perks?: Json | null
          social_links?: Json | null
          status?: Database["public"]["Enums"]["ambassador_status"] | null
          total_earnings?: number | null
          total_referrals?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ambassador_code?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          brand_id?: string
          commission_rate?: number | null
          created_at?: string
          id?: string
          monthly_target?: number | null
          perks?: Json | null
          social_links?: Json | null
          status?: Database["public"]["Enums"]["ambassador_status"] | null
          total_earnings?: number | null
          total_referrals?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      brand_loyalty_tiers: {
        Row: {
          brand_id: string
          created_at: string
          discount_percent: number | null
          id: string
          min_points: number
          priority_access: boolean | null
          tier: Database["public"]["Enums"]["loyalty_tier"]
          tier_benefits: Json | null
          tier_name: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          discount_percent?: number | null
          id?: string
          min_points: number
          priority_access?: boolean | null
          tier: Database["public"]["Enums"]["loyalty_tier"]
          tier_benefits?: Json | null
          tier_name: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          discount_percent?: number | null
          id?: string
          min_points?: number
          priority_access?: boolean | null
          tier?: Database["public"]["Enums"]["loyalty_tier"]
          tier_benefits?: Json | null
          tier_name?: string
        }
        Relationships: []
      }
      brand_point_programs: {
        Row: {
          brand_id: string
          created_at: string
          id: string
          is_active: boolean | null
          point_expiry_days: number | null
          points_per_checkin: number | null
          points_per_media: number | null
          points_per_referral: number | null
          points_per_review: number | null
          program_name: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          point_expiry_days?: number | null
          points_per_checkin?: number | null
          points_per_media?: number | null
          points_per_referral?: number | null
          points_per_review?: number | null
          program_name: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          point_expiry_days?: number | null
          points_per_checkin?: number | null
          points_per_media?: number | null
          points_per_referral?: number | null
          points_per_review?: number | null
          program_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          bid_amount: number | null
          brand_id: string
          budget: number | null
          created_at: string
          description: string | null
          end_date: string | null
          featured: boolean | null
          featured_until: string | null
          id: string
          impressions: number
          is_active: boolean
          redemptions: number
          reward_type: Database["public"]["Enums"]["reward_type"]
          reward_value: string | null
          start_date: string | null
          target_age_ranges: string[] | null
          target_categories: string[] | null
          target_genders: string[] | null
          target_lifestyle_tags: string[] | null
          target_locations: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          bid_amount?: number | null
          brand_id: string
          budget?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          featured?: boolean | null
          featured_until?: string | null
          id?: string
          impressions?: number
          is_active?: boolean
          redemptions?: number
          reward_type?: Database["public"]["Enums"]["reward_type"]
          reward_value?: string | null
          start_date?: string | null
          target_age_ranges?: string[] | null
          target_categories?: string[] | null
          target_genders?: string[] | null
          target_lifestyle_tags?: string[] | null
          target_locations?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          bid_amount?: number | null
          brand_id?: string
          budget?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          featured?: boolean | null
          featured_until?: string | null
          id?: string
          impressions?: number
          is_active?: boolean
          redemptions?: number
          reward_type?: Database["public"]["Enums"]["reward_type"]
          reward_value?: string | null
          start_date?: string | null
          target_age_ranges?: string[] | null
          target_categories?: string[] | null
          target_genders?: string[] | null
          target_lifestyle_tags?: string[] | null
          target_locations?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          check_in_code: string | null
          checked_in_at: string
          id: string
          location_verified: boolean
          moment_id: string
          reward_claimed: boolean
          user_id: string
        }
        Insert: {
          check_in_code?: string | null
          checked_in_at?: string
          id?: string
          location_verified?: boolean
          moment_id: string
          reward_claimed?: boolean
          user_id: string
        }
        Update: {
          check_in_code?: string | null
          checked_in_at?: string
          id?: string
          location_verified?: boolean
          moment_id?: string
          reward_claimed?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_integrations: {
        Row: {
          api_key_encrypted: string | null
          created_at: string
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          merchant_id: string
          platform: string
          settings: Json | null
          store_url: string | null
          sync_error: string | null
          sync_status: string | null
          updated_at: string
        }
        Insert: {
          api_key_encrypted?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          merchant_id: string
          platform: string
          settings?: Json | null
          store_url?: string | null
          sync_error?: string | null
          sync_status?: string | null
          updated_at?: string
        }
        Update: {
          api_key_encrypted?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          merchant_id?: string
          platform?: string
          settings?: Json | null
          store_url?: string | null
          sync_error?: string | null
          sync_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      merchant_products: {
        Row: {
          category: string | null
          compare_at_price: number | null
          cost_price: number | null
          created_at: string
          currency: string | null
          description: string | null
          external_id: string | null
          external_source: string | null
          external_sync_at: string | null
          id: string
          images: Json | null
          inventory_policy: string | null
          inventory_quantity: number | null
          is_active: boolean | null
          is_redeemable_with_points: boolean | null
          merchant_id: string
          name: string
          points_cost: number | null
          price: number
          sku: string | null
          updated_at: string
          variants: Json | null
          venue_id: string | null
        }
        Insert: {
          category?: string | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          external_id?: string | null
          external_source?: string | null
          external_sync_at?: string | null
          id?: string
          images?: Json | null
          inventory_policy?: string | null
          inventory_quantity?: number | null
          is_active?: boolean | null
          is_redeemable_with_points?: boolean | null
          merchant_id: string
          name: string
          points_cost?: number | null
          price: number
          sku?: string | null
          updated_at?: string
          variants?: Json | null
          venue_id?: string | null
        }
        Update: {
          category?: string | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          external_id?: string | null
          external_source?: string | null
          external_sync_at?: string | null
          id?: string
          images?: Json | null
          inventory_policy?: string | null
          inventory_quantity?: number | null
          is_active?: boolean | null
          is_redeemable_with_points?: boolean | null
          merchant_id?: string
          name?: string
          points_cost?: number | null
          price?: number
          sku?: string | null
          updated_at?: string
          variants?: Json | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchant_products_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      moment_bounties: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          brand_id: string
          campaign_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          expires_at: string | null
          fulfilled_moment_id: string | null
          id: string
          payout_amount: number
          platform_fee_percent: number | null
          requirements: string
          status: Database["public"]["Enums"]["bounty_status"] | null
          target_category: string
          target_date_range: unknown
          target_location: string | null
          target_min_participants: number | null
          title: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          brand_id: string
          campaign_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          fulfilled_moment_id?: string | null
          id?: string
          payout_amount: number
          platform_fee_percent?: number | null
          requirements: string
          status?: Database["public"]["Enums"]["bounty_status"] | null
          target_category: string
          target_date_range?: unknown
          target_location?: string | null
          target_min_participants?: number | null
          title: string
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          brand_id?: string
          campaign_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          fulfilled_moment_id?: string | null
          id?: string
          payout_amount?: number
          platform_fee_percent?: number | null
          requirements?: string
          status?: Database["public"]["Enums"]["bounty_status"] | null
          target_category?: string
          target_date_range?: unknown
          target_location?: string | null
          target_min_participants?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "moment_bounties_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moment_bounties_fulfilled_moment_id_fkey"
            columns: ["fulfilled_moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      moment_media: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          media_type: string
          media_url: string
          moderation_notes: string | null
          moderation_status: string | null
          moment_id: string
          thumbnail_url: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          media_type: string
          media_url: string
          moderation_notes?: string | null
          moderation_status?: string | null
          moment_id: string
          thumbnail_url?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          media_type?: string
          media_url?: string
          moderation_notes?: string | null
          moderation_status?: string | null
          moment_id?: string
          thumbnail_url?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "moment_media_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
        ]
      }
      moment_participants: {
        Row: {
          checked_in_at: string | null
          id: string
          joined_at: string
          moment_id: string
          status: string
          user_id: string
        }
        Insert: {
          checked_in_at?: string | null
          id?: string
          joined_at?: string
          moment_id: string
          status?: string
          user_id: string
        }
        Update: {
          checked_in_at?: string | null
          id?: string
          joined_at?: string
          moment_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moment_participants_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
        ]
      }
      moment_reviews: {
        Row: {
          content: string | null
          created_at: string
          helpful_count: number | null
          id: string
          is_featured: boolean | null
          is_verified_participant: boolean | null
          moderation_status: string | null
          moment_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified_participant?: boolean | null
          moderation_status?: string | null
          moment_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified_participant?: boolean | null
          moderation_status?: string | null
          moment_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moment_reviews_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
        ]
      }
      moments: {
        Row: {
          campaign_id: string | null
          category: string
          check_in_code: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          host_id: string
          id: string
          image_url: string | null
          is_active: boolean
          location: string
          max_participants: number | null
          moment_type: Database["public"]["Enums"]["moment_type"]
          reward: string | null
          starts_at: string
          status: Database["public"]["Enums"]["moment_status"]
          title: string
          updated_at: string
          venue_id: string | null
          venue_name: string | null
          visibility: Database["public"]["Enums"]["moment_visibility"]
        }
        Insert: {
          campaign_id?: string | null
          category: string
          check_in_code?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          host_id: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          location: string
          max_participants?: number | null
          moment_type?: Database["public"]["Enums"]["moment_type"]
          reward?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["moment_status"]
          title: string
          updated_at?: string
          venue_id?: string | null
          venue_name?: string | null
          visibility?: Database["public"]["Enums"]["moment_visibility"]
        }
        Update: {
          campaign_id?: string | null
          category?: string
          check_in_code?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          host_id?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string
          max_participants?: number | null
          moment_type?: Database["public"]["Enums"]["moment_type"]
          reward?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["moment_status"]
          title?: string
          updated_at?: string
          venue_id?: string | null
          venue_name?: string | null
          visibility?: Database["public"]["Enums"]["moment_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "moments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moments_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_transactions: {
        Row: {
          created_at: string
          currency: string | null
          gross_amount: number
          id: string
          net_amount: number
          payee_id: string | null
          payer_id: string | null
          platform_fee: number
          processed_at: string | null
          reference_id: string
          reference_type: string
          status: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          created_at?: string
          currency?: string | null
          gross_amount: number
          id?: string
          net_amount: number
          payee_id?: string | null
          payer_id?: string | null
          platform_fee?: number
          processed_at?: string | null
          reference_id: string
          reference_type: string
          status?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          created_at?: string
          currency?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          payee_id?: string | null
          payer_id?: string | null
          platform_fee?: number
          processed_at?: string | null
          reference_id?: string
          reference_type?: string
          status?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: []
      }
      point_transactions: {
        Row: {
          action: Database["public"]["Enums"]["point_action"]
          brand_id: string
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          points: number
          reference_id: string | null
          reference_type: string | null
          user_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["point_action"]
          brand_id: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          points: number
          reference_id?: string | null
          reference_type?: string | null
          user_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["point_action"]
          brand_id?: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          points?: number
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      product_redemptions: {
        Row: {
          brand_id: string
          created_at: string
          id: string
          notes: string | null
          points_spent: number
          product_id: string
          quantity: number | null
          shipping_address: Json | null
          status: string | null
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          id?: string
          notes?: string | null
          points_spent: number
          product_id: string
          quantity?: number | null
          shipping_address?: Json | null
          status?: string | null
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          points_spent?: number
          product_id?: string
          quantity?: number | null
          shipping_address?: Json | null
          status?: string | null
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_redemptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "merchant_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          location: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean | null
          total_clicks: number | null
          total_conversions: number | null
          total_signups: number | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_signups?: number | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_signups?: number | null
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referral_code_id: string | null
          referred_id: string
          referrer_id: string
          reward_paid_at: string | null
          reward_points: number | null
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code_id?: string | null
          referred_id: string
          referrer_id: string
          reward_paid_at?: string | null
          reward_points?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          referral_code_id?: string | null
          referred_id?: string
          referrer_id?: string
          reward_paid_at?: string | null
          reward_points?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          campaign_id: string | null
          claimed_at: string | null
          earned_at: string
          expires_at: string | null
          id: string
          moment_id: string
          redemption_code: string | null
          reward_type: Database["public"]["Enums"]["reward_type"]
          reward_value: string
          status: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          claimed_at?: string | null
          earned_at?: string
          expires_at?: string | null
          id?: string
          moment_id: string
          redemption_code?: string | null
          reward_type?: Database["public"]["Enums"]["reward_type"]
          reward_value: string
          status?: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          claimed_at?: string | null
          earned_at?: string
          expires_at?: string | null
          id?: string
          moment_id?: string
          redemption_code?: string | null
          reward_type?: Database["public"]["Enums"]["reward_type"]
          reward_value?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsorship_requests: {
        Row: {
          bid_amount: number
          brand_id: string
          campaign_id: string | null
          created_at: string
          expires_at: string | null
          host_id: string
          host_response: string | null
          id: string
          message: string | null
          moment_id: string
          platform_fee_percent: number | null
          requirements: string | null
          responded_at: string | null
          status: Database["public"]["Enums"]["sponsorship_status"] | null
        }
        Insert: {
          bid_amount?: number
          brand_id: string
          campaign_id?: string | null
          created_at?: string
          expires_at?: string | null
          host_id: string
          host_response?: string | null
          id?: string
          message?: string | null
          moment_id: string
          platform_fee_percent?: number | null
          requirements?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["sponsorship_status"] | null
        }
        Update: {
          bid_amount?: number
          brand_id?: string
          campaign_id?: string | null
          created_at?: string
          expires_at?: string | null
          host_id?: string
          host_response?: string | null
          id?: string
          message?: string | null
          moment_id?: string
          platform_fee_percent?: number | null
          requirements?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["sponsorship_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsorship_requests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsorship_requests_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle_end: string | null
          billing_cycle_start: string | null
          cancelled_at: string | null
          created_at: string
          features: Json | null
          id: string
          monthly_price: number | null
          status: string | null
          tier: Database["public"]["Enums"]["subscription_tier"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle_end?: string | null
          billing_cycle_start?: string | null
          cancelled_at?: string | null
          created_at?: string
          features?: Json | null
          id?: string
          monthly_price?: number | null
          status?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle_end?: string | null
          billing_cycle_start?: string | null
          cancelled_at?: string | null
          created_at?: string
          features?: Json | null
          id?: string
          monthly_price?: number | null
          status?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_brand_points: {
        Row: {
          brand_id: string
          created_at: string
          current_points: number | null
          current_tier: Database["public"]["Enums"]["loyalty_tier"] | null
          id: string
          lifetime_points: number | null
          tier_updated_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          current_points?: number | null
          current_tier?: Database["public"]["Enums"]["loyalty_tier"] | null
          id?: string
          lifetime_points?: number | null
          tier_updated_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          current_points?: number | null
          current_tier?: Database["public"]["Enums"]["loyalty_tier"] | null
          id?: string
          lifetime_points?: number | null
          tier_updated_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          age_range: string | null
          city: string | null
          country: string | null
          created_at: string
          email_digest_frequency: string | null
          gender: string | null
          id: string
          latitude: number | null
          lifestyle_tags: string[] | null
          location_radius_km: number | null
          location_sharing_enabled: boolean | null
          longitude: number | null
          notification_enabled: boolean | null
          preferred_categories: string[] | null
          preferred_times: string[] | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_range?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email_digest_frequency?: string | null
          gender?: string | null
          id?: string
          latitude?: number | null
          lifestyle_tags?: string[] | null
          location_radius_km?: number | null
          location_sharing_enabled?: boolean | null
          longitude?: number | null
          notification_enabled?: boolean | null
          preferred_categories?: string[] | null
          preferred_times?: string[] | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_range?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email_digest_frequency?: string | null
          gender?: string | null
          id?: string
          latitude?: number | null
          lifestyle_tags?: string[] | null
          location_radius_km?: number | null
          location_sharing_enabled?: boolean | null
          longitude?: number | null
          notification_enabled?: boolean | null
          preferred_categories?: string[] | null
          preferred_times?: string[] | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          owner_id: string
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          owner_id: string
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          owner_id?: string
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      product_type: "physical" | "service" | "digital"

      ambassador_status:
      | "applied"
      | "pending"
      | "active"
      | "suspended"
      | "inactive"
      bounty_status:
      | "open"
      | "assigned"
      | "in_progress"
      | "submitted"
      | "approved"
      | "completed"
      | "cancelled"
      | "expired"
      loyalty_tier: "bronze" | "silver" | "gold" | "platinum" | "ambassador"
      moment_status:
      | "draft"
      | "scheduled"
      | "joinable"
      | "active"
      | "closed"
      | "archived"
      moment_type: "community" | "venue_hosted" | "brand_sponsored"
      moment_visibility: "open" | "invite" | "private"
      point_action:
      | "checkin"
      | "referral"
      | "review"
      | "media_upload"
      | "redemption"
      | "bonus"
      | "expiry"
      | "adjustment"
      | "affiliate_commission"
      reward_type:
      | "discount"
      | "freebie"
      | "points"
      | "voucher"
      | "experience"
      | "access"
      sponsorship_status:
      | "pending"
      | "viewed"
      | "negotiating"
      | "accepted"
      | "declined"
      | "active"
      | "completed"
      | "cancelled"
      subscription_tier: "free" | "starter" | "pro" | "enterprise"
      transaction_type:
      | "reward_redemption"
      | "sponsorship_fee"
      | "bounty_fee"
      | "subscription"
      | "featured_placement"
      | "payout"
      user_role: "participant" | "host" | "brand" | "merchant" | "admin"
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
      product_type: ["physical", "service", "digital"],
      ambassador_status: [
        "applied",
        "pending",
        "active",
        "suspended",
        "inactive",
      ],
      bounty_status: [
        "open",
        "assigned",
        "in_progress",
        "submitted",
        "approved",
        "completed",
        "cancelled",
        "expired",
      ],
      loyalty_tier: ["bronze", "silver", "gold", "platinum", "ambassador"],
      moment_status: [
        "draft",
        "submitted",
        "reviewed",
        "approved_unfunded",
        "funded",
        "joinable",
        "active",
        "processing",
        "closed",
        "cancelled",
      ],
      moment_type: ["activation", "bounty", "community", "merchant", "digital"],
      moment_visibility: ["open", "invite", "private"],
      point_action: [
        "checkin",
        "referral",
        "review",
        "media_upload",
        "redemption",
        "bonus",
        "expiry",
        "adjustment",
        "affiliate_commission",
      ],
      reward_type: [
        "discount",
        "freebie",
        "points",
        "voucher",
        "experience",
        "access",
      ],
      sponsorship_status: [
        "pending",
        "viewed",
        "negotiating",
        "accepted",
        "declined",
        "active",
        "completed",
        "cancelled",
      ],
      subscription_tier: ["free", "starter", "pro", "enterprise"],
      transaction_type: [
        "reward_redemption",
        "sponsorship_fee",
        "bounty_fee",
        "subscription",
        "featured_placement",
        "payout",
      ],
      user_role: ["participant", "host", "brand", "merchant", "admin"],
    },
  },
} as const
