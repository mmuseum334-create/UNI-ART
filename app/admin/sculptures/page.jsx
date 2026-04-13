'use client';

import { useState, useEffect } from 'react';
import { Landmark, Pencil, Trash2, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { sculptureService } from '@/services/sculpture/sculptureService';
import { categoryService } from '@/services/categoryService';
import { useColor } from '@/contexts/ColorContext';
import { artCategories } from '@/data/mockData';
import {
  AdminPage, AdminHeader, SearchInput, TableCard, Table,
  EmptyRow, IconBtn, Field, FormInput, FormTextarea, FormSelect,
  ErrorBanner, GhostBtn, PrimaryBtn, usePagination, Pagination, useConfirm,
} from '@/components/admin/AdminShell';
import { toast } from '@/lib/toast';

const STATUS_MAP = {
  completed:  { label: 'Completada', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  processing: { label: 'Procesando', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  failed:     { label: 'Fallida',    cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  pending:    { label: 'Pendiente',  cls: 'bg-slate-100 text-slate-600 dark:bg-dark-tertiary dark:text-slate-400' },
};

export default function AdminSculpturesPage() {
  return (
    <ProtectedRoute adminOnly redirectTo="/">
      <SculpturesContent />
    </ProtectedRoute>
  );
}

function SculpturesContent() {
  const { color } = useColor();
  const { confirm, ConfirmDialog } = useConfirm();

  const [sculptures,  setSculptures]  = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');
  const [modal,       setModal]       = useState(false);
  const [sel,         setSel]         = useState(null);
  const [saving,      setSaving]      = useState(false);

  // Form
  const [fNombre,    setFNombre]    = useState('');
  const [fArtista,   setFArtista]   = useState('');
  const [fDesc,      setFDesc]      = useState('');
  const [fCategoria, setFCategoria] = useState('');
  const [fEtiqueta,  setFEtiqueta]  = useState('');

  useEffect(() => {
    load();
    categoryService.getAll().then(r => { if (r.success) setCategories(r.data); });
  }, []);

  const load = async () => {
    setLoading(true); setError('');
    const res = await sculptureService.getAll();
    if (res.success) setSculptures(res.data);
    else setError(res.error || 'Error al cargar esculturas');
    setLoading(false);
  };

  const filtered = sculptures.filter(s =>
    s.nombre_escultura?.toLowerCase().includes(search.toLowerCase()) ||
    s.artista?.toLowerCase().includes(search.toLowerCase()) ||
    s.categoria?.toLowerCase().includes(search.toLowerCase())
  );

  const { page, total, paged, goTo } = usePagination(filtered, 12);

  const openEdit = (s) => {
    setSel(s);
    setFNombre(s.nombre_escultura ?? '');
    setFArtista(s.artista ?? '');
    setFDesc(s.descripcion ?? '');
    setFCategoria(s.categoria ?? '');
    setFEtiqueta(s.etiqueta ?? '');
    setModal(true);
  };
  const closeModal = () => { setModal(false); setSaving(false); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await sculptureService.update(sel.id, {
      nombre_escultura: fNombre,
      artista:          fArtista,
      descripcion:      fDesc,
      categoria:        fCategoria,
      etiqueta:         fEtiqueta,
    });
    setSaving(false);
    if (!res.success) { toast.error(res.error || 'Error al guardar'); return; }
    toast.success('Escultura actualizada correctamente');
    closeModal(); load();
  };

  const handleDelete = async (s) => {
    const ok = await confirm(`¿Eliminar la escultura "${s.nombre_escultura}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    const res = await sculptureService.delete(s.id);
    if (!res.success) toast.error(res.error || 'Error al eliminar');
    else { toast.success('Escultura eliminada'); load(); }
  };

  const allCats = [
    ...artCategories.map(c => ({ id: c.id, name: c.name })),
    ...categories.filter(c => !artCategories.find(a => a.name === c.name)).map(c => ({ id: c.name, name: c.name })),
  ];

  return (
    <AdminPage>
      <AdminHeader icon={Landmark} title="Esculturas" subtitle={`${sculptures.length} esculturas en el sistema`} />

      <div className="flex items-center gap-4 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, artista o categoría..." />
        <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto">{filtered.length} resultados</span>
      </div>

      <ErrorBanner message={error} />

      <TableCard>
        <Table headers={['Escultura', 'Artista', 'Categoría', 'Estado 3D', 'Fecha', 'Acciones']} loading={loading} color={color}>
          {!loading && paged.length === 0 && <EmptyRow cols={6} message="No hay esculturas" />}
          {paged.map(s => {
            const status = STATUS_MAP[s.processing_status] ?? STATUS_MAP.pending;
            return (
              <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-dark-tertiary/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {s.fotos_originales?.[0] ? (
                      <div className="h-12 w-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-dark-tertiary">
                        <img src={s.fotos_originales[0]} alt={s.nombre_escultura} className="h-full w-full object-cover"
                          onError={e => { e.target.src = 'https://via.placeholder.com/80x60/1a1a1a/444?text=3D'; }} />
                      </div>
                    ) : (
                      <div className="h-12 w-16 shrink-0 rounded-lg bg-slate-100 dark:bg-dark-tertiary flex items-center justify-center">
                        <Landmark className="h-5 w-5 text-slate-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">{s.nombre_escultura}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[160px]">{s.etiqueta || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{s.artista}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-dark-tertiary text-slate-600 dark:text-slate-300">
                    {s.categoria || '—'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.cls}`}>{status.label}</span>
                </td>
                <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {s.fecha ? new Date(s.fecha).toLocaleDateString('es-CO') : '—'}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <Link href={`/sculpture/${s.id}`} target="_blank"><IconBtn icon={ExternalLink} title="Ver" /></Link>
                    <IconBtn icon={Pencil} onClick={() => openEdit(s)} title="Editar" />
                    <IconBtn icon={Trash2} onClick={() => handleDelete(s)} variant="danger" title="Eliminar" />
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>

        {!loading && (
          <div className="px-5 pb-4">
            <Pagination page={page} total={total} goTo={goTo} />
          </div>
        )}
      </TableCard>

      {/* Modal editar completo */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-dark-secondary shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-dark-tertiary">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Editar escultura</h2>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col overflow-hidden flex-1">
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Nombre *">
                    <FormInput value={fNombre} onChange={setFNombre} placeholder="Nombre de la escultura" required />
                  </Field>
                  <Field label="Artista *">
                    <FormInput value={fArtista} onChange={setFArtista} placeholder="Nombre del artista" required />
                  </Field>
                </div>

                <Field label="Descripción">
                  <FormTextarea value={fDesc} onChange={setFDesc} placeholder="Descripción de la escultura..." rows={3} />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Categoría">
                    <FormSelect value={fCategoria} onChange={setFCategoria}>
                      <option value="">Sin categoría</option>
                      {allCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </FormSelect>
                  </Field>
                  <Field label="Etiquetas">
                    <FormInput value={fEtiqueta} onChange={setFEtiqueta} placeholder="ej. moderno, abstracto" />
                  </Field>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 dark:border-dark-tertiary flex items-center justify-end gap-3">
                <GhostBtn onClick={closeModal}>Cancelar</GhostBtn>
                <PrimaryBtn type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </PrimaryBtn>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog />
    </AdminPage>
  );
}
