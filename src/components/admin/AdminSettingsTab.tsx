import React from 'react';

import {
  BRAND,
} from '../../config/brand';

import {
  BANK_TRANSFER_CONFIG,
} from '../../config/payment';

import {
  AdminSession,
} from '../../services/adminService';

export const AdminSettingsTab:
React.FC<{
  session: AdminSession;
}> = ({ session }) => (
  <div className="grid gap-5 xl:grid-cols-2">
    <SettingsCard
      title="Tài khoản Admin"
      description="Tài khoản Google đang có quyền truy cập hệ thống."
    >
      <SettingLine
        label="Tên"
        value={
          session.displayName ||
          'Google Admin'
        }
      />
      <SettingLine
        label="Email"
        value={
          session.email || '—'
        }
      />
      <SettingLine
        label="UID"
        value={
          session.uid || '—'
        }
      />
    </SettingsCard>

    <SettingsCard
      title="Thương hiệu"
      description="Thông tin đang được dùng trên storefront."
    >
      <div className="mb-5 rounded-[12px] bg-[#faf9f8] p-4">
        <img
          src={
            BRAND.logoPath
          }
          alt={
            BRAND.name
          }
          className="h-12 w-auto object-contain"
        />
      </div>
      <SettingLine
        label="Tên"
        value={BRAND.name}
      />
      <SettingLine
        label="Tagline"
        value={BRAND.tagline}
      />
    </SettingsCard>

    <SettingsCard
      title="Thanh toán"
      description="Cấu hình chuyển khoản hiện tại."
    >
      <SettingLine
        label="Ngân hàng"
        value={
          BANK_TRANSFER_CONFIG.bankName
        }
      />
      <SettingLine
        label="Số tài khoản"
        value={
          BANK_TRANSFER_CONFIG.accountNo
        }
      />
      <SettingLine
        label="BIN"
        value={
          BANK_TRANSFER_CONFIG.bankId
        }
      />
      <SettingLine
        label="QR template"
        value={
          BANK_TRANSFER_CONFIG.template
        }
      />
    </SettingsCard>

    <SettingsCard
      title="Lưu ý cấu hình"
      description="Các mục này đang là cấu hình trong code, chưa phải form chỉnh trực tiếp."
    >
      <p className="text-xs leading-6 text-black/45">
        Brand nằm trong <code className="rounded bg-black/[0.04] px-1.5 py-1 font-mono text-[10px]">src/config/brand.ts</code> và thông tin ngân hàng nằm trong <code className="rounded bg-black/[0.04] px-1.5 py-1 font-mono text-[10px]">src/config/payment.ts</code>.
      </p>
    </SettingsCard>
  </div>
);

const SettingsCard:
React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({
  title,
  description,
  children,
}) => (
  <section className="rounded-[18px] border border-black/8 bg-white p-5 sm:p-6">
    <h2 className="text-sm font-black">
      {title}
    </h2>
    <p className="mt-1 text-[11px] leading-5 text-black/38">
      {description}
    </p>
    <dl className="mt-5 space-y-3">
      {children}
    </dl>
  </section>
);

const SettingLine:
React.FC<{
  label: string;
  value: string;
}> = ({
  label,
  value,
}) => (
  <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 border-b border-black/6 pb-3 text-xs last:border-b-0 last:pb-0">
    <dt className="text-black/35">
      {label}
    </dt>
    <dd className="break-all font-bold text-black/65">
      {value}
    </dd>
  </div>
);
