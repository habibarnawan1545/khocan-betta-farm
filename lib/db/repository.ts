import fs from 'fs';
import path from 'path';
import {
  AuctionSession,
  Winner,
  FishItem,
  PublicWinner,
  WinnerDetailData,
  AdminDashboardStats,
  PaymentStatus,
  SessionStatus,
  ShippingOrder,
  ShippingStatus,
} from './types';
import { INITIAL_SESSIONS, INITIAL_WINNERS, INITIAL_FISH_ITEMS } from './seed-data';
import { slugify } from '../utils';
import { getMySqlPool } from './mysql';

// Local storage file for offline / development / demo mode persistence
const DATA_FILE = path.join(process.cwd(), 'data-store.json');

interface LocalStore {
  sessions: AuctionSession[];
  winners: Winner[];
  fishItems: FishItem[];
}

function loadLocalStore(): LocalStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading local data store, falling back to seed:', err);
  }

  // Seed store
  const store: LocalStore = {
    sessions: [...INITIAL_SESSIONS],
    winners: [...INITIAL_WINNERS],
    fishItems: [...INITIAL_FISH_ITEMS],
  };

  saveLocalStore(store);
  return store;
}

function saveLocalStore(store: LocalStore): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local data store:', err);
  }
}

export function packPaymentNote(
  note?: string | null,
  address?: string | null,
  recipientName?: string | null
): string | null {
  const cleanNote = note?.trim() || '';
  const cleanAddress = address?.trim() || '';
  const cleanRecipient = recipientName?.trim() || '';

  let shippingBlock = '';
  if (cleanRecipient || cleanAddress) {
    shippingBlock = `[SHIPPING]\nRECIPIENT: ${cleanRecipient}\nADDRESS: ${cleanAddress}\n[/SHIPPING]`;
  }

  if (!shippingBlock && !cleanNote) return null;
  if (!shippingBlock) return cleanNote;
  if (!cleanNote) return shippingBlock;
  return `${shippingBlock}\n${cleanNote}`;
}

export function unpackPaymentNote(rawNote?: string | null): {
  note: string | null;
  address: string | null;
  recipientName: string | null;
} {
  if (!rawNote) return { note: null, address: null, recipientName: null };

  const shipMatch = rawNote.match(/\[SHIPPING\]([\s\S]*?)\[\/SHIPPING\]/);
  if (shipMatch) {
    const content = shipMatch[1];
    const recMatch = content.match(/RECIPIENT:\s*([^\n]*)/);
    const addrMatch = content.match(/ADDRESS:\s*([\s\S]*)/);
    const recipient = recMatch ? recMatch[1].trim() : null;
    const address = addrMatch ? addrMatch[1].trim() : null;
    const note = rawNote.replace(/\[SHIPPING\][\s\S]*?\[\/SHIPPING\]/, '').trim();

    return {
      recipientName: recipient || null,
      address: address || null,
      note: note || null,
    };
  }

  const matchOld = rawNote.match(/\[ALAMAT\]([\s\S]*?)\[\/ALAMAT\]/);
  if (matchOld) {
    const address = matchOld[1].trim();
    const note = rawNote.replace(/\[ALAMAT\][\s\S]*?\[\/ALAMAT\]/, '').trim();
    return {
      recipientName: null,
      address: address || null,
      note: note || null,
    };
  }

  return { note: rawNote, address: null, recipientName: null };
}

// ==============================================================================
// PUBLIC METHODS (Zero payment leakage!)
// ==============================================================================

/**
 * Returns the currently active auction session.
 */
export async function getActiveSession(): Promise<AuctionSession | null> {
  const pool = getMySqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query(
        'SELECT * FROM auction_sessions WHERE status = ? LIMIT 1',
        ['active']
      );
      if (rows && rows.length > 0) {
        return rows[0] as AuctionSession;
      }
      return null;
    } catch (e) {
      console.warn('MySQL getActiveSession failed, using local store:', e);
    }
  }

  const store = loadLocalStore();
  const active = store.sessions.find((s) => s.status === 'active');
  return active || null;
}

/**
 * Returns sanitized winner cards for the public homepage.
 * Strictly excludes any payment_status or payment_note!
 */
export async function getPublicWinners(sessionId: string): Promise<PublicWinner[]> {
  const pool = getMySqlPool();
  if (pool) {
    try {
      const [winners]: any = await pool.query(
        'SELECT id, session_id, winner_name, slug, created_at FROM winners WHERE session_id = ? ORDER BY created_at ASC',
        [sessionId]
      );

      if (winners && winners.length > 0) {
        const winnerIds = winners.map((w: any) => w.id);
        const [fishList]: any = await pool.query(
          'SELECT id, winner_id, fish_photo, winning_price FROM fish_items WHERE winner_id IN (?)',
          [winnerIds]
        );

        return winners.map((w: any) => {
          const fishForWinner = (fishList || []).filter((f: any) => f.winner_id === w.id);
          const totalWinningPrice = fishForWinner.reduce((sum: number, f: any) => sum + Number(f.winning_price), 0);
          const representativePhoto = fishForWinner[0]?.fish_photo || '';

          return {
            id: w.id,
            session_id: w.session_id,
            winner_name: w.winner_name,
            slug: w.slug,
            created_at: w.created_at,
            fish_count: fishForWinner.length,
            total_winning_price: totalWinningPrice,
            representative_photo: representativePhoto,
          };
        });
      }
      return [];
    } catch (e) {
      console.warn('MySQL getPublicWinners failed, using local store:', e);
    }
  }

  const store = loadLocalStore();
  const winners = store.winners.filter((w) => w.session_id === sessionId);

  return winners.map((w) => {
    const fishForWinner = store.fishItems.filter((f) => f.winner_id === w.id);
    const totalWinningPrice = fishForWinner.reduce((sum, f) => sum + f.winning_price, 0);
    const representativePhoto = fishForWinner[0]?.fish_photo || '';

    return {
      id: w.id,
      session_id: w.session_id,
      winner_name: w.winner_name,
      slug: w.slug,
      created_at: w.created_at,
      fish_count: fishForWinner.length,
      total_winning_price: totalWinningPrice,
      representative_photo: representativePhoto,
    };
  });
}

/**
 * Returns winner detail data for a specific slug.
 * Strictly excludes payment_status and payment_note from response.
 */
export async function getWinnerBySlug(slug: string): Promise<WinnerDetailData | null> {
  const pool = getMySqlPool();
  if (pool) {
    try {
      const [sessions]: any = await pool.query(
        'SELECT * FROM auction_sessions WHERE status = ? LIMIT 1',
        ['active']
      );

      if (sessions && sessions.length > 0) {
        const activeSession = sessions[0];
        const [winners]: any = await pool.query(
          'SELECT id, session_id, winner_name, slug, created_at FROM winners WHERE session_id = ? AND slug = ? LIMIT 1',
          [activeSession.id, slug]
        );

        if (winners && winners.length > 0) {
          const winner = winners[0];
          const [fishItems]: any = await pool.query(
            'SELECT * FROM fish_items WHERE winner_id = ? ORDER BY created_at ASC',
            [winner.id]
          );

          const items: FishItem[] = (fishItems || []).map((f: any) => ({
            id: f.id,
            winner_id: f.winner_id,
            fish_name: f.fish_name,
            fish_code: f.fish_code,
            fish_photo: f.fish_photo,
            winning_price: Number(f.winning_price),
            notes: f.notes,
            created_at: f.created_at,
            updated_at: f.updated_at,
          }));

          const totalWinningPrice = items.reduce((sum, f) => sum + f.winning_price, 0);

          return {
            winner: {
              id: winner.id,
              session_id: winner.session_id,
              winner_name: winner.winner_name,
              slug: winner.slug,
              created_at: winner.created_at,
            },
            session: {
              id: activeSession.id,
              session_name: activeSession.session_name,
              start_date: activeSession.start_date,
              end_date: activeSession.end_date,
              shipping_date: activeSession.shipping_date,
              status: activeSession.status,
            },
            fish_items: items,
            total_winning_price: totalWinningPrice,
            total_fish: items.length,
          };
        }
      }
    } catch (e) {
      console.warn('MySQL getWinnerBySlug failed, using local store:', e);
    }
  }

  const store = loadLocalStore();
  const activeSession = store.sessions.find((s) => s.status === 'active');
  if (!activeSession) return null;

  const winner = store.winners.find((w) => w.session_id === activeSession.id && w.slug === slug);
  if (!winner) return null;

  const fishItems = store.fishItems.filter((f) => f.winner_id === winner.id);
  const totalWinningPrice = fishItems.reduce((sum, f) => sum + f.winning_price, 0);

  return {
    winner: {
      id: winner.id,
      session_id: winner.session_id,
      winner_name: winner.winner_name,
      slug: winner.slug,
      created_at: winner.created_at,
    },
    session: {
      id: activeSession.id,
      session_name: activeSession.session_name,
      start_date: activeSession.start_date,
      end_date: activeSession.end_date,
      shipping_date: activeSession.shipping_date,
      status: activeSession.status,
    },
    fish_items: fishItems,
    total_winning_price: totalWinningPrice,
    total_fish: fishItems.length,
  };
}

// ==============================================================================
// ADMIN METHODS (Full CRUD & payment management)
// ==============================================================================

export async function getAllSessions(): Promise<AuctionSession[]> {
  const pool = getMySqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query(
        'SELECT * FROM auction_sessions ORDER BY created_at DESC'
      );
      if (rows) return rows as AuctionSession[];
    } catch (e) {
      console.warn('MySQL getAllSessions failed, fallback to local store:', e);
    }
  }

  const store = loadLocalStore();
  return [...store.sessions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getSessionById(id: string): Promise<AuctionSession | null> {
  const sessions = await getAllSessions();
  return sessions.find((s) => s.id === id) || null;
}

export async function createSession(data: {
  session_name: string;
  start_date: string;
  end_date: string;
  shipping_date: string;
  status?: SessionStatus;
  notes?: string;
}): Promise<AuctionSession> {
  const targetStatus = data.status || 'closed';
  const newId = `session-${Date.now()}`;
  const now = new Date().toISOString();

  const pool = getMySqlPool();
  if (pool) {
    try {
      if (targetStatus === 'active') {
        await pool.query('UPDATE auction_sessions SET status = "closed" WHERE status = "active"');
      }

      await pool.query(
        'INSERT INTO auction_sessions (id, session_name, start_date, end_date, shipping_date, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          newId,
          data.session_name,
          data.start_date,
          data.end_date,
          data.shipping_date,
          targetStatus,
          data.notes || null,
        ]
      );

      const [rows]: any = await pool.query('SELECT * FROM auction_sessions WHERE id = ?', [newId]);
      if (rows && rows.length > 0) return rows[0] as AuctionSession;
    } catch (e) {
      console.warn('MySQL createSession failed, saving locally:', e);
    }
  }

  const store = loadLocalStore();

  if (targetStatus === 'active') {
    store.sessions = store.sessions.map((s) =>
      s.status === 'active' ? { ...s, status: 'closed', updated_at: now } : s
    );
  }

  const newSession: AuctionSession = {
    id: newId,
    session_name: data.session_name,
    start_date: data.start_date,
    end_date: data.end_date,
    shipping_date: data.shipping_date,
    status: targetStatus,
    notes: data.notes || null,
    created_at: now,
    updated_at: now,
  };

  store.sessions.unshift(newSession);
  saveLocalStore(store);
  return newSession;
}

export async function updateSession(
  id: string,
  data: Partial<Omit<AuctionSession, 'id' | 'created_at'>>
): Promise<AuctionSession | null> {
  const now = new Date().toISOString();
  const pool = getMySqlPool();

  if (pool) {
    try {
      if (data.status === 'active') {
        await pool.query('UPDATE auction_sessions SET status = "closed" WHERE status = "active" AND id != ?', [id]);
      }

      const fields: string[] = [];
      const values: any[] = [];
      for (const [key, val] of Object.entries(data)) {
        fields.push(`${key} = ?`);
        values.push(val);
      }

      if (fields.length > 0) {
        values.push(id);
        await pool.query(`UPDATE auction_sessions SET ${fields.join(', ')} WHERE id = ?`, values);
        const [rows]: any = await pool.query('SELECT * FROM auction_sessions WHERE id = ?', [id]);
        if (rows && rows.length > 0) return rows[0] as AuctionSession;
      }
    } catch (e) {
      console.warn('MySQL updateSession failed, using local store:', e);
    }
  }

  const store = loadLocalStore();
  const index = store.sessions.findIndex((s) => s.id === id);
  if (index === -1) return null;

  if (data.status === 'active') {
    store.sessions = store.sessions.map((s) =>
      s.id !== id && s.status === 'active' ? { ...s, status: 'closed', updated_at: now } : s
    );
  }

  store.sessions[index] = {
    ...store.sessions[index],
    ...data,
    updated_at: now,
  };

  saveLocalStore(store);
  return store.sessions[index];
}

export async function deleteSession(id: string): Promise<boolean> {
  const pool = getMySqlPool();
  if (pool) {
    try {
      await pool.query('DELETE FROM auction_sessions WHERE id = ?', [id]);
      return true;
    } catch (e) {
      console.warn('MySQL deleteSession failed:', e);
    }
  }

  const store = loadLocalStore();
  const winnersToDelete = store.winners.filter((w) => w.session_id === id).map((w) => w.id);

  store.sessions = store.sessions.filter((s) => s.id !== id);
  store.winners = store.winners.filter((w) => w.session_id !== id);
  store.fishItems = store.fishItems.filter((f) => !winnersToDelete.includes(f.winner_id));

  saveLocalStore(store);
  return true;
}

export async function getAdminWinners(sessionId?: string): Promise<
  (Winner & { fish_count: number; total_winning_price: number; representative_photo: string })[]
> {
  const pool = getMySqlPool();
  if (pool) {
    try {
      let query = 'SELECT * FROM winners';
      const params: any[] = [];
      if (sessionId) {
        query += ' WHERE session_id = ?';
        params.push(sessionId);
      }
      query += ' ORDER BY created_at DESC';

      const [winners]: any = await pool.query(query, params);
      if (winners) {
        const [allFish]: any = await pool.query('SELECT * FROM fish_items');
        const fishList = (allFish || []) as FishItem[];

        return winners.map((w: any) => {
          const { note: cleanNote, address, recipientName } = unpackPaymentNote(w.payment_note);
          const winnerFish = fishList.filter((f) => f.winner_id === w.id);
          const total = winnerFish.reduce((sum, f) => sum + Number(f.winning_price), 0);
          return {
            ...(w as Winner),
            recipient_name: (w as any).recipient_name || recipientName || null,
            shipping_address: (w as any).shipping_address || address || null,
            payment_note: cleanNote,
            fish_count: winnerFish.length,
            total_winning_price: total,
            representative_photo: winnerFish[0]?.fish_photo || '',
          };
        });
      }
    } catch (e) {
      console.warn('MySQL getAdminWinners failed, fallback to local store:', e);
    }
  }

  const store = loadLocalStore();
  let winners = store.winners;
  if (sessionId) {
    winners = winners.filter((w) => w.session_id === sessionId);
  }

  return winners.map((w) => {
    const winnerFish = store.fishItems.filter((f) => f.winner_id === w.id);
    const total = winnerFish.reduce((sum, f) => sum + f.winning_price, 0);
    return {
      ...w,
      fish_count: winnerFish.length,
      total_winning_price: total,
      representative_photo: winnerFish[0]?.fish_photo || '',
    };
  });
}

export async function getShippingOrders(
  sessionId?: string,
  onlyPaid: boolean = true
): Promise<ShippingOrder[]> {
  const sessions = await getAllSessions();
  const sessionMap = new Map(sessions.map((s) => [s.id, s]));

  const pool = getMySqlPool();
  if (pool) {
    try {
      let query = 'SELECT * FROM winners WHERE 1=1';
      const params: any[] = [];
      if (sessionId) {
        query += ' AND session_id = ?';
        params.push(sessionId);
      }
      if (onlyPaid) {
        query += ' AND payment_status = "paid"';
      }
      query += ' ORDER BY created_at DESC';

      const [winners]: any = await pool.query(query, params);
      if (winners) {
        const [allFish]: any = await pool.query('SELECT * FROM fish_items');
        const fishList = (allFish || []) as FishItem[];

        return winners.map((w: any) => {
          const { note: cleanNote, address, recipientName } = unpackPaymentNote(w.payment_note);
          const winnerFish = fishList.filter((f) => f.winner_id === w.id);
          const total = winnerFish.reduce((sum, f) => sum + Number(f.winning_price), 0);
          const session = sessionMap.get(w.session_id);

          return {
            ...(w as Winner),
            recipient_name: (w as any).recipient_name || recipientName || null,
            shipping_address: (w as any).shipping_address || address || null,
            payment_note: cleanNote,
            session_name: session?.session_name || 'Sesi Lelang',
            shipping_date: session?.shipping_date || '',
            fish_count: winnerFish.length,
            total_winning_price: total,
            fish_items: winnerFish,
          };
        });
      }
    } catch (e) {
      console.warn('MySQL getShippingOrders failed, fallback to local store:', e);
    }
  }

  const store = loadLocalStore();
  let winners = store.winners;
  if (sessionId) {
    winners = winners.filter((w) => w.session_id === sessionId);
  }
  if (onlyPaid) {
    winners = winners.filter((w) => w.payment_status === 'paid');
  }

  return winners.map((w) => {
    const winnerFish = store.fishItems.filter((f) => f.winner_id === w.id);
    const total = winnerFish.reduce((sum, f) => sum + f.winning_price, 0);
    const session = sessionMap.get(w.session_id);

    return {
      ...w,
      session_name: session?.session_name || 'Sesi Lelang',
      shipping_date: session?.shipping_date || '',
      fish_count: winnerFish.length,
      total_winning_price: total,
      fish_items: winnerFish,
    };
  });
}

export async function createWinner(data: {
  session_id: string;
  winner_name: string;
  recipient_name?: string;
  phone_number?: string;
  shipping_address?: string;
  shipping_status?: ShippingStatus;
  courier?: string;
  tracking_number?: string;
  payment_status?: PaymentStatus;
  payment_note?: string;
}): Promise<Winner> {
  let baseSlug = slugify(data.winner_name);
  if (!baseSlug) baseSlug = 'pemenang';

  const newId = `winner-${Date.now()}`;
  const now = new Date().toISOString();
  let slug = baseSlug;

  const combinedPaymentNote = packPaymentNote(data.payment_note, data.shipping_address, data.recipient_name);

  const pool = getMySqlPool();
  if (pool) {
    try {
      const [existing]: any = await pool.query(
        'SELECT slug FROM winners WHERE session_id = ? AND slug LIKE ?',
        [data.session_id, `${baseSlug}%`]
      );

      if (existing && existing.length > 0) {
        slug = `${baseSlug}-${existing.length + 1}`;
      }

      await pool.query(
        'INSERT INTO winners (id, session_id, winner_name, slug, phone_number, payment_status, payment_note) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          newId,
          data.session_id,
          data.winner_name.trim().toUpperCase(),
          slug,
          data.phone_number || null,
          data.payment_status || 'unpaid',
          combinedPaymentNote,
        ]
      );

      const [rows]: any = await pool.query('SELECT * FROM winners WHERE id = ?', [newId]);
      if (rows && rows.length > 0) {
        const { note: cleanNote, address, recipientName } = unpackPaymentNote(rows[0].payment_note);
        return {
          ...rows[0],
          recipient_name: recipientName,
          shipping_address: address,
          payment_note: cleanNote,
        } as Winner;
      }
    } catch (e: any) {
      console.error('MySQL createWinner error:', e);
    }
  }

  const store = loadLocalStore();
  let counter = 1;
  while (store.winners.some((w) => w.session_id === data.session_id && w.slug === slug)) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  const newWinner: Winner = {
    id: newId,
    session_id: data.session_id,
    winner_name: data.winner_name.trim().toUpperCase(),
    slug: slug,
    recipient_name: data.recipient_name || null,
    phone_number: data.phone_number || null,
    shipping_address: data.shipping_address || null,
    payment_status: data.payment_status || 'unpaid',
    payment_note: data.payment_note || null,
    created_at: now,
    updated_at: now,
  };

  store.winners.push(newWinner);
  saveLocalStore(store);
  return newWinner;
}

export async function updateWinner(
  id: string,
  data: Partial<Omit<Winner, 'id' | 'session_id' | 'created_at'>>
): Promise<Winner | null> {
  const now = new Date().toISOString();
  const pool = getMySqlPool();

  if (pool) {
    try {
      const [existing]: any = await pool.query('SELECT * FROM winners WHERE id = ?', [id]);
      const existingWinner = existing && existing.length > 0 ? existing[0] : null;

      let finalPaymentNote = data.payment_note;
      if (
        data.shipping_address !== undefined ||
        data.recipient_name !== undefined ||
        data.payment_note !== undefined
      ) {
        const { note: curNote, address: curAddr, recipientName: curRec } = unpackPaymentNote(existingWinner?.payment_note);
        const newAddress = data.shipping_address !== undefined ? data.shipping_address : curAddr;
        const newRecipient = data.recipient_name !== undefined ? data.recipient_name : curRec;
        const newNote = data.payment_note !== undefined ? data.payment_note : curNote;
        finalPaymentNote = packPaymentNote(newNote, newAddress, newRecipient) as any;
      }

      const fields: string[] = [];
      const values: any[] = [];
      if (data.winner_name !== undefined) { fields.push('winner_name = ?'); values.push(data.winner_name.trim().toUpperCase()); }
      if (data.phone_number !== undefined) { fields.push('phone_number = ?'); values.push(data.phone_number); }
      if (data.payment_status !== undefined) { fields.push('payment_status = ?'); values.push(data.payment_status); }
      if (finalPaymentNote !== undefined) { fields.push('payment_note = ?'); values.push(finalPaymentNote); }

      if (fields.length > 0) {
        values.push(id);
        await pool.query(`UPDATE winners SET ${fields.join(', ')} WHERE id = ?`, values);
      }

      const [rows]: any = await pool.query('SELECT * FROM winners WHERE id = ?', [id]);
      if (rows && rows.length > 0) {
        const { note: cleanNote, address, recipientName } = unpackPaymentNote(rows[0].payment_note);
        return {
          ...rows[0],
          recipient_name: recipientName,
          shipping_address: address,
          payment_note: cleanNote,
        } as Winner;
      }
    } catch (e: any) {
      console.error('MySQL updateWinner failed:', e);
    }
  }

  const store = loadLocalStore();
  const index = store.winners.findIndex((w) => w.id === id);
  if (index === -1) return null;

  store.winners[index] = {
    ...store.winners[index],
    ...data,
    updated_at: now,
  };

  saveLocalStore(store);
  return store.winners[index];
}

export async function deleteWinner(id: string): Promise<boolean> {
  const pool = getMySqlPool();
  if (pool) {
    try {
      await pool.query('DELETE FROM winners WHERE id = ?', [id]);
      return true;
    } catch (e) {
      console.warn('MySQL deleteWinner failed:', e);
    }
  }

  const store = loadLocalStore();
  store.winners = store.winners.filter((w) => w.id !== id);
  store.fishItems = store.fishItems.filter((f) => f.winner_id !== id);
  saveLocalStore(store);
  return true;
}

export async function getFishByWinnerId(winnerId: string): Promise<FishItem[]> {
  const pool = getMySqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query(
        'SELECT * FROM fish_items WHERE winner_id = ? ORDER BY created_at ASC',
        [winnerId]
      );
      if (rows) return rows as FishItem[];
    } catch (e) {
      console.warn('MySQL getFishByWinnerId failed:', e);
    }
  }

  const store = loadLocalStore();
  return store.fishItems.filter((f) => f.winner_id === winnerId);
}

export async function getAllFishItems(): Promise<(FishItem & { winner_name?: string })[]> {
  const pool = getMySqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query(
        'SELECT f.*, w.winner_name FROM fish_items f LEFT JOIN winners w ON f.winner_id = w.id ORDER BY f.created_at DESC'
      );
      if (rows) {
        return rows.map((item: any) => ({
          ...item,
          winner_name: item.winner_name || '-',
        }));
      }
    } catch (e) {
      console.warn('MySQL getAllFishItems failed:', e);
    }
  }

  const store = loadLocalStore();
  return store.fishItems.map((f) => {
    const winner = store.winners.find((w) => w.id === f.winner_id);
    return {
      ...f,
      winner_name: winner?.winner_name || '-',
    };
  });
}

export async function createFishItem(data: {
  winner_id: string;
  fish_name: string;
  fish_code?: string;
  fish_photo: string;
  winning_price: number;
  notes?: string;
}): Promise<FishItem> {
  const newId = `fish-${Date.now()}`;
  const now = new Date().toISOString();
  const pool = getMySqlPool();

  if (pool) {
    try {
      await pool.query(
        'INSERT INTO fish_items (id, winner_id, fish_name, fish_code, fish_photo, winning_price, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          newId,
          data.winner_id,
          data.fish_name.trim(),
          data.fish_code ? data.fish_code.trim().toUpperCase() : null,
          data.fish_photo,
          Number(data.winning_price),
          data.notes || null,
        ]
      );

      const [rows]: any = await pool.query('SELECT * FROM fish_items WHERE id = ?', [newId]);
      if (rows && rows.length > 0) return rows[0] as FishItem;
    } catch (e) {
      console.warn('MySQL createFishItem failed:', e);
    }
  }

  const store = loadLocalStore();
  const newItem: FishItem = {
    id: newId,
    winner_id: data.winner_id,
    fish_name: data.fish_name.trim(),
    fish_code: data.fish_code ? data.fish_code.trim().toUpperCase() : null,
    fish_photo: data.fish_photo,
    winning_price: Number(data.winning_price),
    notes: data.notes || null,
    created_at: now,
    updated_at: now,
  };

  store.fishItems.push(newItem);
  saveLocalStore(store);
  return newItem;
}

export async function updateFishItem(
  id: string,
  data: Partial<Omit<FishItem, 'id' | 'winner_id' | 'created_at'>>
): Promise<FishItem | null> {
  const now = new Date().toISOString();
  const pool = getMySqlPool();

  if (pool) {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      for (const [key, val] of Object.entries(data)) {
        fields.push(`${key} = ?`);
        values.push(val);
      }

      if (fields.length > 0) {
        values.push(id);
        await pool.query(`UPDATE fish_items SET ${fields.join(', ')} WHERE id = ?`, values);
        const [rows]: any = await pool.query('SELECT * FROM fish_items WHERE id = ?', [id]);
        if (rows && rows.length > 0) return rows[0] as FishItem;
      }
    } catch (e) {
      console.warn('MySQL updateFishItem failed:', e);
    }
  }

  const store = loadLocalStore();
  const index = store.fishItems.findIndex((f) => f.id === id);
  if (index === -1) return null;

  store.fishItems[index] = {
    ...store.fishItems[index],
    ...data,
    updated_at: now,
  };

  saveLocalStore(store);
  return store.fishItems[index];
}

export async function deleteFishItem(id: string): Promise<boolean> {
  const pool = getMySqlPool();
  if (pool) {
    try {
      await pool.query('DELETE FROM fish_items WHERE id = ?', [id]);
      return true;
    } catch (e) {
      console.warn('MySQL deleteFishItem failed:', e);
    }
  }

  const store = loadLocalStore();
  store.fishItems = store.fishItems.filter((f) => f.id !== id);
  saveLocalStore(store);
  return true;
}

export async function getDashboardStats(): Promise<AdminDashboardStats> {
  const sessions = await getAllSessions();
  const activeSession = sessions.find((s) => s.status === 'active') || null;

  const pool = getMySqlPool();
  if (pool) {
    try {
      const [allWinners]: any = await pool.query('SELECT id, payment_status, shipping_status FROM winners');
      const [allFish]: any = await pool.query('SELECT id, winning_price FROM fish_items');

      const winners = allWinners || [];
      const fish = allFish || [];

      const totalRevenue = fish.reduce((sum: number, f: any) => sum + Number(f.winning_price || 0), 0);
      const unpaidCount = winners.filter((w: any) => w.payment_status === 'unpaid').length;
      const partialCount = winners.filter((w: any) => w.payment_status === 'partial').length;
      const paidCount = winners.filter((w: any) => w.payment_status === 'paid').length;
      const readyToShipCount = winners.filter((w: any) => w.payment_status === 'paid' && w.shipping_status !== 'shipped').length;

      return {
        total_sessions: sessions.length,
        total_winners: winners.length,
        total_fish_sold: fish.length,
        total_revenue: totalRevenue,
        active_session: activeSession,
        last_session_status: activeSession ? 'Aktif' : 'Tidak Ada Sesi Aktif',
        unpaid_winners_count: unpaidCount,
        partial_winners_count: partialCount,
        paid_winners_count: paidCount,
        ready_to_ship_count: readyToShipCount,
      };
    } catch (e) {
      console.warn('MySQL getDashboardStats failed, fallback to local store:', e);
    }
  }

  const store = loadLocalStore();
  const winners = store.winners;
  const fish = store.fishItems;

  const totalRevenue = fish.reduce((sum, f) => sum + f.winning_price, 0);
  const unpaidCount = winners.filter((w) => w.payment_status === 'unpaid').length;
  const partialCount = winners.filter((w) => w.payment_status === 'partial').length;
  const paidCount = winners.filter((w) => w.payment_status === 'paid').length;
  const readyToShipCount = winners.filter((w: any) => w.payment_status === 'paid' && w.shipping_status !== 'shipped').length;

  return {
    total_sessions: sessions.length,
    total_winners: winners.length,
    total_fish_sold: fish.length,
    total_revenue: totalRevenue,
    active_session: activeSession,
    last_session_status: activeSession ? 'Aktif' : 'Tidak Ada Sesi Aktif',
    unpaid_winners_count: unpaidCount,
    partial_winners_count: partialCount,
    paid_winners_count: paidCount,
    ready_to_ship_count: readyToShipCount,
  };
}
