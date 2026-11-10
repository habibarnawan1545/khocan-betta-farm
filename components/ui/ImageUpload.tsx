'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = 'Foto Ikan Cupang' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [directUrl, setDirectUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengunggah foto');
      }

      onChange(data.url);
    } catch (err: any) {
      setUploadError(err.message || 'Terjadi kesalahan saat upload.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (directUrl.trim()) {
      onChange(directUrl.trim());
      setDirectUrl('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          {label} <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-zinc-400 hover:text-red-400 flex items-center gap-1 transition-colors"
        >
          <LinkIcon className="w-3 h-3" />
          {showUrlInput ? 'Gunakan Upload File' : 'Gunakan URL Foto'}
        </button>
      </div>

      {showUrlInput ? (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://domain.com/foto-cupang.jpg"
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
          >
            Terapkan
          </button>
        </div>
      ) : (
        <div>
          {value ? (
            <div className="relative w-full aspect-video sm:aspect-[4/3] rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 group">
              <Image
                src={value}
                alt="Preview Foto Ikan"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900/90 text-white text-xs font-bold hover:bg-zinc-800 border border-zinc-700 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Ganti Foto
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="p-1.5 rounded-lg bg-red-950/90 text-red-400 hover:bg-red-900 border border-red-800"
                  title="Hapus foto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-800 hover:border-red-600/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-zinc-950/50 hover:bg-zinc-900/40"
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-2" />
                  <span className="text-xs text-zinc-400 font-medium">Mengunggah ke penyimpanan...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 mb-2">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-white mb-0.5">
                    Klik untuk memilih foto ikan
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Mendukung WebP, JPEG, PNG (Maksimal 5MB)
                  </p>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-rose-400 mt-1">{uploadError}</p>
      )}
    </div>
  );
}
