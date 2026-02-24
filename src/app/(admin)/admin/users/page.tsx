import { Download } from 'lucide-react';

import { AdminUsersTable } from '@/components/admin/admin-users-table';

export default function AdminUsersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Usuarios</h1>
        <a
          href="/api/admin/users/export"
          className="flex items-center gap-2 text-xs font-ui text-fire-400 hover:text-fire-300 transition-colors min-h-[44px] px-3"
        >
          <Download size={14} />
          Exportar CSV
        </a>
      </div>
      <AdminUsersTable />
    </div>
  );
}
