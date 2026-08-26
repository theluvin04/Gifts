import React from 'react';

export interface PersonalizeTab {
  id: string;
  label: string;
  icon?: React.ComponentType<{
    className?: string;
  }>;
}

interface Action {
  label: string;
  onClick: () => void;
}

interface Props {
  title: string;
  tabs: PersonalizeTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
  primaryAction: Action;
  secondaryActions?: Action[];
  error?: string;
}

export const PersonalizePageShell:
React.FC<Props> = ({
  title,
  tabs,
  activeTab,
  onTabChange,
  children,
  primaryAction,
  secondaryActions = [],
  error = '',
}) => (
  <div className="min-h-[100svh] bg-[#fffaf8] pb-24 text-[#191919] sm:pb-8">
    <main className="mx-auto w-full max-w-[1280px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#c9435d]">
            Cá nhân hoá
          </p>
          <h1 className="mt-1 truncate text-xl font-black tracking-[-0.035em] sm:text-2xl">
            {title}
          </h1>
        </div>

        <span className="hidden shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700 sm:inline-flex">
          Tự lưu
        </span>
      </div>

      <div className="sticky top-[62px] z-30 -mx-3 border-y border-black/[0.055] bg-[#fffaf8]/95 px-3 py-2 backdrop-blur-xl sm:top-[68px] sm:mx-0 sm:rounded-[15px] sm:border sm:bg-white sm:p-1.5">
        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={[
                  'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[11px] px-3.5 text-xs font-black transition sm:min-h-11',
                  active
                    ? 'bg-[#191919] text-white'
                    : 'bg-white text-black/42 hover:bg-black/[0.035] hover:text-black/70 sm:bg-transparent',
                ].join(' ')}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-[13px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      <section className="mt-4 overflow-hidden rounded-[18px] border border-black/[0.07] bg-white p-4 shadow-[0_14px_45px_rgba(55,25,35,0.045)] sm:mt-5 sm:rounded-[22px] sm:p-6 lg:p-7">
        {children}
      </section>

      <div className="mt-4 hidden items-center justify-between gap-3 sm:flex">
        <div className="flex flex-wrap gap-2">
          {secondaryActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="min-h-11 rounded-[11px] border border-black/[0.09] bg-white px-4 text-xs font-bold text-black/48 transition hover:border-black/[0.15] hover:text-black/70"
            >
              {action.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={primaryAction.onClick}
          className="min-h-11 rounded-[11px] bg-[#191919] px-6 text-xs font-black text-white transition hover:bg-[#c9435d]"
        >
          {primaryAction.label}
        </button>
      </div>
    </main>

    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/[0.07] bg-white/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl sm:hidden">
      <div className="mx-auto flex max-w-lg gap-2">
        {secondaryActions[0] && (
          <button
            type="button"
            onClick={secondaryActions[0].onClick}
            className="min-h-12 shrink-0 rounded-[13px] border border-black/[0.09] bg-white px-4 text-xs font-bold text-black/50"
          >
            {secondaryActions[0].label}
          </button>
        )}

        <button
          type="button"
          onClick={primaryAction.onClick}
          className="min-h-12 min-w-0 flex-1 rounded-[13px] bg-[#191919] px-5 text-sm font-black text-white"
        >
          {primaryAction.label}
        </button>
      </div>
    </div>
  </div>
);

export const PersonalizeSectionHeader:
React.FC<{
  title: string;
  hint?: string;
}> = ({
  title,
  hint,
}) => (
  <div className="mb-5">
    <h2 className="text-lg font-black tracking-[-0.025em] text-[#191919] sm:text-xl">
      {title}
    </h2>
    {hint && (
      <p className="mt-1 text-xs leading-5 text-black/35">
        {hint}
      </p>
    )}
  </div>
);

export const PersonalizeInput:
React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({
  label,
  value,
  onChange,
  placeholder,
}) => (
  <label className="block min-w-0">
    <span className="mb-1.5 block text-xs font-bold text-black/58">
      {label}
    </span>
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="min-h-12 w-full rounded-[11px] border border-black/[0.09] bg-[#fcfbfa] px-3.5 text-[16px] text-black/70 outline-none transition placeholder:text-black/22 focus:border-[#c9435d]/40 focus:bg-white focus:ring-2 focus:ring-[#c9435d]/10 sm:text-sm"
    />
  </label>
);

export const PersonalizeTextarea:
React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}) => (
  <label className="block min-w-0">
    <span className="mb-1.5 block text-xs font-bold text-black/58">
      {label}
    </span>
    <textarea
      value={value}
      rows={rows}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full resize-y rounded-[11px] border border-black/[0.09] bg-[#fcfbfa] px-3.5 py-3 text-[16px] leading-6 text-black/70 outline-none transition placeholder:text-black/22 focus:border-[#c9435d]/40 focus:bg-white focus:ring-2 focus:ring-[#c9435d]/10 sm:text-sm"
    />
  </label>
);
