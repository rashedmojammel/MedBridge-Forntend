'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getSocket } from '@/lib/socket';
import type { ChatMessage } from '@/types';

/**
 * Wires a consultation page to the backend's /chat gateway.
 * Seed it with the transcript from GET /consultations/:id, then this
 * hook appends anything that arrives live.
 */
export function useChat(consultationId?: number, initial: ChatMessage[] = []) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [connected, setConnected] = useState(false);
  const [ended, setEnded] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const typingTimer = useRef<any>(null);

  useEffect(() => setMessages(initial), [initial.length]);

  useEffect(() => {
    if (!consultationId) return;
    const socket = getSocket();

    const onConnect = () => {
      setConnected(true);
      socket.emit('joinRoom', { consultationId });
    };
    const onDisconnect = () => setConnected(false);
    const onNew = (msg: ChatMessage) =>
      setMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
      );
    const onTyping = () => {
      setPeerTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setPeerTyping(false), 1800);
    };
    const onEnded = () => setEnded(true);

    if (socket.connected) onConnect();
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('newMessage', onNew);
    socket.on('typing', onTyping);
    socket.on('consultationEnded', onEnded);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('newMessage', onNew);
      socket.off('typing', onTyping);
      socket.off('consultationEnded', onEnded);
      clearTimeout(typingTimer.current);
    };
  }, [consultationId]);

  const send = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean || !consultationId) return;
      getSocket().emit('sendMessage', { consultationId, text: clean });
    },
    [consultationId],
  );

  const notifyTyping = useCallback(() => {
    if (consultationId) getSocket().emit('typing', { consultationId });
  }, [consultationId]);

  return { messages, send, notifyTyping, connected, ended, peerTyping, setEnded };
}
