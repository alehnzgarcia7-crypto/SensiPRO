import { redirect } from 'next/navigation';

// Sistema de referidos oculto temporalmente de la UI.
// Backend y DB intactos para reactivación futura.

export default function ReferralsPage() {
  redirect('/profile');
}
