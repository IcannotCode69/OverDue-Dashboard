import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordSchema } from '../../features/profile/types';
import type { SecurityState } from '../../features/profile/types';
import { loadSecurity, saveSecurity } from '../../features/profile/mockApi';
import { Shield, Smartphone, Copy } from 'lucide-react';

export default function SecurityPanel() {
  const [state, setState] = React.useState<SecurityState | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  React.useEffect(() => { loadSecurity().then(setState); }, []);

  const form = useForm<{ current: string; next: string; confirm: string }>({ resolver: zodResolver(passwordSchema), defaultValues: { current: '', next: '', confirm: '' } });

  async function onPassword(values: { current: string; next: string; confirm: string }) {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setMsg('Password changed');
    form.reset();
    setTimeout(() => setMsg(null), 1800);
  }

  async function toggle2FA() {
    if (!state) return;
    const next = { ...state, has2FA: !state.has2FA };
    await saveSecurity(next);
    setState(next);
  }

  function generateRecovery() {
    if (!state) return;
    const codes = Array.from({ length: 8 }).map(() => Math.random().toString(36).slice(2, 10).toUpperCase());
    const next = { ...state, recoveryCodes: codes };
    saveSecurity(next).then(() => setState(next));
  }

  function copyCodes() {
    if (!state?.recoveryCodes?.length) return;
    navigator.clipboard.writeText(state.recoveryCodes.join('\n'));
    setMsg('Recovery codes copied');
    setTimeout(() => setMsg(null), 1600);
  }

  function revoke(id: string) {
    if (!state) return;
    const next = { ...state, sessions: state.sessions.filter((s) => s.id !== id) };
    saveSecurity(next).then(() => setState(next));
  }

  return (
    <div className="pf-card" aria-label="Security">
      <div className="pf-card-body">
        <div className="pf-card-title"><Shield size={16}/> Security</div>

        <form onSubmit={form.handleSubmit(onPassword)} style={{ display:'grid', gap:12 }}>
          <div className="pf-row">
            <div>
              <label className="pf-label" htmlFor="current">Current password</label>
              <input id="current" type="password" className="pf-input" {...form.register('current')} />
              {form.formState.errors.current && <div className="pf-error">{form.formState.errors.current.message}</div>}
            </div>
            <div>
              <label className="pf-label" htmlFor="next">New password</label>
              <input id="next" type="password" className="pf-input" {...form.register('next')} />
              {form.formState.errors.next && <div className="pf-error">{form.formState.errors.next.message}</div>}
            </div>
          </div>
          <div>
            <label className="pf-label" htmlFor="confirm">Confirm</label>
            <input id="confirm" type="password" className="pf-input" {...form.register('confirm')} />
            {form.formState.errors.confirm && <div className="pf-error">{form.formState.errors.confirm.message}</div>}
          </div>
          <div>
            <button className="pf-btn pf-btn-soft" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Change password'}</button>
            {msg && <span className="pf-hint" style={{ marginLeft: 8 }}>{msg}</span>}
          </div>
        </form>

        <div className="pf-card-title" style={{ marginTop: 16 }}><Smartphone size={16}/> Two-factor authentication</div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button className="pf-btn pf-btn-ghost" onClick={toggle2FA}>{state?.has2FA ? 'Disable 2FA' : 'Enable 2FA'}</button>
          <span className="pf-hint">Scan the QR code in your authenticator app.</span>
        </div>
        <div style={{ marginTop: 8, border:'1px dashed rgba(255,255,255,.25)', height: 120, borderRadius: 12, display:'grid', placeItems:'center' }} aria-label="QR placeholder">
          {state?.has2FA ? 'QR Code Placeholder' : '2FA disabled'}
        </div>

        <div className="pf-row" style={{ marginTop: 12, alignItems:'center' }}>
          <button type="button" className="pf-btn pf-btn-soft" onClick={generateRecovery}>Generate recovery codes</button>
          <button type="button" className="pf-btn pf-btn-ghost" onClick={copyCodes}><Copy size={14}/> Copy</button>
        </div>
        {state?.recoveryCodes && state.recoveryCodes.length > 0 && (
          <div className="pf-recovery" style={{ marginTop: 8 }}>
            {state.recoveryCodes.map((c) => <div key={c} className="pf-code">{c}</div>)}
          </div>
        )}

        <div className="pf-card-title" style={{ marginTop: 16 }}>Active sessions</div>
        <div className="pf-sessions">
          {state?.sessions?.map((s) => (
            <div key={s.id} className="pf-session">
              <div>
                <div style={{ fontWeight:700 }}>{s.agent}</div>
                <div className="pf-hint">{s.ip} • Last active {new Date(s.lastActive).toLocaleString()}</div>
              </div>
              <button className="pf-btn pf-btn-danger" onClick={() => revoke(s.id)}>Revoke</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

