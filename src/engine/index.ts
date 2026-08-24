export type {
  AnimationConfig,
  AnimationEasing,
  AnimationMotionDefinition,
  AnimationPreset,
  AnimationTrigger,
  StaggerConfig,
} from './animation/types';

export {
  DEFAULT_ANIMATION_CONFIG,
  DEFAULT_STAGGER_CONFIG,
} from './animation/types';

export {
  getAnimationMotionDefinition,
  getStaggerDelayMs,
  normalizeAnimationConfig,
} from './animation/presets';

export {
  AnimatedElement,
} from './animation/AnimatedElement';

export {
  AnimatedGroup,
} from './animation/AnimatedGroup';

export type {
  GoToSceneOptions,
  SceneDefinition,
  SceneTransitionConfig,
  SceneTransitionEasing,
  SceneTransitionPreset,
} from './scene/types';

export {
  DEFAULT_SCENE_TRANSITION,
} from './scene/types';

export {
  SceneTransition,
} from './scene/SceneTransition';

export {
  useSceneController,
} from './scene/useSceneController';

export type {
  SceneButtonElement,
  SceneButtonStyle,
  SceneCanvasBackground,
  SceneCanvasDefinition,
  SceneCustomElement,
  SceneElement,
  SceneElementAction,
  SceneElementAnchor,
  SceneElementFrame,
  SceneElementType,
  SceneImageElement,
  SceneImageStyle,
  SceneShapeElement,
  SceneShapeKind,
  SceneShapeStyle,
  SceneTextElement,
  SceneTextStyle,
} from './scene/elementTypes';

export type {
  SceneActionContext,
} from './scene/actions';

export {
  executeSceneAction,
  executeSceneActions,
} from './scene/actions';

export {
  useSceneElementRuntime,
} from './scene/useSceneElementRuntime';

export {
  SceneElementView,
} from './scene/SceneElementView';

export {
  SceneCanvas,
} from './scene/SceneCanvas';

export {
  VisualSceneExperience,
} from './scene/VisualSceneExperience';
