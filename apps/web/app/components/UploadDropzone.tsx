'use client';

import { useState, useCallback, useRef } from 'react';
import { cn } from '../lib/utils';

interface UploadItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'ready' | 'failed';
  progress: number;
  uploadId?: string;
  error?: string;
}

interface Props {
  onUploadComplete?: (uploadId: string, fileName: string) => void;
  prospectId?: string;
  accept?: string;
  maxFiles?: number;
}

const FILE_ICONS: Record<string, string> = {
  video: 'M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z',
  image: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 18V6.75A2.25 2.25 0 014.5 4.5h15A2.25 2.25 0 0121.75 6.75V18',
  document: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
};

function getFileCategory(mime: string): string {
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('image/')) return 'image';
  return 'document';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function UploadDropzone({ onUploadComplete, prospectId, accept, maxFiles = 10 }: Props) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newItems: UploadItem[] = Array.from(files).slice(0, maxFiles - items.length).map((file) => ({
      id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      file,
      status: 'pending' as const,
      progress: 0,
    }));
    setItems((prev) => [...prev, ...newItems]);
    newItems.forEach((item) => uploadFile(item));
  }, [items.length, maxFiles]);

  const uploadFile = async (item: UploadItem) => {
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, status: 'uploading' } : i));

    try {
      // 1. Initiate upload
      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: item.file.name,
          mimeType: item.file.type,
          fileSize: item.file.size,
          prospectId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }

      const { uploadId } = await res.json();

      // 2. Poll for progress
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/uploads?id=${uploadId}`);
          const status = await statusRes.json();
          setItems((prev) => prev.map((i) => i.id === item.id ? {
            ...i,
            uploadId,
            progress: status.progress,
            status: status.status,
          } : i));

          if (status.status === 'ready' || status.status === 'failed') {
            clearInterval(pollInterval);
            if (status.status === 'ready') {
              onUploadComplete?.(uploadId, item.file.name);
            }
          }
        } catch { /* continue polling */ }
      }, 400);
    } catch (err) {
      setItems((prev) => prev.map((i) => i.id === item.id ? {
        ...i,
        status: 'failed',
        error: err instanceof Error ? err.message : 'Upload failed',
      } : i));
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all',
          isDragging
            ? 'border-electric bg-electric/5 scale-[1.01]'
            : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept || 'video/*,image/*,.pdf,.csv,.xlsx'}
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
          className="hidden"
        />

        <div className="space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-electric/10 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-electric">
              <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {isDragging ? 'Drop files here' : 'Drag and drop files, or click to browse'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Video (MP4, MOV, WebM up to 2GB) | Images (JPG, PNG up to 20MB) | Documents (PDF, CSV, XLSX)
            </p>
          </div>
        </div>
      </div>

      {/* Upload items */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => {
            const category = getFileCategory(item.file.type);
            return (
              <div key={item.id} className="card px-4 py-3 flex items-center gap-3">
                {/* Icon */}
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                  item.status === 'failed' ? 'bg-red-500/10' : 'bg-electric/10'
                )}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                    className={item.status === 'failed' ? 'text-red-400' : 'text-electric'}>
                    <path d={FILE_ICONS[category] || FILE_ICONS.document} />
                  </svg>
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.file.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{formatBytes(item.file.size)}</span>
                    {item.status === 'failed' && (
                      <span className="text-xs text-red-400">{item.error}</span>
                    )}
                    {item.status === 'ready' && (
                      <span className="text-xs text-green-400">Complete</span>
                    )}
                  </div>

                  {/* Progress bar */}
                  {(item.status === 'uploading' || item.status === 'processing') && (
                    <div className="mt-1.5 h-1 bg-charcoal rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-300',
                          item.status === 'processing'
                            ? 'bg-amber-400 animate-pulse'
                            : 'bg-gradient-to-r from-electric to-cyan-400'
                        )}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Status / Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.status === 'uploading' && (
                    <span className="text-xs text-electric font-medium">{item.progress}%</span>
                  )}
                  {item.status === 'processing' && (
                    <span className="text-xs text-amber-400 font-medium">Processing</span>
                  )}
                  {item.status === 'ready' && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                      <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                    className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 hover:text-white">
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
