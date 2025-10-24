'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useImageLibrary } from '../lib/image-library';

function SortableItem({ id, children }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  return (
    <div ref={setNodeRef} style={style} className="card mb-3">
      <div className="flex items-start gap-3">
        <div {...attributes} {...listeners} className="cursor-move p-2 hover:bg-gray-100 rounded" title="Drag to reorder">
          ☰
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

type HeroImage = {
  url: string;
  focusX: number; // 0 - 100
  focusY: number; // 0 - 100
  zoom: number; // 0.5 - 3.0
};

type GalleryMode = 'local' | 'immich' | 'hybrid';

type GallerySection = {
  heading: string;
  images: string[];
  mode: GalleryMode;
  immich: {
    albums: string[];
    limit: number;
    randomize: boolean;
    hiddenAssets: string[];
  };
};

type ImmichAlbumSummary = {
  id: string;
  name: string;
  description?: string;
  assetCount: number;
  createdAt?: string;
  shareId?: string;
  shareKey?: string;
  albumId?: string;
};

type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

function clamp01(value: number | undefined, fallback = 50) {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.min(100, Math.max(0, value));
}

function normalizeHeroImages(list: any): HeroImage[] {
  return (list ?? [])
    .map((item: any) => {
      if (typeof item === 'string') {
        return { url: item, focusX: 50, focusY: 50, zoom: 1 };
      }
      const url = item?.url || item?.src || '';
      const focusX = clamp01(item?.focusX);
      const focusY = clamp01(item?.focusY);
      const zoom = typeof item?.zoom === 'number' ? Math.min(3, Math.max(0.5, item.zoom)) : 1;
      return { url, focusX, focusY, zoom };
    })
    .filter((it: HeroImage) => !!it.url);
}

function normalizeConfig(config: any) {
  if (!config) return config;

  const next = { ...config };

  if (next.hero) {
    next.hero = {
      ...next.hero,
      images: normalizeHeroImages(next.hero.images)
    };
  }

  if (Array.isArray(next.sections)) {
    next.sections = next.sections.map((section: any) => {
      if (section?.type === 'gallery') {
        const immich = section.immich ?? {};
        const albums = Array.isArray(immich.albums)
          ? immich.albums.filter((id: string) => typeof id === 'string' && id.trim().length > 0)
          : [];
        return {
          ...section,
          images: Array.isArray(section.images) ? section.images : [],
          mode: section.mode ?? (albums.length > 0 ? 'hybrid' : 'local'),
          immich: {
            albums,
            limit: typeof immich.limit === 'number' ? immich.limit : 60,
            randomize: immich.randomize !== false,
            hiddenAssets: Array.isArray(immich.hiddenAssets) ? immich.hiddenAssets : [],
          },
        };
      }
      return section;
    });
  }

  return next;
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [cfg, setCfg] = useState<any>(null);
  const [pwdInput, setPwdInput] = useState('');
  const [adminPass, setAdminPass] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  const cfgRef = useRef<any>(null);
  const saveStatusRef = useRef<SaveStatus>('idle');
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const changeVersionRef = useRef(0);
  const skipNextSaveRef = useRef(true);

  useEffect(() => {
    cfgRef.current = cfg;
  }, [cfg]);

  useEffect(() => {
    saveStatusRef.current = saveStatus;
  }, [saveStatus]);

  useEffect(() => () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
    if (statusResetTimeoutRef.current) {
      clearTimeout(statusResetTimeoutRef.current);
      statusResetTimeoutRef.current = null;
    }
  }, []);

  async function loadConfig(pass: string) {
    const r = await fetch('/api/config', { headers: { 'x-admin-pass': pass } });
    if (!r.ok) throw new Error('Unauthorized');
    const j = await r.json();
    const normalized = normalizeConfig(j);
    setCfg(normalized);
    cfgRef.current = normalized;
    changeVersionRef.current = 0;
    skipNextSaveRef.current = true;
    setReady(true);
    setSaveStatus('idle');
    setLastSavedAt(Date.now());
  }

  async function handleLogin() {
    try {
      await loadConfig(pwdInput);
      setAdminPass(pwdInput);
      setPwdInput('');
      setAuthed(true);
    } catch {
      alert('Wrong password');
    }
  }

  const runSave = useCallback(async (version: number) => {
    if (!adminPass || !cfgRef.current) return;
    setSaveStatus('saving');
    try {
      const payload = normalizeConfig(cfgRef.current);
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-pass': adminPass },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Save failed');
      }
      if (changeVersionRef.current === version) {
        setLastSavedAt(Date.now());
        setSaveStatus('saved');
        if (statusResetTimeoutRef.current) {
          clearTimeout(statusResetTimeoutRef.current);
        }
        statusResetTimeoutRef.current = setTimeout(() => {
          if (changeVersionRef.current === version && saveStatusRef.current === 'saved') {
            setSaveStatus('idle');
          }
          statusResetTimeoutRef.current = null;
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to save config', error);
      if (changeVersionRef.current === version) {
        setSaveStatus('error');
      }
    }
  }, [adminPass]);

  const forceSave = useCallback(async () => {
    if (!authed || !adminPass || !cfgRef.current) return;
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
    if (statusResetTimeoutRef.current) {
      clearTimeout(statusResetTimeoutRef.current);
      statusResetTimeoutRef.current = null;
    }
    changeVersionRef.current += 1;
    const version = changeVersionRef.current;
    await runSave(version);
  }, [adminPass, authed, runSave]);

  useEffect(() => {
    if (!authed || !adminPass || !cfg || !ready) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    changeVersionRef.current += 1;
    const version = changeVersionRef.current;
    setSaveStatus('dirty');
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    if (statusResetTimeoutRef.current) {
      clearTimeout(statusResetTimeoutRef.current);
      statusResetTimeoutRef.current = null;
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      runSave(version).catch((error) => {
        console.error('Auto-save failed', error);
        if (changeVersionRef.current === version) {
          setSaveStatus('error');
        }
      }).finally(() => {
        autoSaveTimeoutRef.current = null;
      });
    }, 1200);
  }, [adminPass, authed, cfg, ready, runSave]);

  const saveStatusDisplay = useMemo(() => {
    const formattedTime = lastSavedAt
      ? new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null;

    switch (saveStatus) {
      case 'dirty':
        return {
          label: 'Unsaved changes',
          helper: 'Auto-saving shortly…',
          badge: 'bg-amber-500',
          pulse: true,
        };
      case 'saving':
        return {
          label: 'Saving…',
          helper: 'Syncing your updates',
          badge: 'bg-sky-500',
          pulse: true,
        };
      case 'error':
        return {
          label: 'Save failed',
          helper: 'Check connection then press save now',
          badge: 'bg-red-500',
          pulse: false,
        };
      case 'saved':
        return {
          label: 'All changes saved',
          helper: formattedTime ? `Saved at ${formattedTime}` : 'Up to date',
          badge: 'bg-emerald-500',
          pulse: false,
        };
      default:
        return {
          label: 'Live changes synced',
          helper: formattedTime ? `Last saved ${formattedTime}` : 'Ready to edit',
          badge: 'bg-emerald-500',
          pulse: false,
        };
    }
  }, [lastSavedAt, saveStatus]);

  const manualSaveLabel = useMemo(() => {
    if (saveStatus === 'saving') return 'Saving…';
    if (saveStatus === 'error') return 'Retry save';
    if (saveStatus === 'dirty') return 'Save now';
    return 'Save again';
  }, [saveStatus]);

  const manualSaveDisabled = saveStatus === 'saving';
  const hasUnsavedChanges = saveStatus === 'dirty' || saveStatus === 'error';

  function onDragEnd(e: any) {
    const { active, over } = e;
    if (active?.id !== over?.id) {
      const oldIndex = cfg.sections.findIndex((_: any, i: number) => i.toString() === active.id);
      const newIndex = cfg.sections.findIndex((_: any, i: number) => i.toString() === over.id);
      setCfg({ ...cfg, sections: arrayMove(cfg.sections, oldIndex, newIndex) });
    }
  }

  if (!authed) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-purple-500/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_60%)]" />
        </div>

        <div className="relative z-10 w-full max-w-md px-4">
          <div className="glass-panel p-10 shadow-2xl">
            <div className="mb-6 text-center">
              <div className="text-xs uppercase tracking-[0.4em] text-white/60">Wedding Studio</div>
              <h1 className="mt-3 text-3xl font-semibold text-white">Admin Console</h1>
              <p className="mt-2 text-sm text-white/70">
                Enter your private passphrase to unlock the live page builder.
              </p>
            </div>

            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Access key</label>
            <input
              type="password"
              className="mt-2 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-white/60 focus:outline-none"
              placeholder="••••••••"
              value={pwdInput}
              onChange={e => setPwdInput(e.target.value)}
              autoFocus
            />

            <button
              className="mt-6 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              onClick={handleLogin}
            >
              Unlock dashboard
            </button>

            <p className="mt-4 text-center text-[11px] uppercase tracking-[0.3em] text-white/50">
              Protected workspace
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!cfg) return <div className="container py-20">Loading…</div>;

  return (
    <div className="container py-6 sm:py-10">
      <h1 className="section-title">Page Builder</h1>
      <p className="subtext">Drag to reorder sections. Tap to edit content.</p>

      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl border border-white/50 bg-white/70 px-4 sm:px-6 py-3 sm:py-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <span
            className={`h-3 w-3 flex-shrink-0 rounded-full ${saveStatusDisplay.badge} ${saveStatusDisplay.pulse ? 'animate-pulse' : ''}`}
          />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-900">{saveStatusDisplay.label}</div>
            {saveStatusDisplay.helper && (
              <div className="text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-600/80 truncate">
                {saveStatusDisplay.helper}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            className={`rounded-full px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-900/30 min-h-[44px] w-full sm:w-auto touch-manipulation ${
              hasUnsavedChanges
                ? 'bg-slate-900 text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl'
                : 'bg-white/80 text-slate-900 border border-slate-900/10 shadow-sm hover:-translate-y-0.5 hover:shadow-md'
            }`}
            onClick={forceSave}
            disabled={manualSaveDisabled}
          >
            {manualSaveLabel}
          </button>
        </div>
      </div>

      <div className="card mt-4 sm:mt-6">
        <h2 className="text-lg sm:text-xl font-semibold">Hero</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <input className="border rounded p-3 sm:p-2 text-base min-h-[44px] touch-manipulation" placeholder="Title" value={cfg.hero.title} onChange={e=>setCfg({...cfg, hero: {...cfg.hero, title: e.target.value}})} />
          <input className="border rounded p-3 sm:p-2 text-base min-h-[44px] touch-manipulation" placeholder="Subtitle" value={cfg.hero.subtitle} onChange={e=>setCfg({...cfg, hero: {...cfg.hero, subtitle: e.target.value}})} />
          <input className="border rounded p-3 sm:p-2 text-base min-h-[44px] touch-manipulation" placeholder="Date" value={cfg.hero.date} onChange={e=>setCfg({...cfg, hero: {...cfg.hero, date: e.target.value}})} />
          <input className="border rounded p-3 sm:p-2 text-base min-h-[44px] touch-manipulation" placeholder="CTA Text" value={cfg.hero.ctaText} onChange={e=>setCfg({...cfg, hero: {...cfg.hero, ctaText: e.target.value}})} />
          <input className="border rounded p-3 sm:p-2 text-base min-h-[44px] touch-manipulation" placeholder="CTA Link" value={cfg.hero.ctaHref} onChange={e=>setCfg({...cfg, hero: {...cfg.hero, ctaHref: e.target.value}})} />
        </div>
        <div className="mt-3">
          <label className="block text-sm">Hero Images</label>
          <HeroImageList
            list={cfg.hero.images}
            onChange={(list: HeroImage[]) =>
              setCfg({
                ...cfg,
                hero: { ...cfg.hero, images: list }
              })
            }
          />
        </div>
      </div>

      <h2 className="text-lg sm:text-xl font-semibold mt-6 sm:mt-8">Sections</h2>
      <p className="text-sm opacity-70 mb-3">Drag ☰ to reorder • Tap to edit</p>
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={cfg.sections.map((_:any, i:number)=>i.toString())} strategy={verticalListSortingStrategy}>
          {cfg.sections.map((sec: any, i: number) => (
            <SortableItem id={i.toString()} key={i}>
              <SectionEditor section={sec} onChange={(s: any)=>{
                const copy = [...cfg.sections];
                copy[i] = s;
                setCfg({ ...cfg, sections: copy });
              }} />
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <button 
                  className={`flex-1 px-4 py-3 sm:py-2 rounded-lg border transition-all min-h-[44px] touch-manipulation text-sm sm:text-base ${sec.visible !== false ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
                  onClick={()=>{
                    const copy = [...cfg.sections]; 
                    copy[i] = {...copy[i], visible: copy[i].visible === false ? true : false}; 
                    setCfg({...cfg, sections: copy});
                  }}
                  title={sec.visible !== false ? 'Tap to hide' : 'Tap to show'}
                >
                  {sec.visible !== false ? '👁️ Visible' : '🚫 Hidden'}
                </button>
                <button 
                  className="px-4 py-2 rounded-lg border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                  onClick={()=>{
                    if (confirm('Delete this section?')) {
                      const copy = [...cfg.sections]; 
                      copy.splice(i, 1); 
                      setCfg({...cfg, sections: copy});
                    }
                  }}
                  title="Delete section"
                >
                  🗑️
                </button>
              </div>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
      
      {/* Add Section Button */}
      <div className="mt-4">
        <details className="border rounded-lg">
          <summary className="btn btn-primary cursor-pointer list-none px-4 py-3 text-center">
            + Add New Section
          </summary>
          <div className="p-4 bg-gray-50 space-y-2">
            <button className="btn w-full text-left" onClick={() => {
              setCfg({...cfg, sections: [...cfg.sections, {type: 'couple', heading: 'Our Story', visible: true}]});
            }}>+ Couple Section</button>
            <button className="btn w-full text-left" onClick={() => {
              setCfg({...cfg, sections: [...cfg.sections, {type: 'story', heading: 'Timeline', items: [], visible: true}]});
            }}>+ Story/Timeline</button>
            <button className="btn w-full text-left" onClick={() => {
              setCfg({...cfg, sections: [...cfg.sections, {type: 'events', heading: 'Events', items: [], visible: true}]});
            }}>+ Events</button>
            <button className="btn w-full text-left" onClick={() => {
              setCfg({...cfg, sections: [...cfg.sections, {type: 'gallery', heading: 'Gallery', images: [], mode: 'local', immich: {albums: [], limit: 60, randomize: true, hiddenAssets: []}, visible: true}]});
            }}>+ Gallery</button>
            <button className="btn w-full text-left" onClick={() => {
              setCfg({...cfg, sections: [...cfg.sections, {type: 'wedding-live', heading: 'Watch Live', mode: 'links', links: [], description: '', visible: true}]});
            }}>+ Wedding Live Stream 🎬</button>
            <button className="btn w-full text-left" onClick={() => {
              setCfg({...cfg, sections: [...cfg.sections, {type: 'rsvp', heading: 'RSVP', note: '', visible: true}]});
            }}>+ RSVP</button>
            <button className="btn w-full text-left" onClick={() => {
              setCfg({...cfg, sections: [...cfg.sections, {type: 'map', heading: 'Venue', embed: '', visible: true}]});
            }}>+ Map/Venue</button>
            <button className="btn w-full text-left" onClick={() => {
              setCfg({...cfg, sections: [...cfg.sections, {type: 'invitation', heading: 'You\'re Invited', visible: true}]});
            }}>+ Invitation</button>
            <button className="btn w-full text-left" onClick={() => {
              setCfg({...cfg, sections: [...cfg.sections, {type: 'invitation-hero', hashtag: '#Wedding', visible: true}]});
            }}>+ Invitation Hero</button>
          </div>
        </details>
      </div>
    </div>
  );
}

function SectionEditor({ section, onChange }: any) {
  if (section.type === 'couple') {
    return (
      <div>
        <div className="text-lg font-semibold">Couple</div>
        <input className="border rounded p-2 w-full mt-2" value={section.heading} onChange={e=>onChange({...section, heading: e.target.value})} />
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <input className="border rounded p-2" placeholder="Bride name" value={section.bride?.name||''} onChange={e=>onChange({...section, bride:{...section.bride, name:e.target.value}})} />
          <input className="border rounded p-2" placeholder="Groom name" value={section.groom?.name||''} onChange={e=>onChange({...section, groom:{...section.groom, name:e.target.value}})} />
          <input className="border rounded p-2" placeholder="Bride bio" value={section.bride?.bio||''} onChange={e=>onChange({...section, bride:{...section.bride, bio:e.target.value}})} />
          <input className="border rounded p-2" placeholder="Groom bio" value={section.groom?.bio||''} onChange={e=>onChange({...section, groom:{...section.groom, bio:e.target.value}})} />
        </div>
        <div className="mt-3">
          <label className="block text-sm">Couple Image (with Focus Point)</label>
          <ImagePickerWithFocus value={section.image} onChange={(v:ImageWithFocus)=>onChange({...section, image: v})} />
        </div>
      </div>
    );
  }
  if (section.type === 'story') {
    return (
      <div>
        <div className="text-lg font-semibold">Story</div>
        <input className="border rounded p-2 w-full mt-2" value={section.heading} onChange={e=>onChange({...section, heading: e.target.value})} />
        <Repeater items={section.items||[]} onChange={(it:any)=>onChange({...section, items: it})} fields={[
          {key:'year', label:'Year'}, {key:'title', label:'Title'}, {key:'desc', label:'Description'}
        ]} />
      </div>
    );
  }
  if (section.type === 'events') {
    return (
      <div>
        <div className="text-lg font-semibold">Events</div>
        <input className="border rounded p-2 w-full mt-2" value={section.heading} onChange={e=>onChange({...section, heading: e.target.value})} />
        <EventRepeater items={section.items||[]} onChange={(it:any)=>onChange({...section, items: it})} />
      </div>
    );
  }
  if (section.type === 'gallery') {
    return <GalleryEditor section={section} onChange={onChange} />;
  }
  if (section.type === 'rsvp') {
    return (
      <div>
        <div className="text-lg font-semibold">RSVP</div>
        <input className="border rounded p-2 w-full mt-2" value={section.heading} onChange={e=>onChange({...section, heading: e.target.value})} />
        <input className="border rounded p-2 w-full mt-2" value={section.note||''} onChange={e=>onChange({...section, note: e.target.value})} />
      </div>
    );
  }
  if (section.type === 'map') {
    return (
      <div>
        <div className="text-lg font-semibold">Map / Venue</div>
        <input className="border rounded p-2 w-full mt-2" value={section.heading} onChange={e=>onChange({...section, heading: e.target.value})} />
        <input className="border rounded p-2 w-full mt-2" value={section.embed||''} onChange={e=>onChange({...section, embed: e.target.value})} />
      </div>
    );
  }
  if (section.type === 'invitation') {
    return (
      <div>
        <div className="text-lg font-semibold">Invitation Section</div>
        <input className="border rounded p-2 w-full mt-2" placeholder="Hashtag (e.g., #MoCHA)" value={section.hashtag||''} onChange={e=>onChange({...section, hashtag: e.target.value})} />
        <input className="border rounded p-2 w-full mt-2" placeholder="Heading" value={section.heading||''} onChange={e=>onChange({...section, heading: e.target.value})} />
        <textarea className="border rounded p-2 w-full mt-2" rows={4} placeholder="Message" value={section.message||''} onChange={e=>onChange({...section, message: e.target.value})} />
        <input className="border rounded p-2 w-full mt-2" placeholder="Dates (e.g., Nov 24th - 26th)" value={section.dates||''} onChange={e=>onChange({...section, dates: e.target.value})} />
        <div className="grid md:grid-cols-2 gap-3 mt-2">
          <input className="border rounded p-2" placeholder="CTA Button Text" value={section.ctaText||''} onChange={e=>onChange({...section, ctaText: e.target.value})} />
          <input className="border rounded p-2" placeholder="CTA Button Link" value={section.ctaHref||''} onChange={e=>onChange({...section, ctaHref: e.target.value})} />
        </div>
        <input className="border rounded p-2 w-full mt-2" placeholder="Note (e.g., contact info)" value={section.note||''} onChange={e=>onChange({...section, note: e.target.value})} />
        <div className="mt-3">
          <label className="block text-sm">Background Image (with Focus Point)</label>
          <ImagePickerWithFocus value={section.image} onChange={(v:ImageWithFocus)=>onChange({...section, image: v})} />
        </div>
      </div>
    );
  }
  if (section.type === 'invitation-hero') {
    return (
      <div>
        <div className="text-lg font-semibold">Invitation Hero (Circular Photos)</div>
        <input className="border rounded p-2 w-full mt-2" placeholder="Hashtag (e.g., #MoCHA)" value={section.hashtag||''} onChange={e=>onChange({...section, hashtag: e.target.value})} />
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <input className="border rounded p-2" placeholder="Bride Name" value={section.brideName||''} onChange={e=>onChange({...section, brideName: e.target.value})} />
          <input className="border rounded p-2" placeholder="Groom Name" value={section.groomName||''} onChange={e=>onChange({...section, groomName: e.target.value})} />
        </div>
        <div className="mt-3">
          <label className="block text-sm">Bride Image (Circular - with Focus Point)</label>
          <ImagePickerWithFocus value={section.brideImage} onChange={(v:ImageWithFocus)=>onChange({...section, brideImage: v})} />
        </div>
        <div className="mt-3">
          <label className="block text-sm">Groom Image (Circular - with Focus Point)</label>
          <ImagePickerWithFocus value={section.groomImage} onChange={(v:ImageWithFocus)=>onChange({...section, groomImage: v})} />
        </div>
        <textarea className="border rounded p-2 w-full mt-3" rows={2} placeholder="Message (optional)" value={section.message||''} onChange={e=>onChange({...section, message: e.target.value})} />
        <input className="border rounded p-2 w-full mt-2" placeholder="Date (e.g., 26th November 2025)" value={section.date||''} onChange={e=>onChange({...section, date: e.target.value})} />
      </div>
    );
  }
  if (section.type === 'wedding-live') {
    return <WeddingLiveEditor section={section} onChange={onChange} />;
  }
  return <div>Unknown section</div>;
}

function Repeater({ items, onChange, fields }: any) {
  const [list, setList] = useState(items);
  useEffect(()=>setList(items), [items]);
  function add() { const obj:any = {}; fields.forEach((f:any)=>obj[f.key]=''); onChange([...(list||[]), obj]); }
  function rm(i:number) { const c=[...list]; c.splice(i,1); onChange(c); }
  function upd(i:number, key:string, val:string) { const c=[...list]; c[i] = {...c[i], [key]: val}; onChange(c); }
  return (
    <div className="space-y-3 mt-3">
      {(list||[]).map((it:any, i:number)=> (
        <div key={i} className="grid md:grid-cols-3 gap-2 items-start">
          {fields.map((f:any)=>(
            <input key={f.key} className="border rounded p-2" placeholder={f.label} value={it[f.key]||''} onChange={e=>upd(i, f.key, e.target.value)} />
          ))}
          <button className="btn" onClick={()=>rm(i)}>Delete</button>
        </div>
      ))}
      <button className="btn btn-primary" onClick={add}>Add Item</button>
    </div>
  );
}

function EventRepeater({ items, onChange }: any) {
  const [list, setList] = useState(items);
  useEffect(()=>setList(items), [items]);
  
  function add() { 
    onChange([...(list||[]), {name:'', time:'', date:'', place:'', description:'', image:'', liveStreamUrl:''}]); 
  }
  
  function rm(i:number) { 
    const c=[...list]; c.splice(i,1); onChange(c); 
  }
  
  function upd(i:number, key:string, val:any) { 
    const c=[...list]; c[i] = {...c[i], [key]: val}; onChange(c); 
  }
  
  return (
    <div className="space-y-4 mt-3">
      {(list||[]).map((it:any, i:number)=> (
        <div key={i} className="border-2 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <span className="font-bold text-lg text-gray-800">Event {i+1}</span>
              {it.name && <span className="text-sm text-gray-600">- {it.name}</span>}
            </div>
            <button className="btn border-red-300 bg-red-50 text-red-600 hover:bg-red-100" onClick={()=>rm(i)}>🗑️ Delete</button>
          </div>
          
          <div className="space-y-3">
            {/* Event Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
              <input 
                className="border-2 border-purple-200 rounded-lg p-2 w-full focus:border-purple-500 focus:outline-none" 
                placeholder="e.g., Sangeet Night, Haldi Ceremony" 
                value={it.name||''} 
                onChange={e=>upd(i, 'name', e.target.value)} 
              />
            </div>
            
            {/* Date and Time */}
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input 
                  type="date"
                  className="border-2 border-purple-200 rounded-lg p-2 w-full focus:border-purple-500 focus:outline-none" 
                  value={it.date||''} 
                  onChange={e=>upd(i, 'date', e.target.value)} 
                  required
                />
                {it.date && (() => {
                  try {
                    // Parse date in local timezone to avoid off-by-one errors
                    const [year, month, day] = it.date.split('-').map(Number);
                    if (!year || !month || !day) {
                      return <p className="text-xs text-red-500 mt-1">❌ Invalid date</p>;
                    }
                    const date = new Date(year, month - 1, day);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                    const dayNum = date.getDate();
                    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                    const getOrdinal = (d: number) => {
                      if (d > 3 && d < 21) return 'th';
                      switch (d % 10) {
                        case 1: return 'st';
                        case 2: return 'nd';
                        case 3: return 'rd';
                        default: return 'th';
                      }
                    };
                    return (
                      <p className="text-xs text-purple-600 mt-1 font-medium">
                        ✅ {dayName}, {dayNum}{getOrdinal(dayNum)} {monthName}
                      </p>
                    );
                  } catch (e) {
                    return <p className="text-xs text-red-500 mt-1">❌ Invalid date</p>;
                  }
                })()}
                {!it.date && (
                  <p className="text-xs text-gray-500 mt-1">Required for calendar sync</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                <input 
                  type="time"
                  className="border-2 border-purple-200 rounded-lg p-2 w-full focus:border-purple-500 focus:outline-none" 
                  value={it.time||''} 
                  onChange={e=>upd(i, 'time', e.target.value)} 
                  required
                />
                {it.time && (() => {
                  const format24To12 = (time24: string) => {
                    const [hoursStr, minutes] = time24.split(':');
                    const hours24 = parseInt(hoursStr, 10);
                    const period = hours24 >= 12 ? 'PM' : 'AM';
                    let hours12 = hours24 % 12;
                    if (hours12 === 0) hours12 = 12;
                    return `${hours12}:${minutes} ${period}`;
                  };
                  return (
                    <p className="text-xs text-purple-600 mt-1 font-medium">
                      ✅ {format24To12(it.time)}
                    </p>
                  );
                })()}
                {!it.time && (
                  <p className="text-xs text-gray-500 mt-1">Select event start time</p>
                )}
              </div>
            </div>
            
            {/* Preview of how it will appear */}
            {it.date && it.time && (() => {
              try {
                // Parse date in local timezone to avoid off-by-one errors
                const [year, month, day] = it.date.split('-').map(Number);
                if (!year || !month || !day) return null;
                
                const date = new Date(year, month - 1, day);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                const dayNum = date.getDate();
                const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                const getOrdinal = (d: number) => {
                  if (d > 3 && d < 21) return 'th';
                  switch (d % 10) {
                    case 1: return 'st';
                    case 2: return 'nd';
                    case 3: return 'rd';
                    default: return 'th';
                  }
                };
                // Convert 24-hour time to 12-hour format
                const format24To12 = (time24: string) => {
                  const [hoursStr, minutes] = time24.split(':');
                  const hours24 = parseInt(hoursStr, 10);
                  const period = hours24 >= 12 ? 'PM' : 'AM';
                  let hours12 = hours24 % 12;
                  if (hours12 === 0) hours12 = 12;
                  return `${hours12}:${minutes} ${period}`;
                };
                const formattedTime = format24To12(it.time);
                return (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 mt-3">
                    <p className="text-xs font-medium text-green-800 mb-1">
                      👀 Preview on Website (IST):
                    </p>
                    <p className="text-sm font-bold text-green-900">
                      {dayName}, {dayNum}{getOrdinal(dayNum)} {monthName} {formattedTime}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Note: Calendar apps will show in user's local timezone
                    </p>
                  </div>
                );
              } catch (e) {
                return null;
              }
            })()}
            
            {/* Place */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue/Place</label>
              <input 
                className="border-2 border-purple-200 rounded-lg p-2 w-full focus:border-purple-500 focus:outline-none" 
                placeholder="e.g., SRINIDHI Joy 'n' Joy Clubs & Resorts" 
                value={it.place||''} 
                onChange={e=>upd(i, 'place', e.target.value)} 
              />
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                className="border-2 border-purple-200 rounded-lg p-2 w-full focus:border-purple-500 focus:outline-none" 
                placeholder="Event details, dress code, special notes..." 
                rows={3}
                value={it.description||''} 
                onChange={e=>upd(i, 'description', e.target.value)} 
              />
            </div>
            
            {/* Live Stream URL */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
              <label className="block text-sm font-medium text-blue-800 mb-1 flex items-center gap-2">
                <span>📹</span>
                <span>Live Stream URL (Optional)</span>
              </label>
              <input 
                type="url"
                className="border-2 border-blue-300 rounded-lg p-2 w-full focus:border-blue-500 focus:outline-none" 
                placeholder="https://youtube.com/watch?v=... or https://youtu.be/..." 
                value={it.liveStreamUrl||''} 
                onChange={e=>upd(i, 'liveStreamUrl', e.target.value)} 
              />
              <p className="text-xs text-blue-700 mt-2">
                💡 Add YouTube, Zoom, or any live stream link. Guests will see a "Watch Live" button.
              </p>
              {it.liveStreamUrl && (
                <div className="mt-2">
                  <a 
                    href={it.liveStreamUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    🔗 Test link: {it.liveStreamUrl}
                  </a>
                </div>
              )}
            </div>
            
            {/* Event Image */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Image (with Focus Point)</label>
              <ImagePickerWithFocus value={it.image} onChange={(v:ImageWithFocus)=>upd(i, 'image', v)} />
            </div>
          </div>
        </div>
      ))}
      
      <button className="btn btn-primary w-full text-lg py-3" onClick={add}>
        ➕ Add New Event
      </button>
      
      {list && list.length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>📝 Note:</strong> Changes are saved automatically. Calendar events will update for all users who subscribed to the calendar.
          </p>
        </div>
      )}
    </div>
  );
}

type ImageWithFocus = string | { url: string; focusX?: number; focusY?: number; zoom?: number };

function normalizeImageWithFocus(item: ImageWithFocus): { url: string; focusX: number; focusY: number; zoom: number } {
  if (typeof item === 'string') {
    return { url: item, focusX: 50, focusY: 50, zoom: 1 };
  }
  return {
    url: item.url || '',
    focusX: clamp01(item.focusX),
    focusY: clamp01(item.focusY),
    zoom: typeof item.zoom === 'number' ? Math.min(3, Math.max(0.5, item.zoom)) : 1,
  };
}

function ImagePicker({ value, onChange }: { value: string, onChange: (url: string) => void }) {
  const [showLibrary, setShowLibrary] = useState(false);
  const handleConfirm = useCallback((urls: string[]) => {
    if (urls[0]) {
      onChange(urls[0]);
    }
    setShowLibrary(false);
  }, [onChange]);

  return (
    <div>
      <div className="flex items-center gap-3">
        {value && <img src={value} alt="" className="w-24 h-24 object-cover rounded-lg border" />}
        <button className="btn" onClick={() => setShowLibrary(true)}>Choose Image</button>
      </div>
      {showLibrary && (
        <MediaLibrary
          mode="single"
          onClose={() => setShowLibrary(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}

function ImagePickerWithFocus({ value, onChange }: { value: ImageWithFocus, onChange: (val: ImageWithFocus) => void }) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [showFocusEditor, setShowFocusEditor] = useState(false);
  
  const normalized = normalizeImageWithFocus(value);
  
  const handleConfirm = useCallback((urls: string[]) => {
    if (urls[0]) {
      onChange({ url: urls[0], focusX: 50, focusY: 50, zoom: 1 });
    }
    setShowLibrary(false);
  }, [onChange]);
  
  const updateFocus = (patch: { focusX?: number; focusY?: number; zoom?: number }) => {
    onChange({
      url: normalized.url,
      focusX: clamp01(patch.focusX ?? normalized.focusX),
      focusY: clamp01(patch.focusY ?? normalized.focusY),
      zoom: typeof patch.zoom === 'number' ? Math.min(3, Math.max(0.5, patch.zoom)) : normalized.zoom,
    });
  };

  return (
    <div>
      <div className="flex items-start gap-3">
        {normalized.url && (
          <div className="relative group">
            <div className="w-32 h-32 overflow-hidden rounded-lg border bg-gray-900">
              <img 
                src={normalized.url} 
                alt="" 
                className="w-full h-full object-cover" 
                style={{ 
                  objectPosition: `${normalized.focusX}% ${normalized.focusY}%`,
                  transform: `scale(${normalized.zoom})`
                }}
              />
              {/* Focus point indicator */}
              <div 
                className="absolute w-4 h-4 rounded-full border-2 border-red-500 bg-red-500/50 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: `${normalized.focusX}%`, top: `${normalized.focusY}%` }}
              />
            </div>
            <button
              className="absolute bottom-1 right-1 btn text-xs bg-blue-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setShowFocusEditor(!showFocusEditor)}
            >
              🎯
            </button>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <button className="btn" onClick={() => setShowLibrary(true)}>Choose Image</button>
          {normalized.url && showFocusEditor && (
            <div className="p-3 bg-white border rounded-lg shadow-lg w-64">
              <div className="text-xs font-semibold mb-2">Focus Point & Zoom</div>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] block">↔️ Horizontal ({Math.round(normalized.focusX)}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={normalized.focusX}
                    onChange={(e) => updateFocus({ focusX: Number(e.target.value) })}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] block">↕️ Vertical ({Math.round(normalized.focusY)}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={normalized.focusY}
                    onChange={(e) => updateFocus({ focusY: Number(e.target.value) })}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] block">🔍 Zoom ({(normalized.zoom * 100).toFixed(0)}%)</label>
                  <input
                    type="range"
                    min={50}
                    max={300}
                    step={5}
                    value={normalized.zoom * 100}
                    onChange={(e) => updateFocus({ zoom: Number(e.target.value) / 100 })}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
                    <span>50%</span>
                    <span>100%</span>
                    <span>300%</span>
                  </div>
                </div>
                <button 
                  className="btn btn-primary w-full text-xs" 
                  onClick={() => setShowFocusEditor(false)}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showLibrary && (
        <MediaLibrary
          mode="single"
          onClose={() => setShowLibrary(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}

type GalleryImage = string | { url: string; focusX?: number; focusY?: number; zoom?: number };

function normalizeGalleryImage(item: GalleryImage): { url: string; focusX: number; focusY: number; zoom: number } {
  if (typeof item === 'string') {
    return { url: item, focusX: 50, focusY: 50, zoom: 1 };
  }
  return {
    url: item.url || '',
    focusX: clamp01(item.focusX),
    focusY: clamp01(item.focusY),
    zoom: typeof item.zoom === 'number' ? Math.min(3, Math.max(0.5, item.zoom)) : 1,
  };
}

function ImagePickerList({ list, onChange }: { list: GalleryImage[], onChange: (urls: GalleryImage[]) => void }) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const normalized = (list || []).map(normalizeGalleryImage);
  
  const handleConfirm = useCallback((urls: string[]) => {
    if (urls.length > 0) {
      const newImages = urls.filter(Boolean).map(url => ({ url, focusX: 50, focusY: 50, zoom: 1 }));
      onChange([...normalized, ...newImages]);
    }
    setShowLibrary(false);
  }, [normalized, onChange]);

  function rm(i: number) {
    const copy = [...normalized];
    copy.splice(i, 1);
    onChange(copy);
  }
  
  function updateImage(i: number, patch: Partial<{ focusX: number; focusY: number; zoom: number }>) {
    const copy = [...normalized];
    copy[i] = {
      ...copy[i],
      focusX: clamp01(patch.focusX, copy[i].focusX),
      focusY: clamp01(patch.focusY, copy[i].focusY),
      zoom: typeof patch.zoom === 'number' ? Math.min(3, Math.max(0.5, patch.zoom)) : copy[i].zoom,
    };
    onChange(copy);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mt-2">
        {normalized.map((img, i) => (
          <div key={i} className="relative group">
            <div className="w-28 h-28 overflow-hidden rounded-lg border bg-gray-900">
              <img 
                src={img.url} 
                alt="" 
                className="w-full h-full object-cover" 
                style={{ 
                  objectPosition: `${img.focusX}% ${img.focusY}%`,
                  transform: `scale(${img.zoom})`
                }}
              />
              {/* Focus point indicator */}
              <div 
                className="absolute w-3 h-3 rounded-full border-2 border-red-500 bg-red-500/50 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: `${img.focusX}%`, top: `${img.focusY}%` }}
              />
            </div>
            <button 
              className="btn absolute top-1 right-1 text-xs bg-red-500 text-white" 
              onClick={() => rm(i)}
            >
              ✕
            </button>
            <button
              className="btn absolute bottom-1 left-1 text-xs bg-blue-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setEditingIndex(editingIndex === i ? null : i)}
            >
              🎯
            </button>
            {editingIndex === i && (
              <div className="absolute top-full left-0 mt-2 p-3 bg-white border rounded-lg shadow-lg z-10 w-64">
                <div className="text-xs font-semibold mb-2">Focus Point & Zoom</div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] block">↔️ Horizontal ({Math.round(img.focusX)}%)</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={img.focusX}
                      onChange={(e) => updateImage(i, { focusX: Number(e.target.value) })}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] block">↕️ Vertical ({Math.round(img.focusY)}%)</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={img.focusY}
                      onChange={(e) => updateImage(i, { focusY: Number(e.target.value) })}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] block">🔍 Zoom ({(img.zoom * 100).toFixed(0)}%)</label>
                    <input
                      type="range"
                      min={50}
                      max={300}
                      step={5}
                      value={img.zoom * 100}
                      onChange={(e) => updateImage(i, { zoom: Number(e.target.value) / 100 })}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                    <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
                      <span>50%</span>
                      <span>100%</span>
                      <span>300%</span>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary w-full text-xs" 
                    onClick={() => setEditingIndex(null)}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button className="btn mt-2" onClick={() => setShowLibrary(true)}>Add Image</button>
      <p className="text-xs text-gray-600 mt-1">🎯 Hover over images and click the target icon to adjust focus point</p>
      {showLibrary && (
        <MediaLibrary
          mode="multiple"
          onClose={() => setShowLibrary(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}

function ImmichPhotoManager({ albums, hiddenAssets, onHiddenAssetsChange }: { 
  albums: string[]; 
  hiddenAssets: string[];
  onHiddenAssetsChange: (hidden: string[]) => void;
}) {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!albums.length || !expanded) return;
    
    setLoading(true);
    Promise.all(
      albums.map(async (albumId) => {
        try {
          const res = await fetch(`/api/immich/albums/${albumId}/assets?take=100`);
          const data = await res.json();
          return (data.assets || []).map((asset: any) => ({ ...asset, albumId }));
        } catch {
          return [];
        }
      })
    )
      .then((results) => setAssets(results.flat()))
      .finally(() => setLoading(false));
  }, [albums, expanded]);

  const toggleHidden = (assetId: string) => {
    if (hiddenAssets.includes(assetId)) {
      onHiddenAssetsChange(hiddenAssets.filter(id => id !== assetId));
    } else {
      onHiddenAssetsChange([...hiddenAssets, assetId]);
    }
  };

  if (!expanded) {
    return (
      <button 
        className="btn w-full text-sm" 
        onClick={() => setExpanded(true)}
      >
        Show Immich Photos ({albums.length} album{albums.length !== 1 ? 's' : ''})
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-blue-600">Click photos to hide/show them in the gallery</p>
        <button 
          className="text-xs text-blue-600 hover:text-blue-800 underline" 
          onClick={() => setExpanded(false)}
        >
          Collapse
        </button>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : assets.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-96 overflow-y-auto p-1">
          {assets.map((asset) => {
            const isHidden = hiddenAssets.includes(asset.id);
            return (
              <button
                key={asset.id}
                type="button"
                onClick={() => toggleHidden(asset.id)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all group ${
                  isHidden 
                    ? 'border-red-500 opacity-40 hover:opacity-60' 
                    : 'border-green-500/50 hover:border-green-500'
                }`}
                title={isHidden ? 'Click to show' : 'Click to hide'}
              >
                <img 
                  src={asset.thumbUrl} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                  isHidden ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <div className={`px-2 py-1 rounded text-xs font-bold text-white shadow-lg ${
                    isHidden ? 'bg-red-600' : 'bg-green-600'
                  }`}>
                    {isHidden ? '🚫 Hidden' : '✓ Visible'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-gray-500 text-center py-4">No photos found in selected albums</p>
      )}
      
      {assets.length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-blue-200">
          <p className="text-xs text-blue-700">
            {assets.length - hiddenAssets.length} visible • {hiddenAssets.length} hidden
          </p>
          {hiddenAssets.length > 0 && (
            <button
              type="button"
              onClick={() => onHiddenAssetsChange([])}
              className="text-xs text-red-600 hover:text-red-800 underline font-medium"
            >
              Show all photos
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function GalleryEditor({ section, onChange }: { section: any; onChange: (value: any) => void }) {
  const gallery = useMemo(() => ({
    ...section,
    heading: section.heading ?? 'Gallery',
    images: Array.isArray(section.images) ? section.images : [],
    mode: (section.mode as GalleryMode) ?? 'local',
    immich: {
      albums: Array.isArray(section.immich?.albums) ? section.immich.albums : [],
      limit: typeof section.immich?.limit === 'number' ? section.immich.limit : 60,
      randomize: section.immich?.randomize !== false,
      hiddenAssets: Array.isArray(section.immich?.hiddenAssets) ? section.immich.hiddenAssets : [],
    },
  }), [section]);

  const [immichAlbums, setImmichAlbums] = useState<ImmichAlbumSummary[]>([]);
  const [immichStatus, setImmichStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [immichError, setImmichError] = useState<string | null>(null);
  const [immichConfigured, setImmichConfigured] = useState<boolean>(true);
  const [manualAlbum, setManualAlbum] = useState('');

  const update = useCallback((patch: Partial<GallerySection>) => {
    onChange({
      ...gallery,
      ...patch,
      immich: patch.immich ? { ...gallery.immich, ...patch.immich } : gallery.immich,
    });
  }, [gallery, onChange]);

  const updateImmich = useCallback((patch: Partial<GallerySection['immich']>) => {
    update({ immich: { ...gallery.immich, ...patch } });
  }, [gallery.immich, update]);

  const toggleAlbum = useCallback((album: ImmichAlbumSummary) => {
    const synonyms = [album.id, album.shareId, album.shareKey, album.albumId]
      .filter((value): value is string => Boolean(value));
    const current = gallery.immich.albums as string[];
    const filtered = current.filter((value) => !synonyms.includes(value));
    const existed = filtered.length !== current.length;
    const next = existed ? filtered : [...filtered, album.id];
    updateImmich({ albums: next });
  }, [gallery.immich.albums, updateImmich]);

  const addManualAlbum = useCallback(() => {
    const trimmed = manualAlbum.trim();
    if (!trimmed) return;
    if (gallery.immich.albums.includes(trimmed)) {
      setManualAlbum('');
      return;
    }
    const match = immichAlbums.find((album) =>
      [album.id, album.shareId, album.shareKey, album.albumId]
        .filter((value): value is string => Boolean(value))
        .includes(trimmed)
    );
    const normalized = match?.id ?? trimmed;
    const synonyms = match
      ? [match.id, match.shareId, match.shareKey, match.albumId].filter((value): value is string => Boolean(value))
      : [normalized];
    const filtered = gallery.immich.albums.filter((value: string) => !synonyms.includes(value));
    updateImmich({ albums: [...filtered, normalized] });
    setManualAlbum('');
  }, [gallery.immich.albums, immichAlbums, manualAlbum, updateImmich]);

  const loadAlbums = useCallback(async () => {
    setImmichStatus('loading');
    setImmichError(null);
    try {
      const res = await fetch('/api/immich/albums');
      const data = await res.json();
      setImmichConfigured(Boolean(data.configured));
      if (!res.ok) {
        setImmichError(data.error || 'Unable to load Immich albums');
        setImmichStatus('error');
        return;
      }
      setImmichAlbums(data.albums ?? []);
      setImmichError(data.error ?? null);
      setImmichStatus('ready');
    } catch (error) {
      setImmichStatus('error');
      setImmichError((error as Error).message);
    }
  }, []);

  useEffect(() => {
    if (gallery.immich.albums.length > 0 && immichStatus === 'idle') {
      loadAlbums().catch(() => {});
    }
  }, [gallery.immich.albums.length, immichStatus, loadAlbums]);

  useEffect(() => {
    if (!immichAlbums.length) return;
    if (!gallery.immich.albums.length) return;

    const normalized = gallery.immich.albums.map((value: string) => {
      const match = immichAlbums.find((album) =>
        [album.id, album.shareId, album.shareKey, album.albumId]
          .filter((identifier): identifier is string => Boolean(identifier))
          .includes(value)
      );
      return match ? match.id : value;
    });

  const deduped: string[] = Array.from(new Set(normalized));

    const changed =
      deduped.length !== gallery.immich.albums.length ||
      deduped.some((value, index) => value !== gallery.immich.albums[index]);

    if (changed) {
      updateImmich({ albums: deduped });
    }
  }, [immichAlbums, gallery.immich.albums, updateImmich]);

  return (
    <div>
      <div className="text-lg font-semibold">Gallery</div>
      <input
        className="border rounded p-2 w-full mt-2"
        value={gallery.heading}
        onChange={(e) => update({ heading: e.target.value })}
        placeholder="Gallery heading"
      />

      <div className="mt-4 glass-panel p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <span className="text-sm font-semibold">Image source</span>
            <p className="text-xs opacity-70">Choose where gallery photos come from.</p>
          </div>
          <select
            className="border rounded-lg px-3 py-2 text-sm bg-white/80"
            value={gallery.mode}
            onChange={(e) => update({ mode: e.target.value as GalleryMode })}
          >
            <option value="local">Local uploads only</option>
            <option value="immich">Immich shared album only</option>
            <option value="hybrid">Blend Immich + local</option>
          </select>
        </div>

        <div className="rounded-xl border border-white/30 bg-white/60 backdrop-blur p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">Immich shared albums</h4>
              <p className="text-xs opacity-70">
                Powered by IMMICH_BASE_URL &amp; IMMICH_API_KEY environment variables.
              </p>
            </div>
            <button className="btn" type="button" onClick={loadAlbums} disabled={immichStatus === 'loading'}>
              {immichStatus === 'loading' ? 'Loading…' : 'Refresh list'}
            </button>
          </div>

          {!immichConfigured && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs">
              Set IMMICH_BASE_URL and IMMICH_API_KEY in your environment to enable the album picker.
            </div>
          )}

          {immichError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              {immichError}
            </div>
          )}

          {immichAlbums.length > 0 ? (
            <div className="grid gap-2 max-h-52 overflow-y-auto pr-1">
              {immichAlbums.map((album) => {
                const identifiers = [album.id, album.shareId, album.shareKey, album.albumId]
                  .filter((value): value is string => Boolean(value));
                const checked = identifiers.some((value) => gallery.immich.albums.includes(value));
                return (
                  <label
                    key={album.id}
                    className={`flex items-start gap-3 rounded-lg border px-3 py-2 cursor-pointer transition ${
                      checked ? 'border-primary/60 bg-white/80 shadow-sm' : 'border-gray-200 hover:border-primary/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAlbum(album)}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-sm font-medium">{album.name}</div>
                      <div className="text-xs opacity-70 flex flex-wrap gap-2">
                        <span>{album.assetCount} items</span>
                        <span>Key: {album.id.slice(0, 8)}…</span>
                        {album.albumId && <span>Album: {album.albumId.slice(0, 8)}…</span>}
                      </div>
                      {album.description && (
                        <p className="text-xs opacity-80 mt-1">{album.description}</p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="text-xs opacity-60">No albums loaded yet.</p>
          )}

          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <input
              className="border rounded-lg px-3 py-2 text-sm flex-1"
              placeholder="Paste Immich shared album ID"
              value={manualAlbum}
              onChange={(e) => setManualAlbum(e.target.value)}
            />
            <button className="btn" type="button" onClick={addManualAlbum}>
              Add album
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <label className="flex flex-col gap-1">
              <span className="font-medium">Max Immich photos</span>
              <input
                type="number"
                min={1}
                max={200}
                className="border rounded-lg px-3 py-2"
                value={gallery.immich.limit}
                onChange={(e) => updateImmich({ limit: Number(e.target.value) || 0 })}
              />
            </label>
            <label className="flex items-center gap-2 mt-2 md:mt-6">
              <input
                type="checkbox"
                checked={gallery.immich.randomize}
                onChange={(e) => updateImmich({ randomize: e.target.checked })}
              />
              <span className="text-sm">Shuffle Immich photos on each load</span>
            </label>
          </div>
          
          {gallery.immich.albums.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h5 className="text-sm font-semibold text-blue-900">Manage Immich Photos</h5>
                  <p className="text-xs text-blue-700 mt-0.5">Preview and hide specific photos from selected albums</p>
                </div>
                {gallery.immich.hiddenAssets.length > 0 && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                    {gallery.immich.hiddenAssets.length} hidden
                  </span>
                )}
              </div>
              <ImmichPhotoManager 
                albums={gallery.immich.albums}
                hiddenAssets={gallery.immich.hiddenAssets}
                onHiddenAssetsChange={(hidden) => updateImmich({ hiddenAssets: hidden })}
              />
            </div>
          )}
        </div>
      </div>

      {(gallery.mode === 'local' || gallery.mode === 'hybrid') && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">Curated uploads</h4>
            <span className="text-xs opacity-60">{gallery.images.length} selected</span>
          </div>
          <ImagePickerList
            list={gallery.images}
            onChange={(list) => update({ images: list })}
          />
        </div>
      )}
    </div>
  );
}

function WeddingLiveEditor({ section, onChange }: { section: any; onChange: (value: any) => void }) {
  const mode = section.mode || 'links';
  const links = section.links || [];
  const [urlHelper, setUrlHelper] = useState('');
  
  // Convert regular YouTube/Facebook URLs to embed URLs
  function convertToEmbedUrl(url: string): string {
    if (!url) return url;
    
    // YouTube conversions
    // youtube.com/watch?v=VIDEO_ID -> youtube.com/embed/VIDEO_ID
    const youtubeWatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (youtubeWatch && youtubeWatch[1]) {
      return `https://www.youtube.com/embed/${youtubeWatch[1]}`;
    }
    
    // youtube.com/live/VIDEO_ID -> youtube.com/embed/VIDEO_ID
    const youtubeLive = url.match(/youtube\.com\/live\/([^&\s]+)/);
    if (youtubeLive && youtubeLive[1]) {
      return `https://www.youtube.com/embed/${youtubeLive[1]}`;
    }
    
    // Facebook video URLs - extract video ID
    const fbVideo = url.match(/facebook\.com\/.*\/videos\/(\d+)/);
    if (fbVideo && fbVideo[1]) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`;
    }
    
    return url;
  }
  
  function handleIframeUrlChange(url: string) {
    const embedUrl = convertToEmbedUrl(url);
    onChange({ ...section, iframeUrl: embedUrl });
    
    // Show helper message if URL was converted
    if (embedUrl !== url && embedUrl !== '') {
      setUrlHelper('✅ URL auto-converted to embed format!');
      setTimeout(() => setUrlHelper(''), 3000);
    } else if (url && !url.includes('embed') && !url.includes('plugins')) {
      setUrlHelper('⚠️ Make sure this is an embed URL, not a regular page URL');
    } else {
      setUrlHelper('');
    }
  }
  
  function updateLink(index: number, field: string, value: string) {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...section, links: updated });
  }
  
  function addLink() {
    onChange({ ...section, links: [...links, { label: '', url: '', icon: '🎬' }] });
  }
  
  function removeLink(index: number) {
    const updated = [...links];
    updated.splice(index, 1);
    onChange({ ...section, links: updated });
  }
  
  return (
    <div>
      <div className="text-lg font-semibold">Wedding Live Stream</div>
      
      <input 
        className="border rounded p-2 w-full mt-2" 
        placeholder="Section Heading (e.g., Watch Live)" 
        value={section.heading || ''} 
        onChange={e => onChange({ ...section, heading: e.target.value })} 
      />
      
      <textarea 
        className="border rounded p-2 w-full mt-2" 
        rows={2}
        placeholder="Description (optional)" 
        value={section.description || ''} 
        onChange={e => onChange({ ...section, description: e.target.value })} 
      />
      
      <div className="mt-4">
        <label className="block text-sm font-semibold mb-2">Display Mode</label>
        <select 
          className="border rounded p-2 w-full" 
          value={mode}
          onChange={e => onChange({ ...section, mode: e.target.value })}
        >
          <option value="links">Multiple Links (YouTube, Facebook, Instagram, etc.)</option>
          <option value="iframe">Single Embedded Stream (iframe)</option>
        </select>
      </div>
      
      {mode === 'iframe' ? (
        <div className="mt-4">
          <label className="block text-sm font-semibold mb-2">Iframe Embed URL</label>
          <input 
            className="border rounded p-2 w-full" 
            placeholder="Paste any YouTube/Facebook URL - I'll convert it for you!" 
            value={section.iframeUrl || ''} 
            onChange={e => handleIframeUrlChange(e.target.value)}
            onBlur={e => handleIframeUrlChange(e.target.value)}
          />
          {urlHelper && (
            <p className={`text-xs mt-1 ${urlHelper.includes('✅') ? 'text-green-600' : 'text-amber-600'}`}>
              {urlHelper}
            </p>
          )}
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1">
            <p className="font-semibold text-blue-900">💡 Smart URL Conversion:</p>
            <p className="text-blue-800">• Paste ANY YouTube URL (I'll auto-convert to embed format)</p>
            <p className="text-blue-800">• Works with: youtube.com/watch, youtu.be, youtube.com/live</p>
            <p className="text-blue-800">• Facebook video URLs also supported</p>
          </div>
          <div className="mt-2 space-y-1 text-xs text-gray-600">
            <p><strong>Examples that work:</strong></p>
            <p>• https://youtube.com/watch?v=dQw4w9WgXcQ</p>
            <p>• https://youtu.be/dQw4w9WgXcQ</p>
            <p>• https://youtube.com/live/dQw4w9WgXcQ</p>
            <p>• https://www.youtube.com/embed/dQw4w9WgXcQ (already in embed format)</p>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <label className="block text-sm font-semibold mb-2">Live Stream Links</label>
          <div className="space-y-3">
            {links.map((link: any, index: number) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm">Link {index + 1}</span>
                  <button 
                    className="btn border-red-300 bg-red-50 text-red-600 text-sm" 
                    onClick={() => removeLink(index)}
                  >
                    Delete
                  </button>
                </div>
                <div className="grid md:grid-cols-3 gap-2">
                  <input 
                    className="border rounded p-2" 
                    placeholder="Platform (e.g., YouTube)" 
                    value={link.label || ''} 
                    onChange={e => updateLink(index, 'label', e.target.value)} 
                  />
                  <input 
                    className="border rounded p-2 md:col-span-2" 
                    placeholder="Full URL (any format works - e.g., https://youtube.com/watch?v=...)" 
                    value={link.url || ''} 
                    onChange={e => updateLink(index, 'url', e.target.value)} 
                  />
                </div>
                <div className="mt-2">
                  <label className="block text-xs mb-1">Icon (emoji)</label>
                  <input 
                    className="border rounded p-2 w-20" 
                    placeholder="🎬" 
                    value={link.icon || ''} 
                    onChange={e => updateLink(index, 'icon', e.target.value)} 
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary mt-3" onClick={addLink}>
            + Add Live Stream Link
          </button>
          {links.length === 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Add links to YouTube, Facebook Live, Instagram Live, or any streaming platform
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function HeroImageList({ list, onChange }: { list: HeroImage[]; onChange: (list: HeroImage[]) => void }) {
  const heroImages = normalizeHeroImages(list);
  const [showLibrary, setShowLibrary] = useState(false);
  
  function onDragEnd(e: any) {
    const { active, over } = e;
    if (active?.id !== over?.id) {
      const oldIndex = heroImages.findIndex((_, i) => i.toString() === active.id);
      const newIndex = heroImages.findIndex((_, i) => i.toString() === over.id);
      onChange(arrayMove(heroImages, oldIndex, newIndex));
    }
  }
  const handleLibraryConfirm = useCallback((urls: string[]) => {
    if (!urls.length) {
      setShowLibrary(false);
      return;
    }
    const next = [...(heroImages || [])];
    urls.filter(Boolean).forEach((url) => {
      if (!url) return;
      next.push({ url, focusX: 50, focusY: 50, zoom: 1 });
    });
    onChange(next);
    setShowLibrary(false);
  }, [heroImages, onChange]);

  async function upload(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) {
      alert('Upload failed');
      return;
    }
    const j = await res.json();
    if (!j?.url) {
      alert('Upload failed');
      return;
    }
    onChange([...(heroImages || []), { url: j.url, focusX: 50, focusY: 50, zoom: 1 }]);
  }

  function updateImage(index: number, patch: Partial<HeroImage>) {
    const copy = [...heroImages];
    copy[index] = {
      ...copy[index],
      ...patch,
      focusX: clamp01(patch.focusX, copy[index].focusX),
      focusY: clamp01(patch.focusY, copy[index].focusY)
    };
    onChange(copy);
  }

  function remove(index: number) {
    const copy = [...heroImages];
    copy.splice(index, 1);
    onChange(copy);
  }

  // Helper to show where text will position based on focus
  const getTextPositionLabel = (focusX: number, focusY: number) => {
    // Mobile positioning (vertical only)
    let mobile = '';
    if (focusY < 40) mobile = 'BOTTOM';
    else if (focusY > 60) mobile = 'TOP';
    else mobile = 'BOTTOM';
    
    // Desktop positioning (2D)
    let desktop = '';
    if (focusY < 33) {
      if (focusX < 33) desktop = 'BOTTOM-RIGHT';
      else if (focusX > 66) desktop = 'BOTTOM-LEFT';
      else desktop = 'BOTTOM';
    } else if (focusY > 66) {
      if (focusX < 33) desktop = 'TOP-RIGHT';
      else if (focusX > 66) desktop = 'TOP-LEFT';
      else desktop = 'TOP';
    } else {
      if (focusX < 40) desktop = 'RIGHT';
      else if (focusX > 60) desktop = 'LEFT';
      else desktop = 'BOTTOM';
    }
    
    return { mobile, desktop };
  };

  const getTextPositionColor = (focusX: number, focusY: number) => {
    // Green if text will be well-positioned away from center
    const awayFromCenter = (focusY < 40 || focusY > 60 || focusX < 40 || focusX > 60);
    return awayFromCenter 
      ? 'bg-green-50 text-green-800 border-green-200'
      : 'bg-amber-50 text-amber-800 border-amber-200';
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 sm:p-4 text-sm text-blue-800">
        <p className="font-semibold mb-2 flex items-center gap-2">
          🎯 Smart Text Positioning
          <span className="text-xs font-normal bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full">AI-Powered</span>
        </p>
        <div className="space-y-2 text-xs leading-relaxed">
          <p><span className="font-semibold">📱 Mobile:</span> Text moves <strong>above or below</strong> faces (vertical only)</p>
          <p><span className="font-semibold">💻 Desktop:</span> Text moves to <strong>corners, sides, or edges</strong> (full 2D positioning)</p>
          <p className="text-blue-600 mt-2 pt-2 border-t border-blue-200">Adjust the sliders below to mark where faces are in each photo. The text will intelligently avoid those areas on both mobile and desktop!</p>
          <p className="text-purple-700 font-semibold mt-2 pt-2 border-t border-blue-200">☰ Drag images to reorder them!</p>
        </div>
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={heroImages.map((_, i) => i.toString())} strategy={verticalListSortingStrategy}>
          <div className="flex flex-wrap gap-4">
            {heroImages.map((img, i) => (
            <SortableHeroImage
              key={img.url + i}
              id={i.toString()}
              img={img}
              index={i}
              onUpdate={(patch) => updateImage(i, patch)}
              onRemove={() => remove(i)}
              getTextPositionLabel={getTextPositionLabel}
              getTextPositionColor={getTextPositionColor}
            />
          ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex flex-wrap gap-3">
        <button className="btn" type="button" onClick={() => setShowLibrary(true)}>
          Choose from library
        </button>
        <label className="btn cursor-pointer" htmlFor="hero-upload-input">
          Upload new image
        </label>
        <input
          id="hero-upload-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = '';
          }}
        />
      </div>
      {showLibrary && (
        <MediaLibrary
          mode="multiple"
          onClose={() => setShowLibrary(false)}
          onConfirm={handleLibraryConfirm}
        />
      )}
    </div>
  );
}

function SortableHeroImage({ id, img, index, onUpdate, onRemove, getTextPositionLabel, getTextPositionColor }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg p-3 bg-white/80 w-full md:w-64">
      <div className="flex items-center justify-between mb-2">
        <div {...attributes} {...listeners} className="cursor-move p-2 hover:bg-gray-100 rounded" title="Drag to reorder">
          ☰
        </div>
        <span className="text-xs font-semibold text-gray-600">Image #{index + 1}</span>
      </div>
      <div className="relative w-full h-36 overflow-hidden rounded-lg border bg-gray-900">
        <img
          src={img.url}
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            objectPosition: `${img.focusX}% ${img.focusY}%`,
            transform: `scale(${img.zoom})`
          }}
        />
        {/* Focus point indicator */}
        <div 
          className="absolute w-6 h-6 rounded-full border-4 border-red-500 bg-red-500/30 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
          style={{ left: `${img.focusX}%`, top: `${img.focusY}%` }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-white animate-ping" />
        </div>
        {/* Text position preview - Desktop */}
        <div className="hidden sm:block absolute inset-0 pointer-events-none">
          {(() => {
            const { desktop } = getTextPositionLabel(img.focusX, img.focusY);
            const positionClass = desktop.includes('TOP') ? 'top-2' : desktop.includes('BOTTOM') ? 'bottom-2' : 'top-1/2 -translate-y-1/2';
            const horizontalClass = desktop.includes('LEFT') ? 'left-2' : desktop.includes('RIGHT') ? 'right-2' : 'left-1/2 -translate-x-1/2';
            return (
              <div className={`absolute ${positionClass} ${horizontalClass} bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[8px] font-bold text-gray-700 shadow-lg border border-gray-300 transform`}>
                💻 TEXT
              </div>
            );
          })()}
        </div>
        {/* Text position preview - Mobile */}
        <div className="sm:hidden absolute inset-0 pointer-events-none">
          {(() => {
            const { mobile } = getTextPositionLabel(img.focusX, img.focusY);
            const positionClass = mobile === 'TOP' ? 'top-2' : 'bottom-2';
            return (
              <div className={`absolute ${positionClass} left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[8px] font-bold text-gray-700 shadow-lg border border-gray-300`}>
                📱 TEXT
              </div>
            );
          })()}
        </div>
      </div>
      {/* Position indicator */}
      <div className={`mt-2 px-2 py-1.5 rounded-lg text-[11px] font-semibold border ${getTextPositionColor(img.focusX, img.focusY)}`}>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1">
            <span className="text-[9px] opacity-60">📱</span>
            {getTextPositionLabel(img.focusX, img.focusY).mobile}
          </span>
          <span className="w-px h-3 bg-current opacity-20" />
          <span className="flex items-center gap-1">
            <span className="text-[9px] opacity-60">💻</span>
            {getTextPositionLabel(img.focusX, img.focusY).desktop}
          </span>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div>
          <label className="text-xs font-semibold block text-gray-700">
            ↔️ Horizontal Focus ({Math.round(img.focusX)}%)
            <span className="text-[10px] font-normal ml-1 text-gray-500">• Where are faces horizontally?</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={img.focusX}
            onChange={(e) => onUpdate({ focusX: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
            <span>Left</span>
            <span>Center</span>
            <span>Right</span>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold block text-gray-700">
            ↕️ Vertical Focus ({Math.round(img.focusY)}%)
            <span className="text-[10px] font-normal ml-1 text-gray-500">• Where are faces vertically?</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={img.focusY}
            onChange={(e) => onUpdate({ focusY: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
            <span>Top</span>
            <span>Middle</span>
            <span>Bottom</span>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold block text-gray-700">
            🔍 Zoom ({(img.zoom * 100).toFixed(0)}%)
            <span className="text-[10px] font-normal ml-1 text-gray-500">• Zoom in or out</span>
          </label>
          <input
            type="range"
            min={50}
            max={300}
            step={5}
            value={img.zoom * 100}
            onChange={(e) => onUpdate({ zoom: Number(e.target.value) / 100 })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
            <span>50% (Zoom Out)</span>
            <span>100%</span>
            <span>300% (Zoom In)</span>
          </div>
        </div>
        <input
          className="border rounded p-2 w-full text-sm"
          value={img.url}
          onChange={(e) => onUpdate({ url: e.target.value })}
          placeholder="Image URL"
        />
        <button className="btn w-full" onClick={onRemove}>
          Remove
        </button>
      </div>
    </div>
  );
}

type MediaLibraryProps = {
  mode?: 'single' | 'multiple';
  onConfirm: (urls: string[]) => void;
  onClose: () => void;
};

type ImmichAssetItem = {
  id: string;
  originalUrl: string;
  thumbUrl: string;
  fullUrl?: string;
};

function MediaLibrary({ mode = 'single', onConfirm, onClose }: MediaLibraryProps) {
  const { images, setImages, addImage } = useImageLibrary();
  const [activeSource, setActiveSource] = useState<'local' | 'immich'>('local');
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [localLoading, setLocalLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [immichStatus, setImmichStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [immichConfigured, setImmichConfigured] = useState(true);
  const [immichError, setImmichError] = useState<string | null>(null);
  const [immichAlbums, setImmichAlbums] = useState<ImmichAlbumSummary[]>([]);
  const [currentAlbum, setCurrentAlbum] = useState<ImmichAlbumSummary | null>(null);
  const [albumAssets, setAlbumAssets] = useState<ImmichAssetItem[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadLocalImages = useCallback(async () => {
    setLocalLoading(true);
    try {
      const res = await fetch('/api/images');
      const data = await res.json();
      setImages(Array.isArray(data.urls) ? data.urls : []);
    } catch (error) {
      console.error('Failed to load images', error);
    } finally {
      setLocalLoading(false);
    }
  }, [setImages]);

  const loadImmichAlbums = useCallback(async () => {
    setImmichStatus('loading');
    setImmichError(null);
    try {
      const res = await fetch('/api/immich/albums');
      const data = await res.json();
      setImmichConfigured(Boolean(data.configured));
      if (!res.ok) {
        setImmichError(data.error || 'Unable to load Immich albums');
        setImmichStatus('error');
        return;
      }
      setImmichAlbums(Array.isArray(data.albums) ? data.albums : []);
      setImmichStatus('ready');
    } catch (error) {
      setImmichError((error as Error).message);
      setImmichStatus('error');
    }
  }, []);

  const loadAlbumAssets = useCallback(async (album: ImmichAlbumSummary) => {
    setCurrentAlbum(album);
    setAssetsLoading(true);
    setImmichError(null);
    try {
      const res = await fetch(`/api/immich/albums/${album.id}/assets?take=240`);
      const data = await res.json();
      if (!res.ok) {
        setImmichError(data.error || 'Unable to load album photos');
        setAlbumAssets([]);
        return;
      }
      setAlbumAssets(Array.isArray(data.assets) ? data.assets : []);
    } catch (error) {
      setImmichError((error as Error).message);
      setAlbumAssets([]);
    } finally {
      setAssetsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocalImages().catch(() => {});
  }, [loadLocalImages]);

  useEffect(() => {
    if (activeSource === 'immich' && immichStatus === 'idle') {
      loadImmichAlbums().catch(() => {});
    }
  }, [activeSource, immichStatus, loadImmichAlbums]);

  const handleUpload = useCallback((file: File) => {
    setUploading(true);
    setUploadProgress(0);

    const fd = new FormData();
    fd.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress((event.loaded / event.total) * 100);
      }
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        setUploading(false);
        if (xhr.status === 200) {
          try {
            const res = JSON.parse(xhr.responseText);
            if (res?.url) {
              addImage(res.url);
              if (mode === 'single') {
                onConfirm([res.url]);
                onClose();
              } else {
                setSelection((prev) => {
                  const next = new Set(prev);
                  next.add(res.url);
                  return next;
                });
              }
            }
          } catch (error) {
            console.error('Failed to parse upload response', error);
          }
        } else {
          alert('Upload failed');
        }
      }
    };

    xhr.send(fd);
  }, [addImage, mode, onClose, onConfirm]);

  const handleDeleteLocal = useCallback(async (url: string) => {
    if (!confirm('Delete this image from the library?')) return;
    const filename = url.split('/').pop();
    if (!filename) return;
    try {
      const res = await fetch(`/api/images/${filename}`, { method: 'DELETE' });
      if (!res.ok) {
        alert('Delete failed');
        return;
      }
      setImages(images.filter((img) => img !== url));
      setSelection((prev) => {
        if (!prev.has(url)) return prev;
        const next = new Set(prev);
        next.delete(url);
        return next;
      });
    } catch (error) {
      console.error('Failed to delete image', error);
    }
  }, [images, setImages]);

  const toggleSelection = useCallback((url: string) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (mode === 'single') {
        next.clear();
        next.add(url);
      } else {
        if (next.has(url)) {
          next.delete(url);
        } else {
          next.add(url);
        }
      }
      return next;
    });
  }, [mode]);

  const handleItemClick = useCallback((url: string) => {
    if (mode === 'single') {
      onConfirm([url]);
      onClose();
      return;
    }
    toggleSelection(url);
  }, [mode, onClose, onConfirm, toggleSelection]);

  const handleConfirm = useCallback(() => {
    const urls = Array.from(selection);
    if (mode === 'multiple' && urls.length === 0) {
      onClose();
      return;
    }
    if (mode === 'single' && urls.length === 0) {
      onClose();
      return;
    }
    onConfirm(urls);
    onClose();
  }, [mode, onClose, onConfirm, selection]);

  const resetImmichView = useCallback(() => {
    setCurrentAlbum(null);
    setAlbumAssets([]);
  }, []);

  const isSelected = useCallback((url: string) => selection.has(url), [selection]);

  const renderLocalGrid = () => {
    if (localLoading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="animate-pulse h-36 rounded-2xl bg-white/30" />
          ))}
        </div>
      );
    }

    if (!images.length) {
      return <p className="text-sm text-slate-700">No uploads yet. Use the upload button to add your first photo.</p>;
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((url) => {
          const selected = isSelected(url);
          return (
            <div
              key={url}
              className={`group relative overflow-hidden rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-xl ${
                selected ? 'border-primary ring-2 ring-primary/60' : 'border-white/20'
              }`}
            >
              <img
                src={url}
                alt=""
                className="h-36 w-full object-cover cursor-pointer"
                onClick={() => handleItemClick(url)}
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="truncate" title={url}>{url.split('/').pop()}</span>
                <button
                  type="button"
                  className="rounded-full bg-white/20 px-2 py-1 backdrop-blur hover:bg-white/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLocal(url);
                  }}
                >
                  Delete
                </button>
              </div>
              {selected && (
                <div className="absolute inset-0 bg-primary/30 pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderImmichContent = () => {
    if (!immichConfigured) {
      return (
        <div className="text-sm text-slate-700">
          Set <code className="bg-slate-200 px-1 rounded">IMMICH_BASE_URL</code> and <code className="bg-slate-200 px-1 rounded">IMMICH_API_KEY</code> in your environment to browse Immich albums.
        </div>
      );
    }

    if (immichStatus === 'loading') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-2xl bg-white/30" />
          ))}
        </div>
      );
    }

    if (immichStatus === 'error') {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700">
          {immichError || 'Immich albums could not be loaded.'}
        </div>
      );
    }

    if (!currentAlbum) {
      if (!immichAlbums.length) {
        return <p className="text-sm text-slate-700">No shared albums found yet.</p>;
      }

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {immichAlbums.map((album) => (
            <button
              key={album.id}
              type="button"
              className="group rounded-3xl border border-white/20 bg-white/30 p-4 text-left transition hover:-translate-y-1 hover:border-primary hover:shadow-lg"
              onClick={() => loadAlbumAssets(album)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">{album.name}</h3>
                <span className="rounded-full bg-white/40 px-2 py-1 text-xs text-slate-800">{album.assetCount} photos</span>
              </div>
              {album.description && (
                <p className="mt-2 text-sm text-slate-700 line-clamp-2">{album.description}</p>
              )}
              <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-slate-600">
                Key {album.id.slice(0, 8)} • {album.albumId ? `Album ${album.albumId.slice(0, 8)}` : 'Shared'}
              </p>
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-sm text-slate-900 underline-offset-4 hover:underline"
            onClick={resetImmichView}
          >
            ← Back to albums
          </button>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-600">
            {currentAlbum.assetCount} photos
          </span>
        </div>
        {assetsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-2xl bg-white/30" />
            ))}
          </div>
        ) : albumAssets.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albumAssets.map((asset) => {
              // Use thumbUrl for display since it's browser-compatible (JPEG/WebP)
              // originalUrl might be HEIC or other formats not supported by browsers
              const displayUrl = asset.thumbUrl || asset.originalUrl;
              const selected = isSelected(displayUrl);
              return (
                <div
                  key={asset.id}
                  className={`group relative overflow-hidden rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-xl ${
                    selected ? 'border-primary ring-2 ring-primary/60' : 'border-white/20'
                  }`}
                >
                  <img
                    src={displayUrl}
                    alt=""
                    className="h-36 w-full object-cover cursor-pointer"
                    onClick={() => handleItemClick(displayUrl)}
                  />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                  {selected && <div className="absolute inset-0 bg-primary/30 pointer-events-none" />}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-700">No photos in this album yet.</p>
        )}
      </div>
    );
  };

  const showConfirmBar = mode === 'multiple';
  const selectedCount = selection.size;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-6xl h-[95vh] sm:h-[85vh] glass-panel overflow-hidden rounded-t-3xl sm:rounded-3xl">
        <button
          type="button"
          aria-label="Close media library"
          className="absolute right-3 sm:right-5 top-3 sm:top-5 z-10 rounded-full bg-white/90 px-4 py-2 sm:px-3 sm:py-1 text-sm font-medium text-slate-900 hover:bg-white shadow-lg min-h-[44px] touch-manipulation"
          onClick={onClose}
        >
          Close ✕
        </button>

        <div className="flex flex-col sm:flex-row h-full">
          <aside className="w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-white/20 bg-white/10 backdrop-blur-xl px-4 py-4 sm:py-6 flex-shrink-0">
            <h2 className="text-base sm:text-lg font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-900">Sources</h2>
            <div className="mt-3 sm:mt-4 flex sm:flex-col gap-2">
              <button
                type="button"
                className={`flex-1 sm:w-full rounded-xl sm:rounded-2xl px-4 py-3 text-left text-sm font-medium transition min-h-[44px] touch-manipulation ${
                  activeSource === 'local'
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'bg-white/5 text-slate-900 hover:bg-white/10'
                }`}
                onClick={() => {
                  setActiveSource('local');
                  resetImmichView();
                }}
              >
                Local uploads
              </button>
              <button
                type="button"
                className={`flex-1 sm:w-full rounded-xl sm:rounded-2xl px-4 py-3 text-left text-sm font-medium transition min-h-[44px] touch-manipulation ${
                  activeSource === 'immich'
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'bg-white/5 text-slate-900 hover:bg-white/10'
                }`}
                onClick={() => setActiveSource('immich')}
              >
                Immich shared albums
              </button>
            </div>

            {activeSource === 'immich' && (
              <div className="mt-6 space-y-3 text-xs text-slate-700">
                <p className="uppercase tracking-[0.3em] text-[11px] text-slate-600">Status</p>
                <p>
                  {immichStatus === 'loading' && 'Loading albums…'}
                  {immichStatus === 'ready' && `${immichAlbums.length} albums connected`}
                  {immichStatus === 'error' && 'Unable to load albums'}
                  {immichStatus === 'idle' && 'Ready'}
                </p>
                <button
                  type="button"
                  className="rounded-full border border-slate-400 px-3 py-1 text-xs font-medium text-slate-800 hover:bg-white/10"
                  onClick={() => {
                    resetImmichView();
                    loadImmichAlbums().catch(() => {});
                  }}
                  disabled={immichStatus === 'loading'}
                >
                  Refresh albums
                </button>
              </div>
            )}
          </aside>

          <div className="flex flex-1 flex-col bg-white/20 backdrop-blur-xl min-h-0">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/20 px-4 sm:px-6 py-3 sm:py-4 gap-3 sm:gap-0 flex-shrink-0">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900/90 truncate">{activeSource === 'local' ? 'Local uploads' : currentAlbum ? currentAlbum.name : 'Immich albums'}</h3>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-700/60">
                  {activeSource === 'local'
                    ? `${images.length} images available`
                    : currentAlbum
                      ? `${albumAssets.length} loaded • ${currentAlbum.assetCount} total`
                      : `${immichAlbums.length} albums connected`}
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                {activeSource === 'local' && (
                  <>
                    <button
                      type="button"
                      className="rounded-full border border-slate-800/20 bg-white px-4 sm:px-5 py-2.5 sm:py-2 text-sm font-medium shadow-sm hover:-translate-y-0.5 hover:shadow-lg min-h-[44px] touch-manipulation flex-1 sm:flex-initial"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? `${uploadProgress.toFixed(0)}%` : 'Upload'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file);
                        e.target.value = '';
                      }}
                    />
                  </>
                )}
                {showConfirmBar && (
                  <button
                    type="button"
                    className="rounded-full bg-slate-900 px-5 sm:px-6 py-2.5 sm:py-2 text-sm font-semibold text-white shadow-lg transition disabled:opacity-50 min-h-[44px] touch-manipulation flex-1 sm:flex-initial"
                    onClick={handleConfirm}
                    disabled={!selectedCount}
                  >
                    Add {selectedCount ? `${selectedCount}` : '0'}
                  </button>
                )}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 min-h-0">
              {activeSource === 'local' ? renderLocalGrid() : renderImmichContent()}
            </div>
          </div>
        </div>

        {!showConfirmBar && mode === 'single' && (
          <div className="absolute inset-x-0 bottom-0 bg-white/60 px-6 py-3 text-center text-xs text-slate-700">
            Tip: Tap an image to insert it immediately.
          </div>
        )}
      </div>
    </div>
  );
}
