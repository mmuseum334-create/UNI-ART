'use client';

import { useState, useEffect } from 'react';
import { Frame, Pencil, Trash2, RotateCcw, X, Eye, Heart, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { paintService } from '@/services/paint/paintService';
import { getPublicImageUrl } from '@/lib/supabase';
import { useColor } from '@/contexts/ColorContext';
import {
  AdminPage, AdminHeader, SearchInput, TableCard, Table,
  EmptyRow, IconBtn, Field, FormInput, FormTextarea,
  ErrorBanner, GhostBtn, PrimaryBtn,
} from '@/components/admin/AdminShell';

export default function AdminPaintingsPage() {
  return (
    <ProtectedRoute adminOnly redirectTo="/">
      <PaintingsContent />
    </ProtectedRoute>
  );
}

function PaintingsContent() {
  const { color } = useColor();

  const [paintings, setPaintings] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [search,    setSearch]    = useState('');
  const [modal,     setModal]     = useState(null);
  const [sel,       setSel]       = useState(null);
  const [formName,  setFormName]  = useState('');
  const [formDesc,  setFormDesc]  = useState('');
  const [saving,    setSaving]    = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true); setError('');
    const res = await paintService.getAll();
    if (res.success) setPaintings(res.data);
    else setError(res.error || 'Error al cargar pinturas');
    setLoading(false);
  };

  const openEdit = (p) => {
    setSel(p);
    setFormName(p.nombre_pintura);
    setFormDesc(p.descripcion_pintura ?? '');
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setSaving(false); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await paintService.update(sel.id, {
      nombre_pintura:       formName,
      descripcion_pintura:  formDesc,
    });
    if (!res.success) { setError(res.error); setSaving(false); return; }
    closeModal(); load();
  };

  const handleDelete = async (p) => {
    if (!confirm(`¿Eliminar "${p.nombre_pintura}"?`)) return;
    const res = await paintService.delete(p.id);
    if (!res.success) setError(res.error);
    else load();
  };

  const handleRestore = async (p) => {
    const res = await paintService.restore(p.id);
    if (!res.success) setError(res.error);
    else load();
  };

  const imgUrl = (p) => getPublicImageUrl(p.img_pintura) || `http://localhost:3002${p.img_pintura}`;

  const filtered = paintings.filter(p =>
    p.nombre_pintura?.toLowerCase().includes(search.toLowerCase()) ||
    p.artista?.toLowerCase().includes(search.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminPage>
      <AdminHeader
        icon={Frame}
        title="Pinturas"
        subtitle={`${paintings.length} pinturas en el sistema`}
      />

      <div className="flex items-center gap-4 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por título, artista o categoría..." />
        <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto">{filtered.length} resultados</span>
      </div>

      <ErrorBanner message={error} />

      <TableCard>
        <Table
          headers={['Obra', 'Artista', 'Categoría', 'Likes / Vistas', 'Fecha', 'Estado', 'Acciones']}
          loading={loading}
          color={color}
        >
          {!loading && filtered.length === 0 && <EmptyRow cols={7} message="No hay pinturas registradas" />}
          {filtered.map(p => (
            <tr key={p.id} className={`hover:bg-slate-50 dark:hover:bg-dark-tertiary/30 transition-colors ${p.deleted_at ? 'opacity-50' : ''}`}>
              {/* Obra */}
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-dark-tertiary">
                    <img
                      src={imgUrl(p)}
                      alt={p.nombre_pintura}
                      className="h-full w-full object-cover"
                      onError={e => { e.target.src = 'https://via.placeholder.com/80x60/1a1a1a/444?text=Sin+Img'; }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">{p.nombre_pintura}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[180px]">{p.etiqueta || '—'}</p>
                  </div>
                </div>
              </td>
              {/* Artista */}
              <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{p.artista}</td>
              {/* Categoría */}
              <td className="px-5 py-3">
                <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-dark-tertiary text-slate-600 dark:text-slate-300">
                  {p.categoria || '—'}
                </span>
              </td>
              {/* Stats */}
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-rose-500 font-semibold">
                    <Heart className="h-3.5 w-3.5 fill-current" /> {p.likes ?? 0}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-sky-500 font-semibold">
                    <Eye className="h-3.5 w-3.5" /> {p.views ?? 0}
                  </span>
                </div>
              </td>
              {/* Fecha */}
              <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {p.fecha ? new Date(p.fecha).toLocaleDateString('es-CO') : '—'}
              </td>
              {/* Estado */}
              <td className="px-5 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.deleted_at ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                  {p.deleted_at ? 'Eliminada' : 'Activa'}
                </span>
              </td>
              {/* Acciones */}
              <td className="px-5 py-3">
                <div className="flex items-center gap-1">
                  <Link href={`/artwork/${p.id}`} target="_blank">
                    <IconBtn icon={ExternalLink} title="Ver obra" />
                  </Link>
                  {!p.deleted_at && (
                    <IconBtn icon={Pencil} onClick={() => openEdit(p)} title="Editar" />
                  )}
                  {p.deleted_at
                    ? <IconBtn icon={RotateCcw} onClick={() => handleRestore(p)} title="Restaurar" />
                    : <IconBtn icon={Trash2} onClick={() => handleDelete(p)} variant="danger" title="Eliminar" />
                  }
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </TableCard>

      {/* Modal editar */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-dark-secondary shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-dark-tertiary">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Editar pintura</h2>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Preview */}
            <div className="px-6 pt-4">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-dark-tertiary/50 p-3 mb-4">
                <img
                  src={imgUrl(sel)}
                  alt={sel?.nombre_pintura}
                  className="h-14 w-20 rounded-lg object-cover shrink-0"
                  onError={e => { e.target.src = 'https://via.placeholder.com/80x56/1a1a1a/444?text=Sin+Img'; }}
                />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400">por {sel?.artista}</p>
                  <p className="text-xs mt-0.5 text-slate-400">{sel?.categoria}</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleSave} className="px-6 pb-6 space-y-4">
              <Field label="Título *">
                <FormInput value={formName} onChange={setFormName} placeholder="Título de la pintura" required />
              </Field>
              <Field label="Descripción">
                <FormTextarea value={formDesc} onChange={setFormDesc} placeholder="Descripción de la obra..." rows={3} />
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
