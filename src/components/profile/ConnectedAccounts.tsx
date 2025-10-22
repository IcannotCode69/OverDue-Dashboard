import * as React from 'react';
import { loadConnections, saveConnections } from '../../features/profile/mockApi';
import type { Connections } from '../../features/profile/types';
import { Link as LinkIcon } from 'lucide-react';

export default function ConnectedAccounts() {
  const [state, setState] = React.useState<Connections>({ google: false, outlook: false, brightspace: false });

  React.useEffect(() => { loadConnections().then(setState); }, []);

  function toggle(p: keyof Connections) {
    const next = { ...state, [p]: !state[p] };
    setState(next);
    saveConnections(next);
  }

  function Card({ label, connected, onClick }: { label: string; connected: boolean; onClick: () => void }) {
    return (
      <div className="pf-account">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontWeight:700 }}><LinkIcon size={16}/> {label}</div>
          <span className="pf-badge" style={{ background: connected ? 'rgba(34,197,94,.20)' : undefined }}>{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <button className="pf-btn pf-btn-ghost" onClick={onClick}>{connected ? 'Disconnect' : 'Connect'}</button>
      </div>
    );
  }

  return (
    <div className="pf-card" aria-label="Connected Accounts">
      <div className="pf-card-body">
        <div className="pf-card-title">Connected Accounts</div>
        <div className="pf-accounts">
          <Card label="Google" connected={state.google} onClick={() => toggle('google')} />
          <Card label="Outlook" connected={state.outlook} onClick={() => toggle('outlook')} />
          <Card label="Brightspace" connected={state.brightspace} onClick={() => toggle('brightspace')} />
        </div>
      </div>
    </div>
  );
}

