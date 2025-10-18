import React, { useState, useEffect, useRef } from 'react';
import { googleCalendarClient } from '../../calendar/api/googleClient';
import { CalendarSettings } from '../../calendar/types';

interface CalendarCardSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  anchorElement: HTMLElement | null;
}

export default function CalendarCardSettings({ isOpen, onClose, anchorElement }: CalendarCardSettingsProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [settings, setSettings] = useState<CalendarSettings>({ showDeclined: false });
  const [isConnecting, setIsConnecting] = useState(false);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const [credentials, setCredentials] = useState({ clientId: '', apiKey: '' });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      updateConnectionStatus();
      setSettings(googleCalendarClient.getSettings());
      loadSavedCredentials();
    }
  }, [isOpen]);

  const loadSavedCredentials = () => {
    try {
      const saved = localStorage.getItem('od:gcal:credentials');
      if (saved) {
        setCredentials(JSON.parse(saved));
        const creds = JSON.parse(saved);
        setCredentials(creds);
      }
    } catch (error) {
      console.error('Error loading saved calendar credentials:', error);
    }
  };

  const saveCredentials = (newCredentials: { clientId: string; apiKey: string }) => {
    try {
      localStorage.setItem('od:gcal:credentials', JSON.stringify(newCredentials));
      setCredentials(newCredentials);
    } catch (error) {
      console.error('Error saving calendar credentials:', error);
    }
  };

  const extractCalendarId = (input: string): string | null => {
    // Handle Google Calendar public URL
    const publicUrlMatch = input.match(/calendar\/embed\?src=([^&]+)/);
    if (publicUrlMatch) {
      return decodeURIComponent(publicUrlMatch[1]);
    }
    
    // Handle iframe embed code
    const embedMatch = input.match(/src="[^"]*calendar\/embed\?src=([^&"]+)/);
    if (embedMatch) {
      return decodeURIComponent(embedMatch[1]);
    }
    
    // Handle just calendar ID
    if (input.includes('@') || input.includes('%40')) {
      return input;
    }
    
    return null;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const updateConnectionStatus = () => {
    const connected = googleCalendarClient.isConnected();
    setIsConnected(connected);
    
    if (connected) {
      setConnectedAccount(googleCalendarClient.getConnectedAccount());
    }
  };

  const handleConnect = async () => {
    
    setIsConnecting(true);
    try {
      const success = await googleCalendarClient.connect();
      if (success) {
        updateConnectionStatus();
        window.dispatchEvent(new CustomEvent('calendar-connected'));
      } else {
        alert('Failed to connect to Google Calendar. Please check your credentials and try again.');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setShowCredentialsForm(true);
    }
    setIsConnecting(false);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.clientId.trim()) {
      alert('Please enter a valid Client ID.');
      return;
    }
    
    saveCredentials(credentials);
    setShowCredentialsForm(false);
    // Re-initiate connection with new credentials and try to connect
    googleCalendarClient.updateCredentials(credentials);
    handleConnect();
  };

  const handleDisconnect = () => {
    googleCalendarClient.disconnect();
    updateConnectionStatus();
    setConnectedAccount(null);
    // Trigger a refresh to show mock data
    window.dispatchEvent(new CustomEvent('calendar-disconnected'));
  };

  const handleSettingsChange = (newSettings: Partial<CalendarSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    googleCalendarClient.saveSettings(updatedSettings);
    // Trigger a refresh of the events
    window.dispatchEvent(new CustomEvent('calendar-settings-changed'));
  };

  const getPanelPosition = () => {
    if (!anchorElement) {
      return { top: 100, left: 100 }; // Fallback position
    }
    
    const rect = anchorElement.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    
    // Position below and to the right of the button
    let top = rect.bottom + scrollY + 8;
    let left = rect.left + scrollX;
    
    // Ensure panel stays within viewport
    const panelWidth = 320;
    const panelHeight = 200;
    
    if (left + panelWidth > window.innerWidth) {
      left = window.innerWidth - panelWidth - 20;
    }
    
    if (top + panelHeight > window.innerHeight) {
      top = rect.top + scrollY - panelHeight - 8;
    }
    
    const position = { top, left };
    return position;
  };

  if (!isOpen) return null;

  const position = getPanelPosition();

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 9999,
        background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.95), rgba(15, 23, 42, 0.95))',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '12px',
        padding: '20px',
        minWidth: '280px',
        maxWidth: '320px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        color: 'var(--ink-0)',
        fontFamily: 'var(--font-sans)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {/* Header */}
      <div style={{
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--ink-0)'
        }}>
          Calendar Settings
        </h3>
      </div>

      {!isConnected ? (
        /* Not Connected State */
        <div>
          {!showCredentialsForm ? (
            <div>
              <div style={{
                marginBottom: '16px',
                color: 'var(--ink-1)',
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                Connect your Google Calendar to show your real events instead of sample data.
              </div>
              
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #4aa8ff, #8855ff)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: isConnecting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isConnecting ? 0.7 : 1,
                  marginBottom: '12px'
                }}
                onMouseOver={(e) => {
                  if (!isConnecting) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(74, 168, 255, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isConnecting) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
              </button>
              
              <button
                onClick={() => setShowCredentialsForm(true)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: '1px solid var(--stroke-inner)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  color: 'var(--ink-1)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'var(--stroke-outer)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--stroke-inner)';
                }}
              >
                Enter API Credentials
              </button>
              
              <div style={{
                marginTop: '12px',
                fontSize: '12px',
                color: 'var(--ink-2)',
                lineHeight: '1.3'
              }}>
                Need Google API credentials? Click "Enter API Credentials" for setup.
              </div>
            </div>
          ) : (
            /* Credentials Form */
            <form onSubmit={handleCredentialsSubmit}>
              <div style={{
                marginBottom: '16px',
                color: 'var(--ink-1)',
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                Enter your Google API credentials:
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontSize: '12px',
                  color: 'var(--ink-2)',
                  fontWeight: 500
                }}>
                  Client ID *
                </label>
                <input
                  type="text"
                  value={credentials.clientId}
                  onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                  placeholder="xxx.apps.googleusercontent.com"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--stroke-inner)',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--ink-0)',
                    fontSize: '13px',
                    fontFamily: 'monospace'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontSize: '12px',
                  color: 'var(--ink-2)',
                  fontWeight: 500
                }}>
                  API Key (optional)
                </label>
                <input
                  type="text"
                  value={credentials.apiKey}
                  onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="AIzaSyC..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--stroke-inner)',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--ink-0)',
                    fontSize: '13px',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #4aa8ff, #8855ff)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Save & Connect
                </button>
                <button
                  type="button"
                  onClick={() => setShowCredentialsForm(false)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: '1px solid var(--stroke-inner)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    color: 'var(--ink-2)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
              
              <div style={{
                marginTop: '12px',
                fontSize: '11px',
                color: 'var(--ink-2)',
                lineHeight: '1.3'
              }}>
                Get credentials from <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--acc-1)' }}>Google Cloud Console</a>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* Connected State */
        <div>
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '8px'
          }}>
            <div style={{
              fontSize: '12px',
              color: 'rgba(34, 197, 94, 0.8)',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: 500
            }}>
              Connected
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--ink-0)',
              fontWeight: 500
            }}>
              {connectedAccount || 'Google Calendar'}
            </div>
          </div>

          {/* Settings */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              color: 'var(--ink-1)'
            }}>
              <input
                type="checkbox"
                checked={settings.showDeclined}
                onChange={(e) => handleSettingsChange({ showDeclined: e.target.checked })}
                style={{
                  accentColor: '#4aa8ff',
                  transform: 'scale(1.1)'
                }}
              />
              Show declined events
            </label>
          </div>

          {/* Disconnect */}
          <button
            onClick={handleDisconnect}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '10px 16px',
              color: 'rgba(239, 68, 68, 0.9)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
              e.currentTarget.style.color = 'rgba(239, 68, 68, 1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              e.currentTarget.style.color = 'rgba(239, 68, 68, 0.9)';
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}