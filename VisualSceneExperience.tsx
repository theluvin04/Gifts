import React, {
  Component,
  type ErrorInfo,
  type ReactNode,
  useMemo,
} from 'react';

import type {
  SceneCanvasDefinition,
} from './elementTypes';

import {
  SceneCanvas,
} from './SceneCanvas';

import {
  SceneTransition,
} from './SceneTransition';

import {
  useSceneController,
} from './useSceneController';

interface SceneErrorBoundaryProps {
  children: ReactNode;
  sceneId: string;
  onReset?: () => void;
}

interface SceneErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class SceneErrorBoundary extends React.Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
  override state: SceneErrorBoundaryState = { hasError: false };

  constructor(props: SceneErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): SceneErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught in SceneErrorBoundary:', error, errorInfo);
  }

  componentDidUpdate(prevProps: SceneErrorBoundaryProps) {
    if (prevProps.sceneId !== this.props.sceneId && this.state.hasError) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[320px] w-full flex-col items-center justify-center p-6 text-center">
          <p className="text-sm font-bold text-rose-600">Đã xảy ra lỗi khi hiển thị trang</p>
          <p className="mt-1 text-xs text-black/50">{this.state.error?.message || 'Lỗi không xác định'}</p>
          {this.props.onReset && (
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                this.props.onReset?.();
              }}
              className="mt-4 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-black/80"
            >
              Quay về trang đầu
            </button>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

interface VisualSceneExperienceProps {
  scenes:
    SceneCanvasDefinition[];

  initialSceneId:
    string;

  className?: string;

  mobileOverride?:
    boolean;

  onSceneChange?: (
    sceneId: string
  ) => void;
}

export const VisualSceneExperience:
React.FC<
  VisualSceneExperienceProps
> = ({
  scenes = [],
  initialSceneId,
  className = '',
  mobileOverride,
  onSceneChange,
}) => {
  const rootRef =
    React.useRef<HTMLDivElement>(null);
  const validInitial =
    scenes.some(
      (scene) =>
        scene.id ===
        initialSceneId
    )
      ? initialSceneId
      : scenes[0]?.id ||
        '';

  const controller =
    useSceneController<
      string
    >(
      validInitial
    );

  const sceneMap =
    useMemo(
      () =>
        new Map(
          scenes.map(
            (scene) => [
              scene.id,
              scene,
            ]
          )
        ),
      [
        scenes,
      ]
    );

  // Sync with initialSceneId if changed from parent
  React.useEffect(() => {
    if (validInitial && validInitial !== controller.scene && !controller.history.includes(validInitial)) {
      controller.reset(validInitial);
    }
  }, [validInitial]);

  const resolveTargetSceneId = (target: string | undefined): string | null => {
    if (!target || typeof target !== 'string') return null;
    const trimmed = target.trim();
    if (!trimmed) return null;

    // 1. Direct exact ID match
    if (sceneMap.has(trimmed)) return trimmed;

    // 2. Case-insensitive ID match
    const lower = trimmed.toLowerCase();
    const idMatch = scenes.find((s) => s.id && s.id.toLowerCase() === lower);
    if (idMatch) return idMatch.id;

    // 3. Match by scene title (e.g., "Trang 6", "Scene 6", "Success", "Intro")
    const titleMatch = scenes.find(
      (s) => s.title && s.title.trim().toLowerCase() === lower
    );
    if (titleMatch) return titleMatch.id;

    // 4. Match by relative navigation keywords
    const currentIndex = scenes.findIndex((s) => s.id === controller.scene);
    if (lower === 'next' || lower === 'next-scene' || lower === 'sau' || lower === 'tiếp') {
      const nextIdx = currentIndex >= 0 && currentIndex < scenes.length - 1 ? currentIndex + 1 : 0;
      return scenes[nextIdx]?.id || null;
    }
    if (lower === 'prev' || lower === 'previous' || lower === 'back' || lower === 'quay-lại' || lower === 'quay lại' || lower === 'trước') {
      const prevIdx = currentIndex > 0 ? currentIndex - 1 : Math.max(0, scenes.length - 1);
      return scenes[prevIdx]?.id || null;
    }
    if (lower === 'first' || lower === 'đầu') return scenes[0]?.id || null;
    if (lower === 'last' || lower === 'cuối') return scenes[scenes.length - 1]?.id || null;

    // 5. Match by numeric index (e.g. "6", "scene-6", "trang-6", "page-6", "scene 6", "trang 6", "#6")
    const numMatch = trimmed.match(/\d+/);
    if (numMatch) {
      const index1Based = parseInt(numMatch[0], 10);
      if (index1Based >= 1 && index1Based <= scenes.length) {
        return scenes[index1Based - 1].id;
      }
    }

    // 6. Partial match on ID or Title
    const partialMatch = scenes.find(
      (s) =>
        (s.id && s.id.toLowerCase().includes(lower)) ||
        (s.title && s.title.toLowerCase().includes(lower))
    );
    if (partialMatch) return partialMatch.id;

    return null;
  };

  const currentScene =
    sceneMap.get(
      controller.scene
    ) ||
    scenes[0];

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !currentScene) return;

    let parent = root.parentElement;

    while (parent) {
      const overflowY =
        window.getComputedStyle(parent).overflowY;

      if (overflowY === 'auto' || overflowY === 'scroll') {
        parent.scrollTop = 0;
        return;
      }

      parent = parent.parentElement;
    }

    window.scrollTo({top: 0, left: 0, behavior: 'auto'});
  }, [currentScene?.id]);

  if (
    !currentScene
  ) {
    return (
      <div
        className={[
          'flex min-h-[320px] items-center justify-center bg-slate-50 px-6 text-center text-sm text-slate-400',
          className,
        ].join(' ')}
      >
        Chưa có scene để preview.
      </div>
    );
  }

  const goToScene = (
    sceneId: string,
    options?: {
      replace?: boolean;
    }
  ) => {
    const resolvedId = resolveTargetSceneId(sceneId);

    if (!resolvedId) {
      console.warn(
        'Scene target not found for:',
        sceneId,
        'Available scenes:',
        scenes.map((s) => ({ id: s.id, title: s.title }))
      );
      // Fallback: If not found, try next scene in sequence
      const currentIndex = scenes.findIndex((s) => s.id === controller.scene);
      if (currentIndex >= 0 && currentIndex < scenes.length - 1) {
        const nextScene = scenes[currentIndex + 1];
        controller.goToScene(nextScene.id, options);
        onSceneChange?.(nextScene.id);
      }
      return;
    }

    controller.goToScene(
      resolvedId,
      options
    );

    onSceneChange?.(
      resolvedId
    );
  };

  const resetScene = (
    sceneId?: string
  ) => {
    const target =
      (sceneId && resolveTargetSceneId(sceneId)) || validInitial;

    controller.reset(
      target
    );

    onSceneChange?.(
      target
    );
  };

  const backScene =
    () => {
      if (
        controller.canGoBack
      ) {
        const previous =
          controller
            .previousScene;

        controller.back();

        if (
          previous
        ) {
          onSceneChange?.(
            previous
          );
        }
        return;
      }

      // Fallback when canGoBack is false (e.g. opened directly without history)
      const currentIndex = scenes.findIndex((s) => s.id === controller.scene);
      if (currentIndex > 0) {
        const prevScene = scenes[currentIndex - 1];
        controller.goToScene(prevScene.id);
        onSceneChange?.(prevScene.id);
      } else if (scenes.length > 1) {
        // If on the first scene, go to the last scene
        const lastScene = scenes[scenes.length - 1];
        controller.goToScene(lastScene.id);
        onSceneChange?.(lastScene.id);
      }
    };

  return (
    <div
      ref={rootRef}
      className={[
        'w-full min-w-0',
        className,
      ].join(' ')}
    >
      <SceneErrorBoundary
        sceneId={currentScene.id}
        onReset={() => resetScene()}
      >
        <SceneTransition
          sceneKey={
            currentScene.id
          }
          transition={
            currentScene
              .transition
          }
        >
          <SceneCanvas
            scene={
              currentScene
            }
            actionContext={{
              goToScene,
              backScene,
              resetScene,
            }}
            mobileOverride={
              mobileOverride
            }
          />
        </SceneTransition>
      </SceneErrorBoundary>
    </div>
  );
};
