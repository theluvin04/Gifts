import {
  auth,
} from '../config/firebase';

export interface OrderConfirmationEmailResult {
  ok: boolean;
  sent: boolean;
  alreadySent?: boolean;
  processing?: boolean;
  to?: string;
  messageId?: string;
}

export const sendOrderConfirmationEmail =
  async (
    giftId: string
  ): Promise<
    OrderConfirmationEmailResult
  > => {
    const user =
      auth.currentUser;

    if (!user) {
      throw new Error(
        'Admin chưa đăng nhập.'
      );
    }

    const idToken =
      await user.getIdToken();

    const response =
      await fetch(
        '/api/send-order-confirmation',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            Authorization:
              `Bearer ${idToken}`,
          },
          body:
            JSON.stringify({
              giftId,
            }),
        }
      );

    let payload: any =
      null;

    try {
      payload =
        await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      throw new Error(
        payload?.error ||
          'Không gửi được email xác nhận đơn.'
      );
    }

    return payload as
      OrderConfirmationEmailResult;
  };
