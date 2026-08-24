import React, {
  useState,
} from 'react';

import {
  Plus,
  Trash2,
} from 'lucide-react';

import type {
  TemplateAssetChoice,
  TemplateAssetLibrary,
  TemplateAssetSlot,
} from '../../templates/assets';

import {
  getEnabledAssetChoices,
} from '../../templates/assets';

interface Props {
  assets:
    TemplateAssetLibrary;
  onChange: (
    assets:
      TemplateAssetLibrary
  ) => void;
}

const makeAssetId = () => {
  if (
    crypto?.randomUUID
  ) {
    return crypto
      .randomUUID()
      .slice(0, 18);
  }

  return `asset-${Date.now()}`;
};

const updateSlot = (
  library:
    TemplateAssetLibrary,
  slotId: string,
  next:
    TemplateAssetSlot
) => ({
  ...library,
  slots: {
    ...library.slots,
    [slotId]:
      next,
  },
});

export const AdminTemplateAssetEditor:
React.FC<Props> = ({
  assets,
  onChange,
}) => {
  const groups =
    Array.from(
      new Set(
        Object.values(
          assets.slots
        ).map(
          (slot) =>
            slot.group
        )
      )
    );

  return (
    <div>
      <div className="rounded-[14px] bg-[#fff4f6] px-4 py-3 text-[11px] leading-5 text-[#9f4054]">
        Asset được khai báo trong code sẽ tự xuất hiện ở đây.
        Nếu preview báo “Thiếu file / sai path” thì path đã có nhưng file chưa nằm đúng trong{' '}
        <strong>
          public/images/template-assets/
        </strong>
        .
      </div>

      <div className="mt-4 space-y-3">
        {groups.map(
          (
            group,
            groupIndex
          ) => (
            <details
              key={group}
              open={
                groupIndex ===
                0
              }
              className="group rounded-[16px] border border-black/8 bg-white"
            >
              <summary className="cursor-pointer list-none px-4 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black">
                    {group}
                  </p>

                  <span className="text-lg text-black/25 transition group-open:rotate-45">
                    +
                  </span>
                </div>
              </summary>

              <div className="space-y-3 border-t border-black/6 p-3">
                {Object.values(
                  assets.slots
                )
                  .filter(
                    (slot) =>
                      slot.group ===
                      group
                  )
                  .map(
                    (slot) => (
                      <AssetSlot
                        key={
                          slot.id
                        }
                        slot={
                          slot
                        }
                        onChange={(
                          next
                        ) =>
                          onChange(
                            updateSlot(
                              assets,
                              slot.id,
                              next
                            )
                          )
                        }
                      />
                    )
                  )}
              </div>
            </details>
          )
        )}
      </div>
    </div>
  );
};

const AssetSlot:
React.FC<{
  slot:
    TemplateAssetSlot;
  onChange: (
    slot:
      TemplateAssetSlot
  ) => void;
}> = ({
  slot,
  onChange,
}) => {
  const enabledCount =
    getEnabledAssetChoices(
      slot
    ).length;

  const updateChoice = (
    id: string,
    patch:
      Partial<
        TemplateAssetChoice
      >
  ) => {
    const choices =
      slot.choices.map(
        (choice) =>
          choice.id === id
            ? {
                ...choice,
                ...patch,
              }
            : choice
      );

    const currentDefault =
      choices.find(
        (choice) =>
          choice.id ===
          slot.defaultAssetId
      );

    const defaultAssetId =
      currentDefault
        ?.enabled
        ? slot.defaultAssetId
        : (
            choices.find(
              (choice) =>
                choice.enabled
            ) ||
            choices[0]
          )?.id || '';

    onChange({
      ...slot,
      choices,
      defaultAssetId,
    });
  };

  const addChoice = () => {
    onChange({
      ...slot,
      choices: [
        ...slot.choices,
        {
          id:
            makeAssetId(),
          label:
            `Asset ${slot.choices.length + 1}`,
          url: '',
          enabled: true,
        },
      ],
    });
  };

  const removeChoice = (
    id: string
  ) => {
    if (
      slot.choices.length <=
      1
    ) {
      return;
    }

    const choices =
      slot.choices.filter(
        (choice) =>
          choice.id !== id
      );

    const defaultAssetId =
      slot.defaultAssetId ===
      id
        ? (
            choices.find(
              (choice) =>
                choice.enabled
            ) ||
            choices[0]
          )?.id || ''
        : slot.defaultAssetId;

    onChange({
      ...slot,
      choices,
      defaultAssetId,
    });
  };

  return (
    <section className="rounded-[14px] bg-[#faf9f8] p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black text-black/70">
            {slot.label}
          </p>

          <p className="mt-1 text-[10px] leading-4 text-black/35">
            {slot.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-[9px] font-semibold text-black/30">
            {enabledCount}{' '}
            đang bật
          </p>

          <label className="flex items-center gap-1.5 text-[10px] font-bold text-black/50">
            <input
              type="checkbox"
              checked={
                slot
                  .customerCanChoose
              }
              onChange={(
                event
              ) =>
                onChange({
                  ...slot,
                  customerCanChoose:
                    event.target
                      .checked,
                })
              }
              className="h-4 w-4 accent-[#b83e57]"
            />

            Khách được chọn
          </label>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {slot.choices.map(
          (choice) => (
            <AssetCard
              key={
                choice.id
              }
              choice={
                choice
              }
              defaultAssetId={
                slot.defaultAssetId
              }
              radioName={
                `default-${slot.id}`
              }
              canDelete={
                slot.choices
                  .length >
                1
              }
              onUpdate={(
                patch
              ) =>
                updateChoice(
                  choice.id,
                  patch
                )
              }
              onSetDefault={() =>
                onChange({
                  ...slot,
                  defaultAssetId:
                    choice.id,
                })
              }
              onDelete={() =>
                removeChoice(
                  choice.id
                )
              }
            />
          )
        )}
      </div>

      <button
        type="button"
        onClick={
          addChoice
        }
        className="mt-3 inline-flex items-center gap-1.5 rounded-[10px] border border-dashed border-[#cf5068]/35 bg-white px-3 py-2 text-[10px] font-bold text-[#b83e57]"
      >
        <Plus className="h-3.5 w-3.5" />
        Thêm asset
      </button>
    </section>
  );
};

const AssetCard:
React.FC<{
  choice:
    TemplateAssetChoice;
  defaultAssetId:
    string;
  radioName: string;
  canDelete: boolean;
  onUpdate: (
    patch:
      Partial<
        TemplateAssetChoice
      >
  ) => void;
  onSetDefault:
    () => void;
  onDelete:
    () => void;
}> = ({
  choice,
  defaultAssetId,
  radioName,
  canDelete,
  onUpdate,
  onSetDefault,
  onDelete,
}) => {
  const [
    broken,
    setBroken,
  ] = useState(false);

  return (
    <div className="rounded-[12px] border border-black/7 bg-white p-3">
      <div className="aspect-[16/10] overflow-hidden rounded-[10px] bg-[#f5f1f2]">
        {choice.url &&
        !broken ? (
          <img
            src={
              choice.url
            }
            alt=""
            onError={() =>
              setBroken(true)
            }
            onLoad={() =>
              setBroken(false)
            }
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center">
            <p className="text-[10px] font-bold text-red-400">
              {choice.url
                ? 'Thiếu file / sai path'
                : 'Chưa có URL'}
            </p>
          </div>
        )}
      </div>

      <input
        value={
          choice.label
        }
        onChange={(
          event
        ) =>
          onUpdate({
            label:
              event.target
                .value,
          })
        }
        className="mt-3 w-full border-0 border-b border-black/8 px-0 py-1.5 text-xs font-bold outline-none focus:border-[#cf5068]"
      />

      <input
        value={
          choice.url
        }
        onChange={(
          event
        ) => {
          setBroken(false);

          onUpdate({
            url:
              event.target
                .value,
          });
        }}
        placeholder="/images/..."
        className="mt-2 w-full rounded-[8px] bg-[#faf9f8] px-2.5 py-2 font-mono text-[9px] text-black/48 outline-none"
      />

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 text-[9px] font-bold text-black/40">
            <input
              type="checkbox"
              checked={
                choice.enabled
              }
              onChange={(
                event
              ) =>
                onUpdate({
                  enabled:
                    event.target
                      .checked,
                })
              }
              className="h-3.5 w-3.5 accent-[#b83e57]"
            />
            Bật
          </label>

          <label className="flex items-center gap-1 text-[9px] font-bold text-black/40">
            <input
              type="radio"
              name={
                radioName
              }
              checked={
                defaultAssetId ===
                choice.id
              }
              disabled={
                !choice.enabled
              }
              onChange={
                onSetDefault
              }
              className="h-3.5 w-3.5 accent-[#b83e57]"
            />
            Mặc định
          </label>
        </div>

        <button
          type="button"
          disabled={
            !canDelete
          }
          onClick={
            onDelete
          }
          className="flex h-7 w-7 items-center justify-center text-black/20 hover:text-red-500 disabled:opacity-20"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
