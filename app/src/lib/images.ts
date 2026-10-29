import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { supabase } from './supabase';

export type ImageSource = 'camera' | 'library';
export type ImageBucket = 'garments' | 'selfies';

/** Imagen lista para subir: comprimida, en JPEG y con su contenido en base64. */
export type PreparedImage = {
  uri: string;
  width: number;
  height: number;
  base64: string;
};

export class ImagePermissionError extends Error {
  constructor(public source: ImageSource) {
    super(
      source === 'camera'
        ? 'Necesitamos acceso a la cámara. Actívalo en los ajustes del dispositivo.'
        : 'Necesitamos acceso a tus fotos. Actívalo en los ajustes del dispositivo.',
    );
  }
}

/** Lado máximo de las imágenes subidas (RNF2: optimizar imágenes). */
const MaxImageSize = 1280;
const JpegQuality = 0.8;

/**
 * Abre la cámara o la galería y devuelve la imagen ya optimizada,
 * o `null` si el usuario cancela.
 */
export async function pickImage(
  source: ImageSource,
  options: { aspect?: [number, number]; frontCamera?: boolean } = {},
): Promise<PreparedImage | null> {
  if (Platform.OS !== 'web') {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) throw new ImagePermissionError(source);
  }

  const pickerOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: options.aspect,
    quality: 1,
    cameraType: options.frontCamera ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
  };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(pickerOptions)
      : await ImagePicker.launchImageLibraryAsync(pickerOptions);

  if (result.canceled || !result.assets?.length) return null;
  return prepareImage(result.assets[0].uri);
}

/** Reduce la imagen a `MaxImageSize` px por el lado largo y la pasa a JPEG. */
async function prepareImage(uri: string): Promise<PreparedImage> {
  let rendered = await ImageManipulator.manipulate(uri).renderAsync();

  const longest = Math.max(rendered.width, rendered.height);
  if (longest > MaxImageSize) {
    const resize =
      rendered.width >= rendered.height ? { width: MaxImageSize } : { height: MaxImageSize };
    rendered = await ImageManipulator.manipulate(rendered).resize(resize).renderAsync();
  }

  const saved = await rendered.saveAsync({
    format: SaveFormat.JPEG,
    compress: JpegQuality,
    base64: true,
  });
  if (!saved.base64) throw new Error('No se ha podido procesar la imagen.');
  return { uri: saved.uri, width: saved.width, height: saved.height, base64: saved.base64 };
}

/**
 * Sube la imagen a la carpeta del usuario dentro del bucket privado
 * (`<bucket>/<userId>/<archivo>.jpg`) y devuelve su ruta (RB7).
 */
export async function uploadImage(
  bucket: ImageBucket,
  userId: string,
  image: PreparedImage,
): Promise<string> {
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
  const path = `${userId}/${fileName}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, base64ToArrayBuffer(image.base64), { contentType: 'image/jpeg' });
  if (error) throw error;
  return path;
}

export async function removeImage(bucket: ImageBucket, path: string | null) {
  if (!path) return;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) console.warn(`[images] No se pudo borrar ${path}:`, error.message);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// --- URLs firmadas --------------------------------------------------------------

const SignedUrlTtlSeconds = 60 * 60;
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

/**
 * Los buckets son privados, así que las imágenes se muestran con URLs firmadas
 * temporales. Se cachean en memoria hasta poco antes de caducar.
 */
export async function getSignedUrls(
  bucket: ImageBucket,
  paths: string[],
): Promise<Record<string, string>> {
  const now = Date.now();
  const result: Record<string, string> = {};
  const missing: string[] = [];

  for (const path of new Set(paths)) {
    const cached = signedUrlCache.get(`${bucket}/${path}`);
    if (cached && cached.expiresAt > now) result[path] = cached.url;
    else missing.push(path);
  }

  if (missing.length > 0) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrls(missing, SignedUrlTtlSeconds);
    if (error) throw error;
    const expiresAt = now + (SignedUrlTtlSeconds - 60) * 1000;
    for (const item of data) {
      if (!item.path || !item.signedUrl) continue;
      result[item.path] = item.signedUrl;
      signedUrlCache.set(`${bucket}/${item.path}`, { url: item.signedUrl, expiresAt });
    }
  }
  return result;
}
