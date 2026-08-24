import React from 'react';

import { BRAND } from '../../config/brand';
import { BANK_TRANSFER_CONFIG } from '../../config/payment';
import { AdminSession } from '../../services/adminService';

export const AdminSettingsTab:
React.FC<{
  session: AdminSession;
}> = ({ session }) => (
  <div className="grid gap-5 lg:grid-cols-2">
    <section className="border border-black/8 bg-white p-5 sm:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b83e57]">
        Brand
      </p>

      <img
        src={BRAND.logoPath}
        alt={BRAND.name}
        className="mt-5 h-16 w-auto object-contain"
      />

      <dl className="mt-6 space-y-4 text-xs">
        <SettingLine label="Tên" value={BRAND.name} />
        <SettingLine label="Tagline" value={BRAND.tagline} />
        <SettingLine label="Admin" value={session.email || '—'} />
      </dl>
    </section>

    <section className="border border-black/8 bg-white p-5 sm:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b83e57]">
        Thanh toán
      </p>

      <h2 className="mt-4 text-xl font-black">
        {BANK_TRANSFER_CONFIG.bankName}
      </h2>

      <dl className="mt-6 space-y-4 text-xs">
        <SettingLine label="Số tài khoản" value={BANK_TRANSFER_CONFIG.accountNo} />
        <SettingLine label="BIN" value={BANK_TRANSFER_CONFIG.bankId} />
        <SettingLine label="QR template" value={BANK_TRANSFER_CONFIG.template} />
      </dl>

      <p className="mt-6 border-t border-black/8 pt-4 text-[11px] leading-5 text-black/40">
        Tài khoản ngân hàng vẫn nằm trong src/config/payment.ts. Tab này chỉ giúp kiểm tra nhanh cấu hình đang chạy.
      </p>
    </section>
  </div>
);

const SettingLine: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => (
  <div className="grid grid-cols-[110px_1fr] gap-3 border-b border-black/6 pb-3 last:border-b-0">
    <dt className="text-black/35">{label}</dt>
    <dd className="break-all font-bold text-black/65">{value}</dd>
  </div>
);
