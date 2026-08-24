import React from 'react';

import {
  Image as ImageIcon,
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

interface AdminTemplateAssetEditorProps {
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

  return `asset-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};

const updateSlotInLibrary = (
  library:
    TemplateAssetLibrary,
  slotId: string,
  updater: (
    slot:
      TemplateAssetSlot
  ) => TemplateAssetSlot
): TemplateAssetLibrary => {
  const current =
    library.slots[
      slotId
    ];

  if (!current) {
    return library;
  }

  return {
    ...library,
    slots: {
      ...library.slots,
      [slotId]:
        updater(current),
    },
  };
};

export const AdminTemplateAssetEditor:
React.FC<
  AdminTemplateAssetEditorProps
> = ({
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
    <div className="mt-8 border-t border-black/8 pt-7">
      <div className="border-b border-black/8 pb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b83e57]">
          Asset Library
        </p>

        <h3 className="mt-2 text-xl font-black">
          GIF & ảnh của mẫu gốc
        </h3>

        <p className="mt-1 max-w-3xl text-xs leading-5 text-black/40">
          Thêm nhiều asset bằng URL hoặc đường dẫn /images/...
          Chọn asset mặc định và bật “Khách được chọn” cho từng giai đoạn.
          Khi nối Firebase Storage sau này, cấu trúc này giữ nguyên.
        </p>
      </div>

      <div className="mt-6 space-y-8">
        {groups.map(
          (group) => (
            <section
              key={group}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 bg-[#cf5068]" />

                <h4 className="text-sm font-black">
                  {group}
                </h4>
              </div>

              <div className="grid gap-4">
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
                      <AssetSlotEditor
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
                            updateSlotInLibrary(
                              assets,
                              slot.id,
                              () =>
                                next
                            )
                          )
                        }
                      />
                    )
                  )}
              </div>
            </section>
          )
        )}
      </div>
    </div>
  );
};

const AssetSlotEditor:
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
    assetId: string,
    patch:
      Partial<
        TemplateAssetChoice
      >
  ) => {
    const choices =
      slot.choices.map(
        (choice) =>
          choice.id ===
          assetId
            ? {
                ...choice,
                ...patch,
              }
            : choice
      );

    let defaultAssetId =
      slot.defaultAssetId;

    const defaultChoice =
      choices.find(
        (choice) =>
          choice.id ===
          defaultAssetId
      );

    if (
      !defaultChoice ||
      !defaultChoice.enabled
    ) {
      defaultAssetId =
        choices.find(
          (choice) =>
            choice.enabled
        )?.id ||
        choices[0]?.id ||
        '';
    }

    onChange({
      ...slot,
      choices,
      defaultAssetId,
    });
  };

  const removeChoice = (
    assetId: string
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
          choice.id !==
          assetId
      );

    const defaultAssetId =
      slot.defaultAssetId ===
      assetId
        ? (
            choices.find(
              (choice) =>
                choice.enabled
            ) ||
            choices[0]
          )?.id ||
          ''
        : slot.defaultAssetId;

    onChange({
      ...slot,
      choices,
      defaultAssetId,
    });
  };

  const addChoice = () => {
    const id =
      makeAssetId();

    onChange({
      ...slot,
      choices: [
        ...slot.choices,
        {
          id,
          label:
            `Asset ${slot.choices.length + 1}`,
          url: '',
          enabled: true,
        },
      ],
    });
  };

  return (
    <div className="border border-black/8 bg-[#fffdfc]">
      <div className="flex flex-col gap-4 border-b border-black/8 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-[#b83e57]" />

            <h5 className="text-sm font-black">
              {slot.label}
            </h5>

            <span className="border border-black/8 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-black/35">
              {slot.kind}
            </span>
          </div>

          <p className="mt-1.5 max-w-2xl text-[11px] leading-5 text-black/38">
            {slot.description}
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-2">
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

          <span className="text-[11px] font-bold text-black/58">
            Khách được chọn
          </span>
        </label>
      </div>

      <div className="grid gap-3 p-4">
        {slot.choices.map(
          (
            choice,
            index
          ) => (
            <div
              key={
                choice.id
              }
              className="grid gap-3 border border-black/8 bg-white p-3 lg:grid-cols-[76px_minmax(0,180px)_minmax(0,1fr)_auto]"
            >
              <div className="flex h-[76px] w-[76px] items-center justify-center overflow-hidden bg-[#f7f2f3]">
                {choice.url ? (
                  <img
                    src={
                      choice.url
                    }
                    alt=""
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <ImageIcon className="h-5 w-5 text-black/18" />
                )}
              </div>

              <label className="block">
                <span className="mb-1 block text-[10px] font-bold text-black/42">
                  Tên asset
                </span>

                <input
                  value={
                    choice.label
                  }
                  onChange={(
                    event
                  ) =>
                    updateChoice(
                      choice.id,
                      {
                        label:
                          event
                            .target
                            .value,
                      }
                    )
                  }
                  className="w-full border border-black/10 px-3 py-2.5 text-xs outline-none focus:border-[#cf5068]"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[10px] font-bold text-black/42">
                  URL / đường dẫn asset
                </span>

                <input
                  value={
                    choice.url
                  }
                  placeholder="/images/... hoặc https://..."
                  onChange={(
                    event
                  ) =>
                    updateChoice(
                      choice.id,
                      {
                        url:
                          event
                            .target
                            .value,
                      }
                    )
                  }
                  className="w-full border border-black/10 px-3 py-2.5 font-mono text-[11px] outline-none focus:border-[#cf5068]"
                />
              </label>

              <div className="flex items-center gap-3 lg:flex-col lg:items-end lg:justify-between">
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={
                      choice.enabled
                    }
                    onChange={(
                      event
                    ) =>
                      updateChoice(
                        choice.id,
                        {
                          enabled:
                            event
                              .target
                              .checked,
                        }
                      )
                    }
                    className="h-4 w-4 accent-[#b83e57]"
                  />

                  <span className="text-[10px] font-bold text-black/48">
                    Bật
                  </span>
                </label>

                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name={
                      `default-${slot.id}`
                    }
                    checked={
                      slot
                        .defaultAssetId ===
                      choice.id
                    }
                    disabled={
                      !choice.enabled
                    }
                    onChange={() =>
                      onChange({
                        ...slot,
                        defaultAssetId:
                          choice.id,
                      })
                    }
                    className="h-4 w-4 accent-[#b83e57]"
                  />

                  <span className="text-[10px] font-bold text-black/48">
                    Mặc định
                  </span>
                </label>

                <button
                  type="button"
                  disabled={
                    slot.choices
                      .length <=
                    1
                  }
                  onClick={() =>
                    removeChoice(
                      choice.id
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center border border-black/8 text-black/25 transition hover:border-red-200 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-20"
                  aria-label={
                    `Xóa asset ${index + 1}`
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        )}

        <button
          type="button"
          onClick={
            addChoice
          }
          className="inline-flex w-fit items-center gap-2 border border-dashed border-[#cf5068]/35 px-4 py-2.5 text-[11px] font-bold text-[#b83e57] transition hover:bg-[#fff3f5]"
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm asset
        </button>

        <p className="text-[10px] leading-5 text-black/30">
          {enabledCount}{' '}
          asset đang bật ·
          {' '}
          {slot.customerCanChoose &&
          enabledCount > 1
            ? 'Khách sẽ thấy selector.'
            : 'Khách dùng asset mặc định.'}
        </p>
      </div>
    </div>
  );
};
