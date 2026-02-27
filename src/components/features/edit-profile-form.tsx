'use client';

import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

// ══════════════════════════════════════════════════════════
// Formulario de edición de perfil (client component)
// Permite cambiar username y bio con validación client-side
// ══════════════════════════════════════════════════════════

interface EditProfileFormProps {
  initialData: {
    username: string;
    avatarUrl: string | null;
    bio: string | null;
  };
}

interface ProfileApiResponse {
  success: boolean;
  data?: { username: string; bio: string | null };
  error?: { code: string; message: string; statusCode: number };
}

export function EditProfileForm({ initialData }: EditProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState(initialData.username);
  const [bio, setBio] = useState(initialData.bio ?? '');
  const [loading, setLoading] = useState(false);

  const isValid = username.length >= 3 && username.length <= 30 && /^[a-zA-Z0-9_-]+$/.test(username);

  const handleSubmit = async () => {
    if (!isValid) {
      toast('error', 'El nombre de usuario debe tener 3-30 caracteres (letras, números, _ y -)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, bio }),
      });
      const data: ProfileApiResponse = await res.json();
      if (data.success) {
        toast('success', 'Perfil actualizado');
        router.refresh();
      } else {
        toast('error', data.error?.message ?? 'Error al actualizar');
      }
    } catch {
      toast('error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-slate-400 font-ui mb-1 block">Nombre de usuario</label>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={30}
          placeholder="tu_nombre"
        />
        {username.length > 0 && !isValid && (
          <p className="text-[10px] text-danger mt-1">
            Solo letras, números, _ y - (mínimo 3 caracteres)
          </p>
        )}
      </div>
      <div>
        <label className="text-xs text-slate-400 font-ui mb-1 block">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={160}
          rows={3}
          className="w-full rounded-gaming bg-background-card border border-white/10 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-fire-500/50 focus:outline-none resize-none"
          placeholder="Escribe algo sobre ti..."
        />
        <p className="text-[10px] text-slate-600 mt-1">{bio.length}/160</p>
      </div>
      <Button
        variant="primary"
        onClick={handleSubmit}
        isLoading={loading}
        leftIcon={<Save size={16} />}
        disabled={!isValid}
      >
        Guardar Cambios
      </Button>
    </div>
  );
}
