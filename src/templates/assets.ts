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
  choices: TemplateAssetChoice[];
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

  /**
   * Chỉ MỘT GIF NO dùng chung
   * cho toàn bộ các lần bấm NO.
   */
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

/**
 * Hỗ trợ draft / Firestore config
 * từ bản thử trước từng chia NO
 * thành nhiều slot.
 */
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

const makeChoice = (
  id: string,
  label: string,
  url: string
): TemplateAssetChoice => ({
  id,
  label,
  url,
  enabled: true,
});

const makeSlot = (
  id: string,
  label: string,
  description: string,
  group: string,
  kind: TemplateAssetKind,
  defaultChoice:
    TemplateAssetChoice
): TemplateAssetSlot => ({
  id,
  label,
  description,
  group,
  kind,
  customerCanChoose:
    false,
  defaultAssetId:
    defaultChoice.id,
  choices: [
    defaultChoice,
  ],
});

export const DEFAULT_LOVE_TEMPLATE_ASSETS:
TemplateAssetLibrary = {
  slots: {
    [LOVE_ASSET_SLOT_IDS
      .proposalInitial]:
      makeSlot(
        LOVE_ASSET_SLOT_IDS
          .proposalInitial,
        'GIF mở đầu',
        'GIF hiển thị trước câu hỏi YES / NO.',
        'YES / NO',
        'gif',
        makeChoice(
          'cat-initial-default',
          'Cat mặc định',
          '/images/cat-default.gif'
        )
      ),

    [LOVE_ASSET_SLOT_IDS
      .proposalNo]:
      makeSlot(
        LOVE_ASSET_SLOT_IDS
          .proposalNo,
        'GIF khi bấm NO',
        'Một GIF duy nhất dùng chung cho mọi lần người nhận bấm NO. Text NO vẫn thay đổi theo từng giai đoạn.',
        'YES / NO',
        'gif',
        makeChoice(
          'cat-no-default',
          'Cat NO mặc định',
          '/images/cat-default.gif'
        )
      ),

    [LOVE_ASSET_SLOT_IDS
      .proposalSuccess]:
      makeSlot(
        LOVE_ASSET_SLOT_IDS
          .proposalSuccess,
        'GIF sau khi bấm YES',
        'GIF thành công trước màn 3 món quà.',
        'YES / NO',
        'gif',
        makeChoice(
          'success-default',
          'Success mặc định',
          '/images/gifts/success.gif'
        )
      ),

    [LOVE_ASSET_SLOT_IDS
      .giftBox1]:
      makeSlot(
        LOVE_ASSET_SLOT_IDS
          .giftBox1,
        'Ảnh hộp quà 1',
        'Ảnh đại diện cho món quà Album ảnh.',
        '3 món quà',
        'image',
        makeChoice(
          'gift-box-1-default',
          'Gift box 1',
          '/images/gifts/gift-1.png'
        )
      ),

    [LOVE_ASSET_SLOT_IDS
      .giftBox2]:
      makeSlot(
        LOVE_ASSET_SLOT_IDS
          .giftBox2,
        'Ảnh hộp quà 2',
        'Ảnh đại diện cho món quà Âm nhạc.',
        '3 món quà',
        'image',
        makeChoice(
          'gift-box-2-default',
          'Gift box 2',
          '/images/gifts/gift-2.png'
        )
      ),

    [LOVE_ASSET_SLOT_IDS
      .giftBox3]:
      makeSlot(
        LOVE_ASSET_SLOT_IDS
          .giftBox3,
        'Ảnh hộp quà 3',
        'Ảnh đại diện cho món quà Bức thư.',
        '3 món quà',
        'image',
        makeChoice(
          'gift-box-3-default',
          'Gift box 3',
          '/images/gifts/gift-3.png'
        )
      ),

    [LOVE_ASSET_SLOT_IDS
      .letterEnvelope]:
      makeSlot(
        LOVE_ASSET_SLOT_IDS
          .letterEnvelope,
        'Thiệp / phong bì',
        'Ảnh thiệp hoặc phong bì người nhận chạm để mở thư.',
        'Bức thư',
        'image',
        makeChoice(
          'letter-envelope-default',
          'Phong bì mặc định',
          '/images/letter/envelope-cover.png'
        )
      ),
  },
};

const safeText = (
  value: unknown,
  fallback: string,
  maxLength = 120
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
        maxLength
      )
    : fallback;
};

const normalizeChoice = (
  value: unknown,
  fallback:
    TemplateAssetChoice,
  index: number
): TemplateAssetChoice => {
  const data =
    value &&
    typeof value ===
      'object'
      ? value as any
      : {};

  return {
    id:
      safeText(
        data.id,
        fallback.id ||
          `asset-${index}`,
        90
      ),

    label:
      safeText(
        data.label,
        fallback.label ||
          `Asset ${index + 1}`,
        90
      ),

    url:
      safeText(
        data.url,
        fallback.url,
        1500
      ),

    enabled:
      typeof data.enabled ===
        'boolean'
        ? data.enabled
        : fallback.enabled,
  };
};

const normalizeSlot = (
  value: unknown,
  fallback:
    TemplateAssetSlot
): TemplateAssetSlot => {
  const data =
    value &&
    typeof value ===
      'object'
      ? value as any
      : {};

  const rawChoices =
    Array.isArray(
      data.choices
    )
      ? data.choices
      : fallback.choices;

  const fallbackChoice =
    fallback.choices[0];

  const choices =
    rawChoices
      .slice(0, 60)
      .map(
        (
          choice:
            unknown,
          index:
            number
        ) =>
          normalizeChoice(
            choice,
            fallback.choices[
              index
            ] ||
              fallbackChoice,
            index
          )
      )
      .filter(
        (
          choice:
            TemplateAssetChoice
        ) =>
          Boolean(
            choice.url
          )
      );

  const safeChoices =
    choices.length
      ? choices
      : [
          {
            ...fallbackChoice,
          },
        ];

  const defaultCandidate =
    typeof data.defaultAssetId ===
      'string'
      ? data.defaultAssetId
      : fallback.defaultAssetId;

  const defaultAssetId =
    safeChoices.some(
      (choice) =>
        choice.id ===
          defaultCandidate &&
        choice.enabled
    )
      ? defaultCandidate
      : (
          safeChoices.find(
            (choice) =>
              choice.enabled
          ) ||
          safeChoices[0]
        ).id;

  return {
    id:
      fallback.id,

    label:
      safeText(
        data.label,
        fallback.label,
        100
      ),

    description:
      safeText(
        data.description,
        fallback.description,
        260
      ),

    group:
      fallback.group,

    kind:
      data.kind ===
        'gif'
        ? 'gif'
        : data.kind ===
            'image'
          ? 'image'
          : fallback.kind,

    customerCanChoose:
      typeof data.customerCanChoose ===
        'boolean'
        ? data.customerCanChoose
        : fallback
            .customerCanChoose,

    defaultAssetId,

    choices:
      safeChoices,
  };
};

const findRawSlot = (
  rawSlots:
    Record<
      string,
      unknown
    >,
  slotId: string
) => {
  if (
    rawSlots?.[
      slotId
    ]
  ) {
    return rawSlots[
      slotId
    ];
  }

  const aliases =
    LEGACY_SLOT_ALIASES[
      slotId
    ] ||
    [];

  for (
    const alias
    of aliases
  ) {
    if (
      rawSlots?.[
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

const findSelection = (
  selections:
    Record<
      string,
      string
    > | undefined,
  slotId: string
) => {
  if (
    selections?.[
      slotId
    ]
  ) {
    return selections[
      slotId
    ];
  }

  const aliases =
    LEGACY_SLOT_ALIASES[
      slotId
    ] ||
    [];

  for (
    const alias
    of aliases
  ) {
    if (
      selections?.[
        alias
      ]
    ) {
      return selections[
        alias
      ];
    }
  }

  return undefined;
};

export const cloneTemplateAssets =
  (
    library:
      TemplateAssetLibrary
  ): TemplateAssetLibrary => {
    return JSON.parse(
      JSON.stringify(
        library
      )
    );
  };

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

    const slots =
      Object.fromEntries(
        Object.entries(
          fallback.slots
        ).map(
          ([
            slotId,
            fallbackSlot,
          ]) => [
            slotId,
            normalizeSlot(
              findRawSlot(
                rawSlots,
                slotId
              ),
              fallbackSlot
            ),
          ]
        )
      );

    return {
      slots,
    };
  };

export const getEnabledAssetChoices =
  (
    slot:
      TemplateAssetSlot
  ) => {
    return slot.choices.filter(
      (choice) =>
        choice.enabled &&
        Boolean(
          choice.url
        )
    );
  };

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

    const selectedId =
      findSelection(
        selections,
        slot.id
      );

    if (
      selectedId &&
      enabled.some(
        (choice) =>
          choice.id ===
          selectedId
      )
    ) {
      return selectedId;
    }

    if (
      enabled.some(
        (choice) =>
          choice.id ===
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

    const selected =
      selectedAssetId
        ? enabled.find(
            (choice) =>
              choice.id ===
              selectedAssetId
          )
        : undefined;

    if (selected) {
      return selected.url;
    }

    return (
      enabled.find(
        (choice) =>
          choice.id ===
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
  ) => {
    return Object.fromEntries(
      Object.keys(
        library.slots
      ).map(
        (slotId) => {
          const selectedId =
            findSelection(
              selections,
              slotId
            );

          return [
            slotId,
            resolveTemplateAssetUrl(
              library,
              slotId,
              selectedId
            ),
          ];
        }
      )
    );
  };

export const getCustomerSelectableSlots =
  (
    library:
      TemplateAssetLibrary
  ) => {
    return Object.values(
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
  };
