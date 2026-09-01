'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatSidebar from '@/components/chat/ChatSidebar';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { useConsultation } from '@/hooks/useConsultations';
import { useChat } from '@/hooks/useChat';
import { useCurrentUser } from '@/hooks/useAuth';

export default function PatientConsultationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useCurrentUser();
  const t = useTranslations('patient.room');
  const tc = useTranslations('common');

  const { data: consultation, isLoading } = useConsultation(id);
  const { messages, send, notifyTyping, ended, peerTyping } = useChat(
    Number(id),
    consultation?.messages ?? [],
  );

  const locked = ended || consultation?.status === 'COMPLETED';

  if (isLoading) return <Skeleton className="h-[70vh] w-full rounded-xl" />;

  return (
    <div className="-m-4 flex h-[calc(100vh-3.5rem)] flex-col lg:-m-6">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <button
          onClick={() => router.back()}
          aria-label={tc('back')}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">
            {consultation?.doctor?.fullName ?? t('yourDoctor')}
          </p>
          <p className="text-xs text-slate-500">{consultation?.reason}</p>
        </div>
        <Badge tone={locked ? 'gray' : 'green'} dot>
          {locked ? t('ended') : t('connected')}
        </Badge>
      </div>

      <div className="flex min-h-0 flex-1">
        <ChatWindow
          messages={messages}
          currentUserId={user?.id}
          onSend={send}
          onTyping={notifyTyping}
          peerTyping={peerTyping}
          locked={locked}
          peerName={consultation?.doctor?.fullName}
        />
        <ChatSidebar patient={consultation?.patient} />
      </div>
    </div>
  );
}
