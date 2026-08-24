const YOUTUBE_ID_PATTERN =
  /^[a-zA-Z0-9_-]{11}$/;

export const getYouTubeVideoId = (
  value?: string
): string | null => {
  const input =
    value?.trim() || '';

  if (!input) {
    return null;
  }

  if (
    YOUTUBE_ID_PATTERN.test(
      input
    )
  ) {
    return input;
  }

  try {
    const url = new URL(input);
    const host =
      url.hostname
        .replace(/^www\./, '')
        .toLowerCase();

    if (host === 'youtu.be') {
      const id =
        url.pathname
          .split('/')
          .filter(Boolean)[0];

      return id &&
        YOUTUBE_ID_PATTERN.test(id)
        ? id
        : null;
    }

    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'music.youtube.com'
    ) {
      const queryId =
        url.searchParams.get('v');

      if (
        queryId &&
        YOUTUBE_ID_PATTERN.test(
          queryId
        )
      ) {
        return queryId;
      }

      const parts =
        url.pathname
          .split('/')
          .filter(Boolean);

      const markerIndex =
        parts.findIndex(
          (part) =>
            part === 'embed' ||
            part === 'shorts' ||
            part === 'live'
        );

      const pathId =
        markerIndex >= 0
          ? parts[
              markerIndex + 1
            ]
          : null;

      return pathId &&
        YOUTUBE_ID_PATTERN.test(
          pathId
        )
        ? pathId
        : null;
    }
  } catch {
    return null;
  }

  return null;
};

export const getYouTubeEmbedUrl = (
  value?: string
) => {
  const id =
    getYouTubeVideoId(value);

  if (!id) {
    return null;
  }

  return (
    `https://www.youtube-nocookie.com/embed/${id}` +
    '?rel=0&modestbranding=1'
  );
};

export const getYouTubeThumbnailUrl = (
  value?: string
) => {
  const id =
    getYouTubeVideoId(value);

  if (!id) {
    return null;
  }

  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
};
