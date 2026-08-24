export type AdminSection =
  | 'dashboard'
  | 'orders'
  | 'templates'
  | 'customers'
  | 'discounts'
  | 'settings';

export type AppLocation =
  | {
      kind: 'home';
    }
  | {
      kind:
        'template-product';
      templateId: string;
    }
  | {
      kind:
        'template-create';
      templateId: string;
    }
  | {
      kind:
        'template-checkout';
      templateId: string;
    }
  | {
      kind: 'cart';
    }
  | {
      kind: 'track-order';
    }
  | {
      kind: 'gift';
      giftId: string;
    }
  | {
      kind: 'admin';
      section: AdminSection;
    }
  | {
      kind: 'admin-order';
      giftId: string;
    }
  | {
      kind:
        'legacy-template';
      templateId: string;
    }
  | {
      kind: 'not-found';
    };

export const cleanPath = (
  pathname: string
) => {
  if (
    pathname.length > 1 &&
    pathname.endsWith('/')
  ) {
    return pathname.slice(
      0,
      -1
    );
  }

  return pathname;
};

const TEMPLATE_ID =
  '[a-z0-9-]+';

const GIFT_ID =
  '[A-Za-z0-9_-]{4,64}';

export const resolveAppLocation = (
  pathname: string,
  search = ''
): AppLocation => {
  const path =
    cleanPath(pathname);

  const query =
    new URLSearchParams(
      search
    );

  const legacyGift =
    query.get('gift') ||
    query.get('g');

  if (legacyGift) {
    return {
      kind: 'gift',
      giftId:
        legacyGift,
    };
  }

  if (path === '/') {
    return {
      kind: 'home',
    };
  }

  if (path === '/cart') {
    return {
      kind: 'cart',
    };
  }

  if (
    path ===
    '/track-order'
  ) {
    return {
      kind:
        'track-order',
    };
  }

  const giftMatch =
    path.match(
      new RegExp(
        `^/gift/(${GIFT_ID})$`
      )
    );

  if (giftMatch) {
    return {
      kind: 'gift',
      giftId:
        giftMatch[1],
    };
  }

  const adminOrder =
    path.match(
      new RegExp(
        `^/admin/orders/(${GIFT_ID})$`
      )
    );

  if (adminOrder) {
    return {
      kind: 'admin-order',
      giftId:
        adminOrder[1],
    };
  }

  const adminPaths:
  Record<
    string,
    AdminSection
  > = {
    '/admin':
      'dashboard',
    '/admin/orders':
      'orders',
    '/admin/templates':
      'templates',
    '/admin/customers':
      'customers',
    '/admin/discounts':
      'discounts',
    '/admin/settings':
      'settings',
  };

  if (adminPaths[path]) {
    return {
      kind: 'admin',
      section:
        adminPaths[path],
    };
  }

  const product =
    path.match(
      new RegExp(
        `^/products/(${TEMPLATE_ID})$`
      )
    );

  if (product) {
    return {
      kind:
        'template-product',
      templateId:
        product[1],
    };
  }

  const create =
    path.match(
      new RegExp(
        `^/create/(${TEMPLATE_ID})$`
      )
    );

  if (create) {
    return {
      kind:
        'template-create',
      templateId:
        create[1],
    };
  }

  const checkout =
    path.match(
      new RegExp(
        `^/checkout/(${TEMPLATE_ID})$`
      )
    );

  if (checkout) {
    return {
      kind:
        'template-checkout',
      templateId:
        checkout[1],
    };
  }

  const oldTemplate =
    path.match(
      new RegExp(
        `^/templates/(${TEMPLATE_ID})(?:/.*)?$`
      )
    );

  if (oldTemplate) {
    return {
      kind:
        'legacy-template',
      templateId:
        oldTemplate[1],
    };
  }

  return {
    kind: 'not-found',
  };
};
