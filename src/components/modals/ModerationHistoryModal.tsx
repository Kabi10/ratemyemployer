'use client'

import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface ModerationHistoryEntry {
  id: number;
  action: string;
  note: string | null;
  previous_status: string | null;
  new_status: string;
  created_at: string;
  moderator: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
}

interface ModerationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ModerationHistoryEntry[];
  reviewTitle: string;
}

export function ModerationHistoryModal({
  isOpen,
  onClose,
  history,
  reviewTitle
}: ModerationHistoryModalProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Moderation History - {reviewTitle}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((entry) => (
                <div
                  key={entry.id}
                  className="border rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">
                        {entry.moderator?.full_name || entry.moderator?.email || 'Unknown Moderator'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {entry.previous_status && (
                        <>
                          {getStatusBadge(entry.previous_status)}
                          <span className="text-gray-400">→</span>
                        </>
                      )}
                      {getStatusBadge(entry.new_status)}
                    </div>
                  </div>
                  {entry.note && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
                      {entry.note}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No moderation history available
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 