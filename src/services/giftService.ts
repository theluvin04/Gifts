import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import {
  auth,
  db,
  ensureAuth,
} from '../config/firebase';

import { LoveConfig } from '../types';

export type GiftStatus =
  | 'draft'
  | 'published';

export interface SavedGiftDocument {
  id: string;
  config: LoveConfig;
  createdAt: unknown;
  updatedAt: unknown;
  publishedAt?: unknown;
  creatorId: string;
  senderName: string;
  receiverName: string;
  viewCount: number;
  status: GiftStatus;
  isPublished: boolean;
}

interface SaveGiftResult {
  id: string;
  url: string;
  status: GiftStatus;
}

const SAVED_KEYS_STORAGE =
  'gifts:created_ids';

const generateGiftId = (
  length = 8
): string => {
  const chars =
    'abcdefghjkmnpqrstuvwxyz23456789';

  let result = '';

  for (let index = 0; index < length; index++) {
    result += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return result;
};

const buildShareUrl = (
  giftId: string
) => {
  return `${window.location.origin}/gift/${giftId}`;
};

const getAuthenticatedCreatorId =
  async (): Promise<string> => {
    await ensureAuth();

    const creatorId =
      auth.currentUser?.uid;

    if (!creatorId) {
      throw new Error(
        'Không thể xác thực phiên tạo quà. Hãy tải lại trang và thử lại.'
      );
    }

    return creatorId;
  };

const getAvailableGiftId =
  async (): Promise<string> => {
    for (
      let attempt = 0;
      attempt < 8;
      attempt++
    ) {
      const candidate = generateGiftId();

      const snapshot = await getDoc(
        doc(db, 'gifts', candidate)
      );

      if (!snapshot.exists()) {
        return candidate;
      }
    }

    throw new Error(
      'Không thể tạo mã quà tặng. Hãy thử lại.'
    );
  };

export const getMySavedGiftIds =
  (): string[] => {
    try {
      const raw = localStorage.getItem(
        SAVED_KEYS_STORAGE
      );

      return raw
        ? JSON.parse(raw)
        : [];
    } catch {
      return [];
    }
  };

export const recordMySavedGiftId = (
  id: string
) => {
  try {
    const current =
      getMySavedGiftIds();

    if (!current.includes(id)) {
      current.unshift(id);

      localStorage.setItem(
        SAVED_KEYS_STORAGE,
        JSON.stringify(
          current.slice(0, 20)
        )
      );
    }
  } catch {
    // Không chặn publish nếu localStorage lỗi.
  }
};

const saveGift = async (
  config: LoveConfig,
  status: GiftStatus,
  customId?: string
): Promise<SaveGiftResult> => {
  const creatorId =
    await getAuthenticatedCreatorId();

  const giftId =
    customId ||
    (await getAvailableGiftId());

  const giftRef = doc(
    db,
    'gifts',
    giftId
  );

  const existing =
    await getDoc(giftRef);

  if (
    existing.exists() &&
    existing.data().creatorId !== creatorId
  ) {
    throw new Error(
      'Bạn không có quyền sửa món quà này.'
    );
  }

  const now = serverTimestamp();

  const docData: Record<
    string,
    unknown
  > = {
    id: giftId,
    config,
    senderName:
      config.couple.senderName ||
      'Anonymous',
    receiverName:
      config.couple.receiverName ||
      'Someone Special',
    creatorId,
    status,
    isPublished:
      status === 'published',
    updatedAt: now,
  };

  if (!existing.exists()) {
    docData.createdAt = now;
    docData.viewCount = 0;
  }

  if (status === 'published') {
    docData.publishedAt = now;
  }

  await setDoc(
    giftRef,
    docData,
    {
      merge: true,
    }
  );

  recordMySavedGiftId(giftId);

  return {
    id: giftId,
    url: buildShareUrl(giftId),
    status,
  };
};

export const saveGiftDraftToFirestore =
  async (
    config: LoveConfig,
    customId?: string
  ) => {
    return saveGift(
      config,
      'draft',
      customId
    );
  };

export const publishGiftToFirestore =
  async (
    config: LoveConfig,
    customId?: string
  ) => {
    return saveGift(
      config,
      'published',
      customId
    );
  };

/**
 * Alias để code cũ vẫn chạy nếu còn nơi nào import tên cũ.
 * Từ giờ thao tác "Chia sẻ" được hiểu là publish.
 */
export const saveGiftToFirestore =
  publishGiftToFirestore;

export const fetchGiftFromFirestore =
  async (
    giftId: string
  ): Promise<SavedGiftDocument | null> => {
    try {
      const giftRef = doc(
        db,
        'gifts',
        giftId
      );

      const snapshot =
        await getDoc(giftRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data =
        snapshot.data() as SavedGiftDocument;

      const isPublished =
        data.status === 'published' ||
        data.isPublished === true;

      if (!isPublished) {
        return null;
      }

      return data;
    } catch (error) {
      console.error(
        'Error fetching gift from Firestore:',
        error
      );

      return null;
    }
  };