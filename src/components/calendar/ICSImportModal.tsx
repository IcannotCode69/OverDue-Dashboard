import * as React from 'react';
import { Upload, X } from 'lucide-react';
// import JSZip from 'jszip';
import JSZip, { JSZipObject } from 'jszip';
import { parseICS, type IcsEvent } from '../../features/calendar/ics';

type Props = {
  open: boolean;
  onClose: () => void;
  onImport: (items: IcsEvent[]) => void;
};

const MAX = 5 * 1024 * 1024; // 5MB

export default function ICSImportModal({ open, onClose, onImport }: Props) {
  const [err, setErr] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => { if (open) setErr(null); }, [open]);
  if (!open) return null;

  async function handleFile(f: File) {
    setErr(null);
    if (f.size > MAX) { setErr('File too large (max 5MB).'); return; }
    const name = f.name.toLowerCase();
    const isZip = name.endsWith('.zip');

    try {
      if (isZip) {
        const zip = await JSZip.loadAsync(f);
        const entries = Object.values(zip.files).filter(
          (entry) => !entry.dir && entry.name.toLowerCase().endsWith('.ics')
        );

        if (!entries.length) {
          setErr("Couldn't find any .ics files in this zip.");
          return;
        }

        let allItems: IcsEvent[] = [];
        for (const entry of entries) {
          const text = await entry.async('text');
          const items = parseICS(text);
          if (items.length) {
            allItems = allItems.concat(items);
          }
        }

        if (!allItems.length) {
          setErr("Couldn't find any events in the .ics files.");
          return;
        }

        onImport(allItems);
        onClose();
      } else {
        if (!/\.ics$/i.test(f.name) && !/text\/calendar/.test(f.type)) {
          setErr('Please select a .ics file.');
          return;
        }
        const text = await f.text();
        const items = parseICS(text);
        if (!items.length) { setErr("Couldn't find any events in this file."); return; }
        onImport(items);
        onClose();
      }
    } catch (e) {
      console.error(e);
      setErr('Failed to parse this file.');
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="cal-dialog-overlay" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div className="cal-dialog-content" role="dialog" aria-modal="true" aria-label="Import .ics">
        <div className="cal-dialog-header">
          <h2 className="cal-dialog-title">Import .ics</h2>
          <button className="cal-dialog-close" aria-label="Close" onClick={onClose}><X size={16}/></button>
        </div>
        <div className="cal-dialog-form">
          <div>
            <label className="cal-label" htmlFor="icsfile">Choose .ics file</label>
            <input id="icsfile" ref={inputRef} type="file" accept=".ics,text/calendar,.zip,application/zip" className="cal-input" onChange={onChange} />
            <div className="ics-inline">Google Calendar (.ics or .zip with multiple .ics files) and Brightspace exports supported. Max 5MB.</div>
            <div className="ics-inline">Tip: Export your Google Calendar, upload the .zip here, and we&apos;ll import all calendars inside.</div>
            {err && <div className="ics-error" role="alert">{err}</div>}
          </div>
          <div className="cal-dialog-footer">
            <button className="cal-btn cal-btn-ghost" type="button" onClick={() => { inputRef.current && (inputRef.current.value = ''); setErr(null); }}>Reset</button>
            <button className="cal-btn cal-btn-primary" type="button" onClick={() => inputRef.current?.click()}><Upload size={14}/> Select File</button>
          </div>
        </div>
      </div>
    </div>
  );
}
