'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Truck,
  MapPin,
  MessageCircle,
  Copy,
  Search,
  Package,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Box,
  User,
  Phone,
} from 'lucide-react';
import { AuctionSession, ShippingOrder } from '@/lib/db/types';
import { formatIDR, formatIndoDate } from '@/lib/utils';

export default function AdminPengirimanPage() {
  const [sessions, setSessions] = useState<AuctionSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [orders, setOrders] = useState<ShippingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addressFilter, setAddressFilter] = useState<'all' | 'with_address' | 'no_address'>('all');

  // Copy alert feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      if (data.sessions) {
        setSessions(data.sessions);
        const active = data.sessions.find((s: AuctionSession) => s.status === 'active');
        if (active) {
          setSelectedSessionId(active.id);
        } else if (data.sessions.length > 0) {
          setSelectedSessionId(data.sessions[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  };

  const fetchOrders = async (sessionId?: string) => {
    setLoading(true);
    try {
      const targetSession = sessionId !== undefined ? sessionId : selectedSessionId;
      const url = targetSession
        ? `/api/shipping?session_id=${targetSession}`
        : '/api/shipping';
      const res = await fetch(url);
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch shipping orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      fetchOrders(selectedSessionId);
    }
  }, [selectedSessionId]);

  const handleCopyBoxLabel = (order: ShippingOrder) => {
    const recipient = order.recipient_name?.trim() || order.winner_name;
    const fishSummary = order.fish_items
      .map((f, i) => `  ${i + 1}. ${f.fish_name}${f.fish_code ? ` (${f.fish_code})` : ''} - ${formatIDR(f.winning_price)}`)
      .join('\n');

    const text = `=============================
TANDA KOTAK (TIKTOK): ${order.winner_name}
=============================
PENERIMA: ${recipient}
NO HP / WA: ${order.phone_number || '-'}
ALAMAT LENGKAP PENGIRIMAN:
${order.shipping_address?.trim() || '(Alamat belum diisi)'}
=============================
ISI KOTAK (${order.fish_count} EKOR):
${fishSummary}
TOTAL: ${formatIDR(order.total_winning_price)}
=============================`;

    navigator.clipboard.writeText(text);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const hasAddr = Boolean(o.shipping_address && o.shipping_address.trim());
    const matchesFilter =
      addressFilter === 'all'
        ? true
        : addressFilter === 'with_address'
        ? hasAddr
        : !hasAddr;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.winner_name.toLowerCase().includes(q) ||
      (o.recipient_name && o.recipient_name.toLowerCase().includes(q)) ||
      (o.shipping_address && o.shipping_address.toLowerCase().includes(q)) ||
      o.fish_items.some(
        (f) =>
          f.fish_name.toLowerCase().includes(q) ||
          (f.fish_code && f.fish_code.toLowerCase().includes(q))
      );

    return matchesFilter && matchesSearch;
  });

  const withAddressCount = orders.filter(
    (o) => o.shipping_address && o.shipping_address.trim()
  ).length;
  const missingAddressCount = orders.filter(
    (o) => !o.shipping_address || !o.shipping_address.trim()
  ).length;
  const totalFishCount = orders.reduce((sum, o) => sum + o.fish_count, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <Truck className="w-4 h-4" />
            Fitur Packing & Siap Kirim
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
            Data Ikan Siap Dikirim
          </h2>
          <p className="text-xs text-zinc-400">
            Daftar pemenang lunas untuk proses penulisan tanda kotak (Akun TikTok), nama penerima asli, dan alamat pengiriman pada kotak packing.
          </p>
        </div>

        <button
          onClick={() => fetchOrders()}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider border border-zinc-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-500' : ''}`} />
          Segarkan Data
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
            Total Pemenang Lunas
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {orders.length}
            </span>
            <span className="text-xs text-zinc-500">kotak</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
            Alamat Sudah Ada
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {withAddressCount}
            </span>
            <span className="text-xs text-zinc-500">siap tulis di kotak</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
            Alamat Belum Ada
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black font-mono ${missingAddressCount > 0 ? 'text-rose-500' : 'text-zinc-500'}`}>
              {missingAddressCount}
            </span>
            <span className="text-xs text-zinc-500">tunggu via WA</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
            Total Ikan
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-red-500 font-mono">
              {totalFishCount}
            </span>
            <span className="text-xs text-zinc-500">ekor ikan</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="shrink-0">
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full sm:w-auto bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-medium"
            >
              <option value="">Semua Sesi Lelang</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.session_name} ({s.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="flex rounded-lg bg-zinc-950 p-1 border border-zinc-800 text-xs">
            <button
              onClick={() => setAddressFilter('all')}
              className={`px-3 py-1.5 rounded-md font-bold uppercase transition-colors ${
                addressFilter === 'all'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Semua ({orders.length})
            </button>
            <button
              onClick={() => setAddressFilter('with_address')}
              className={`px-3 py-1.5 rounded-md font-bold uppercase transition-colors ${
                addressFilter === 'with_address'
                  ? 'bg-emerald-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Ada Alamat ({withAddressCount})
            </button>
            <button
              onClick={() => setAddressFilter('no_address')}
              className={`px-3 py-1.5 rounded-md font-bold uppercase transition-colors ${
                addressFilter === 'no_address'
                  ? 'bg-rose-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Belum Ada ({missingAddressCount})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari akun TikTok, penerima, atau alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
          />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-16 text-center text-zinc-500 text-sm">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-red-500" />
          Memuat data pemenang siap dikirim...
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const hasAddress = Boolean(
              order.shipping_address && order.shipping_address.trim()
            );
            const cleanPhone = order.phone_number?.replace(/\D/g, '') || '';
            const waTargetPhone = cleanPhone.startsWith('0')
              ? '62' + cleanPhone.slice(1)
              : cleanPhone;

            return (
              <div
                key={order.id}
                className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl"
              >
                {/* Header: Nama Pemenang & Status */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-950 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-red-600 text-white flex items-center gap-1.5 shadow-sm">
                      <Box className="w-3.5 h-3.5" />
                      Kotak: {order.winner_name}
                    </span>

                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Lunas
                    </span>

                    {hasAddress ? (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-blue-950/60 text-blue-400 border border-blue-800/60">
                        Alamat Siap
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-950/60 text-amber-400 border border-amber-800/60">
                        Belum Ada Alamat
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span>
                      Sesi: <strong className="text-zinc-200">{order.session_name}</strong>
                    </span>
                    {order.shipping_date && (
                      <span>
                        • Jadwal Kirim:{' '}
                        <strong className="text-emerald-400">
                          {formatIndoDate(order.shipping_date)}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Content: Alamat Lengkap & Daftar Ikan */}
                <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Bagian Data Kotak & Alamat Pengiriman (7 Cols) */}
                  <div className="lg:col-span-7 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        Data Label Kotak Pengiriman
                      </span>

                      <button
                        onClick={() => handleCopyBoxLabel(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider transition-colors"
                        title="Salin semua informasi untuk ditulis di kotak packing"
                      >
                        <Copy className="w-3.5 h-3.5 text-red-500" />
                        {copiedId === order.id ? 'Tersalin!' : 'Salin Format Kotak'}
                      </button>
                    </div>

                    {/* Rincian Identitas Penerima */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Tanda Kotak (Akun TikTok) */}
                      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block flex items-center gap-1">
                          <Box className="w-3 h-3 text-red-500" />
                          Tanda Kotak (Akun TikTok)
                        </span>
                        <p className="text-sm font-black text-white uppercase tracking-tight">
                          {order.winner_name}
                        </p>
                      </div>

                      {/* Nama Penerima Asli */}
                      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block flex items-center gap-1">
                          <User className="w-3 h-3 text-emerald-400" />
                          Nama Penerima Paket
                        </span>
                        <p className="text-sm font-black text-white uppercase tracking-tight">
                          {order.recipient_name?.trim() ? order.recipient_name : (
                            <span className="text-zinc-400 font-semibold">{order.winner_name} (Sesuai Akun TikTok)</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* No HP / WhatsApp */}
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/90 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block flex items-center gap-1">
                          <Phone className="w-3 h-3 text-blue-400" />
                          No HP / WhatsApp Penerima
                        </span>
                        <p className="text-xs font-mono font-bold text-white">
                          {order.phone_number || <span className="text-zinc-500 font-sans">Belum diisi</span>}
                        </p>
                      </div>

                      {order.phone_number && (
                        <a
                          href={`https://wa.me/${waTargetPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 text-xs font-bold transition-colors shrink-0"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Chat WA
                        </a>
                      )}
                    </div>

                    {/* Alamat Lengkap */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        Alamat Pengiriman (Ditulis Langsung di Kotak Packing)
                      </span>

                      {hasAddress ? (
                        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-100 leading-relaxed font-sans whitespace-pre-wrap select-all">
                          {order.shipping_address}
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-2">
                          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>Alamat pengiriman belum diisi oleh pemenang.</span>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            Pemenang belum memberikan alamat. Silakan hubungi via WA. Jika sudah dikirimkan via WA, masukkan alamat tersebut lewat menu <strong className="text-zinc-200">Data Pemenang</strong> (klik Edit).
                          </p>
                          {order.phone_number && (
                            <a
                              href={`https://wa.me/${waTargetPhone}?text=${encodeURIComponent(
                                `Halo Bro/Sis *${order.winner_name}* pemenang lelang KHOCAN BETTA FARM,\n\nPembayaran lelang kamu sudah lunas. Mohon kirimkan ALAMAT LENGKAP PENGIRIMAN (Nama Asli Penerima, No HP, Alamat Lengkap + Kode Pos) untuk kami tulis di kotak packing ya! Terima kasih.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors w-fit"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Minta Alamat via WA
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bagian Daftar Ikan yang Dimenangkan (5 Cols) */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                        <Package className="w-4 h-4 text-red-500" />
                        Isi Kotak ({order.fish_items.length} Ekor Ikan)
                      </span>
                      <span className="text-xs font-mono font-bold text-red-400">
                        Total: {formatIDR(order.total_winning_price)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {order.fish_items.length > 0 ? (
                        order.fish_items.map((fish, idx) => (
                          <div
                            key={fish.id}
                            className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative w-11 h-11 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                                {fish.fish_photo ? (
                                  <Image
                                    src={fish.fish_photo}
                                    alt={fish.fish_name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-600 text-[9px]">
                                    No Foto
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-bold uppercase text-white truncate block">
                                  #{idx + 1}. {fish.fish_name}
                                </span>
                                {fish.fish_code && (
                                  <span className="text-[10px] font-mono text-zinc-400">
                                    Kode: {fish.fish_code}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-xs font-mono font-bold text-zinc-200 shrink-0">
                              {formatIDR(fish.winning_price)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-zinc-500 text-xs bg-zinc-950 rounded-xl border border-zinc-800">
                          Belum ada data ikan.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center text-zinc-500 text-sm bg-zinc-900/40 rounded-2xl border border-zinc-800">
          Tidak ada data pesanan lunas yang sesuai dengan filter.
        </div>
      )}
    </div>
  );
}
