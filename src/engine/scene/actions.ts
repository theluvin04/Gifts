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
      SceneElementAction | any,
    context:
      SceneActionContext
  ) => {
    if (!action || typeof action !== 'object') {
      return;
    }

    const type = String(action.type || '').toLowerCase().replace(/_/g, '-');

    switch (type) {
      case 'go-to-scene':
      case 'goto-scene':
      case 'change-scene':
      case 'next-scene':
        context.goToScene(
          action.sceneId || (type === 'next-scene' ? 'next' : ''),
          {
            replace:
              action.replace,
          }
        );
        return;

      case 'back-scene':
      case 'back':
      case 'prev-scene':
      case 'previous-scene':
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
        return;
      }
    }
  };

export const executeSceneActions =
  (
    actions:
      SceneElementAction[] |
      SceneElementAction |
      any,
    context:
      SceneActionContext
  ) => {
    if (
      !actions
    ) {
      return;
    }

    const list = Array.isArray(actions) ? actions : [actions];

    if (
      list.length ===
        0
    ) {
      return;
    }

    list.forEach(
      (action) =>
        executeSceneAction(
          action,
          context
        )
    );
  };
