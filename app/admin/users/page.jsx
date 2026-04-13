'use client';

import { useState, useEffect } from 'react';
import { Users, Pencil, X, ChevronDown } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { roleService } from '@/services/rbac/roleService';
import { ROLES } from '@/services/rbac/permissionService';
import { useColor } from '@/contexts/ColorContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  AdminPage, AdminHeader, SearchInput, TableCard, Table,
  EmptyRow, IconBtn, Field, FormInput, FormSelect,
  ErrorBanner, GhostBtn, PrimaryBtn, Avatar,
  usePagination, Pagination,
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
  const { color }               = useColor();
  const { canAssignSuperAdmin } = usePermissions();

  const [users,   setUsers]   = useState([]);
  const [roles,   setRoles]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(false);
  const [sel,     setSel]     = useState(null);
  const [saving,  setSaving]  = useState(false);

  // Form
  const [fName,   setFName]   = useState('');
  const [fEmail,  setFEmail]  = useState('');
  const [fRoleId, setFRoleId] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true); setError('');
    const [ur, rr] = await Promise.all([roleService.getAllUsers(), roleService.getAllRoles()]);
    if (ur.success) setUsers(ur.data);
    else setError(ur.error || 'Error al cargar usuarios');
    if (rr.success) setRoles(rr.data);
    setLoading(false);
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const { page, total, paged, goTo } = usePagination(filtered, 15);

  const openEdit = (u) => {
    setSel(u);
    setFName(u.name ?? '');
    setFEmail(u.email ?? '');
    setFRoleId(u.role?.id ?? '');
    setModal(true);
  };
  const closeModal = () => { setModal(false); setSaving(false); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Assign role if changed
    if (fRoleId && fRoleId !== String(sel.role?.id)) {
      const res = await roleService.assignRoleToUser(sel.id, Number(fRoleId));
      if (!res.success) { setError(res.error); setSaving(false); return; }
    }
    closeModal(); load();
  };

  const roleBadgeClass = (name) => ROLE_COLORS[name] ?? 'bg-slate-100 text-slate-600 dark:bg-dark-tertiary dark:text-slate-400';

  return (
    <AdminPage>
      <AdminHeader icon={Users} title="Usuarios" subtitle={`${users.length} usuarios registrados`} />

      <div className="flex items-center gap-4 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, correo o rol..." />
        <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto">{filtered.length} resultados</span>
      </div>

      <ErrorBanner message={error} />

      <TableCard>
        <Table headers={['Usuario', 'Correo', 'Rol', 'Registro', 'Acciones']} loading={loading} color={color}>
          {!loading && paged.length === 0 && <EmptyRow cols={5} message="No se encontraron usuarios" />}
          {paged.map(user => (
            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-dark-tertiary/30 transition-colors">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} color={color} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">ID #{user.id}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{user.email}</td>
              <td className="px-5 py-3.5">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadgeClass(user.role?.name)}`}>
                  {user.role?.name ?? 'Sin rol'}
                </span>
              </td>
              <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-CO') : '—'}
              </td>
              <td className="px-5 py-3.5">
                <IconBtn icon={Pencil} onClick={() => openEdit(user)} title="Editar usuario" />
              </td>
            </tr>
          ))}
        </Table>

        {!loading && (
          <div className="px-5 pb-4">
            <Pagination page={page} total={total} goTo={goTo} />
          </div>
        )}
      </TableCard>

      {/* Modal editar usuario */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-dark-secondary shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-dark-tertiary">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Editar usuario</h2>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {/* Info */}
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-dark-tertiary/50 px-4 py-3">
                <Avatar name={sel?.name} color={color} />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{sel?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{sel?.email}</p>
                </div>
              </div>

              <Field label="Nombre">
                <FormInput value={fName} onChange={setFName} placeholder="Nombre completo" />
              </Field>

              <Field label="Correo">
                <FormInput value={fEmail} onChange={setFEmail} placeholder="correo@unipaz.edu.co" type="email" />
              </Field>

              <Field label="Rol">
                <FormSelect value={fRoleId} onChange={setFRoleId}>
                  <option value="">Sin rol</option>
                  {roles
                    .filter(r => r.name !== ROLES.SUPER_ADMIN || canAssignSuperAdmin())
                    .map(r => <option key={r.id} value={r.id}>{r.name}</option>)
                  }
                </FormSelect>
              </Field>

              <div className="flex items-center justify-end gap-3 pt-2">
                <GhostBtn onClick={closeModal}>Cancelar</GhostBtn>
                <PrimaryBtn type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </PrimaryBtn>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
