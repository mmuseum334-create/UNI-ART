'use client';

import { useState, useEffect } from 'react';
import { Users, Pencil, X, ChevronDown } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { roleService } from '@/services/rbac/roleService';
import { ROLES } from '@/services/rbac/permissionService';
import { useColor } from '@/contexts/ColorContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  AdminPage, AdminHeader, SearchInput,
  TableCard, Table, EmptyRow, IconBtn,
  Field, FormTextarea, ErrorBanner, Avatar, GhostBtn, PrimaryBtn,
} from '@/components/admin/AdminShell';

const ROLE_COLORS = {
  super_admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  admin:       'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  moderator:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  artist:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

export default function UsersAdminPage() {
  return (
    <ProtectedRoute adminOnly redirectTo="/">
      <UsersContent />
    </ProtectedRoute>
  );
}

function UsersContent() {
  const { color }            = useColor();
  const { canAssignSuperAdmin } = usePermissions();

  const [users,   setUsers]   = useState([]);
  const [roles,   setRoles]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(false);
  const [sel,     setSel]     = useState(null);
  const [roleId,  setRoleId]  = useState('');
  const [saving,  setSaving]  = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    const [ur, rr] = await Promise.all([roleService.getAllUsers(), roleService.getAllRoles()]);
    if (ur.success) setUsers(ur.data);
    else setError(ur.error || 'Error al cargar usuarios');
    if (rr.success) setRoles(rr.data);
    setLoading(false);
  };

  const openModal  = (u)  => { setSel(u); setRoleId(u.role?.id ?? ''); setModal(true); };
  const closeModal = ()   => { setModal(false); setSaving(false); };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!roleId) return;
    setSaving(true);
    const res = await roleService.assignRoleToUser(sel.id, Number(roleId));
    if (res.success) { closeModal(); load(); }
    else { setError(res.error); setSaving(false); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadgeClass = (name) => ROLE_COLORS[name] ?? 'bg-slate-100 text-slate-600 dark:bg-dark-tertiary dark:text-slate-400';

  return (
    <AdminPage>
      <AdminHeader
        icon={Users}
        title="Usuarios"
        subtitle={`${users.length} usuarios registrados`}
      />

      <div className="flex items-center gap-4 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o correo..." />
      </div>

      <ErrorBanner message={error} />

      <TableCard>
        <Table headers={['Usuario', 'Correo', 'Rol', 'Registro', 'Acciones']} loading={loading} color={color}>
          {!loading && filtered.length === 0 && <EmptyRow cols={5} message="No se encontraron usuarios" />}
          {filtered.map(user => (
            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-dark-tertiary/30 transition-colors">
              {/* Usuario */}
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} color={color} />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</span>
                </div>
              </td>
              {/* Correo */}
              <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">{user.email}</td>
              {/* Rol */}
              <td className="px-5 py-4">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadgeClass(user.role?.name)}`}>
                  {user.role?.name ?? 'Sin rol'}
                </span>
              </td>
              {/* Registro */}
              <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-CO') : '—'}
              </td>
              {/* Acciones */}
              <td className="px-5 py-4">
                <IconBtn icon={Pencil} onClick={() => openModal(user)} title="Cambiar rol" />
              </td>
            </tr>
          ))}
        </Table>
      </TableCard>

      {/* ── Modal asignar rol ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-dark-secondary shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-dark-tertiary">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Asignar Rol</h2>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-tertiary transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAssign} className="px-6 py-5 space-y-4">
              {/* User info */}
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-dark-tertiary/50 px-4 py-3">
                <Avatar name={sel?.name} color={color} />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{sel?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{sel?.email}</p>
                </div>
              </div>

              {/* Selector */}
              <Field label="Nuevo rol">
                <div className="relative">
                  <select
                    required
                    value={roleId}
                    onChange={e => setRoleId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 dark:border-dark-tertiary bg-slate-50 dark:bg-dark-tertiary px-3.5 py-2.5 pr-9 text-sm text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="">Selecciona un rol...</option>
                    {roles
                      .filter(r => r.name !== ROLES.SUPER_ADMIN || canAssignSuperAdmin())
                      .map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </Field>

              <div className="flex items-center justify-end gap-3 pt-1">
                <GhostBtn onClick={closeModal}>Cancelar</GhostBtn>
                <PrimaryBtn type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : 'Asignar'}
                </PrimaryBtn>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
