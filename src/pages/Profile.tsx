import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, preferencesSchema } from '../features/profile/types';
import type { Profile, Preferences } from '../features/profile/types';
import { loadProfile, saveProfile, loadPreferences, savePreferences } from '../features/profile/mockApi';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileForm from '../components/profile/ProfileForm';
import PreferencesPanel from '../components/profile/PreferencesPanel';
import SecurityPanel from '../components/profile/SecurityPanel';
import ConnectedAccounts from '../components/profile/ConnectedAccounts';
import ActivitySummary from '../components/profile/ActivitySummary';
import '../features/profile/profile.styles.css';
import { resetAllLocalData } from '../features/sync/resetLocalData';
import { useSync } from '../features/sync/useSync';

type FormShape = Profile & Preferences;

function Toast({ text }: { text: string }) {
  return <div className="pf-toast" role="status" aria-live="polite">{text}</div>;
}

export default function ProfilePage() {
  const [loading, setLoading] = React.useState(true);
  const [toast, setToast] = React.useState<string | null>(null);

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
  const userId = (email || '').trim();

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
  }

  function onDiscard() {
    methods.reset(undefined, { keepValues: false });
  }

  // KPI stubs – could be derived from other stores if present
  const kpis = { upcomingDue: 3, completedThisWeek: 5, overallPercent: 88, streakDays: 6 };

  const displayName = methods.watch('displayName') || '';
  const handle = methods.watch('handle') || '';
  const avatarUrl = methods.watch('avatarUrl');
  const coverUrl = methods.watch('coverUrl');

  return (
    <div className="pf-page">
      <div className="pf-topbar">
        <h1 className="pf-title">Profile</h1>
        <div className="pf-actions">
          <button className="pf-btn pf-btn-ghost" onClick={onDiscard} aria-label="Discard changes" disabled={!isDirty}>Discard</button>
          <button className="pf-btn pf-btn-primary" onClick={methods.handleSubmit(onSave)} aria-label="Save changes" disabled={!isDirty || !isValid || loading}>
            {methods.formState.isSubmitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <FormProvider {...methods}>
        {/* Header – avatar/cover editing */}
        <ProfileHeader
          displayName={displayName || 'Student'}
          handle={handle || '@handle'}
          avatarUrl={avatarUrl}
          coverUrl={coverUrl}
          onChangeAvatar={(d) => methods.setValue('avatarUrl', d, { shouldDirty: true })}
          onChangeCover={(d) => methods.setValue('coverUrl', d, { shouldDirty: true })}
        />

        <div className="pf-grid" style={{ marginTop: 16 }}>
          <div>
            <ActivitySummary {...kpis} />
          </div>
          <div style={{ display:'grid', gap: 16 }}>
            <ProfileForm />
            <PreferencesPanel />
            <SecurityPanel />
            <ConnectedAccounts />
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'grid', gap: 16 }}>
          <div className="app-card">
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>Cloud Sync (preview)</h2>
            <p style={{ fontSize: 13, color: 'var(--ink-3, #97a1c0)', marginBottom: 8 }}>
              Use your profile email as your cloud id. You can load data from the cloud or save your current dashboard snapshot.
            </p>
            <p style={{ fontSize: 12, marginBottom: 8 }}>
              <strong>User id:</strong>{' '}
              {userId ? userId : <span style={{ opacity: 0.7 }}>Add an email in your profile to enable sync.</span>}
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
                onClick={() => syncFromCloud(userId)}
              >
                {isSyncing ? 'Syncing...' : 'Load from cloud'}
              </button>
              <button
                type="button"
                className="app-button-primary"
                disabled={isSyncing || !userId}
                onClick={() => syncToCloud(userId)}
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
