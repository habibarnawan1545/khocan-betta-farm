import { PaymentStatus } from '@/lib/db/types';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  showIcon?: boolean;
}

export function PaymentStatusBadge({ status, showIcon = true }: PaymentStatusBadgeProps) {
  switch (status) {
    case 'paid':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/50">
          {showIcon && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
          Lunas
        </span>
      );
    case 'partial':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-950/70 text-amber-400 border border-amber-800/50">
          {showIcon && <Clock className="w-3 h-3 text-amber-400" />}
          Sebagian (DP)
        </span>
      );
    case 'unpaid':
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-950/70 text-rose-400 border border-rose-800/50">
          {showIcon && <AlertCircle className="w-3 h-3 text-rose-400" />}
          Belum Bayar
        </span>
      );
  }
}
