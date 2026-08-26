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

export {
  AnimatedTextContent,
  isTextRevealPreset,
} from './animation/AnimatedTextContent';

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
  SceneImageShape,
  SceneImageStyle,
  PhotoFrameLayoutKind,
  ScenePhotoFrameElement,
  ScenePhotoFramePreset,
  ScenePhotoFrameStyle,
  SceneYoutubeElement,
  SceneYoutubeFrameTheme,
  SceneYoutubeStyle,
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
  CurvedText,
} from './scene/CurvedText';

export {
  ImageShapeRenderer,
} from './scene/ImageShapeRenderer';

export {
  IMAGE_SHAPE_PRESETS,
  getImageShapeDefinition,
} from './scene/imageShapeUtils';

export {
  PhotoFrameRenderer,
} from './scene/PhotoFrameRenderer';

export {
  PHOTO_FRAME_PRESETS,
  PHOTOBOOTH_SHADOW_PRESETS,
  getPhotoFramePreset,
  resolvePhotoFrameStyle,
} from './scene/photoFramePresets';

export type {
  PhotoFramePresetDefinition,
} from './scene/photoFramePresets';

export {
  YoutubeFrameRenderer,
} from './scene/YoutubeFrameRenderer';

export {
  YOUTUBE_FRAME_THEMES,
  extractYoutubeId,
  buildYoutubeEmbedUrl,
  getYoutubeThumbnailUrl,
} from './scene/youtubeUtils';

export type {
  YoutubeFrameThemeOption,
} from './scene/youtubeUtils';

export {
  TEXT_SHADOW_PRESETS,
  BOX_SHADOW_PRESETS,
} from './scene/shadowPresets';

export type {
  ShadowPreset,
} from './scene/shadowPresets';

export {
  SceneCanvas,
} from './scene/SceneCanvas';

export {
  VisualSceneExperience,
} from './scene/VisualSceneExperience';
