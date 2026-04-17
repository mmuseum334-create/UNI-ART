'use client';

import { useState, useEffect, useRef } from 'react';
import { bannerService } from '@/services/banner/bannerService';
import {
  Save, Upload, Trash2, GripVertical, Image as ImageIcon,
  Video, Plus, Loader2, Check, ChevronLeft, ChevronRight,
} from 'lucide-react';

const PAGES = [
  { id: 'home',    label: 'Inicio' },
  { id: 'catalog', label: 'Catálogo' },
];

const MediaThumb = ({ item, index, total, onRemove, onMoveLeft, onMoveRight }) => {
  const isVideo = item.type === 'video';
  return (
    <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#1a1a1a]" style={{ aspectRatio: '16/9', minWidth: 180 }}>
      {isVideo ? (
        <video src={item.url} className="w-full h-full object-cover" muted />
      ) : (
        <img src={item.url} alt="" className="w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
        <div className="flex justify-end">
          <button
            onClick={() => onRemove(index)}
            className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center"
          >
            <Trash2 className="h-3.5 w-3.5 text-white" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {isVideo
              ? <Video className="h-4 w-4 text-white/70" />
              : <ImageIcon className="h-4 w-4 text-white/70" />}
            <span className="text-xs text-white/70">{isVideo ? 'Video' : 'Imagen'}</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onMoveLeft(index)}
              disabled={index === 0}
              className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5 text-white" />
            </button>
            <button
              onClick={() => onMoveRight(index)}
              disabled={index === total - 1}
              className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>
      <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center font-bold">
        {index + 1}
      </div>
    </div>
  );
};

export default function AdminBannerPage() {
  const [activePage, setActivePage] = useState('home');
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const load = async (page) => {
    setIsLoading(true);
    setError(null);
    const res = await bannerService.getByPage(page);
    if (res.success) setConfig(res.data);
    else setError(res.error);
    setIsLoading(false);
  };

  useEffect(() => { load(activePage); }, [activePage]);

  const handlePageSwitch = (page) => {
    setActivePage(page);
    setSaved(false);
  };

  const handleTextChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await bannerService.update(activePage, {
      title: config.title,
      subtitle: config.subtitle,
      button_text: config.button_text,
      button_url: config.button_url,
    });
    if (res.success) {
      setConfig(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setError(res.error);
    }
    setIsSaving(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const res = await bannerService.uploadMedia(activePage, file);
    if (res.success) setConfig(res.data);
    else setError(res.error);
    setIsUploading(false);
    e.target.value = '';
  };

  const handleRemove = async (index) => {
    const res = await bannerService.removeMedia(activePage, index);
    if (res.success) setConfig(res.data);
    else setError(res.error);
  };

  const move = async (index, dir) => {
    const media = [...config.media];
    const newIndex = index + dir;
    [media[index], media[newIndex]] = [media[newIndex], media[index]];
    const reordered = media.map((m, i) => ({ ...m, order: i }));
    setConfig(prev => ({ ...prev, media: reordered }));
    await bannerService.reorderMedia(activePage, reordered.map(m => ({ url: m.url, type: m.type })));
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Configurar Banners</h1>
          <p className="text-white/50 text-sm">
            Personaliza los textos y medios del banner en Inicio y Catálogo.
            Si subes más de un video/imagen, se mostrarán como slider.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10 pb-0">
          {PAGES.map(p => (
            <button
              key={p.id}
              onClick={() => handlePageSwitch(p.id)}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px border border-transparent ${
                activePage === p.id
                  ? 'bg-[#1a1a1a] border-white/10 border-b-[#1a1a1a] text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-white/30" />
          </div>
        ) : !config ? (
          <div className="text-red-400 text-sm">{error || 'No se pudo cargar la configuración'}</div>
        ) : (
          <div className="space-y-8">

            {/* Textos */}
            <div className="bg-[#171717] rounded-2xl border border-white/5 p-6 space-y-5">
              <h2 className="font-semibold text-white/90">Textos del Banner</h2>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Título</label>
                <input
                  value={config.title}
                  onChange={e => handleTextChange('title', e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors"
                  placeholder="Título principal del banner"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Subtítulo</label>
                <textarea
                  value={config.subtitle}
                  onChange={e => handleTextChange('subtitle', e.target.value)}
                  rows={3}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors resize-none"
                  placeholder="Descripción o subtítulo"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Texto del botón</label>
                  <input
                    value={config.button_text}
                    onChange={e => handleTextChange('button_text', e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors"
                    placeholder="Ej: Explorar Catálogo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">URL del botón</label>
                  <input
                    value={config.button_url}
                    onChange={e => handleTextChange('button_url', e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-colors"
                    placeholder="Ej: /catalog"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                  style={{ background: saved ? '#22c55e' : '#3b82f6' }}
                >
                  {isSaving
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : saved
                    ? <Check className="h-4 w-4" />
                    : <Save className="h-4 w-4" />}
                  {saved ? 'Guardado' : 'Guardar textos'}
                </button>
              </div>
            </div>

            {/* Media */}
            <div className="bg-[#171717] rounded-2xl border border-white/5 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-white/90">Videos e Imágenes</h2>
                  <p className="text-xs text-white/40 mt-0.5">
                    {config.media?.length > 1
                      ? `${config.media.length} medios — se mostrarán como slider`
                      : 'Sube videos (.mp4) o imágenes (.jpg, .png, .webp)'}
                  </p>
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  {isUploading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Plus className="h-4 w-4" />}
                  {isUploading ? 'Subiendo...' : 'Agregar medio'}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/*,image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
              </div>

              {config.media?.length === 0 ? (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-white/10 rounded-xl p-10 flex flex-col items-center gap-3 text-white/30 hover:border-white/20 hover:text-white/50 transition-colors"
                >
                  <Upload className="h-8 w-8" />
                  <span className="text-sm">Haz clic para subir el primer video o imagen</span>
                </button>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {[...config.media]
                    .sort((a, b) => a.order - b.order)
                    .map((item, i) => (
                      <div key={`${item.url}-${i}`} style={{ minWidth: 200, maxWidth: 220 }}>
                        <MediaThumb
                          item={item}
                          index={i}
                          total={config.media.length}
                          onRemove={handleRemove}
                          onMoveLeft={(idx) => move(idx, -1)}
                          onMoveRight={(idx) => move(idx, 1)}
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-950/40 border border-red-900/50 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
