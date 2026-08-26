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

export interface TemplatePreviewDocument {
  id: string;
  templateId: string;
  templateName: string;
  config: TemplateVisualEditorConfig;
  expiresAtMs?: number;
}

const getPreviewId = (
  templateId: string
) => {
  let hash = 2166136261;

  for (
    let index = 0;
    index < templateId.length;
    index += 1
  ) {
    hash ^=
      templateId.charCodeAt(
        index
      );
    hash = Math.imul(
      hash,
      16777619
    );
  }

  const safeId =
    templateId
      .replace(
        /[^A-Za-z0-9_-]/g,
        '-'
      )
      .slice(0, 36) ||
    'template';

  return `template-test-${safeId}-${(hash >>> 0).toString(36)}`;
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
          active: true,
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
      (data as any).active ===
        false
    ) {
      return null;
    }

    return {
      ...data,
      id: snapshot.id,
    };
  };
