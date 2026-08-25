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
  <div className="grid gap-4 xl:grid-cols-3">
    <SettingsCard
      title="Tài khoản"
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
        mono
      />
    </SettingsCard>

    <SettingsCard
      title="Thương hiệu"
    >
      <div className="mb-4 rounded-[12px] bg-[#faf9f8] p-3">
        <img
          src={BRAND.logoPath}
          alt={BRAND.name}
          className="h-10 w-auto object-contain"
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
    >
      <SettingLine
        label="Ngân hàng"
        value={
          BANK_TRANSFER_CONFIG.bankName
        }
      />
      <SettingLine
        label="Số TK"
        value={
          BANK_TRANSFER_CONFIG.accountNo
        }
        mono
      />
      <SettingLine
        label="BIN"
        value={
          BANK_TRANSFER_CONFIG.bankId
        }
        mono
      />
    </SettingsCard>
  </div>
);

const SettingsCard:
React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({
  title,
  children,
}) => (
  <section className="rounded-[18px] border border-black/8 bg-white p-5">
    <h2 className="text-sm font-black">
      {title}
    </h2>
    <dl className="mt-4 space-y-3">
      {children}
    </dl>
  </section>
);

const SettingLine:
React.FC<{
  label: string;
  value: string;
  mono?: boolean;
}> = ({
  label,
  value,
  mono = false,
}) => (
  <div className="grid grid-cols-[84px_minmax(0,1fr)] gap-3 border-b border-black/6 pb-3 text-xs last:border-b-0 last:pb-0">
    <dt className="text-black/35">
      {label}
    </dt>
    <dd
      className={[
        'break-all font-bold text-black/65',
        mono ? 'font-mono text-[10px]' : '',
      ].join(' ')}
    >
      {value}
    </dd>
  </div>
);
