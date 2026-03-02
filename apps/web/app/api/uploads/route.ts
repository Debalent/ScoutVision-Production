// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision — File Upload API Route
// POST: Initiate upload, returns presigned URL / upload ID
// PUT:  Update upload status (progress, completion)
// GET:  List uploads
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface UploadRecord {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  progress: number;
  category: 'video' | 'document' | 'image' | 'csv';
  storagePath: string;
  storageUrl: string | null;
  metadata: Record<string, unknown> | null;
  userId: string;
  createdAt: string;
  completedAt: string | null;
}

// In-memory store
const uploads = new Map<string, UploadRecord>();

// ─── Supported file types ───────────────────────────────────────────

const ALLOWED_TYPES: Record<string, { category: UploadRecord['category']; maxSizeMB: number }> = {
  'video/mp4': { category: 'video', maxSizeMB: 2048 },
  'video/quicktime': { category: 'video', maxSizeMB: 2048 },
  'video/x-msvideo': { category: 'video', maxSizeMB: 2048 },
  'video/webm': { category: 'video', maxSizeMB: 2048 },
  'image/jpeg': { category: 'image', maxSizeMB: 20 },
  'image/png': { category: 'image', maxSizeMB: 20 },
  'image/webp': { category: 'image', maxSizeMB: 20 },
  'application/pdf': { category: 'document', maxSizeMB: 50 },
  'text/csv': { category: 'csv', maxSizeMB: 10 },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { category: 'csv', maxSizeMB: 50 },
};

// ─── POST: Initiate upload ──────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, mimeType, fileSize, prospectId } = body;

    // Validate
    if (!fileName || !mimeType || !fileSize) {
      return NextResponse.json({ error: 'fileName, mimeType, and fileSize are required' }, { status: 400 });
    }

    const typeConfig = ALLOWED_TYPES[mimeType];
    if (!typeConfig) {
      return NextResponse.json({
        error: `Unsupported file type: ${mimeType}`,
        allowedTypes: Object.keys(ALLOWED_TYPES),
      }, { status: 400 });
    }

    const maxBytes = typeConfig.maxSizeMB * 1024 * 1024;
    if (fileSize > maxBytes) {
      return NextResponse.json({
        error: `File too large. Maximum for ${typeConfig.category}: ${typeConfig.maxSizeMB}MB`,
      }, { status: 400 });
    }

    const id = `upl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const ext = fileName.split('.').pop() || 'bin';
    const storagePath = `uploads/${typeConfig.category}/${id}.${ext}`;

    const upload: UploadRecord = {
      id,
      fileName: `${id}.${ext}`,
      originalName: fileName,
      mimeType,
      fileSize,
      status: 'uploading',
      progress: 0,
      category: typeConfig.category,
      storagePath,
      storageUrl: null,
      metadata: prospectId ? { prospectId } : null,
      userId: 'current-user', // In production: from auth context
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    uploads.set(id, upload);

    // Simulate upload completion after a delay
    simulateUpload(id, typeConfig.category);

    return NextResponse.json({
      uploadId: id,
      storagePath,
      // In production: return a presigned URL for direct-to-S3 upload
      uploadUrl: `/api/uploads/${id}/data`,
      expiresIn: 3600,
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to initiate upload' }, { status: 500 });
  }
}

// ─── GET: List uploads ──────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uploadId = searchParams.get('id');
  const category = searchParams.get('category');

  if (uploadId) {
    const upload = uploads.get(uploadId);
    if (!upload) return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    return NextResponse.json(upload);
  }

  let all = Array.from(uploads.values()).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (category) {
    all = all.filter((u) => u.category === category);
  }

  return NextResponse.json({ uploads: all.slice(0, 50) });
}

// ─── Simulate upload progression ────────────────────────────────────

async function simulateUpload(id: string, category: string) {
  const upload = uploads.get(id);
  if (!upload) return;

  // Simulate progress
  const steps = [10, 25, 45, 65, 80, 95, 100];
  for (const pct of steps) {
    await delay(300 + Math.random() * 400);
    upload.progress = pct;
  }

  upload.status = 'processing';

  // Processing time depends on category
  const processingMs = category === 'video' ? 2000 : 500;
  await delay(processingMs);

  upload.status = 'ready';
  upload.storageUrl = `https://storage.scoutvision.ai/${upload.storagePath}`;
  upload.completedAt = new Date().toISOString();

  if (category === 'video') {
    upload.metadata = {
      ...upload.metadata,
      duration: 45 + Math.random() * 120,
      resolution: '1080p',
      fps: 30,
      codec: 'h264',
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
