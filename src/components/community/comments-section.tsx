'use client';

import { useState, useEffect, useCallback } from 'react';
import { Send, Flag, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

// ═══════════════════════════════════════════════════════════════
// CommentsSection — Comentarios en guías y configs compartidas
// Soporta: crear, reportar, replies, paginacion
// ═══════════════════════════════════════════════════════════════

interface CommentUser {
  id: string;
  username: string;
  avatarUrl: string | null;
  tier: string;
}

interface CommentReply {
  id: string;
  content: string;
  createdAt: string;
  user: CommentUser;
}

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  user: CommentUser;
  replies: CommentReply[];
}

interface CommentsSectionProps {
  guideId?: string;
  sharedConfigId?: string;
}

function getTierVariant(tier: string): 'vip' | 'premium' | 'free' {
  if (tier === 'VIP') return 'vip';
  if (tier === 'PREMIUM') return 'premium';
  return 'free';
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin}m`;
  if (diffHr < 24) return `hace ${diffHr}h`;
  if (diffDay < 7) return `hace ${diffDay}d`;
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

interface CommentCardProps {
  comment: CommentData | CommentReply;
  onReport: (commentId: string) => void;
  onReply?: (commentId: string) => void;
  isReply?: boolean;
}

function CommentCard({ comment, onReport, onReply, isReply = false }: CommentCardProps) {
  return (
    <div className={isReply ? 'ml-6 border-l border-white/5 pl-4' : ''}>
      <div className="glass p-4 rounded-gaming">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-fire-500 to-ice-500 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white uppercase">
                {comment.user.username.charAt(0)}
              </span>
            </div>
            <span className="text-sm font-ui font-semibold text-white">
              {comment.user.username}
            </span>
            <Badge variant={getTierVariant(comment.user.tier)} size="sm">
              {comment.user.tier}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-600">
              {formatRelativeDate(comment.createdAt)}
            </span>
            <button
              onClick={() => onReport(comment.id)}
              className="p-1 text-slate-600 hover:text-warning transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
              title="Reportar comentario"
            >
              <Flag size={12} />
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{comment.content}</p>
        {!isReply && onReply && (
          <button
            onClick={() => onReply(comment.id)}
            className="mt-2 flex items-center gap-1 text-[11px] text-slate-500 hover:text-ice-400 transition-colors"
          >
            <MessageSquare size={12} />
            Responder
          </button>
        )}
      </div>
    </div>
  );
}

export function CommentsSection({ guideId, sharedConfigId }: CommentsSectionProps) {
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});

  const fetchComments = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      const params = new URLSearchParams();
      if (guideId) params.set('guideId', guideId);
      if (sharedConfigId) params.set('sharedConfigId', sharedConfigId);
      params.set('page', String(pageNum));
      params.set('limit', '20');

      const res = await fetch(`/api/comments?${params.toString()}`);
      const json: {
        success: boolean;
        data: CommentData[];
        meta: { total: number; totalPages: number };
      } = await res.json();

      if (json.success) {
        setComments((prev) => append ? [...prev, ...json.data] : json.data);
        setTotal(json.meta.total);
        setHasMore(pageNum < json.meta.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [guideId, sharedConfigId]);

  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  const handleSubmit = async () => {
    const trimmed = newComment.trim();
    if (!trimmed || trimmed.length < 3) return;

    setSubmitting(true);
    try {
      const body: Record<string, string> = { content: trimmed };
      if (guideId) body.guideId = guideId;
      if (sharedConfigId) body.sharedConfigId = sharedConfigId;
      if (replyTo) body.parentId = replyTo;

      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json: {
        success: boolean;
        data: CommentData;
        error?: { message: string };
      } = await res.json();

      if (json.success) {
        if (replyTo) {
          // Agregar reply al comentario padre
          setComments((prev) =>
            prev.map((c) =>
              c.id === replyTo
                ? { ...c, replies: [...c.replies, json.data] }
                : c,
            ),
          );
          setShowReplies((prev) => ({ ...prev, [replyTo]: true }));
          setReplyTo(null);
        } else {
          setComments((prev) => [json.data, ...prev]);
          setTotal((prev) => prev + 1);
        }
        setNewComment('');
        toast('success', 'Comentario publicado');
      } else {
        toast('error', json.error?.message ?? 'Error al publicar comentario');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/report`, { method: 'POST' });
      const json: {
        success: boolean;
        error?: { message: string };
      } = await res.json();

      if (json.success) {
        toast('success', 'Reportado. Lo revisaremos pronto.');
      } else {
        toast('error', json.error?.message ?? 'Error al reportar');
      }
    } catch {
      toast('error', 'Error al reportar comentario');
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage, true);
  };

  const toggleReplies = (commentId: string) => {
    setShowReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-40 bg-white/5 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass p-4 rounded-gaming space-y-2 animate-pulse">
            <div className="h-4 w-32 bg-white/5 rounded" />
            <div className="h-3 w-full bg-white/5 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
        <MessageSquare size={18} className="text-ice-400" />
        Comentarios ({total})
      </h3>

      {/* Nuevo comentario */}
      <div className="mb-6">
        {replyTo && (
          <div className="flex items-center gap-2 mb-2 text-xs text-ice-400">
            <MessageSquare size={12} />
            <span>Respondiendo a un comentario</span>
            <button
              onClick={() => setReplyTo(null)}
              className="text-slate-500 hover:text-white underline"
            >
              Cancelar
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyTo ? 'Escribe tu respuesta...' : 'Escribe un comentario...'}
            maxLength={500}
            rows={2}
            className="flex-1 rounded-gaming bg-background-card border border-white/10 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-fire-500/50 focus:outline-none resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={submitting}
            disabled={newComment.trim().length < 3}
          >
            <Send size={16} />
          </Button>
        </div>
        <div className="flex justify-end mt-1">
          <span className="text-[10px] text-slate-600">{newComment.length}/500</span>
        </div>
      </div>

      {/* Lista de comentarios */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare size={32} className="mx-auto text-slate-700 mb-2" />
          <p className="text-sm text-slate-500">
            No hay comentarios todavia. Se el primero en comentar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id}>
              <CommentCard
                comment={comment}
                onReport={handleReport}
                onReply={(id) => {
                  setReplyTo(id);
                  setNewComment('');
                }}
              />

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="mt-1">
                  <button
                    onClick={() => toggleReplies(comment.id)}
                    className="ml-6 flex items-center gap-1 text-[11px] text-slate-500 hover:text-ice-400 transition-colors py-1"
                  >
                    {showReplies[comment.id] ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    )}
                    {comment.replies.length} {comment.replies.length === 1 ? 'respuesta' : 'respuestas'}
                  </button>

                  {showReplies[comment.id] && (
                    <div className="mt-1 space-y-2">
                      {comment.replies.map((reply) => (
                        <CommentCard
                          key={reply.id}
                          comment={reply}
                          onReport={handleReport}
                          isReply
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Cargar mas */}
          {hasMore && (
            <div className="text-center pt-2">
              <Button variant="ghost" size="sm" onClick={handleLoadMore}>
                Cargar mas comentarios
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
