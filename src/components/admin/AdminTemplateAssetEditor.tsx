import React, {
  useMemo,
} from 'react';

import type {
  SceneCanvasDefinition,
  SceneElement,
} from '../../engine';

import type {
  TemplateVisualEditorConfig,
} from '../../templates/visualEditor';

import {
  encodeCustomerSlot,
  getCustomerSlot,
} from '../../templates/customerSlots';

interface Props {
  visualEditor:
    TemplateVisualEditorConfig;

  onChange: (
    visualEditor:
      TemplateVisualEditorConfig
  ) => void;
}

type VisualResource = {
  sceneId: string;
  sceneTitle: string;
  element: SceneElement;
};

const getElementLabel = (
  element: SceneElement
) => {
  if (element.name?.trim()) {
    return element.name.trim();
  }

  if (
    element.type === 'image' ||
    element.type === 'decor'
  ) {
    return element.alt?.trim() ||
      (element.type === 'decor'
        ? 'Trang trí'
        : 'Ảnh');
  }

  if (
    element.type ===
    'photo-frame'
  ) {
    return element.caption?.trim() ||
      'Khung ảnh';
  }

  if (element.type === 'text') {
    return element.text.trim().slice(0, 56) ||
      'Chữ';
  }

  if (element.type === 'button') {
    return element.label.trim().slice(0, 56) ||
      'Nút';
  }

  return element.id;
};

const getImageUrl = (
  element: SceneElement
) => {
  if (
    element.type === 'image' ||
    element.type === 'decor' ||
    element.type === 'photo-frame'
  ) {
    return element.src || '';
  }

  return '';
};

const getTypeLabel = (
  element: SceneElement
) => {
  switch (element.type) {
    case 'image':
      return 'Ảnh';
    case 'decor':
      return 'Trang trí';
    case 'photo-frame':
      return 'Khung ảnh';
    case 'text':
      return 'Chữ';
    case 'button':
      return 'Nút';
    default:
      return 'Layer';
  }
};

export const AdminTemplateAssetEditor:
React.FC<Props> = ({
  visualEditor,
  onChange,
}) => {
  const resources =
    useMemo<VisualResource[]>(
      () =>
        visualEditor.scenes.flatMap(
          (scene) =>
            scene.elements
              .filter(
                (element) =>
                  element.type === 'image' ||
                  element.type === 'decor' ||
                  element.type === 'photo-frame' ||
                  element.type === 'text' ||
                  element.type === 'button'
              )
              .map((element) => ({
                sceneId: scene.id,
                sceneTitle:
                  scene.title ||
                  scene.id,
                element,
              }))
        ),
      [visualEditor]
    );

  const imageResources =
    resources.filter(
      ({ element }) =>
        element.type === 'image' ||
        element.type === 'decor' ||
        element.type === 'photo-frame'
    );

  const textResources =
    resources.filter(
      ({ element }) =>
        element.type === 'text' ||
        element.type === 'button'
    );

  const backgrounds =
    visualEditor.scenes.filter(
      (scene) =>
        Boolean(
          scene.background?.imageUrl
        )
    );

  const customerSlots =
    resources.filter(
      ({ element }) =>
        getCustomerSlot(element)
          .kind !== 'none'
    );

  const updateElement = (
    sceneId: string,
    elementId: string,
    updater: (
      element: SceneElement
    ) => SceneElement
  ) => {
    onChange({
      ...visualEditor,
      scenes:
        visualEditor.scenes.map(
          (scene) =>
            scene.id === sceneId
              ? {
                  ...scene,
                  elements:
                    scene.elements.map(
                      (element) =>
                        element.id ===
                        elementId
                          ? updater(
                              element
                            )
                          : element
                    ),
                }
              : scene
        ),
    });
  };

  const updateScene = (
    sceneId: string,
    updater: (
      scene:
        SceneCanvasDefinition
    ) => SceneCanvasDefinition
  ) => {
    onChange({
      ...visualEditor,
      scenes:
        visualEditor.scenes.map(
          (scene) =>
            scene.id === sceneId
              ? updater(scene)
              : scene
        ),
    });
  };

  return (
    <div>
      <div className="rounded-[14px] border border-[#cf5068]/10 bg-[#fff6f8] px-4 py-3">
        <p className="text-[11px] font-black text-[#9f4054]">
          Tài nguyên của đúng template này
        </p>
        <p className="mt-1 text-[10px] leading-5 text-[#9f4054]/70">
          Danh sách bên dưới lấy trực tiếp từ các layer trong Thiết kế trang. Không còn dùng bộ asset Love cũ. Đánh dấu “Khách thay” ở đây thì màn cá nhân hoá của khách sẽ hiện đúng trường đó.
        </p>

        <div className="mt-3 flex flex-wrap gap-2 text-[9px] font-black">
          <span className="rounded-full bg-white px-2.5 py-1.5 text-black/45">
            {imageResources.length} ảnh
          </span>
          <span className="rounded-full bg-white px-2.5 py-1.5 text-black/45">
            {textResources.length} chữ
          </span>
          <span className="rounded-full bg-[#191919] px-2.5 py-1.5 text-white">
            {customerSlots.length} khách được thay
          </span>
        </div>
      </div>

      {backgrounds.length > 0 && (
        <ResourceSection
          title="Ảnh nền"
          description="Ảnh nền đang được dùng thực tế trong từng trang."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {backgrounds.map(
              (scene) => (
                <BackgroundCard
                  key={scene.id}
                  scene={scene}
                  onChange={(imageUrl) =>
                    updateScene(
                      scene.id,
                      (current) => ({
                        ...current,
                        background: {
                          ...current.background,
                          imageUrl:
                            imageUrl ||
                            undefined,
                        },
                      })
                    )
                  }
                />
              )
            )}
          </div>
        </ResourceSection>
      )}

      <ResourceSection
        title="Ảnh & trang trí trong mẫu"
        description="Mỗi card tương ứng đúng một layer đang xuất hiện trên canvas."
      >
        {imageResources.length === 0 ? (
          <EmptyState text="Template chưa có layer ảnh/trang trí." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {imageResources.map(
              ({
                sceneId,
                sceneTitle,
                element,
              }) => (
                <ImageResourceCard
                  key={`${sceneId}-${element.id}`}
                  sceneTitle={sceneTitle}
                  element={element}
                  onChange={(next) =>
                    updateElement(
                      sceneId,
                      element.id,
                      () => next
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </ResourceSection>

      <ResourceSection
        title="Chữ khách có thể sửa"
        description="Bật đúng những dòng khách cần nhập. Chữ trang trí hoặc chữ cố định cứ để khóa."
      >
        {textResources.length === 0 ? (
          <EmptyState text="Template chưa có layer chữ/nút." />
        ) : (
          <div className="space-y-2">
            {textResources.map(
              ({
                sceneId,
                sceneTitle,
                element,
              }) => (
                <TextResourceRow
                  key={`${sceneId}-${element.id}`}
                  sceneTitle={sceneTitle}
                  element={element}
                  onChange={(next) =>
                    updateElement(
                      sceneId,
                      element.id,
                      () => next
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </ResourceSection>
    </div>
  );
};

const ResourceSection:
React.FC<{
  title: string;
  description: string;
  children:
    React.ReactNode;
}> = ({
  title,
  description,
  children,
}) => (
  <section className="mt-4 rounded-[16px] border border-black/8 bg-white p-3 sm:p-4">
    <div className="mb-3">
      <h3 className="text-sm font-black text-black/75">
        {title}
      </h3>
      <p className="mt-1 text-[9px] leading-4 text-black/35">
        {description}
      </p>
    </div>
    {children}
  </section>
);

const EmptyState:
React.FC<{
  text: string;
}> = ({ text }) => (
  <div className="rounded-[11px] border border-dashed border-black/10 bg-[#faf9f8] p-4 text-center text-[10px] font-bold text-black/30">
    {text}
  </div>
);

const BackgroundCard:
React.FC<{
  scene: SceneCanvasDefinition;
  onChange: (
    imageUrl: string
  ) => void;
}> = ({
  scene,
  onChange,
}) => {
  const url =
    scene.background?.imageUrl ||
    '';

  return (
    <div className="rounded-[12px] border border-black/7 bg-[#faf9f8] p-3">
      <div className="aspect-[16/10] overflow-hidden rounded-[9px] bg-white">
        {url ? (
          <img
            src={url}
            alt=""
            className="h-full w-full object-contain"
          />
        ) : null}
      </div>
      <p className="mt-2 text-[10px] font-black text-black/65">
        {scene.title || scene.id}
      </p>
      <input
        value={url}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder="/images/..."
        className="mt-2 w-full rounded-[8px] border border-black/7 bg-white px-2.5 py-2 font-mono text-[9px] outline-none focus:border-[#cf5068]/40"
      />
    </div>
  );
};

const ImageResourceCard:
React.FC<{
  sceneTitle: string;
  element: SceneElement;
  onChange: (
    next: SceneElement
  ) => void;
}> = ({
  sceneTitle,
  element,
  onChange,
}) => {
  const slot =
    getCustomerSlot(element);

  const url =
    getImageUrl(element);

  const canCustomerReplace =
    element.type === 'image' ||
    element.type ===
      'photo-frame';

  const setUrl = (
    nextUrl: string
  ) => {
    if (
      element.type === 'image' ||
      element.type === 'decor' ||
      element.type === 'photo-frame'
    ) {
      onChange({
        ...element,
        src: nextUrl,
      } as SceneElement);
    }
  };

  const setCustomerReplace = (
    enabled: boolean
  ) => {
    onChange(
      encodeCustomerSlot(
        element,
        enabled
          ? 'image'
          : 'none',
        slot.label ||
          getElementLabel(
            element
          )
      )
    );
  };

  const setCustomerLabel = (
    label: string
  ) => {
    onChange(
      encodeCustomerSlot(
        element,
        'image',
        label
      )
    );
  };

  return (
    <article className="rounded-[12px] border border-black/7 bg-[#faf9f8] p-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[9px] bg-white">
        {url ? (
          <img
            src={url}
            alt=""
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[9px] font-bold text-black/25">
            Chưa có ảnh
          </div>
        )}

        <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[7px] font-black uppercase text-white">
          {getTypeLabel(
            element
          )}
        </span>
      </div>

      <div className="mt-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-black text-black/70">
            {getElementLabel(
              element
            )}
          </p>
          <p className="mt-0.5 truncate text-[8px] text-black/30">
            {sceneTitle}
          </p>
        </div>

        {canCustomerReplace && (
          <label className="flex shrink-0 items-center gap-1.5 text-[8px] font-black text-black/45">
            <input
              type="checkbox"
              checked={
                slot.kind === 'image'
              }
              onChange={(event) =>
                setCustomerReplace(
                  event.target.checked
                )
              }
              className="h-3.5 w-3.5 accent-[#b83e57]"
            />
            Khách thay
          </label>
        )}
      </div>

      <input
        value={url}
        onChange={(event) =>
          setUrl(
            event.target.value
          )
        }
        placeholder="/images/..."
        className="mt-2 w-full rounded-[8px] border border-black/7 bg-white px-2.5 py-2 font-mono text-[9px] outline-none focus:border-[#cf5068]/40"
      />

      {canCustomerReplace &&
      slot.kind === 'image' && (
        <input
          value={
            slot.label ||
            getElementLabel(
              element
            )
          }
          onChange={(event) =>
            setCustomerLabel(
              event.target.value
            )
          }
          placeholder="Tên trường khách thấy"
          className="mt-2 w-full rounded-[8px] border border-[#cf5068]/15 bg-[#fff7f9] px-2.5 py-2 text-[9px] font-bold text-[#9f4054] outline-none focus:border-[#cf5068]/40"
        />
      )}

      {element.type === 'decor' && (
        <p className="mt-2 text-[8px] leading-4 text-black/28">
          Trang trí được khóa theo mẫu, khách không thay.
        </p>
      )}
    </article>
  );
};

const TextResourceRow:
React.FC<{
  sceneTitle: string;
  element: SceneElement;
  onChange: (
    next: SceneElement
  ) => void;
}> = ({
  sceneTitle,
  element,
  onChange,
}) => {
  const slot =
    getCustomerSlot(element);

  const canEdit =
    element.type === 'text' ||
    element.type === 'button';

  if (!canEdit) {
    return null;
  }

  const label =
    getElementLabel(element);

  const setCustomerReplace = (
    enabled: boolean
  ) => {
    onChange(
      encodeCustomerSlot(
        element,
        enabled
          ? 'text'
          : 'none',
        slot.label || label
      )
    );
  };

  const setCustomerLabel = (
    nextLabel: string
  ) => {
    onChange(
      encodeCustomerSlot(
        element,
        'text',
        nextLabel
      )
    );
  };

  return (
    <div className="rounded-[11px] border border-black/7 bg-[#faf9f8] p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-black text-black/65">
            {label}
          </p>
          <p className="mt-0.5 text-[8px] text-black/28">
            {sceneTitle} · {getTypeLabel(element)}
          </p>
        </div>

        <label className="flex shrink-0 items-center gap-1.5 text-[8px] font-black text-black/45">
          <input
            type="checkbox"
            checked={
              slot.kind === 'text'
            }
            onChange={(event) =>
              setCustomerReplace(
                event.target.checked
              )
            }
            className="h-3.5 w-3.5 accent-[#b83e57]"
          />
          Khách thay chữ
        </label>
      </div>

      {slot.kind === 'text' && (
        <input
          value={
            slot.label || label
          }
          onChange={(event) =>
            setCustomerLabel(
              event.target.value
            )
          }
          placeholder="Tên trường khách thấy"
          className="mt-2 w-full rounded-[8px] border border-[#cf5068]/15 bg-white px-2.5 py-2 text-[9px] font-bold text-[#9f4054] outline-none focus:border-[#cf5068]/40"
        />
      )}
    </div>
  );
};
