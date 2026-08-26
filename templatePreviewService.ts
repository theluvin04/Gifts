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
}

const PREVIEW_CACHE_PREFIX =
  'dearly:template-preview:';

const writePreviewCache = (
  preview:
    TemplatePreviewDocument
) => {
  try {
    window.localStorage.setItem(
      PREVIEW_CACHE_PREFIX +
        preview.id,
      JSON.stringify(preview)
    );
  } catch {
    // Firestore remains the cross-device source when storage is unavailable.
  }
};

const readPreviewCache = (
  previewId: string
): TemplatePreviewDocument | null => {
  try {
    const raw =
      window.localStorage.getItem(
        PREVIEW_CACHE_PREFIX +
          previewId
      );

    if (!raw) return null;

    const preview =
      JSON.parse(raw) as
        TemplatePreviewDocument;

    return preview?.id ===
        previewId &&
      Array.isArray(
        preview.config?.scenes
      )
      ? preview
      : null;
  } catch {
    return null;
  }
};

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

const getTemplateIdFromPreviewId = (
  previewId: string
) => {
  const prefix =
    'template-test-';

  if (
    !previewId.startsWith(
      prefix
    )
  ) {
    return '';
  }

  const value =
    previewId.slice(
      prefix.length
    );
  const hashSeparator =
    value.lastIndexOf('-');

  return hashSeparator > 0
    ? value.slice(
        0,
        hashSeparator
      )
    : '';
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

    const cachedPreview:
      TemplatePreviewDocument = {
        id: previewId,
        templateId,
        templateName,
        config: cleanConfig,
      };

    try {
      await setDoc(
        doc(
          db,
          'templates',
          templateId
        ),
        {
          testPreview: {
            id: previewId,
            templateId,
            templateName,
            config: cleanConfig,
            ownerId: user.uid,
            updatedAt:
              serverTimestamp(),
            active: true,
          },
        },
        {
          merge: true,
        }
      );

      // The editor preview iframe is same-origin. Cache after Firestore accepts
      // the sync so AI Studio/Vercel preview never hangs waiting for a second
      // Firestore read. External phones still read the public template document.
      writePreviewCache(
        cachedPreview
      );
    } catch (error: any) {
      if (
        error?.code ===
          'permission-denied' ||
        error?.code ===
          'firestore/permission-denied'
      ) {
        throw new Error(
          'Không đồng bộ được bản test. Hãy đăng nhập lại tài khoản Admin.'
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
    const cached =
      readPreviewCache(
        previewId
      );

    if (cached) {
      return cached;
    }

    const templateId =
      getTemplateIdFromPreviewId(
        previewId
      );

    if (!templateId) {
      return null;
    }

    const snapshot =
      await getDoc(
        doc(
          db,
          'templates',
          templateId
        )
      );

    if (!snapshot.exists()) {
      return null;
    }

    const data =
      snapshot.data() as {
        testPreview?:
          TemplatePreviewDocument & {
            active?: boolean;
          };
      };
    const preview =
      data.testPreview;

    if (
      !preview ||
      preview.id !==
        previewId ||
      !preview.config ||
      !Array.isArray(
        preview.config.scenes
      ) ||
      preview.active ===
        false
    ) {
      return null;
    }

    return {
      ...preview,
      id: previewId,
    };
  };
