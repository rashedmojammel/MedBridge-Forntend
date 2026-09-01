'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormat } from '@/hooks/useFormat';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types';

export default function ChatWindow({
  messages,
  currentUserId,
  onSend,
  onTyping,
  peerTyping,
  locked,
  peerName,
}: {
  messages: ChatMessage[];
  currentUserId?: number;
  onSend: (text: string) => void;
  onTyping: () => void;
  peerTyping: boolean;
  locked: boolean;
  peerName?: string;
}) {
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('chat');
  const f = useFormat();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, peerTyping]);

  const submit = () => {
    if (!text.trim() || locked) return;
    onSend(text);
    setText('');
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">{t('noMessages')}</p>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const mine = m.sender?.id === currentUserId;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn('flex flex-col gap-1', mine ? 'items-end' : 'items-start')}
              >
                <span className="px-1 text-[11px] text-slate-400">
                  {mine ? t('you') : m.sender?.name} · {f.time(m.sentAt)}
                </span>
                <div
                  className={cn(
                    'max-w-[78%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
                    mine
                      ? 'rounded-br-sm bg-blue-600 text-white'
                      : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800',
                  )}
                >
                  {m.message}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {peerTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <div className="flex gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              {[0, 0.15, 0.3].map((d) => (
                <motion.span
                  key={d}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: d }}
                  className="h-1.5 w-1.5 rounded-full bg-slate-400"
                />
              ))}
            </div>
            <span className="text-xs text-slate-400">{t('typing', { name: peerName ?? '' })}</span>
          </motion.div>
        )}

        <div ref={endRef} />
      </div>

      <div className="border-t border-slate-200 bg-white p-3">
        {locked ? (
          <p className="py-2 text-center text-sm text-slate-400">{t('ended')}</p>
        ) : (
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                onTyping();
              }}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submit()}
              placeholder={t('placeholder')}
              className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <button
              onClick={submit}
              disabled={!text.trim()}
              aria-label={t('send')}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
