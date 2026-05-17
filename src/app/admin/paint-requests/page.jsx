'use client';

import { useState, useEffect } from 'react';
import {
  ClipboardList, CheckCircle, Eye, Pencil, X, Clock,
  User, Tag, Palette, Calendar, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { paintService } from '@/services/paint/paintService';
import { categoryService } from '@/services/categoryService';
import { techniqueService } from '@/services/techniqueService';
import { getPublicImageUrl } from '@/lib/supabase';
import { useColor } from '@/contexts/ColorContext';
import { artCategories } from '@/data/mockData';
import {
  AdminPage, AdminHeader, SearchInput, TableCard, Table,
  EmptyRow, IconBtn, Field, FormInput, FormTextarea, FormSelect,
  ErrorBanner, GhostBtn, PrimaryBtn, usePagination, Pagination,
} from '@/components/admin/AdminShell';
import { toast } from '@/lib/toast';

export default function AdminPaintRequestsPage() {
  return (
    <ProtectedRoute adminOnly redirectTo="/">
      <PaintRequestsContent />
    </ProtectedRoute>
  );
}

function PaintRequestsContent() {
  const { color } = useColor();

  const [pending,     setPending]     = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [techniques,  setTechniques]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');

  // Modal de editar + aprobar
  const [modal,       setModal]       = useState(false);
  const [sel,         setSel]         = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [approving,   setApproving]   = useState(false);

  // Campos del formulario de edición
  const [fNombre,    setFNombre]    = useState('');
  const [fArtista,   setFArtista]   = useState('');
  const [fDesc,      setFDesc]      = useState('');
  const [fCategoria, setFCategoria] = useState('');
  const [fEtiqueta,  setFEtiqueta]  = useState('');

  useEffect(() => {
    load();
    categoryService.getAll().then(r => { if (r.success) setCategories(r.data); });
    techniqueService.getAll().then(r => { if (r.success) setTechniques(r.data); });
  }, []);

  const load = async () => {
    setLoading(true); setError('');
    const res = await paintService.getPending();
    if (res.success) setPending(res.data);
    else setError(res.error || 'Error al cargar solicitudes pendientes');
    setLoading(false);
  };

  const filtered = pending.filter(p =>
    p.nombre_pintura?.toLowerCase().includes(search.toLowerCase()) ||
    p.artista?.toLowerCase().includes(search.toLowerCase()) ||
    p.publicado_por?.toLowerCase().includes(search.toLowerCase())
  );

  const { page, total, paged, goTo } = usePagination(filtered, 10);

  const openDetail = (p) => {
    setSel(p);
    setFNombre(p.nombre_pintura ?? '');
    setFArtista(p.artista ?? '');
    setFDesc(p.descripcion_pintura ?? '');
    setFCategoria(p.categoria ?? '');
    setFEtiqueta(p.etiqueta ?? '');
    setModal(true);
  };

  const closeModal = () => { setModal(false); setSaving(false); setApproving(false); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await paintService.update(sel.id, {
      nombre_pintura:      fNombre,
      artista:             fArtista,
      descripcion_pintura: fDesc,
      categoria:           fCategoria,
      etiqueta:            fEtiqueta,
    });
    setSaving(false);
    if (!res.success) { toast.error('Error al guardar', res.error); return; }
    toast.success('Cambios guardados', 'La información fue actualizada. Ahora puedes aprobarla.');
    setSel({ ...sel, nombre_pintura: fNombre, artista: fArtista, descripcion_pintura: fDesc, categoria: fCategoria, etiqueta: fEtiqueta });
  };

  const handleApprove = async () => {
    setApproving(true);
    const res = await paintService.approve(sel.id);
    setApproving(false);
    if (!res.success) { toast.error('Error al aprobar', res.error); return; }
    toast.success(
      '¡Pintura aprobada!',
      `"${sel.nombre_pintura}" ya es visible en la galería. El artista fue notificado.`
    );
    closeModal();
    load();
  };

  const imgUrl = (p) => getPublicImageUrl(p.img_pintura) || `http://localhost:3002${p.img_pintura}`;

  const allCats = [
    ...artCategories.map(c => ({ id: c.id, name: c.name })),
    ...categories
      .filter(c => !artCategories.find(a => a.id === c.name || a.name === c.name))
      .map(c => ({ id: c.name, name: c.name })),
  ];

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (hours < 1)  return 'Hace menos de 1h';
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${days} día${days !== 1 ? 's' : ''}`;
  };

  return (
    <AdminPage>
      <AdminHeader
        icon={ClipboardList}
        title="Solicitudes de Pinturas"
        subtitle={`${pending.length} pintura${pending.length !== 1 ? 's' : ''} pendiente${pending.length !== 1 ? 's' : ''} de aprobación`}
      />

      {/* Banner informativo */}
      <div
        className="rounded-xl px-4 py-3 text-sm flex items-center gap-3"
        style={{ backgroundColor: `${color}15`, borderLeft: `3px solid ${color}` }}
      >
        <ClipboardList className="h-4 w-4 shrink-0" style={{ color }} />
        <span className="text-slate-700 dark:text-slate-300">
          Las pinturas subidas por artistas aparecen aquí antes de publicarse.
          Revisa y <strong>aprueba</strong> cada obra para que sea visible en la galería.
          El artista recibirá una notificación automática al aprobarla.
        </span>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por título, artista o publicado por..." />
        <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <ErrorBanner message={error} />

      <TableCard>
        <Table
          headers={['Obra', 'Artista / Publicado por', 'Categoría', 'Fecha creación', 'Tiempo esperando', 'Acciones']}
          loading={loading}
          color={color}
        >
          {!loading && paged.length === 0 && (
            <EmptyRow cols={6} message={search ? 'No hay resultados para esta búsqueda' : 'No hay pinturas pendientes. ¡Todo al día!'} />
          )}

          {paged.map(p => (
            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-dark-tertiary/30 transition-colors">
              {/* Obra */}
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-dark-tertiary">
                    <img
                      src={imgUrl(p)}
                      alt={p.nombre_pintura}
                      className="h-full w-full object-cover"
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden absolute inset-0 items-center justify-center bg-slate-200 dark:bg-dark-tertiary">
                      <Palette className="h-5 w-5 text-slate-400" />
                    </div>
                    {/* Badge pendiente */}
                    <span className="absolute top-0.5 right-0.5 rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
                      NUEVO
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
                      {p.nombre_pintura}
                    </p>
                    <p className="text-xs text-slate-400 truncate max-w-[160px]">{p.etiqueta || '—'}</p>
                  </div>
                </div>
              </td>

              {/* Artista */}
              <td className="px-5 py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {p.artista}
                  </span>
                  {p.publicado_por && p.publicado_por !== p.artista && (
                    <span className="text-xs text-slate-400 pl-4">por: {p.publicado_por}</span>
                  )}
                </div>
              </td>

              {/* Categoría */}
              <td className="px-5 py-3">
                <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-dark-tertiary text-slate-600 dark:text-slate-300">
                  {p.categoria || '—'}
                </span>
              </td>

              {/* Fecha creación */}
              <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  {p.created_at ? new Date(p.created_at).toLocaleDateString('es-CO') : '—'}
                </div>
              </td>

              {/* Tiempo esperando */}
              <td className="px-5 py-3">
                <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {p.created_at ? timeAgo(p.created_at) : '—'}
                </span>
              </td>

              {/* Acciones */}
              <td className="px-5 py-3">
                <div className="flex items-center gap-1">
                  <IconBtn icon={Eye} onClick={() => openDetail(p)} title="Revisar y aprobar" />
                  <Link href={`/artwork/${p.id}`} target="_blank">
                    <IconBtn icon={ExternalLink} title="Ver preview" />
                  </Link>
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

      {/* Modal: Revisar, editar y aprobar */}
      {modal && sel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-dark-secondary shadow-2xl flex flex-col max-h-[92vh]">
            {/* Header del modal */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-dark-tertiary">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Revisar solicitud
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Edita la información si es necesario y luego aprueba la pintura.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {/* Preview imagen */}
              <div className="px-6 pt-5">
                <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-tertiary h-48">
                  <img
                    src={imgUrl(sel)}
                    alt={sel.nombre_pintura}
                    className="w-full h-full object-contain"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute top-2 left-2">
                    <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                      Pendiente
                    </span>
                  </div>
                </div>
              </div>

              {/* Formulario de edición */}
              <form id="edit-request-form" onSubmit={handleSave} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Título *">
                    <FormInput value={fNombre} onChange={setFNombre} placeholder="Título de la obra" required />
                  </Field>
                  <Field label="Artista *">
                    <FormInput value={fArtista} onChange={setFArtista} placeholder="Nombre del artista" required />
                  </Field>
                </div>

                <Field label="Descripción">
                  <FormTextarea value={fDesc} onChange={setFDesc} placeholder="Descripción de la obra..." rows={3} />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Categoría">
                    <FormSelect value={fCategoria} onChange={setFCategoria}>
                      <option value="">Sin categoría</option>
                      {allCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </FormSelect>
                  </Field>
                  <Field label="Etiquetas">
                    <FormInput value={fEtiqueta} onChange={setFEtiqueta} placeholder="ej. abstracto, color" />
                  </Field>
                </div>

                {/* Info de solo lectura */}
                <div className="rounded-xl bg-slate-50 dark:bg-dark-tertiary/40 p-3 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <div><span className="font-medium">Técnica:</span> {sel.tecnicas || '—'}</div>
                  <div><span className="font-medium">Fecha obra:</span> {sel.fecha ? new Date(sel.fecha).toLocaleDateString('es-CO') : '—'}</div>
                  <div><span className="font-medium">Subido por:</span> {sel.publicado_por || '—'}</div>
                  <div><span className="font-medium">Carrera:</span> {sel.carrera || '—'}</div>
                </div>
              </form>
            </div>

            {/* Footer con acciones */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-dark-tertiary flex items-center justify-between gap-3">
              <GhostBtn onClick={closeModal}>Cancelar</GhostBtn>

              <div className="flex items-center gap-2">
                {/* Guardar edición */}
                <button
                  form="edit-request-form"
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-dark-tertiary text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-dark-tertiary/80 transition-colors disabled:opacity-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>

                {/* Aprobar */}
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  id="approve-paint-btn"
                  className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white transition-all disabled:opacity-50 hover:opacity-90 shadow-lg"
                  style={{ backgroundColor: '#22c55e' }}
                >
                  <CheckCircle className="h-4 w-4" />
                  {approving ? 'Aprobando...' : 'Aprobar y publicar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
