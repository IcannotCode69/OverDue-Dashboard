import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, preferencesSchema } from '../features/profile/types';
import type { Profile, Preferences } from '../features/profile/types';
import { loadProfile, saveProfile, loadPreferences, savePreferences } from '../features/profile/mockApi';
import ProfileForm from '../components/profile/ProfileForm';
import '../features/profile/profile.styles.css';
import { resetAllLocalData } from '../features/sync/resetLocalData';
import { useSync } from '../features/sync/useSync';
import { useAuth } from '../features/auth/AuthContext';
import { getUserIdFromAuth } from '../features/sync/userId';

type FormShape = Profile & Preferences;

function Toast({ text }: { text: string }) {
  return <div className="pf-toast" role="status" aria-live="polite">{text}</div>;
}

export default function ProfilePage() {
  const [loading, setLoading] = React.useState(true);
  const [toast, setToast] = React.useState<string | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);

  const methods = useForm<FormShape>({
    resolver: zodResolver(profileSchema.merge(preferencesSchema) as any),
    mode: 'onChange',
    defaultValues: async () => {
      const [p, prefs] = await Promise.all([loadProfile(), loadPreferences()]);
      setLoading(false);
      return { ...p, ...prefs } as FormShape;
    },
  });

  const isDirty = methods.formState.isDirty;
  const isValid = methods.formState.isValid;
  const email = methods.watch('email');
  const { user } = useAuth();
  const authUserId = getUserIdFromAuth(user);
  const fallbackProfileId = (email || '').trim();
  const userId = authUserId || fallbackProfileId || '';

  const {
    isSyncing,
    lastSyncedAt,
    syncError,
    syncFromCloud,
    syncToCloud,
  } = useSync();

  async function onSave(values: FormShape) {
    methods.clearErrors();
    const profile: Profile = {
      firstName: values.firstName,
      lastName: values.lastName,
      displayName: values.displayName,
      handle: values.handle,
      email: values.email,
      phone: values.phone,
      bio: values.bio,
      timezone: values.timezone,
      locale: values.locale,
      school: values.school,
      program: values.program,
      graduationYear: values.graduationYear,
      socials: values.socials,
      avatarUrl: values.avatarUrl,
      coverUrl: values.coverUrl,
    };
    const prefs: Preferences = {
      emailReminders: values.emailReminders,
      pushReminders: values.pushReminders,
      calendar: values.calendar,
      grades: values.grades,
      categoryColors: values.categoryColors,
    };

    methods.formState.isSubmitting;
    await Promise.all([saveProfile(profile), savePreferences(prefs)]);
    methods.reset({ ...profile, ...prefs });
    setToast('Profile updated');
    setTimeout(() => setToast(null), 1800);
    setIsEditing(false);
  }

  return (
    <div className="pf-page">
      <div className="pf-topbar">
        <h1 className="pf-title">Profile</h1>
        <div className="pf-actions">
          {!isEditing && (
            <button
              type="button"
              className="pf-btn pf-btn-primary"
              onClick={() => setIsEditing(true)}
            >
              Edit profile
            </button>
          )}
          {isEditing && (
            <>
              <button
                type="button"
                className="pf-btn pf-btn-ghost"
                onClick={() => {
                  methods.reset();
                  setIsEditing(false);
                }}
                disabled={loading}
                aria-label="Cancel editing"
              >
                Cancel
              </button>
              <button
                type="button"
                className="pf-btn pf-btn-primary"
                onClick={methods.handleSubmit(onSave)}
                disabled={!isDirty || !isValid || loading}
                aria-label="Save profile changes"
              >
                {methods.formState.isSubmitting ? 'Saving…' : 'Save changes'}
              </button>
            </>
          )}
        </div>
      </div>

      <FormProvider {...methods}>
        <div style={{ marginTop: 16 }}>
          <ProfileForm isEditing={isEditing} />
        </div>

        <div style={{ marginTop: 24, display: 'grid', gap: 16 }}>
          <div className="app-card">
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>Cloud Sync (preview)</h2>
            <p style={{ fontSize: 13, color: 'var(--ink-3, #97a1c0)', marginBottom: 8 }}>
              Sync your dashboard to the cloud using your signed-in account.
            </p>
            <p style={{ fontSize: 12, marginBottom: 8 }}>
              <strong>Signed in as:</strong>{' '}
              {userId ? userId : <span style={{ opacity: 0.7 }}>Sign in to use Cloud Sync.</span>}
            </p>
            {lastSyncedAt && (
              <p style={{ fontSize: 12, marginBottom: 8 }}>
                <strong>Last synced:</strong> {new Date(lastSyncedAt).toLocaleString()}
              </p>
            )}
            {syncError && (
              <p style={{ fontSize: 12, color: '#fca5a5', marginBottom: 8 }}>
                {syncError}
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className="app-button-primary"
                disabled={isSyncing || !userId}
                onClick={() => userId && syncFromCloud(userId)}
              >
                {isSyncing ? 'Syncing...' : 'Load from cloud'}
              </button>
              <button
                type="button"
                className="app-button-primary"
                disabled={isSyncing || !userId}
                onClick={() => userId && syncToCloud(userId)}
              >
                {isSyncing ? 'Syncing...' : 'Save to cloud'}
              </button>
            </div>
          </div>

          <div className="app-card">
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>Reset this device</h2>
            <p style={{ fontSize: 13, color: 'var(--ink-3, #97a1c0)', marginBottom: 8 }}>
              Clear all OverDue Dashboard data stored in this browser, including calendar events, notes, grades, and profile info. This does not affect any data stored in the cloud.
            </p>
            <button
              type="button"
              className="app-button-primary"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all local data on this device?')) {
                  resetAllLocalData();
                  window.location.reload();
                }
              }}
            >
              Clear local data on this device
            </button>
          </div>
        </div>
      </FormProvider>

      {toast && <Toast text={toast} />}
    </div>
  );
}
