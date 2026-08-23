import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { RotateCcw, Sparkles, X } from 'lucide-react';

import { LoveConfig } from '../types';

interface QuickConfigModalProps {
  open: boolean;
  config: LoveConfig;
  onClose: () => void;
  onSave: (config: LoveConfig) => void;
  onReset: () => void;
}

export const QuickConfigModal: React.FC<
  QuickConfigModalProps
> = ({
  open,
  config,
  onClose,
  onSave,
  onReset,
}) => {
  const [senderName, setSenderName] = useState(
    config.couple.senderName
  );
  const [receiverName, setReceiverName] = useState(
    config.couple.receiverName
  );
  const [question, setQuestion] = useState(
    config.proposal.question
  );
  const [yesText, setYesText] = useState(
    config.proposal.yesBtnText
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setSenderName(config.couple.senderName);
    setReceiverName(config.couple.receiverName);
    setQuestion(config.proposal.question);
    setYesText(config.proposal.yesBtnText);
  }, [open, config]);

  const handleSave = () => {
    onSave({
      ...config,
      couple: {
        ...config.couple,
        senderName,
        receiverName,
      },
      proposal: {
        ...config.proposal,
        question,
        yesBtnText: yesText,
      },
      gifts: {
        ...config.gifts,
        gift3: {
          ...config.gifts.gift3,
          letter: {
            ...config.gifts.gift3.letter,
            salutation: `Gửi ${receiverName},`,
            signature: senderName,
          },
        },
      },
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{
              scale: 0.94,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            exit={{
              scale: 0.94,
              opacity: 0,
            }}
            className="w-full max-w-md rounded-3xl border-2 border-rose-200 bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-rose-500" />

                <h3 className="text-base font-bold text-slate-800">
                  Tùy chỉnh nhanh
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <Field
                label="Tên người nhận"
                value={receiverName}
                onChange={setReceiverName}
              />

              <Field
                label="Tên người gửi"
                value={senderName}
                onChange={setSenderName}
              />

              <Field
                label="Câu hỏi chính"
                value={question}
                onChange={setQuestion}
              />

              <Field
                label="Nội dung nút YES"
                value={yesText}
                onChange={setYesText}
              />
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onReset();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Mặc định
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-bold text-white transition hover:bg-rose-600"
              >
                Lưu thay đổi ✨
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
}) => (
  <div>
    <label className="mb-1 block text-xs font-bold text-slate-700">
      {label}
    </label>

    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
    />
  </div>
);