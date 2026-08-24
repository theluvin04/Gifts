import type {
  SceneElementAction,
} from './elementTypes';

export interface SceneActionContext {
  goToScene: (
    sceneId: string,
    options?: {
      replace?: boolean;
    }
  ) => void;

  backScene: () => void;

  resetScene: (
    sceneId?: string
  ) => void;

  setElementVisible: (
    elementId: string,
    visible: boolean
  ) => void;

  toggleElement: (
    elementId: string
  ) => void;

  replayElementAnimation: (
    elementId: string
  ) => void;
}

const isSafeExternalUrl = (
  value: string
) => {
  try {
    const url =
      new URL(
        value,
        window.location.origin
      );

    return (
      url.protocol ===
        'http:' ||
      url.protocol ===
        'https:'
    );
  } catch {
    return false;
  }
};

export const executeSceneAction =
  (
    action:
      SceneElementAction,
    context:
      SceneActionContext
  ) => {
    switch (
      action.type
    ) {
      case 'go-to-scene':
        context.goToScene(
          action.sceneId,
          {
            replace:
              action.replace,
          }
        );
        return;

      case 'back-scene':
        context.backScene();
        return;

      case 'reset-scene':
        context.resetScene(
          action.sceneId
        );
        return;

      case 'show-element':
        context.setElementVisible(
          action.elementId,
          true
        );
        return;

      case 'hide-element':
        context.setElementVisible(
          action.elementId,
          false
        );
        return;

      case 'toggle-element':
        context.toggleElement(
          action.elementId
        );
        return;

      case 'replay-animation':
        context.replayElementAnimation(
          action.elementId
        );
        return;

      case 'open-url':
        if (
          !isSafeExternalUrl(
            action.url
          )
        ) {
          console.warn(
            'Blocked unsafe scene URL:',
            action.url
          );
          return;
        }

        if (
          action.newTab ===
          false
        ) {
          window.location.href =
            action.url;
          return;
        }

        window.open(
          action.url,
          '_blank',
          'noopener,noreferrer'
        );
        return;

      default: {
        const exhaustive:
          never =
            action;

        return exhaustive;
      }
    }
  };

export const executeSceneActions =
  (
    actions:
      SceneElementAction[] |
      undefined,
    context:
      SceneActionContext
  ) => {
    if (
      !actions ||
      actions.length ===
        0
    ) {
      return;
    }

    actions.forEach(
      (action) =>
        executeSceneAction(
          action,
          context
        )
    );
  };
