import { GoogleIntegrationSettings, GoogleStatus, UserRole } from '../../../types';
import { getActiveProfile, updateSettings } from '../../settings';

/**
 * Functional Google Client
 * Handles the state transitions for Workspace integration.
 */

export const startGoogleConnect = async (actor: { id: string, name: string, role: UserRole }): Promise<boolean> => {
  return new Promise((resolve) => {
    // 1. Calculate center position for the popup
    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      'about:blank',
      'google_auth',
      `width=${width},height=${height},left=${left},top=${top},menubar=no,status=no,location=no`
    );

    if (popup) {
      popup.document.write(`
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; text-align: center; color: #3c4043;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width="48" style="margin-bottom: 24px;">
          <h2 style="font-size: 24px; font-weight: 500; margin-bottom: 8px;">Sign in</h2>
          <p style="font-size: 16px; margin-bottom: 32px;">to continue to SynkOps</p>
          
          <div style="text-align: left; max-width: 320px; margin: 0 auto;">
            <div style="margin-bottom: 24px;">
              <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #202124;">Email or phone</label>
              <input type="email" id="email-input" placeholder="Enter your Google email" style="width: 100%; padding: 13px 15px; border: 1px solid #dadce0; border-radius: 4px; font-size: 16px; outline-color: #1a73e8; box-sizing: border-box;">
            </div>
            
            <p style="font-size: 12px; color: #5f6368; line-height: 1.5; margin-bottom: 32px;">
              To continue, Google will share your name, email address, language preference, and profile picture with SynkOps.
            </p>

            <div id="loading" style="display: none; text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; width: 24px; height: 24px; border: 3px solid #f3f3f3; border-top: 3px solid #1a73e8; border-radius: 50%; animation: spin 1s linear infinite;"></div>
              <p style="font-size: 14px; color: #1a73e8; margin-top: 12px; font-weight: 500;">Connecting account...</p>
            </div>

            <div id="action-buttons" style="display: flex; justify-content: space-between; align-items: center;">
              <button id="cancel-btn" style="background: none; border: none; color: #1a73e8; font-weight: 500; font-size: 14px; cursor: pointer; padding: 0;">Cancel</button>
              <button id="auth-btn" style="background: #1a73e8; color: white; border: none; padding: 10px 24px; border-radius: 4px; cursor: pointer; font-weight: 500; font-size: 14px;">Next</button>
            </div>
          </div>
        </div>
        <style>
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
        <script>
          document.getElementById('auth-btn').onclick = function() {
            const email = document.getElementById('email-input').value;
            if (!email || !email.includes('@')) {
              alert('Please enter a valid Google account email.');
              return;
            }
            document.getElementById('action-buttons').style.display = 'none';
            document.getElementById('loading').style.display = 'block';
            setTimeout(() => {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', email: email }, '*');
              window.close();
            }, 1800);
          }
          document.getElementById('cancel-btn').onclick = function() {
            window.close();
          }
          // Auto-focus email input
          document.getElementById('email-input').focus();
        </script>
      `);

      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
          const profile = getActiveProfile();
          const updatedGoogle: GoogleIntegrationSettings = {
            ...profile.integrations.google,
            enabled: true,
            status: 'connected',
            connectedEmail: event.data.email,
            lastHealthCheckAt: new Date().toISOString(),
            lastError: undefined
          };
          
          // Fix for line 89: Spread profile to match BusinessProfile interface requirement
          updateSettings({ ...profile, integrations: { ...profile.integrations, google: updatedGoogle } }, actor as any, 'integrations');
          
          window.removeEventListener('message', handleMessage);
          resolve(true);
        }
      };

      window.addEventListener('message', handleMessage);
    } else {
      alert("Popup blocked. Please allow popups for SynkOps to connect Google Workspace.");
      resolve(false);
    }
  });
};

export const disconnectGoogle = async (actor: { id: string, name: string, role: UserRole }): Promise<boolean> => {
  if (window.confirm("Are you sure you want to disconnect Google Workspace? This will stop all calendar and document syncing immediately. All service permissions will be revoked.")) {
    const profile = getActiveProfile();
    const disconnectedGoogle: GoogleIntegrationSettings = {
      enabled: false,
      status: 'disconnected',
      connectedEmail: undefined,
      enabledServices: {
        calendar: false,
        gmail: false,
        drive: false,
        sheets: false,
        contacts: false,
        maps: false
      },
      calendar: { syncMode: 'manual' },
      drive: {},
      sheets: {},
      contacts: { syncMode: 'import' },
      lastHealthCheckAt: undefined,
      lastError: undefined
    };

    // Fix for line 127: Spread profile to match BusinessProfile interface requirement
    updateSettings({ ...profile, integrations: { ...profile.integrations, google: disconnectedGoogle } }, actor as any, 'integrations');
    return true;
  }
  return false;
};

export const testGoogleConnection = async (): Promise<Record<string, boolean>> => {
  // Simulate network latency for a real API call
  await new Promise(r => setTimeout(r, 1200));
  
  // High reliability simulation
  return {
    calendar: true,
    gmail: true,
    drive: true,
    sheets: true,
    contacts: true
  };
};

export const listCalendars = async () => {
  await new Promise(r => setTimeout(r, 600));
  return [
    { id: 'primary', name: 'Primary Google Calendar' },
    { id: 'synkops-production', name: 'SynkOps Production Schedule' },
    { id: 'field-crew-leads', name: 'Crew Lead Appointments' }
  ];
};

export const listDriveFolders = async (parentId?: string) => {
  await new Promise(r => setTimeout(r, 600));
  return [
    { id: 'f1', name: 'SynkOps Root Storage' },
    { id: 'f2', name: 'Project Photos Archive' },
    { id: 'f3', name: 'Signed Proposals (PDF)' }
  ];
};