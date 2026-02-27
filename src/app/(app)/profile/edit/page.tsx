import { prisma } from '@ares/database';
import { redirect } from 'next/navigation';

import { EditProfileForm } from '@/components/features/edit-profile-form';
import { auth } from '@/lib/auth';

// ══════════════════════════════════════════════════════════
// Página de edición de perfil
// Server component que carga datos iniciales y renderiza el form
// ══════════════════════════════════════════════════════════

export const metadata = {
  title: 'Editar Perfil | Sensibilidades PRO',
  description: 'Actualiza tu nombre de usuario y biografía.',
};

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, avatarUrl: true, bio: true },
  });
  if (!user) redirect('/login');

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-display font-bold text-white mb-6">Editar Perfil</h1>
      <EditProfileForm initialData={user} />
    </div>
  );
}
