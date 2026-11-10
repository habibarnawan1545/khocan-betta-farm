export type SessionStatus = 'active' | 'closed' | 'archived';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export type ShippingStatus = 'ready' | 'shipped' | 'delivered';

export interface AuctionSession {
  id: string;
  session_name: string;
  start_date: string;
  end_date: string;
  shipping_date: string;
  status: SessionStatus;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Winner {
  id: string;
  session_id: string;
  winner_name: string; // Akun TikTok Pemenang
  slug: string;
  recipient_name?: string | null; // Nama Asli Penerima Paket
  phone_number?: string | null;
  shipping_address?: string | null;
  shipping_status?: ShippingStatus;
  courier?: string | null;
  tracking_number?: string | null;
  payment_status: PaymentStatus;
  payment_note?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ShippingOrder extends Winner {
  session_name: string;
  shipping_date: string;
  fish_count: number;
  total_winning_price: number;
  fish_items: FishItem[];
}

/**
 * Publicly sanitized winner data.
 * PAYMENT DETAILS ARE STRICTLY OMITTED TO PREVENT ANY DATA LEAK.
 */
export interface PublicWinner {
  id: string;
  session_id: string;
  winner_name: string;
  slug: string;
  created_at: string;
  fish_count: number;
  total_winning_price: number;
  representative_photo: string;
}

export interface FishItem {
  id: string;
  winner_id: string;
  fish_name: string;
  fish_code?: string | null;
  fish_photo: string;
  winning_price: number;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface AdminProfile {
  user_id: string;
  display_name: string;
  role: 'admin' | 'superadmin';
  created_at: string;
}

export interface WinnerDetailData {
  winner: {
    id: string;
    session_id: string;
    winner_name: string;
    slug: string;
    created_at: string;
  };
  session: {
    id: string;
    session_name: string;
    start_date: string;
    end_date: string;
    shipping_date: string;
    status: SessionStatus;
  };
  fish_items: FishItem[];
  total_winning_price: number;
  total_fish: number;
}

export interface AdminDashboardStats {
  total_sessions: number;
  total_winners: number;
  total_fish_sold: number;
  total_revenue: number;
  active_session: AuctionSession | null;
  last_session_status: string;
  unpaid_winners_count: number;
  partial_winners_count: number;
  paid_winners_count: number;
  ready_to_ship_count?: number;
}
