'use client';

import { useState, useTransition } from 'react';
import { Send, Trash2, User } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface CommentData {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    username: string;
    id: string;
  };
}

interface GuideCommentsProps {
  guideId: string;
  initialComments: CommentData[];
}

export function GuideComments({ guideId, initialComments }: GuideCommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isPending, startTransition] = useTransition();

  async function handleSubmit() {
    if (!newComment.trim() || !session?.user) return;

    startTransition(async () => {
      try {
        const res = await fetch('/api/v1/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guideId, content: newComment.trim() }),
        });

        if (!res.ok) throw new Error('Failed to post comment');

        const { data } = (await res.json()) as { data: CommentData };
        setComments((prev) => [data, ...prev]);
        setNewComment('');
      } catch {
        // Silent fail — user sees no new comment
      }
    });
  }

  async function handleDelete(commentId: string) {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/v1/comments?id=${commentId}`, {
          method: 'DELETE',
        });

        if (!res.ok) throw new Error('Failed to delete');

        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } catch {
        // Silent fail
      }
    });
  }

  const timeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'ahora';
    if (diffMin < 60) return `hace ${diffMin}m`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `hace ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    return `hace ${diffD}d`;
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      {session?.user ? (
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-fire-500/15 border border-fire-500/20 flex items-center justify-center">
            <User className="w-4 h-4 text-fire-400" />
          </div>
          <div className="flex-1 flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Escribe un comentario..."
              className="flex-1 glass-card !rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-ice-500/40 focus:outline-none focus:ring-1 focus:ring-ice-500/30 resize-none transition-colors min-h-[44px]"
              aria-label="Escribe un comentario"
            />
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || isPending}
              className="flex-shrink-0 p-3 rounded-xl text-white hover:shadow-[0_0_16px_rgba(255,106,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-h-[44px]"
              style={{ background: 'linear-gradient(135deg, #ff6a00, #c2410c)' }}
              aria-label="Enviar comentario"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-4 text-center text-sm text-slate-400">
          <a href="/login" className="text-fire-400 hover:text-fire-300 transition-colors">
            Inicia sesión
          </a>{' '}
          para dejar un comentario
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-3">
        {comments.map((comment) => {
          const isOwner =
            session?.user &&
            (session.user as unknown as { id?: string }).id === comment.user.id;

          return (
            <div
              key={comment.id}
              className="flex items-start gap-3 p-3 glass-card"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ice-500/15 border border-ice-500/20 flex items-center justify-center">
                <User className="w-4 h-4 text-ice-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-[family-name:var(--font-rajdhani)] font-medium text-white">
                    {comment.user.username || 'Anónimo'}
                  </span>
                  <span className="font-numbers text-xs text-slate-500">{timeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-300 break-words">{comment.content}</p>
              </div>
              {isOwner && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="flex-shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Eliminar comentario"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}

        {comments.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-6 font-[family-name:var(--font-rajdhani)]">
            Sé el primero en comentar
          </p>
        )}
      </div>
    </div>
  );
}
