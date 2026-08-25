import * as tls from 'node:tls';

import {
  Buffer,
} from 'node:buffer';

import {
  randomUUID,
} from 'node:crypto';

const FIREBASE_PROJECT_ID =
  'dearygifts-8a32e';

const FIREBASE_WEB_API_KEY =
  'AIzaSyCfbdssT7_2x3tguS1vL4AT0AUGftd0MI0';

const FIRESTORE_DATABASE_ID =
  'ai-studio-romanticlovesurp-1b89a4b9-dcb7-435b-ad96-d70becbbc72c';

const JSON_HEADERS = {
  'Content-Type':
    'application/json; charset=utf-8',
};

const sendJson = (
  response: any,
  status: number,
  body: Record<
    string,
    unknown
  >
) => {
  response
    .status(status)
    .setHeader(
      'Content-Type',
      JSON_HEADERS[
        'Content-Type'
      ]
    )
    .json(body);
};

const getBearerToken = (
  request: any
) => {
  const header =
    String(
      request.headers
        ?.authorization ||
        ''
    );

  const match =
    header.match(
      /^Bearer\s+(.+)$/i
    );

  return match?.[1] || '';
};

const escapeHtml = (
  value: unknown
) =>
  String(
    value ?? ''
  )
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );

const normalizeBaseUrl = (
  raw: string
) => {
  const trimmed =
    raw.trim();

  if (!trimmed) {
    return '';
  }

  return /^https?:\/\//i.test(
    trimmed
  )
    ? trimmed.replace(
        /\/+$/,
        ''
      )
    : `https://${trimmed.replace(
        /\/+$/,
        ''
      )}`;
};

const getAppUrl = () =>
  normalizeBaseUrl(
    String(
      process.env.APP_URL ||
      process.env
        .VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_URL ||
      ''
    )
  );

const identityLookup =
  async (
    idToken: string
  ) => {
    const response =
      await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(
          FIREBASE_WEB_API_KEY
        )}`,
        {
          method: 'POST',
          headers:
            JSON_HEADERS,
          body:
            JSON.stringify({
              idToken,
            }),
        }
      );

    if (!response.ok) {
      return null;
    }

    const payload: any =
      await response.json();

    return (
      payload?.users?.[0] ||
      null
    );
  };

const firestoreDocumentUrl = (
  path: string,
  fieldMask:
    string[] = [],
  preconditionUpdateTime =
    ''
) => {
  const base =
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      FIREBASE_PROJECT_ID
    )}/databases/${encodeURIComponent(
      FIRESTORE_DATABASE_ID
    )}/documents/${path
      .split('/')
      .map(
        (part) =>
          encodeURIComponent(
            part
          )
      )
      .join('/')}`;

  const params =
    new URLSearchParams();

  fieldMask.forEach(
    (field) =>
      params.append(
        'mask.fieldPaths',
        field
      )
  );

  if (
    preconditionUpdateTime
  ) {
    params.set(
      'currentDocument.updateTime',
      preconditionUpdateTime
    );
  }

  const query =
    params.toString();

  return query
    ? `${base}?${query}`
    : base;
};

const firestoreGet =
  async (
    path: string,
    idToken: string,
    fields:
      string[] = []
  ) => {
    const response =
      await fetch(
        firestoreDocumentUrl(
          path,
          fields
        ),
        {
          headers: {
            Authorization:
              `Bearer ${idToken}`,
          },
        }
      );

    if (
      response.status ===
      404
    ) {
      return null;
    }

    if (!response.ok) {
      const detail =
        await response.text();

      const error: any =
        new Error(
          `Firestore read failed (${response.status}): ${detail.slice(
            0,
            240
          )}`
        );

      error.status =
        response.status;

      throw error;
    }

    return response.json();
  };

const encodeFirestoreValue = (
  value: unknown
):
  Record<
    string,
    unknown
  > => {
  if (
    value === null ||
    value === undefined
  ) {
    return {
      nullValue: null,
    };
  }

  if (
    typeof value ===
    'string'
  ) {
    return {
      stringValue:
        value,
    };
  }

  if (
    typeof value ===
    'boolean'
  ) {
    return {
      booleanValue:
        value,
    };
  }

  if (
    typeof value ===
    'number'
  ) {
    return Number.isInteger(
      value
    )
      ? {
          integerValue:
            String(
              value
            ),
        }
      : {
          doubleValue:
            value,
        };
  }

  if (
    value instanceof Date
  ) {
    return {
      timestampValue:
        value.toISOString(),
    };
  }

  throw new Error(
    'Unsupported Firestore value.'
  );
};

const firestorePatch =
  async (
    path: string,
    idToken: string,
    fields:
      Record<
        string,
        unknown
      >,
    preconditionUpdateTime =
      ''
  ) => {
    const updateFields =
      Object.keys(
        fields
      );

    const base =
      firestoreDocumentUrl(
        path,
        [],
        preconditionUpdateTime
      );

    const separator =
      base.includes('?')
        ? '&'
        : '?';

    const mask =
      new URLSearchParams();

    updateFields.forEach(
      (field) =>
        mask.append(
          'updateMask.fieldPaths',
          field
        )
    );

    const response =
      await fetch(
        `${base}${separator}${mask.toString()}`,
        {
          method: 'PATCH',
          headers: {
            ...JSON_HEADERS,
            Authorization:
              `Bearer ${idToken}`,
          },
          body:
            JSON.stringify({
              fields:
                Object.fromEntries(
                  Object.entries(
                    fields
                  ).map(
                    ([
                      key,
                      value,
                    ]) => [
                      key,
                      encodeFirestoreValue(
                        value
                      ),
                    ]
                  )
                ),
            }),
        }
      );

    if (!response.ok) {
      const detail =
        await response.text();

      const error: any =
        new Error(
          `Firestore update failed (${response.status}): ${detail.slice(
            0,
            240
          )}`
        );

      error.status =
        response.status;

      throw error;
    }

    return response.json();
  };

const decodeFirestoreValue = (
  value: any
): any => {
  if (!value) {
    return undefined;
  }

  if (
    'nullValue' in value
  ) {
    return null;
  }

  if (
    'stringValue' in value
  ) {
    return value.stringValue;
  }

  if (
    'booleanValue' in value
  ) {
    return Boolean(
      value.booleanValue
    );
  }

  if (
    'integerValue' in value
  ) {
    return Number(
      value.integerValue
    );
  }

  if (
    'doubleValue' in value
  ) {
    return Number(
      value.doubleValue
    );
  }

  if (
    'timestampValue' in
    value
  ) {
    return value.timestampValue;
  }

  if (
    'mapValue' in value
  ) {
    return decodeFirestoreFields(
      value.mapValue
        ?.fields ||
        {}
    );
  }

  if (
    'arrayValue' in value
  ) {
    return (
      value.arrayValue
        ?.values || []
    ).map(
      decodeFirestoreValue
    );
  }

  return undefined;
};

const decodeFirestoreFields = (
  fields:
    Record<
      string,
      any
    > = {}
) =>
  Object.fromEntries(
    Object.entries(
      fields
    ).map(
      ([
        key,
        value,
      ]) => [
        key,
        decodeFirestoreValue(
          value
        ),
      ]
    )
  );

const assertAdmin =
  async (
    idToken: string
  ) => {
    const identity =
      await identityLookup(
        idToken
      );

    if (
      !identity?.localId ||
      !identity?.email
    ) {
      throw new Error(
        'Phiên đăng nhập Admin không hợp lệ.'
      );
    }

    const googleUser =
      (
        identity.providerUserInfo ||
        []
      ).some(
        (provider: any) =>
          provider.providerId ===
          'google.com'
      );

    if (!googleUser) {
      throw new Error(
        'Admin phải đăng nhập bằng Google.'
      );
    }

    const candidates =
      Array.from(
        new Set(
          [
            identity.email,
            String(
              identity.email
            ).toLowerCase(),
            identity.localId,
          ].filter(Boolean)
        )
      );

    for (
      const candidate of
      candidates
    ) {
      const document =
        await firestoreGet(
          `admins/${candidate}`,
          idToken,
          [
            'enabled',
          ]
        );

      if (
        document?.fields
          ?.enabled
          ?.booleanValue ===
        true
      ) {
        return identity;
      }
    }

    throw new Error(
      'Tài khoản này không có quyền Admin.'
    );
  };

const formatVnd = (
  amount: number
) =>
  `${new Intl.NumberFormat(
    'vi-VN'
  ).format(
    Math.round(amount)
  )} đ`;

const buildGiftQrUrl = (
  giftUrl: string
) => {
  const params =
    new URLSearchParams({
      size: '320x320',
      data: giftUrl,
      margin: '10',
    });

  return (
    'https://api.qrserver.com/v1/create-qr-code/?' +
    params.toString()
  );
};

const encodeHeader = (
  value: string
) =>
  `=?UTF-8?B?${Buffer.from(
    value,
    'utf8'
  ).toString(
    'base64'
  )}?=`;

const wrapBase64 = (
  value: Buffer |
    string
) => {
  const encoded =
    Buffer.isBuffer(
      value
    )
      ? value.toString(
          'base64'
        )
      : Buffer.from(
          value,
          'utf8'
        ).toString(
          'base64'
        );

  return (
    encoded.match(
      /.{1,76}/g
    ) || []
  ).join('\r\n');
};

const buildEmailHtml = ({
  customerName,
  orderCode,
  templateName,
  amount,
  giftUrl,
}: {
  customerName: string;
  orderCode: string;
  templateName: string;
  amount: string;
  giftUrl: string;
}) => {
  const safeName =
    escapeHtml(
      customerName
    );

  const safeCode =
    escapeHtml(
      orderCode
    );

  const safeTemplate =
    escapeHtml(
      templateName
    );

  const safeAmount =
    escapeHtml(
      amount
    );

  const safeGiftUrl =
    escapeHtml(
      giftUrl
    );

  return `<!doctype html>
<html lang="vi">
<body style="margin:0;padding:0;background:#fffaf8;font-family:Arial,Helvetica,sans-serif;color:#191919;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fffaf8;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border:1px solid #f0e4e7;border-radius:24px;overflow:hidden;">
<tr><td style="padding:30px 32px 14px;text-align:center;">
<div style="font-family:Georgia,'Times New Roman',serif;font-size:34px;color:#e691a2;">Dearly</div>
<div style="margin-top:20px;font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#c94761;">Thanh toán đã xác nhận</div>
<h1 style="margin:10px 0 0;font-size:27px;line-height:1.25;">Cảm ơn ${safeName} 💌</h1>
<p style="margin:12px auto 0;max-width:440px;font-size:14px;line-height:1.7;color:#777;">Dearly đã xác nhận đơn hàng của bạn. Món quà đã sẵn sàng để mở và gửi tới người nhận.</p>
</td></tr>
<tr><td style="padding:14px 32px 22px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff7f8;border-radius:16px;padding:4px 18px;">
<tr><td style="padding:13px 0;font-size:12px;color:#999;border-bottom:1px solid #f1e2e5;">Mã đơn</td><td align="right" style="padding:13px 0;font-size:13px;font-weight:700;color:#c94761;border-bottom:1px solid #f1e2e5;">${safeCode}</td></tr>
<tr><td style="padding:13px 0;font-size:12px;color:#999;border-bottom:1px solid #f1e2e5;">Template</td><td align="right" style="padding:13px 0;font-size:13px;font-weight:700;border-bottom:1px solid #f1e2e5;">${safeTemplate}</td></tr>
<tr><td style="padding:13px 0;font-size:12px;color:#999;">Tổng thanh toán</td><td align="right" style="padding:13px 0;font-size:14px;font-weight:800;">${safeAmount}</td></tr>
</table>
</td></tr>
<tr><td align="center" style="padding:0 32px 8px;">
<p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#555;">Quét QR để mở món quà</p>
<img src="cid:dearly-gift-qr" width="220" height="220" alt="QR mở món quà" style="display:block;width:220px;height:220px;border:1px solid #eee;border-radius:18px;padding:10px;background:#fff;" />
</td></tr>
<tr><td align="center" style="padding:16px 32px 30px;">
<a href="${safeGiftUrl}" style="display:inline-block;background:#191919;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 26px;border-radius:13px;">Mở món quà</a>
<p style="margin:18px auto 0;max-width:460px;font-size:11px;line-height:1.65;color:#aaa;">Nếu nút không mở được, dùng đường dẫn này:<br><a href="${safeGiftUrl}" style="color:#c94761;word-break:break-all;">${safeGiftUrl}</a></p>
</td></tr>
<tr><td style="border-top:1px solid #f3eaec;padding:18px 32px 24px;text-align:center;font-size:11px;line-height:1.6;color:#aaa;">Cảm ơn bạn đã chọn Dearly.<br>Digital gifts for special moments.</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
};

const buildMimeMessage = ({
  fromEmail,
  fromName,
  toEmail,
  subject,
  html,
  qrPng,
  orderCode,
  messageId,
}: {
  fromEmail: string;
  fromName: string;
  toEmail: string;
  subject: string;
  html: string;
  qrPng: Buffer;
  orderCode: string;
  messageId: string;
}) => {
  const boundary =
    `dearly_${randomUUID().replace(
      /-/g,
      ''
    )}`;

  const filename =
    `${orderCode}-QR.png`
      .replace(
        /[^a-zA-Z0-9._-]/g,
        '_'
      );

  const parts = [
    `From: ${encodeHeader(fromName)} <${fromEmail}>`,
    `To: <${toEmail}>`,
    `Subject: ${encodeHeader(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${messageId}>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/related; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrapBase64(
      html
    ),
    `--${boundary}`,
    `Content-Type: image/png; name="${filename}"`,
    'Content-Transfer-Encoding: base64',
    'Content-ID: <dearly-gift-qr>',
    `Content-Disposition: inline; filename="${filename}"`,
    '',
    wrapBase64(
      qrPng
    ),
    `--${boundary}--`,
    '',
  ];

  return parts.join(
    '\r\n'
  );
};

interface SmtpReply {
  code: number;
  text: string;
}

const sendViaGmailSmtp =
  async ({
    user,
    appPassword,
    fromName,
    to,
    subject,
    html,
    qrPng,
    orderCode,
    messageId,
  }: {
    user: string;
    appPassword: string;
    fromName: string;
    to: string;
    subject: string;
    html: string;
    qrPng: Buffer;
    orderCode: string;
    messageId: string;
  }) => {
    const message =
      buildMimeMessage({
        fromEmail:
          user,
        fromName,
        toEmail:
          to,
        subject,
        html,
        qrPng,
        orderCode,
        messageId,
      });

    await new Promise<void>(
      (
        resolve,
        reject
      ) => {
        const socket =
          tls.connect({
            host:
              'smtp.gmail.com',
            port: 465,
            servername:
              'smtp.gmail.com',
          });

        let settled =
          false;

        let lineBuffer =
          '';

        let currentReply:
          string[] = [];

        const replyQueue:
          SmtpReply[] = [];

        const waiters:
          Array<{
            resolve:
              (
                value:
                  SmtpReply
              ) => void;
            reject:
              (
                reason:
                  unknown
              ) => void;
          }> = [];

        const finishReject = (
          error:
            unknown
        ) => {
          if (settled) {
            return;
          }

          settled = true;

          try {
            socket.destroy();
          } catch {
            // ignore
          }

          reject(
            error
          );
        };

        const deliverReply = (
          reply:
            SmtpReply
        ) => {
          const waiter =
            waiters.shift();

          if (waiter) {
            waiter.resolve(
              reply
            );
            return;
          }

          replyQueue.push(
            reply
          );
        };

        socket.on(
          'data',
          (
            chunk
          ) => {
            lineBuffer +=
              chunk.toString(
                'utf8'
              );

            while (
              lineBuffer.includes(
                '\r\n'
              )
            ) {
              const splitAt =
                lineBuffer.indexOf(
                  '\r\n'
                );

              const line =
                lineBuffer.slice(
                  0,
                  splitAt
                );

              lineBuffer =
                lineBuffer.slice(
                  splitAt +
                    2
                );

              currentReply.push(
                line
              );

              if (
                /^\d{3} /.test(
                  line
                )
              ) {
                const text =
                  currentReply.join(
                    '\n'
                  );

                const code =
                  Number(
                    line.slice(
                      0,
                      3
                    )
                  );

                currentReply =
                  [];

                deliverReply({
                  code,
                  text,
                });
              }
            }
          }
        );

        socket.on(
          'error',
          finishReject
        );

        socket.setTimeout(
          20000,
          () =>
            finishReject(
              new Error(
                'Gmail SMTP timeout.'
              )
            )
        );

        const readReply =
          () =>
            new Promise<SmtpReply>(
              (
                resolveReply,
                rejectReply
              ) => {
                const queued =
                  replyQueue.shift();

                if (queued) {
                  resolveReply(
                    queued
                  );
                  return;
                }

                waiters.push({
                  resolve:
                    resolveReply,
                  reject:
                    rejectReply,
                });
              }
            );

        const expect =
          async (
            expected:
              number[]
          ) => {
            const reply =
              await readReply();

            if (
              !expected.includes(
                reply.code
              )
            ) {
              throw new Error(
                `Gmail SMTP ${reply.code}: ${reply.text}`
              );
            }

            return reply;
          };

        const command =
          async (
            value: string,
            expected:
              number[]
          ) => {
            socket.write(
              `${value}\r\n`
            );

            return expect(
              expected
            );
          };

        socket.once(
          'secureConnect',
          () => {
            void (
              async () => {
                try {
                  await expect([
                    220,
                  ]);

                  await command(
                    'EHLO dearly.app',
                    [
                      250,
                    ]
                  );

                  await command(
                    'AUTH LOGIN',
                    [
                      334,
                    ]
                  );

                  await command(
                    Buffer.from(
                      user,
                      'utf8'
                    ).toString(
                      'base64'
                    ),
                    [
                      334,
                    ]
                  );

                  await command(
                    Buffer.from(
                      appPassword,
                      'utf8'
                    ).toString(
                      'base64'
                    ),
                    [
                      235,
                    ]
                  );

                  await command(
                    `MAIL FROM:<${user}>`,
                    [
                      250,
                    ]
                  );

                  await command(
                    `RCPT TO:<${to}>`,
                    [
                      250,
                      251,
                    ]
                  );

                  await command(
                    'DATA',
                    [
                      354,
                    ]
                  );

                  const dotStuffed =
                    message.replace(
                      /(^|\r\n)\./g,
                      '$1..'
                    );

                  socket.write(
                    `${dotStuffed}\r\n.\r\n`
                  );

                  await expect([
                    250,
                  ]);

                  try {
                    await command(
                      'QUIT',
                      [
                        221,
                      ]
                    );
                  } catch {
                    // Message already accepted.
                  }

                  if (
                    !settled
                  ) {
                    settled =
                      true;

                    socket.end();

                    resolve();
                  }
                } catch (
                  error
                ) {
                  finishReject(
                    error
                  );
                }
              }
            )();
          }
        );
      }
    );
  };

const isRecentSendingLock = (
  status: unknown,
  attemptedAt:
    unknown
) => {
  if (
    status !==
    'sending' ||
    typeof attemptedAt !==
      'string'
  ) {
    return false;
  }

  const timestamp =
    Date.parse(
      attemptedAt
    );

  if (
    !Number.isFinite(
      timestamp
    )
  ) {
    return false;
  }

  return (
    Date.now() -
      timestamp <
    10 * 60 * 1000
  );
};

export default async function handler(
  request: any,
  response: any
) {
  if (
    request.method !==
    'POST'
  ) {
    response.setHeader(
      'Allow',
      'POST'
    );

    return sendJson(
      response,
      405,
      {
        error:
          'Method not allowed.',
      }
    );
  }

  const gmailUser =
    String(
      process.env
        .GMAIL_USER ||
        ''
    )
      .trim()
      .toLowerCase();

  const gmailAppPassword =
    String(
      process.env
        .GMAIL_APP_PASSWORD ||
        ''
    )
      .replace(
        /\s+/g,
        ''
      )
      .trim();

  const gmailFromName =
    String(
      process.env
        .GMAIL_FROM_NAME ||
        'Dearly'
    ).trim() ||
    'Dearly';

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      gmailUser
    ) ||
    !gmailAppPassword
  ) {
    return sendJson(
      response,
      503,
      {
        error:
          'Gmail SMTP chưa được cấu hình trên Vercel.',
      }
    );
  }

  const idToken =
    getBearerToken(
      request
    );

  if (!idToken) {
    return sendJson(
      response,
      401,
      {
        error:
          'Thiếu phiên đăng nhập Admin.',
      }
    );
  }

  const giftId =
    String(
      request.body
        ?.giftId ||
        ''
    ).trim();

  if (
    !/^[A-Za-z0-9_-]{16,64}$/.test(
      giftId
    )
  ) {
    return sendJson(
      response,
      400,
      {
        error:
          'Gift ID không hợp lệ.',
      }
    );
  }

  try {
    await assertAdmin(
      idToken
    );

    const giftDocument =
      await firestoreGet(
        `gifts/${giftId}`,
        idToken,
        [
          'customer',
          'senderName',
          'templateId',
          'templateName',
          'price',
          'currency',
          'paymentStatus',
          'status',
          'isPublished',
          'orderCode',
          'paymentReference',
          'confirmationEmailStatus',
          'confirmationEmailAttemptedAt',
          'confirmationEmailSentAt',
          'confirmationEmailMessageId',
          'confirmationEmailTo',
        ]
      );

    if (
      !giftDocument
        ?.fields
    ) {
      return sendJson(
        response,
        404,
        {
          error:
            'Không tìm thấy đơn hàng.',
        }
      );
    }

    let gift =
      decodeFirestoreFields(
        giftDocument.fields
      );

    if (
      gift.confirmationEmailSentAt ||
      gift.confirmationEmailStatus ===
        'sent'
    ) {
      return sendJson(
        response,
        200,
        {
          ok: true,
          sent: false,
          alreadySent: true,
          to:
            gift.confirmationEmailTo ||
            gift.customer
              ?.email ||
            '',
          messageId:
            gift.confirmationEmailMessageId ||
            '',
        }
      );
    }

    if (
      isRecentSendingLock(
        gift.confirmationEmailStatus,
        gift.confirmationEmailAttemptedAt
      )
    ) {
      return sendJson(
        response,
        200,
        {
          ok: true,
          sent: false,
          processing: true,
          to:
            gift.customer
              ?.email ||
            '',
        }
      );
    }

    const paid =
      gift.paymentStatus ===
        'paid' ||
      gift.paymentStatus ===
        'paid_test';

    const published =
      gift.status ===
        'published' ||
      gift.isPublished ===
        true;

    if (
      !paid ||
      !published
    ) {
      return sendJson(
        response,
        409,
        {
          error:
            'Đơn chưa ở trạng thái đã thanh toán và publish.',
        }
      );
    }

    const to =
      String(
        gift.customer
          ?.email ||
          ''
      )
        .trim()
        .toLowerCase();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        to
      )
    ) {
      return sendJson(
        response,
        422,
        {
          error:
            'Đơn hàng không có email khách hợp lệ.',
        }
      );
    }

    const appUrl =
      getAppUrl();

    if (!appUrl) {
      return sendJson(
        response,
        503,
        {
          error:
            'APP_URL chưa được cấu hình.',
        }
      );
    }

    // Claim việc gửi mail bằng updateTime của document.
    // Hai lần click đồng thời thì chỉ một request được quyền gửi.
    try {
      await firestorePatch(
        `gifts/${giftId}`,
        idToken,
        {
          confirmationEmailStatus:
            'sending',
          confirmationEmailAttemptedAt:
            new Date(),
          confirmationEmailTo:
            to,
        },
        giftDocument.updateTime ||
          ''
      );
    } catch (
      claimError
    ) {
      const latest =
        await firestoreGet(
          `gifts/${giftId}`,
          idToken,
          [
            'confirmationEmailStatus',
            'confirmationEmailAttemptedAt',
            'confirmationEmailSentAt',
            'confirmationEmailMessageId',
            'confirmationEmailTo',
          ]
        );

      const latestGift =
        decodeFirestoreFields(
          latest?.fields ||
          {}
        );

      if (
        latestGift.confirmationEmailSentAt ||
        latestGift.confirmationEmailStatus ===
          'sent'
      ) {
        return sendJson(
          response,
          200,
          {
            ok: true,
            sent: false,
            alreadySent: true,
            to:
              latestGift.confirmationEmailTo ||
              to,
            messageId:
              latestGift.confirmationEmailMessageId ||
              '',
          }
        );
      }

      if (
        isRecentSendingLock(
          latestGift.confirmationEmailStatus,
          latestGift.confirmationEmailAttemptedAt
        )
      ) {
        return sendJson(
          response,
          200,
          {
            ok: true,
            sent: false,
            processing: true,
            to,
          }
        );
      }

      throw claimError;
    }

    const orderCode =
      String(
        gift.orderCode ||
        gift.paymentReference ||
        giftId
      );

    const templateName =
      String(
        gift.templateName ||
        (
          gift.templateId ===
          'love-01'
            ? 'Love Story 01'
            : gift.templateId ||
              'Dearly Gift'
        )
      );

    const customerName =
      String(
        gift.customer
          ?.fullName ||
        gift.senderName ||
        'bạn'
      );

    const amount =
      typeof gift.price ===
        'number'
        ? formatVnd(
            gift.price
          )
        : 'Đã thanh toán';

    const giftUrl =
      `${appUrl}/gift/${encodeURIComponent(
        giftId
      )}`;

    const qrResponse =
      await fetch(
        buildGiftQrUrl(
          giftUrl
        )
      );

    if (!qrResponse.ok) {
      throw new Error(
        'Không tạo được QR để gửi email.'
      );
    }

    const qrPng =
      Buffer.from(
        await qrResponse.arrayBuffer()
      );

    const messageId =
      `${Date.now()}.${randomUUID()}@dearly.local`;

    const subject =
      `Dearly đã xác nhận đơn ${orderCode} 💌`;

    const html =
      buildEmailHtml({
        customerName,
        orderCode,
        templateName,
        amount,
        giftUrl,
      });

    try {
      await sendViaGmailSmtp({
        user:
          gmailUser,
        appPassword:
          gmailAppPassword,
        fromName:
          gmailFromName,
        to,
        subject,
        html,
        qrPng,
        orderCode,
        messageId,
      });
    } catch (
      smtpError: any
    ) {
      try {
        await firestorePatch(
          `gifts/${giftId}`,
          idToken,
          {
            confirmationEmailStatus:
              'failed',
            confirmationEmailError:
              String(
                smtpError
                  ?.message ||
                'Gmail SMTP failed.'
              ).slice(
                0,
                500
              ),
          }
        );
      } catch {
        // best effort
      }

      throw smtpError;
    }

    try {
      await firestorePatch(
        `gifts/${giftId}`,
        idToken,
        {
          confirmationEmailStatus:
            'sent',
          confirmationEmailSentAt:
            new Date(),
          confirmationEmailMessageId:
            messageId,
          confirmationEmailTo:
            to,
          confirmationEmailError:
            '',
        }
      );
    } catch (
      metadataError
    ) {
      console.warn(
        'Confirmation email metadata update failed:',
        giftId,
        metadataError
      );
    }

    return sendJson(
      response,
      200,
      {
        ok: true,
        sent: true,
        to,
        messageId,
      }
    );
  } catch (
    error: any
  ) {
    console.error(
      'Gmail order confirmation:',
      error
    );

    return sendJson(
      response,
      500,
      {
        error:
          error?.message ||
          'Không gửi được email xác nhận.',
      }
    );
  }
}
