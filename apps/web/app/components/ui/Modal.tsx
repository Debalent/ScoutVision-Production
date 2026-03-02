'use client';

import { useEffect, useCallback, useRef } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showClose?: boolean;
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({ open, onClose, title, description, children, size = 'md', showClose = true }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div className="overlay" onClick={onClose} />

      {/* Content */}
      <div ref={contentRef} className={`modal-content ${sizeMap[size]}`}>
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div>
              {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
              {description && <p className="text-sm text-gray-400 mt-0.5">{description}</p>}
            </div>
            {showClose && (
              <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 hover:text-white">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
