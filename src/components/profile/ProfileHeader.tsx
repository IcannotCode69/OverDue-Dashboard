import * as React from 'react';
import Dropzone from 'react-dropzone';
import AvatarEditor from 'react-avatar-editor';
import { Camera, Trash2 } from 'lucide-react';

type Props = {
  displayName: string;
  handle: string;
  role?: string;
  avatarUrl?: string;
  coverUrl?: string;
  onChangeAvatar: (dataUrl: string | undefined) => void;
  onChangeCover: (dataUrl: string | undefined) => void;
};

const ACCEPT = { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] } as const;

export default function ProfileHeader({ displayName, handle, role = 'Student', avatarUrl, coverUrl, onChangeAvatar, onChangeCover }: Props) {
  const [cropOpen, setCropOpen] = React.useState<'avatar' | 'cover' | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [scale, setScale] = React.useState(1.2);
  const editorRef = React.useRef<AvatarEditor | null>(null);
  const maxSize = 5 * 1024 * 1024;

  function onDrop(selected: File[]) {
    const f = selected?.[0];
    if (!f) return;
    if (f.size > maxSize) { alert('Image too large (max 5MB)'); return; }
    setFile(f);
  }

  function confirmCrop() {
    if (!editorRef.current) return;
    const canvas = editorRef.current.getImageScaledToCanvas();
    const data = canvas.toDataURL('image/png');
    if (cropOpen === 'avatar') onChangeAvatar(data);
    if (cropOpen === 'cover') onChangeCover(data);
    setCropOpen(null); setFile(null); setScale(1.2);
  }

  function discardCrop() {
    setCropOpen(null); setFile(null); setScale(1.2);
  }

  return (
    <div className="pf-card">
      <div className="pf-card-body" style={{ padding: 0 }}>
        <div className="pf-cover">
          {coverUrl ? <img src={coverUrl} alt="Cover" /> : null}
          <div className="pf-cover-actions">
            <button className="pf-btn pf-btn-ghost" onClick={() => setCropOpen('cover')} aria-label="Change cover">
              <Camera size={16}/> Change
            </button>
            {coverUrl && (
              <button className="pf-btn pf-btn-danger" onClick={() => onChangeCover(undefined)} aria-label="Remove cover">
                <Trash2 size={16}/> Remove
              </button>
            )}
          </div>
          <div className="pf-avatar" aria-label="Profile avatar">
            {avatarUrl ? <img src={avatarUrl} alt="Avatar" /> : <Camera aria-hidden size={20}/>}            
          </div>
        </div>

        <div className="pf-card-body">
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="pf-btn pf-btn-ghost" onClick={() => setCropOpen('avatar')} aria-label="Change avatar"><Camera size={16}/> Change Avatar</button>
            {avatarUrl && <button className="pf-btn pf-btn-danger" onClick={() => onChangeAvatar(undefined)} aria-label="Remove avatar"><Trash2 size={16}/> Remove</button>}
          </div>
          <div className="pf-profile-id">
            <div className="pf-name">{displayName}</div>
            <div className="pf-role">{role} • {handle}</div>
          </div>
        </div>
      </div>

      {cropOpen && (
        <div className="pf-modal" role="dialog" aria-modal="true" aria-label="Image crop">
          <div className="pf-modal-card">
            <Dropzone multiple={false} onDrop={onDrop} accept={ACCEPT} maxSize={maxSize}>
              {({ getRootProps, getInputProps, isDragActive }) => (
                <div {...getRootProps()} style={{ border: '1px dashed rgba(255,255,255,.25)', padding: 12, borderRadius: 12, textAlign: 'center', marginBottom: 12 }}>
                  <input {...getInputProps()} />
                  {isDragActive ? 'Drop image here…' : (file ? file.name : 'Drag & drop or click to select an image')}
                </div>
              )}
            </Dropzone>
            {file && (
              <div style={{ display:'grid', placeItems:'center', gap: 10 }}>
                <AvatarEditor
                  ref={editorRef}
                  image={file}
                  width={cropOpen === 'avatar' ? 220 : 480}
                  height={cropOpen === 'avatar' ? 220 : 270}
                  border={20}
                  borderRadius={cropOpen === 'avatar' ? 999 : 12}
                  color={[0, 0, 0, 0.25]}
                  scale={scale}
                />
                <label className="pf-label" htmlFor="zoom">Zoom</label>
                <input id="zoom" type="range" min={1} max={3} step={0.01} value={scale} onChange={(e) => setScale(Number(e.target.value))} />
              </div>
            )}
            <div className="pf-modal-actions">
              <button className="pf-btn pf-btn-ghost" onClick={discardCrop}>Cancel</button>
              <button className="pf-btn pf-btn-primary" onClick={confirmCrop} disabled={!file}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
