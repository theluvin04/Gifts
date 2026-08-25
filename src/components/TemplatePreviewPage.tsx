import React, {
  useEffect,
  useState,
} from 'react';

import {
  VisualSceneExperience,
} from '../engine';

import {
  fetchTemplatePreview,
  type TemplatePreviewDocument,
} from '../services/templatePreviewService';

interface Props {
  previewId: string;
}

export const TemplatePreviewPage:
React.FC<Props> = ({
  previewId,
}) => {
  const [preview, setPreview] =
    useState<TemplatePreviewDocument | null>(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    void fetchTemplatePreview(
      previewId
    )
      .then((result) => {
        if (cancelled) return;

        if (!result) {
          setError(
            'Link test không tồn tại hoặc đã hết hạn.'
          );
          return;
        }

        setPreview(result);
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            'Không thể tải bản test.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [previewId]);

  if (loading) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-white text-sm font-bold text-black/35">
        Đang mở bản test...
      </main>
    );
  }

  if (error || !preview) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#fffaf8] p-6 text-center">
        <div>
          <h1 className="text-xl font-black">
            Không mở được bản test
          </h1>
          <p className="mt-2 text-sm text-black/45">
            {error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100svh] w-full overflow-x-hidden bg-white">
      <VisualSceneExperience
        scenes={
          preview.config.scenes
        }
        initialSceneId={
          preview.config.initialSceneId
        }
      />
    </main>
  );
};
