'use client';

import { useState, useEffect } from 'react';
import { Shield, Plus, Pencil, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { roleService } from '@/services/rbac/roleService';
import { useColor } from '@/contexts/ColorContext';
import {
  AdminPage, AdminHeader, PrimaryBtn, GhostBtn, SearchInput,
  TableCard, Table, EmptyRow, IconBtn, Field, FormInput,
  FormTextarea, ErrorBanner, usePagination, Pagination,
} from '@/components/admin/AdminShell';
import { toast } from '@/lib/toast';

const RESOURCES = [
  { key: 'paintings',  label: 'Pinturas',   desc: 'Catálogo de pinturas' },
  { key: 'sculptures', label: 'Esculturas', desc: 'Catálogo de esculturas' },
  { key: 'categories', label: 'Categorías', desc: 'Categorías de obras' },
  { key: 'techniques', label: 'Técnicas',   desc: 'Técnicas artísticas' },
  { key: 'users',      label: 'Usuarios',   desc: 'Gestión de usuarios' },
  { key: 'roles',      label: 'Roles',      desc: 'Roles y permisos' },
];

const getLevel = (p) => {
  if (!p) return 'ninguno';
  if (p.canEdit || p.canCreate || p.canDelete) return 'editar';
  if (p.canView) return 'ver';
  return 'ninguno';
};

const levelToPerms = (l) => ({
  canView:   l !== 'ninguno',
  canCreate: l === 'editar',
  canEdit:   l === 'editar',
  canDelete: l === 'editar',
});

export default function RolesAdminPage() {
  return (
    <ProtectedRoute adminOnly redirectTo="/">
      <RolesContent />
    </ProtectedRoute>
  );
}

function RolesContent() {
  const { color } = useColor();

  const [roles,   setRoles]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(null);
  const [sel,     setSel]     = useState(null);
  const [name,    setName]    = useState('');
  const [desc,    setDesc]    = useState('');
  const [levels,  setLevels]  = useState({});
  const [openSec, setOpenSec] = useState({});
  const [saving,  setSaving]  = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    const res = await roleService.getAllRoles();
    if (res.success) setRoles(res.data);
    else setError(res.error || 'Error al cargar roles');
    setLoading(false);
  };

  const openCreate = () => { setSel(null); setName(''); setDesc(''); setLevels({}); setOpenSec({}); setModal('create'); };
  const openEdit   = (r)  => {
    setSel(r); setName(r.name); setDesc(r.description ?? '');
    const lvls = {};
    r.permissions?.forEach(p => { lvls[p.resource] = getLevel(p); });
    setLevels(lvls); setOpenSec({}); setModal('edit');
  };
  const closeModal = () => { setModal(null); setSaving(false); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const perms = RESOURCES
      .filter(r => levels[r.key] && levels[r.key] !== 'ninguno')
      .map(r  => ({ resource: r.key, ...levelToPerms(levels[r.key]) }));

    if (modal === 'create') {
      const res = await roleService.createRole({ name, description: desc });
      if (!res.success) { toast.error('Error al crear rol', res.error); setSaving(false); return; }
      if (perms.length) await roleService.assignPermissions(res.data.id, perms);
      toast.success('Rol creado', `El rol "${name}" fue creado con sus permisos.`);
    } else {
      const res = await roleService.updateRole(sel.id, { name, description: desc });
      if (!res.success) { toast.error('Error al actualizar rol', res.error); setSaving(false); return; }
      await roleService.assignPermissions(sel.id, perms);
      toast.success('Rol actualizado', 'Los cambios se guardaron correctamente.');
    }
    closeModal(); load();
  };

  const handleDelete = (r) => {
    toast.confirm(
      `¿Eliminar el rol "${r.name}"?`,
      'Esta acción no se puede deshacer.',
      async () => {
        const res = await roleService.deleteRole(r.id);
        if (!res.success) toast.error('Error al eliminar', res.error);
        else { toast.success('Rol eliminado', `El rol "${r.name}" fue eliminado.`); load(); }
      }
    );
  };

  const toggleAll = () => {
    const allOpen = RESOURCES.every(r => openSec[r.key]);
    const next = {};
    RESOURCES.forEach(r => { next[r.key] = !allOpen; });
    setOpenSec(next);
  };

  const filtered = roles.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  const { page, total, paged, goTo } = usePagination(filtered, 10);

  return (
    <AdminPage>
      <AdminHeader
        icon={Shield}
        title="Roles"
        subtitle={`${roles.length} roles en el sistema`}
        action={<PrimaryBtn icon={Plus} onClick={openCreate}>Nuevo Rol</PrimaryBtn>}
      />

      <div className="flex items-center gap-4 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar roles..." />
      </div>

      <ErrorBanner message={error} />

      <TableCard>
        <Table headers={['Rol', 'Descripción', 'Permisos', 'Creado', 'Acciones']} loading={loading} color={color}>
          {!loading && paged.length === 0 && <EmptyRow cols={5} message="No hay roles registrados" />}
          {paged.map(role => (
            <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-dark-tertiary/30 transition-colors">
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0" style={{ backgroundColor: `${color}18` }}>
                    <Shield className="h-4 w-4" style={{ color }} />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{role.name}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                {role.description || '—'}
              </td>
              <td className="px-5 py-4">
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions?.filter(p => getLevel(p) !== 'ninguno').length > 0
                    ? role.permissions.filter(p => getLevel(p) !== 'ninguno').map(p => {
                        const lvl = getLevel(p);
                        const lbl = RESOURCES.find(r => r.key === p.resource)?.label ?? p.resource;
                        return (
                          <span
                            key={p.resource}
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${lvl === 'editar' ? 'text-white' : 'bg-slate-100 dark:bg-dark-tertiary text-slate-600 dark:text-slate-300'}`}
                            style={lvl === 'editar' ? { backgroundColor: color } : undefined}
                          >
                            {lbl}: {lvl === 'editar' ? 'Editar' : 'Ver'}
                          </span>
                        );
                      })
                    : <span className="text-xs italic text-slate-400">Sin permisos</span>
                  }
                </div>
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {role.createdAt ? new Date(role.createdAt).toLocaleDateString('es-CO') : '—'}
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1">
                  <IconBtn icon={Pencil} onClick={() => openEdit(role)} title="Editar" />
                  {role.name !== 'super_admin' && (
                    <IconBtn icon={Trash2} onClick={() => handleDelete(role)} variant="danger" title="Eliminar" />
                  )}
                </div>
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

      {/* ── Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-dark-secondary shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-dark-tertiary">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {modal === 'create' ? 'Nuevo Rol' : `Editar: ${sel?.name}`}
              </h2>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-tertiary transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex flex-col overflow-hidden flex-1">
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
                <Field label="Nombre *">
                  <FormInput value={name} onChange={setName} placeholder="ej. editor_arte" required />
                </Field>
                <Field label="Descripción">
                  <FormTextarea value={desc} onChange={setDesc} placeholder="Describe brevemente el rol..." />
                </Field>

                {/* Permisos */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Permisos por sección</p>
                    <button type="button" onClick={toggleAll} className="text-xs font-medium" style={{ color }}>
                      {RESOURCES.every(r => openSec[r.key]) ? 'Contraer todo' : 'Expandir todo'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {RESOURCES.map(res => {
                      const lvl    = levels[res.key] ?? 'ninguno';
                      const isOpen = openSec[res.key] ?? false;
                      return (
                        <div key={res.key} className="rounded-xl border border-slate-200 dark:border-dark-tertiary overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setOpenSec(p => ({ ...p, [res.key]: !p[res.key] }))}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-dark-tertiary/40 transition-colors text-left"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{res.label}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{res.desc}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-4">
                              {lvl !== 'ninguno' && (
                                <span className="rounded-full px-2 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: color }}>
                                  {lvl === 'ver' ? 'Ver' : 'Editar'}
                                </span>
                              )}
                              {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                            </div>
                          </button>
                          {isOpen && (
                            <div className="flex items-center gap-6 px-4 py-3 bg-slate-50 dark:bg-dark-tertiary/30 border-t border-slate-100 dark:border-dark-tertiary">
                              {['ninguno', 'ver', 'editar'].map(opt => (
                                <label key={opt} className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setLevels(p => ({ ...p, [res.key]: opt }))}>
                                  <div
                                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${lvl === opt ? 'border-transparent' : 'border-slate-300 dark:border-slate-600'}`}
                                    style={lvl === opt ? { backgroundColor: color, borderColor: color } : undefined}
                                  >
                                    {lvl === opt && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                  </div>
                                  <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">{opt}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-dark-tertiary flex items-center justify-end gap-3">
                <GhostBtn onClick={closeModal}>Cancelar</GhostBtn>
                <PrimaryBtn type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : modal === 'create' ? 'Crear Rol' : 'Guardar cambios'}
                </PrimaryBtn>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
