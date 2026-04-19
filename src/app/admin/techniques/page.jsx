'use client';

import { useState, useEffect } from 'react';
import { Palette, Plus, Pencil, Trash2, X } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { techniqueService } from '@/services/techniqueService';
import { useColor } from '@/contexts/ColorContext';
import {
  AdminPage, AdminHeader, PrimaryBtn, GhostBtn, SearchInput,
  Field, FormInput, FormTextarea, ErrorBanner,
} from '@/components/admin/AdminShell';
import { toast } from '@/lib/toast';

export default function TechniquesAdminPage() {
  return (
    <ProtectedRoute adminOnly redirectTo="/">
      <TechniquesContent />
    </ProtectedRoute>
  );
}

function TechniquesContent() {
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
    const res = await techniqueService.getAll();
    if (res.success) setItems(res.data);
    else setError(res.error || 'Error al cargar técnicas');
    setLoading(false);
  };

  const openCreate = () => { setSel(null); setName(''); setDesc(''); setModal('create'); };
  const openEdit   = (t) => { setSel(t); setName(t.name); setDesc(t.description ?? ''); setModal('edit'); };
  const closeModal = () => { setModal(null); setSaving(false); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = modal === 'create'
      ? await techniqueService.create({ name, description: desc })
      : await techniqueService.update(sel.id, { name, description: desc });
    setSaving(false);
    if (!res.success) { toast.error('Error al guardar', res.error); return; }
    toast.success(
      modal === 'create' ? 'Técnica creada' : 'Técnica actualizada',
      modal === 'create' ? `"${name}" fue añadida al sistema.` : 'Los cambios se guardaron correctamente.'
    );
    closeModal(); load();
  };

  const handleDelete = (item) => {
    toast.confirm(
      `¿Eliminar "${item.name}"?`,
      'Confirma para eliminar. Ignora para cancelar.',
      async () => {
        const res = await techniqueService.delete(item.id);
        if (!res.success) toast.error('Error al eliminar', res.error);
        else { toast.success('Técnica eliminada', `"${item.name}" fue eliminada del sistema.`); load(); }
      }
    );
  };

  const filtered = items.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Palette de colores para variedad visual
  const cardAccents = [
    'bg-amber-500/10 text-amber-600',
    'bg-violet-500/10 text-violet-600',
    'bg-emerald-500/10 text-emerald-600',
    'bg-sky-500/10 text-sky-600',
    'bg-rose-500/10 text-rose-600',
    'bg-orange-500/10 text-orange-600',
  ];

  return (
    <AdminPage>
      <AdminHeader
        icon={Palette}
        title="Técnicas"
        subtitle={`${items.length} técnicas artísticas registradas`}
        action={<PrimaryBtn icon={Plus} onClick={openCreate}>Nueva Técnica</PrimaryBtn>}
      />

      <div className="flex items-center gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar técnicas..." />
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-t-transparent" style={{ borderColor: color, borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
          <Palette className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm">No hay técnicas. ¡Crea la primera!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((tech, i) => {
            const accent = cardAccents[i % cardAccents.length];
            return (
              <div
                key={tech.id}
                className="group relative rounded-2xl border border-slate-200 dark:border-dark-tertiary bg-white dark:bg-dark-secondary p-5 hover:shadow-md transition-shadow"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-3 ${accent}`}>
                  <Palette className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1 pr-10">{tech.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {tech.description || <span className="italic">Sin descripción</span>}
                </p>
                {/* Actions */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(tech)}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-tertiary transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(tech)}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add card */}
          <button
            onClick={openCreate}
            className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-tertiary p-5 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-colors min-h-[120px]"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium">Nueva técnica</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-dark-secondary shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-dark-tertiary">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {modal === 'create' ? 'Nueva Técnica' : `Editar: ${sel?.name}`}
              </h2>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-tertiary transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              <Field label="Nombre *">
                <FormInput value={name} onChange={setName} placeholder="ej. Óleo sobre lienzo" required />
              </Field>
              <Field label="Descripción">
                <FormTextarea value={desc} onChange={setDesc} placeholder="Descripción de la técnica..." />
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
