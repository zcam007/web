'use client';
import { useEffect, useState } from 'react';
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

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [cfg, setCfg] = useState<any>(null);
  const [pwdInput, setPwdInput] = useState('');
  const [adminPass, setAdminPass] = useState<string | null>(null);

  async function loadConfig(pass: string) {
    const r = await fetch('/api/config', { headers: { 'x-admin-pass': pass } });
    if (!r.ok) throw new Error('Unauthorized');
    const j = await r.json();
    setCfg(j);
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

  async function save() {
    if (!adminPass) return alert('Not authorized');
    const r = await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-pass': adminPass },
      body: JSON.stringify(cfg),
    });
    if (!r.ok) return alert('Save failed');
    alert('Saved');
  }

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
      <div className="container py-20">
        <div className="max-w-md mx-auto card space-y-4">
          <h1 className="section-title">Admin Login</h1>
          <input
            type="password"
            className="w-full border rounded-lg px-4 py-3"
            placeholder="Admin password"
            value={pwdInput}
            onChange={e => setPwdInput(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleLogin}>Enter</button>
        </div>
      </div>
    );
  }

  if (!cfg) return <div className="container py-20">Loading…</div>;

  return (
    <div className="container py-10">
      <h1 className="section-title">Page Builder</h1>
      <p className="subtext">Drag to reorder sections. Click to edit text or replace images.</p>

      <div className="card mt-6">
        <h2 className="text-xl font-semibold">Hero</h2>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <input className="border rounded p-2" value={cfg.hero.title} onChange={e=>setCfg({...cfg, hero: {...cfg.hero, title: e.target.value}})} />
          <input className="border rounded p-2" value={cfg.hero.subtitle} onChange={e=>setCfg({...cfg, hero: {...cfg.hero, subtitle: e.target.value}})} />
          <input className="border rounded p-2" value={cfg.hero.date} onChange={e=>setCfg({...cfg, hero: {...cfg.hero, date: e.target.value}})} />
          <input className="border rounded p-2" value={cfg.hero.ctaText} onChange={e=>setCfg({...cfg, hero: {...cfg.hero, ctaText: e.target.value}})} />
          <input className="border rounded p-2" value={cfg.hero.ctaHref} onChange={e=>setCfg({...cfg, hero: {...cfg.hero, ctaHref: e.target.value}})} />
        </div>
        <div className="mt-3">
          <label className="block text-sm">Hero Images</label>
          <ImagePickerList list={cfg.hero.images} onChange={(list:any)=>setCfg({...cfg, hero: {...cfg.hero, images: list}})} />
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-8">Sections</h2>
      <p className="text-sm opacity-70 mb-3">Drag handle (☰) to reorder • Toggle visibility • Edit content</p>
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={cfg.sections.map((_:any, i:number)=>i.toString())} strategy={verticalListSortingStrategy}>
          {cfg.sections.map((sec: any, i: number) => (
            <SortableItem id={i.toString()} key={i}>
              <SectionEditor section={sec} onChange={(s: any)=>{
                const copy = [...cfg.sections]; copy[i] = s; setCfg({...cfg, sections: copy});
              }} />
              <div className="flex gap-2 mt-3">
                <button 
                  className={`flex-1 px-4 py-2 rounded-lg border transition-all ${sec.visible !== false ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
                  onClick={()=>{
                    const copy = [...cfg.sections]; 
                    copy[i] = {...copy[i], visible: copy[i].visible === false ? true : false}; 
                    setCfg({...cfg, sections: copy});
                  }}
                  title={sec.visible !== false ? 'Click to hide' : 'Click to show'}
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

      <div className="mt-6 flex gap-3">
        <button className="btn btn-primary" onClick={save}>Save</button>
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
          <label className="block text-sm">Couple Image</label>
          <ImagePicker value={section.image} onChange={(v:string)=>onChange({...section, image: v})} />
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
    return (
      <div>
        <div className="text-lg font-semibold">Gallery</div>
        <input className="border rounded p-2 w-full mt-2" value={section.heading} onChange={e=>onChange({...section, heading: e.target.value})} />
        <ImagePickerList list={section.images||[]} onChange={(list:any)=>onChange({...section, images: list})} />
      </div>
    );
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
          <label className="block text-sm">Background Image</label>
          <ImagePicker value={section.image} onChange={(v:string)=>onChange({...section, image: v})} />
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
          <label className="block text-sm">Bride Image (Circular)</label>
          <ImagePicker value={section.brideImage} onChange={(v:string)=>onChange({...section, brideImage: v})} />
        </div>
        <div className="mt-3">
          <label className="block text-sm">Groom Image (Circular)</label>
          <ImagePicker value={section.groomImage} onChange={(v:string)=>onChange({...section, groomImage: v})} />
        </div>
        <textarea className="border rounded p-2 w-full mt-3" rows={2} placeholder="Message (optional)" value={section.message||''} onChange={e=>onChange({...section, message: e.target.value})} />
        <input className="border rounded p-2 w-full mt-2" placeholder="Date (e.g., 26th November 2025)" value={section.date||''} onChange={e=>onChange({...section, date: e.target.value})} />
      </div>
    );
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
    onChange([...(list||[]), {name:'', time:'', place:'', description:'', image:''}]); 
  }
  
  function rm(i:number) { 
    const c=[...list]; c.splice(i,1); onChange(c); 
  }
  
  function upd(i:number, key:string, val:string) { 
    const c=[...list]; c[i] = {...c[i], [key]: val}; onChange(c); 
  }
  
  return (
    <div className="space-y-4 mt-3">
      {(list||[]).map((it:any, i:number)=> (
        <div key={i} className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold">Event {i+1}</span>
            <button className="btn border-red-300 bg-red-50 text-red-600" onClick={()=>rm(i)}>Delete</button>
          </div>
          <div className="space-y-3">
            <input 
              className="border rounded p-2 w-full" 
              placeholder="Event Name" 
              value={it.name||''} 
              onChange={e=>upd(i, 'name', e.target.value)} 
            />
            <div className="grid md:grid-cols-2 gap-3">
              <input 
                className="border rounded p-2" 
                placeholder="Time" 
                value={it.time||''} 
                onChange={e=>upd(i, 'time', e.target.value)} 
              />
              <input 
                className="border rounded p-2" 
                placeholder="Place" 
                value={it.place||''} 
                onChange={e=>upd(i, 'place', e.target.value)} 
              />
            </div>
            <textarea 
              className="border rounded p-2 w-full" 
              placeholder="Description" 
              rows={2}
              value={it.description||''} 
              onChange={e=>upd(i, 'description', e.target.value)} 
            />
            <div>
              <label className="block text-sm mb-1">Event Image</label>
              <ImagePicker value={it.image} onChange={(v:string)=>upd(i, 'image', v)} />
            </div>
          </div>
        </div>
      ))}
      <button className="btn btn-primary" onClick={add}>Add Event</button>
    </div>
  );
}

function ImagePicker({ value, onChange }: { value: string, onChange: (url: string) => void }) {
  const [showLibrary, setShowLibrary] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-3">
        {value && <img src={value} alt="" className="w-24 h-24 object-cover rounded-lg border" />}
        <button className="btn" onClick={() => setShowLibrary(true)}>Choose Image</button>
      </div>
      {showLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-3/4 h-3/4 overflow-y-auto">
            <ImageLibrary onSelect={(url) => {
              onChange(url);
              setShowLibrary(false);
            }} />
            <button className="btn mt-4" onClick={() => setShowLibrary(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ImagePickerList({ list, onChange }: { list: string[], onChange: (urls: string[]) => void }) {
  const [showLibrary, setShowLibrary] = useState(false);

  function onSelect(url: string) {
    onChange([...(list||[]), url]);
    setShowLibrary(false);
  }

  function rm(i:number) {
    const copy = [...(list||[])]; copy.splice(i,1); onChange(copy);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mt-2">
        {(list||[]).map((src:string, i:number)=>(
          <div key={i} className="relative">
            <img src={src} alt="" className="w-28 h-28 object-cover rounded-lg border" />
            <button className="btn absolute top-1 right-1 text-xs" onClick={()=>rm(i)}>✕</button>
          </div>
        ))}
      </div>
      <button className="btn mt-2" onClick={() => setShowLibrary(true)}>Add Image</button>
      {showLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-3/4 h-3/4 overflow-y-auto">
            <ImageLibrary onSelect={onSelect} />
            <button className="btn mt-4" onClick={() => setShowLibrary(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ImageLibrary({ onSelect }: { onSelect: (url: string) => void }) {
  const { images, setImages, addImage } = useImageLibrary();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function fetchImages() {
      const res = await fetch('/api/images');
      const data = await res.json();
      setImages(data.urls);
    }
    fetchImages();
  }, [setImages]);

  async function handleUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        addImage(res.url);
      } else {
        alert('Upload failed');
      }
    };

    xhr.send(fd);
  }

  async function handleDelete(url: string) {
    if (confirm('Are you sure you want to delete this image?')) {
      const filename = url.split('/').pop();
      const res = await fetch(`/api/images/${filename}`, { method: 'DELETE' });
      if (res.ok) {
        setImages(images.filter(i => i !== url));
      } else {
        alert('Delete failed');
      }
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Image Library</h2>
      <div className="grid grid-cols-4 gap-4">
        {images.map((url) => (
          <div key={url} className="relative">
            <img src={url} alt="" className="w-full h-32 object-cover rounded-lg cursor-pointer" onClick={() => onSelect(url)} />
            <button className="btn absolute top-1 right-1 text-xs" onClick={() => handleDelete(url)}>✕</button>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Upload New Image</h3>
        <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>
    </div>
  );
}
