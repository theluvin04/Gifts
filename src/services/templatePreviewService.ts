import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import {
  auth,
  db,
  waitForAuthReady,
} from '../config/firebase';

import type {
  TemplateVisualEditorConfig,
} from '../templates/visualEditor';

const PREVIEW_TTL_MS =
  24 * 60 * 60 * 1000;

const PREVIEW_ID_PREFIX =
  'dearly:template-preview-id:';

const ALPHABET =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

export interface TemplatePreviewDocument {
  id: string;
  templateId: string;
  templateName: string;
  config: TemplateVisualEditorConfig;
  expiresAtMs: number;
}

const generatePreviewId = (
  length = 24
) => {
  const bytes =
    new Uint8Array(length);

  crypto.getRandomValues(bytes);

  return Array.from(
    bytes,
    (byte) =>
      ALPHABET[
        byte % ALPHABET.length
      ]
  ).join('');
};

const getPreviewId = (
  templateId: string
) => {
  const key =
    `${PREVIEW_ID_PREFIX}${templateId}`;

  try {
    const current =
      localStorage.getItem(key);

    if (
      current &&
      /^[A-Za-z0-9_-]{16,64}$/.test(current)
    ) {
      return current;
    }

    const created =
      generatePreviewId();

    localStorage.setItem(
      key,
      created
    );

    return created;
  } catch {
    return generatePreviewId();
  }
};

export const createTemplatePreviewLink =
  async ({
    templateId,
    templateName,
    config,
  }: {
    templateId: string;
    templateName: string;
    config:
      TemplateVisualEditorConfig;
  }) => {
    await waitForAuthReady();

    const user =
      auth.currentUser;

    if (!user || user.isAnonymous) {
      throw new Error(
        'Phiên Admin đã hết hạn. Hãy đăng nhập lại.'
      );
    }

    const previewId =
      getPreviewId(templateId);

    const expiresAtMs =
      Date.now() + PREVIEW_TTL_MS;

    const cleanConfig =
      JSON.parse(
        JSON.stringify(config)
      ) as
        TemplateVisualEditorConfig;

    try {
      await setDoc(
        doc(
          db,
          'templatePreviews',
          previewId
        ),
        {
          id: previewId,
          templateId,
          templateName,
          config: cleanConfig,
          ownerId: user.uid,
          createdAt:
            serverTimestamp(),
          updatedAt:
            serverTimestamp(),
          expiresAtMs,
        },
        {
          merge: true,
        }
      );
    } catch (error: any) {
      if (
        error?.code ===
          'permission-denied' ||
        error?.code ===
          'firestore/permission-denied'
      ) {
        throw new Error(
          'Firestore chưa cho phép tạo link test. Cần cập nhật firestore.rules trong gói sửa.'
        );
      }

      throw error;
    }

    return {
      id: previewId,
      url:
        `${window.location.origin}/preview/${previewId}`,
      expiresAtMs,
    };
  };

export const fetchTemplatePreview =
  async (
    previewId: string
  ):
  Promise<TemplatePreviewDocument | null> => {
    const snapshot =
      await getDoc(
        doc(
          db,
          'templatePreviews',
          previewId
        )
      );

    if (!snapshot.exists()) {
      return null;
    }

    const data =
      snapshot.data() as
        TemplatePreviewDocument;

    if (
      !data.config ||
      !Array.isArray(
        data.config.scenes
      ) ||
      data.expiresAtMs <=
        Date.now()
    ) {
      return null;
    }

    return {
      ...data,
      id: snapshot.id,
    };
  };
