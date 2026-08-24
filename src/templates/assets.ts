export type TemplateAssetKind =
  | 'image'
  | 'gif';

export interface TemplateAssetChoice {
  id: string;
  label: string;
  url: string;
  enabled: boolean;
}

export interface TemplateAssetSlot {
  id: string;
  label: string;
  description: string;
  group: string;
  kind: TemplateAssetKind;
  customerCanChoose: boolean;
  defaultAssetId: string;
  choices:
    TemplateAssetChoice[];
}

export interface TemplateAssetLibrary {
  slots: Record<
    string,
    TemplateAssetSlot
  >;
}

export const LOVE_ASSET_SLOT_IDS = {
  proposalInitial:
    'proposal.initial',
  proposalNo:
    'proposal.no',
  proposalSuccess:
    'proposal.success',
  giftBox1:
    'gifts.box.1',
  giftBox2:
    'gifts.box.2',
  giftBox3:
    'gifts.box.3',
  letterEnvelope:
    'letter.envelope',
} as const;

const CAT_LOVE_STICKER:
TemplateAssetChoice = {
  id:
    'cat-love-sticker',
  label:
    'Cat Love Sticker',
  url:
    '/images/template-assets/proposal/cat-love-sticker.gif',
  enabled: true,
};

const choice = (
  id: string,
  label: string,
  url: string
): TemplateAssetChoice => ({
  id,
  label,
  url,
  enabled: true,
});

const slot = (
  id: string,
  label: string,
  description: string,
  group: string,
  kind:
    TemplateAssetKind,
  choices:
    TemplateAssetChoice[],
  defaultAssetId:
    string
): TemplateAssetSlot => ({
  id,
  label,
  description,
  group,
  kind,
  customerCanChoose:
    false,
  defaultAssetId,
  choices,
});

export const DEFAULT_LOVE_TEMPLATE_ASSETS:
TemplateAssetLibrary = {
  slots: {
    [LOVE_ASSET_SLOT_IDS
      .proposalInitial]:
      slot(
        LOVE_ASSET_SLOT_IDS
          .proposalInitial,
        'GIF mở đầu',
        'GIF trước câu hỏi YES / NO.',
        'YES / NO',
        'gif',
        [
          choice(
            'cat-initial-default',
            'Cat mặc định',
            '/images/cat-default.gif'
          ),
          {
            ...CAT_LOVE_STICKER,
          },
        ],
        'cat-initial-default'
      ),

    [LOVE_ASSET_SLOT_IDS
      .proposalNo]:
      slot(
        LOVE_ASSET_SLOT_IDS
          .proposalNo,
        'GIF khi bấm NO',
        'Một GIF dùng chung cho mọi lần bấm NO.',
        'YES / NO',
        'gif',
        [
          choice(
            'cat-no-default',
            'Cat NO mặc định',
            '/images/cat-default.gif'
          ),
          {
            ...CAT_LOVE_STICKER,
          },
        ],
        'cat-no-default'
      ),

    [LOVE_ASSET_SLOT_IDS
      .proposalSuccess]:
      slot(
        LOVE_ASSET_SLOT_IDS
          .proposalSuccess,
        'GIF sau khi bấm YES',
        'GIF thành công trước màn 3 món quà.',
        'YES / NO',
        'gif',
        [
          choice(
            'success-default',
            'Success mặc định',
            '/images/gifts/success.gif'
          ),
          {
            ...CAT_LOVE_STICKER,
          },
        ],
        'success-default'
      ),

    [LOVE_ASSET_SLOT_IDS
      .giftBox1]:
      slot(
        LOVE_ASSET_SLOT_IDS
          .giftBox1,
        'Ảnh hộp quà 1',
        'Đại diện cho Album ảnh.',
        '3 món quà',
        'image',
        [
          choice(
            'gift-box-1-default',
            'Gift box 1',
            '/images/gifts/gift-1.png'
          ),
        ],
        'gift-box-1-default'
      ),

    [LOVE_ASSET_SLOT_IDS
      .giftBox2]:
      slot(
        LOVE_ASSET_SLOT_IDS
          .giftBox2,
        'Ảnh hộp quà 2',
        'Đại diện cho Âm nhạc.',
        '3 món quà',
        'image',
        [
          choice(
            'gift-box-2-default',
            'Gift box 2',
            '/images/gifts/gift-2.png'
          ),
        ],
        'gift-box-2-default'
      ),

    [LOVE_ASSET_SLOT_IDS
      .giftBox3]:
      slot(
        LOVE_ASSET_SLOT_IDS
          .giftBox3,
        'Ảnh hộp quà 3',
        'Đại diện cho Bức thư.',
        '3 món quà',
        'image',
        [
          choice(
            'gift-box-3-default',
            'Gift box 3',
            '/images/gifts/gift-3.png'
          ),
        ],
        'gift-box-3-default'
      ),

    [LOVE_ASSET_SLOT_IDS
      .letterEnvelope]:
      slot(
        LOVE_ASSET_SLOT_IDS
          .letterEnvelope,
        'Thiệp / phong bì',
        'Ảnh người nhận chạm để mở thư.',
        'Bức thư',
        'image',
        [
          choice(
            'letter-envelope-default',
            'Phong bì mặc định',
            '/images/letter/envelope-cover.png'
          ),
        ],
        'letter-envelope-default'
      ),
  },
};

const LEGACY_SLOT_ALIASES:
Record<
  string,
  string[]
> = {
  [LOVE_ASSET_SLOT_IDS
    .proposalNo]: [
    'proposal.no.1',
    'proposal.no.2',
    'proposal.no.3',
    'proposal.no.4',
    'proposal.no.5',
  ],
};

const safeString = (
  value: unknown,
  fallback: string,
  max = 1500
) => {
  if (
    typeof value !==
    'string'
  ) {
    return fallback;
  }

  const trimmed =
    value.trim();

  return trimmed
    ? trimmed.slice(
        0,
        max
      )
    : fallback;
};

const normalizeSavedChoice = (
  value: unknown,
  index: number
):
  TemplateAssetChoice |
  null => {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return null;
  }

  const data =
    value as any;

  const url =
    safeString(
      data.url,
      ''
    );

  if (!url) {
    return null;
  }

  return {
    id:
      safeString(
        data.id,
        `asset-${index}`,
        90
      ),
    label:
      safeString(
        data.label,
        `Asset ${index + 1}`,
        90
      ),
    url,
    enabled:
      typeof data.enabled ===
        'boolean'
        ? data.enabled
        : true,
  };
};

const mergeChoices = (
  saved:
    TemplateAssetChoice[],
  builtIn:
    TemplateAssetChoice[]
) => {
  const savedMap =
    new Map(
      saved.map(
        (item) => [
          item.id,
          item,
        ]
      )
    );

  const mergedBuiltIn =
    builtIn.map(
      (item) => {
        const existing =
          savedMap.get(
            item.id
          );

        if (!existing) {
          return {
            ...item,
          };
        }

        savedMap.delete(
          item.id
        );

        return {
          ...item,
          ...existing,
          url:
            existing.url ||
            item.url,
        };
      }
    );

  return [
    ...mergedBuiltIn,
    ...Array.from(
      savedMap.values()
    ),
  ].slice(
    0,
    60
  );
};

const findRawSlot = (
  rawSlots:
    Record<
      string,
      unknown
    >,
  id: string
) => {
  if (
    rawSlots[id]
  ) {
    return rawSlots[
      id
    ];
  }

  for (
    const alias
    of (
      LEGACY_SLOT_ALIASES[
        id
      ] ||
      []
    )
  ) {
    if (
      rawSlots[
        alias
      ]
    ) {
      return rawSlots[
        alias
      ];
    }
  }

  return undefined;
};

const normalizeSlot = (
  raw: unknown,
  fallback:
    TemplateAssetSlot
): TemplateAssetSlot => {
  const data =
    raw &&
    typeof raw ===
      'object'
      ? raw as any
      : {};

  const savedChoices =
    Array.isArray(
      data.choices
    )
      ? data.choices
          .map(
            normalizeSavedChoice
          )
          .filter(
            Boolean
          ) as
          TemplateAssetChoice[]
      : [];

  const choices =
    mergeChoices(
      savedChoices,
      fallback.choices
    );

  const requestedDefault =
    typeof data
      .defaultAssetId ===
      'string'
      ? data
          .defaultAssetId
      : fallback
          .defaultAssetId;

  const defaultAssetId =
    choices.some(
      (item) =>
        item.id ===
          requestedDefault &&
        item.enabled
    )
      ? requestedDefault
      : (
          choices.find(
            (item) =>
              item.enabled
          ) ||
          choices[0]
        ).id;

  return {
    id:
      fallback.id,
    label:
      safeString(
        data.label,
        fallback.label,
        100
      ),
    description:
      safeString(
        data.description,
        fallback
          .description,
        260
      ),
    group:
      fallback.group,
    kind:
      data.kind ===
        'gif' ||
      data.kind ===
        'image'
        ? data.kind
        : fallback.kind,
    customerCanChoose:
      typeof data
        .customerCanChoose ===
        'boolean'
        ? data
            .customerCanChoose
        : fallback
            .customerCanChoose,
    defaultAssetId,
    choices,
  };
};

export const cloneTemplateAssets =
  (
    library:
      TemplateAssetLibrary
  ): TemplateAssetLibrary =>
    JSON.parse(
      JSON.stringify(
        library
      )
    );

export const normalizeTemplateAssets =
  (
    value: unknown,
    fallback:
      TemplateAssetLibrary =
        DEFAULT_LOVE_TEMPLATE_ASSETS
  ): TemplateAssetLibrary => {
    const rawSlots =
      value &&
      typeof value ===
        'object' &&
      'slots' in (
        value as any
      )
        ? (
            value as any
          ).slots as
            Record<
              string,
              unknown
            >
        : {};

    return {
      slots:
        Object.fromEntries(
          Object.entries(
            fallback.slots
          ).map(
            ([
              id,
              fallbackSlot,
            ]) => [
              id,
              normalizeSlot(
                findRawSlot(
                  rawSlots,
                  id
                ),
                fallbackSlot
              ),
            ]
          )
        ),
    };
  };

export const getEnabledAssetChoices =
  (
    slot:
      TemplateAssetSlot
  ) =>
    slot.choices.filter(
      (item) =>
        item.enabled &&
        Boolean(
          item.url
        )
    );

export const getSelectedAssetChoiceId =
  (
    slot:
      TemplateAssetSlot,
    selections?:
      Record<
        string,
        string
      >
  ) => {
    const enabled =
      getEnabledAssetChoices(
        slot
      );

    const selected =
      selections?.[
        slot.id
      ];

    if (
      selected &&
      enabled.some(
        (item) =>
          item.id ===
          selected
      )
    ) {
      return selected;
    }

    if (
      enabled.some(
        (item) =>
          item.id ===
          slot.defaultAssetId
      )
    ) {
      return slot
        .defaultAssetId;
    }

    return (
      enabled[0]?.id ||
      slot.defaultAssetId
    );
  };

export const resolveTemplateAssetUrl =
  (
    library:
      TemplateAssetLibrary,
    slotId: string,
    selectedAssetId?:
      string
  ) => {
    const slot =
      library.slots[
        slotId
      ];

    if (!slot) {
      return '';
    }

    const enabled =
      getEnabledAssetChoices(
        slot
      );

    return (
      enabled.find(
        (item) =>
          item.id ===
          selectedAssetId
      )?.url ||
      enabled.find(
        (item) =>
          item.id ===
          slot.defaultAssetId
      )?.url ||
      enabled[0]?.url ||
      ''
    );
  };

export const resolveAllTemplateAssetUrls =
  (
    library:
      TemplateAssetLibrary,
    selections?:
      Record<
        string,
        string
      >
  ) =>
    Object.fromEntries(
      Object.keys(
        library.slots
      ).map(
        (slotId) => [
          slotId,
          resolveTemplateAssetUrl(
            library,
            slotId,
            selections?.[
              slotId
            ]
          ),
        ]
      )
    );

export const getCustomerSelectableSlots =
  (
    library:
      TemplateAssetLibrary
  ) =>
    Object.values(
      library.slots
    ).filter(
      (slot) =>
        slot
          .customerCanChoose &&
        getEnabledAssetChoices(
          slot
        ).length >
          1
    );
