'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Pencil, Trash2, X } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { categoryService } from '@/services/categoryService';
import { useColor } from '@/contexts/ColorContext';
import {
  AdminPage, AdminHeader, PrimaryBtn, GhostBtn, SearchInput,
  Field, FormInput, FormTextarea, ErrorBanner,
} from '@/components/admin/AdminShell';

export default function CategoriesAdminPage() {
  return (
    <ProtectedRoute adminOnly redirectTo="/">
      <CategoriesContent />
    </ProtectedRoute>
  );
}

function CategoriesContent() {
  const { color } = useColor();

  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(null);
  const [sel,     setSel]     = useState(null);
  const [name,    setName]    = useState('');
  const [desc,    setDesc]    = useState('');
  const [saving,  setSaving]  = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    const res = await categoryService.getAll();
    if (res.success) setItems(res.data);
    else setError(res.error || 'Error al cargar categorías');
    setLoading(false);
  };

  const openCreate = () => { setSel(null); setName(''); setDesc(''); setModal('create'); };
  const openEdit   = (c) => { setSel(c); setName(c.name); setDesc(c.description ?? ''); setModal('edit'); };
  const closeModal = () => { setModal(null); setSaving(false); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = modal === 'create'
      ? await categoryService.create({ name, description: desc })
      : await categoryService.update(sel.id, { name, description: desc });
    if (!res.success) { setError(res.error); setSaving(false); return; }
    closeModal(); load();
  };

  const handleDelete = async (item) => {
    if (!confirm(`¿Eliminar "${item.name}"?`)) return;
    const res = await categoryService.delete(item.id);
    if (!res.success) setError(res.error);
    else load();
  };

  const filtered = items.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminPage>
      <AdminHeader
        icon={Tag}
        title="Categorías"
        subtitle={`${items.length} categorías registradas`}
        action={<PrimaryBtn icon={Plus} onClick={openCreate}>Nueva Categoría</PrimaryBtn>}
      />

      <div className="flex items-center gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar categorías..." />
      </div>

      <ErrorBanner message={error} />

      {/* Cards grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-t-transparent" style={{ borderColor: color, borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
          <Tag className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm">No hay categorías. ¡Crea la primera!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(cat => (
            <div
              key={cat.id}
              className="group relative rounded-2xl border border-slate-200 dark:border-dark-tertiary bg-white dark:bg-dark-secondary p-5 hover:shadow-md transition-shadow"
            >
              {/* Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-3" style={{ backgroundColor: `${color}15` }}>
                <Tag className="h-5 w-5" style={{ color }} />
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1 pr-10">{cat.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {cat.description || <span className="italic">Sin descripción</span>}
              </p>
              {/* Actions */}
              <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(cat)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-tertiary transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add card */}
          <button
            onClick={openCreate}
            className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-tertiary p-5 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-colors min-h-[120px]"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium">Nueva categoría</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-dark-secondary shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-dark-tertiary">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {modal === 'create' ? 'Nueva Categoría' : `Editar: ${sel?.name}`}
              </h2>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-tertiary transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              <Field label="Nombre *">
                <FormInput value={name} onChange={setName} placeholder="ej. Pintura Abstracta" required />
              </Field>
              <Field label="Descripción">
                <FormTextarea value={desc} onChange={setDesc} placeholder="Descripción de la categoría..." />
              </Field>
              <div className="flex items-center justify-end gap-3 pt-2">
                <GhostBtn onClick={closeModal}>Cancelar</GhostBtn>
                <PrimaryBtn type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : modal === 'create' ? 'Crear' : 'Guardar'}
                </PrimaryBtn>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
