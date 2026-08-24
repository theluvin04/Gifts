import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db, ensureAuth, auth } from '../config/firebase';
import { LoveConfig } from '../types';

export interface SavedGiftDocument {
  id: string;
  config: LoveConfig;
  createdAt: any;
  updatedAt: any;
  creatorId?: string;
  senderName: string;
  receiverName: string;
  viewCount: number;
  isPublished: boolean;
}

const generateGiftId = (length = 8): string => {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const SAVED_KEYS_STORAGE = 'gifts:created_ids';

export const getMySavedGiftIds = (): string[] => {
  try {
    const raw = localStorage.getItem(SAVED_KEYS_STORAGE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const recordMySavedGiftId = (id: string) => {
  try {
    const current = getMySavedGiftIds();
    if (!current.includes(id)) {
      current.unshift(id);
      localStorage.setItem(SAVED_KEYS_STORAGE, JSON.stringify(current.slice(0, 20)));
    }
  } catch {
    // Ignore storage issues
  }
};

/**
 * Save or publish a gift configuration to Firestore
 */
export const saveGiftToFirestore = async (
  config: LoveConfig,
  customId?: string
): Promise<{ id: string; url: string }> => {
  await ensureAuth();
  const giftId = customId || generateGiftId();
  const giftRef = doc(db, 'gifts', giftId);

  const docData: Record<string, any> = {
    id: giftId,
    config,
    senderName: config.couple.senderName || 'Anonymous',
    receiverName: config.couple.receiverName || 'Someone Special',
    creatorId: auth.currentUser?.uid || 'anonymous',
    isPublished: true,
    updatedAt: serverTimestamp(),
  };

  // Check if document exists
  const existing = await getDoc(giftRef);
  if (!existing.exists()) {
    docData.createdAt = serverTimestamp();
    docData.viewCount = 0;
  }

  await setDoc(giftRef, docData, { merge: true });
  recordMySavedGiftId(giftId);

  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/?gift=${giftId}`;

  return { id: giftId, url: shareUrl };
};

/**
 * Fetch a gift by ID from Firestore and increment view count
 */
export const fetchGiftFromFirestore = async (
  giftId: string
): Promise<SavedGiftDocument | null> => {
  try {
    const giftRef = doc(db, 'gifts', giftId);
    const snapshot = await getDoc(giftRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data() as SavedGiftDocument;

    // Increment view count asynchronously
    try {
      updateDoc(giftRef, {
        viewCount: increment(1),
        lastViewedAt: serverTimestamp(),
      });
    } catch {
      // Non-blocking
    }

    return data;
  } catch (error) {
    console.error('Error fetching gift from Firestore:', error);
    return null;
  }
};
