'use client';

import { useState, useEffect } from 'react';
import { Landmark, Pencil, Trash2, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { sculptureService } from '@/services/sculpture/sculptureService';
import { useColor } from '@/contexts/ColorContext';
import {
  AdminPage, AdminHeader, SearchInput, TableCard, Table,
  EmptyRow, IconBtn, Field, FormInput, FormTextarea,
  ErrorBanner, GhostBtn, PrimaryBtn,
} from '@/components/admin/AdminShell';

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

  const [sculptures, setSculptures] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');
  const [modal,      setModal]      = useState(false);
  const [sel,        setSel]        = useState(null);
  const [formName,   setFormName]   = useState('');
  const [formDesc,   setFormDesc]   = useState('');
  const [saving,     setSaving]     = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true); setError('');
    const res = await sculptureService.getAll();
    if (res.success) setSculptures(res.data);
    else setError(res.error || 'Error al cargar esculturas');
    setLoading(false);
  };

  const openEdit = (s) => {
    setSel(s);
    setFormName(s.nombre_escultura);
    setFormDesc(s.descripcion ?? '');
    setModal(true);
  };
  const closeModal = () => { setModal(false); setSaving(false); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await sculptureService.update(sel.id, {
      nombre_escultura: formName,
      descripcion:      formDesc,
    });
    if (!res.success) { setError(res.error); setSaving(false); return; }
    closeModal(); load();
  };

  const handleDelete = async (s) => {
    if (!confirm(`¿Eliminar "${s.nombre_escultura}"?`)) return;
    const res = await sculptureService.delete(s.id);
    if (!res.success) setError(res.error);
    else load();
  };

  const filtered = sculptures.filter(s =>
    s.nombre_escultura?.toLowerCase().includes(search.toLowerCase()) ||
    s.artista?.toLowerCase().includes(search.toLowerCase()) ||
    s.categoria?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminPage>
      <AdminHeader
        icon={Landmark}
        title="Esculturas"
        subtitle={`${sculptures.length} esculturas en el sistema`}
      />

      <div className="flex items-center gap-4 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, artista o categoría..." />
        <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto">{filtered.length} resultados</span>
      </div>

      <ErrorBanner message={error} />

      <TableCard>
        <Table
          headers={['Escultura', 'Artista', 'Categoría', 'Estado 3D', 'Fecha', 'Acciones']}
          loading={loading}
          color={color}
        >
          {!loading && filtered.length === 0 && <EmptyRow cols={6} message="No hay esculturas registradas" />}
          {filtered.map(s => {
            const status = STATUS_MAP[s.processing_status] ?? STATUS_MAP.pending;
            return (
              <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-dark-tertiary/30 transition-colors">
                {/* Escultura */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {s.fotos_originales?.[0] ? (
                      <div className="h-12 w-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-dark-tertiary">
                        <img
                          src={s.fotos_originales[0]}
                          alt={s.nombre_escultura}
                          className="h-full w-full object-cover"
                          onError={e => { e.target.src = 'https://via.placeholder.com/80x60/1a1a1a/444?text=3D'; }}
                        />
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
                {/* Artista */}
                <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{s.artista}</td>
                {/* Categoría */}
                <td className="px-5 py-3">
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-dark-tertiary text-slate-600 dark:text-slate-300">
                    {s.categoria || '—'}
                  </span>
                </td>
                {/* Estado */}
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.cls}`}>{status.label}</span>
                </td>
                {/* Fecha */}
                <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {s.fecha ? new Date(s.fecha).toLocaleDateString('es-CO') : '—'}
                </td>
                {/* Acciones */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <Link href={`/sculpture/${s.id}`} target="_blank">
                      <IconBtn icon={ExternalLink} title="Ver escultura" />
                    </Link>
                    <IconBtn icon={Pencil} onClick={() => openEdit(s)} title="Editar" />
                    <IconBtn icon={Trash2} onClick={() => handleDelete(s)} variant="danger" title="Eliminar" />
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      </TableCard>

      {/* Modal editar */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-dark-secondary shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-dark-tertiary">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Editar escultura</h2>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              <Field label="Nombre *">
                <FormInput value={formName} onChange={setFormName} placeholder="Nombre de la escultura" required />
              </Field>
              <Field label="Descripción">
                <FormTextarea value={formDesc} onChange={setFormDesc} placeholder="Descripción de la escultura..." rows={3} />
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
