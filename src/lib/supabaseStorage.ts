import { supabase } from './supabase';

const IMAGES_BUCKET = process.env.EXPO_PUBLIC_SUPABASE_IMAGES_BUCKET ?? 'images';
const AUDIO_BUCKET = process.env.EXPO_PUBLIC_SUPABASE_AUDIO_BUCKET ?? 'audio';
const VIDEO_BUCKET = process.env.EXPO_PUBLIC_SUPABASE_VIDEO_BUCKET ?? 'videos';

type UploadKind = 'image' | 'audio' | 'video';

function getBucket(kind: UploadKind) {
  if (kind === 'image') return IMAGES_BUCKET;
  if (kind === 'audio') return AUDIO_BUCKET;
  return VIDEO_BUCKET;
}

function extFromMime(mimeType: string | undefined, fallback: string) {
  if (!mimeType || !mimeType.includes('/')) return fallback;
  const ext = mimeType.split('/')[1];
  return ext || fallback;
}

export async function uploadMediaToSupabase(params: {
  fileUri: string;
  mimeType?: string;
  kind: UploadKind;
}) {
  if (!supabase) throw new Error('Supabase не настроен.');

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Пользователь не авторизован.');

  const { fileUri, mimeType, kind } = params;
  const bucket = getBucket(kind);
  const ext = extFromMime(
    mimeType,
    kind === 'image' ? 'jpg' : kind === 'audio' ? 'mp3' : 'mp4'
  );
  const fileName =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const path = `${user.id}/${fileName}.${ext}`;

  const fileResponse = await fetch(fileUri);
  const blob = await fileResponse.blob();

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: mimeType,
    upsert: true,
  });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
