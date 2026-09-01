'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatSidebar from '@/components/chat/ChatSidebar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import {
  useConsultation,
  useSaveDiagnosis,
  useCompleteConsultation,
} from '@/hooks/useConsultations';
import { useTriageHistory } from '@/hooks/useTriage';
import { useChat } from '@/hooks/useChat';
import { useCurrentUser } from '@/hooks/useAuth';
import { apiError } from '@/lib/api';

export default function DoctorConsultationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const user = useCurrentUser();

  const { data: consultation, isLoading } = useConsultation(id);
  const { data: triage } = useTriageHistory(consultation?.patient?.id);
  const saveDiagnosis = useSaveDiagnosis(Number(id));
  const complete = useCompleteConsultation(Number(id));

  const { messages, send, notifyTyping, ended, peerTyping } = useChat(
    Number(id),
    consultation?.messages ?? [],
  );

  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmEnd, setConfirmEnd] = useState(false);

  const locked = ended || consultation?.status === 'COMPLETED';

  if (isLoading) {
    return <Skeleton className="h-[70vh] w-full rounded-xl" />;
  }

  return (
    <div className="-m-4 flex h-[calc(100vh-3.5rem)] flex-col lg:-m-6">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {consultation?.patient?.fullName}
            </p>
            <p className="font-mono text-xs text-slate-500">
              {consultation?.patient?.mrn}
            </p>
          </div>
          <Badge tone={locked ? 'gray' : 'green'} dot>
            {locked ? 'Ended' : 'Live'}
          </Badge>
        </div>
        {!locked && (
          <Button variant="danger" size="sm" onClick={() => setConfirmEnd(true)}>
            End consultation
          </Button>
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        <ChatWindow
          messages={messages}
          currentUserId={user?.id}
          onSend={send}
          onTyping={notifyTyping}
          peerTyping={peerTyping}
          locked={locked}
          peerName={consultation?.patient?.fullName}
        />

        <ChatSidebar
          patient={consultation?.patient}
          vitals={triage?.vitals?.[0]}
          report={triage?.reports?.[0]}
        >
          <section className="border-t border-slate-100 pt-4">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Diagnosis
            </h3>
            <div className="space-y-3">
              <Input
                placeholder="e.g. Viral fever"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                disabled={locked}
              />
              <Textarea
                rows={3}
                placeholder="Clinical notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={locked}
              />
              <Button
                fullWidth
                size="sm"
                loading={saveDiagnosis.isPending}
                disabled={locked || !diagnosis.trim()}
                onClick={() =>
                  saveDiagnosis.mutate(
                    { diagnosis, notes },
                    {
                      onSuccess: () => toast('Diagnosis saved'),
                      onError: (e) => toast(apiError(e), 'error'),
                    },
                  )
                }
              >
                Save diagnosis
              </Button>
              <Link
                href={`/doctor/prescriptions/new?patientId=${consultation?.patient?.id}&consultationId=${id}`}
                className="block"
              >
                <Button variant="outline" fullWidth size="sm">
                  <FileText className="h-4 w-4" aria-hidden />
                  Write prescription
                </Button>
              </Link>
            </div>
          </section>
        </ChatSidebar>
      </div>

      <ConfirmDialog
        open={confirmEnd}
        onClose={() => setConfirmEnd(false)}
        onConfirm={() =>
          complete.mutate(undefined, {
            onSuccess: () => {
              toast('Consultation completed');
              setConfirmEnd(false);
            },
            onError: (e) => toast(apiError(e), 'error'),
          })
        }
        loading={complete.isPending}
        title="End this consultation?"
        description="The chat will be locked and the transcript becomes read-only. This cannot be undone."
        confirmLabel="End consultation"
      />
    </div>
  );
}
