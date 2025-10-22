import * as React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import type { Profile } from '../../features/profile/types';

const timezones = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Asia/Kolkata', 'Asia/Tokyo'
];
const locales = ['en-US', 'en-GB', 'fr-FR', 'es-ES', 'de-DE', 'ja-JP'];

export default function ProfileForm() {
  const { register, control, formState: { errors }, watch } = useFormContext<Profile>();
  const bio = watch('bio') || '';

  return (
    <div className="pf-card" aria-label="Profile form">
      <div className="pf-card-body">
        <div className="pf-card-title">Profile</div>

        <div className="pf-row">
          <div>
            <label className="pf-label" htmlFor="firstName">First name</label>
            <input id="firstName" className="pf-input" {...register('firstName')} />
            {errors.firstName && <div className="pf-error">{errors.firstName.message}</div>}
          </div>
          <div>
            <label className="pf-label" htmlFor="lastName">Last name</label>
            <input id="lastName" className="pf-input" {...register('lastName')} />
            {errors.lastName && <div className="pf-error">{errors.lastName.message}</div>}
          </div>
        </div>

        <div className="pf-row">
          <div>
            <label className="pf-label" htmlFor="displayName">Display name</label>
            <input id="displayName" className="pf-input" {...register('displayName')} />
            {errors.displayName && <div className="pf-error">{errors.displayName.message}</div>}
          </div>
          <div>
            <label className="pf-label" htmlFor="handle">Handle</label>
            <input id="handle" className="pf-input" placeholder="@handle" {...register('handle')} />
            {errors.handle && <div className="pf-error">{errors.handle.message}</div>}
          </div>
        </div>

        <div className="pf-row">
          <div>
            <label className="pf-label" htmlFor="email">Email</label>
            <input id="email" className="pf-input" {...register('email')} disabled />
          </div>
          <div>
            <label className="pf-label" htmlFor="phone">Phone (optional)</label>
            <input id="phone" className="pf-input" {...register('phone')} />
          </div>
        </div>

        <div>
          <label className="pf-label" htmlFor="bio">Bio</label>
          <textarea id="bio" className="pf-textarea" maxLength={240} {...register('bio')} />
          <div className="pf-hint">{bio.length}/240</div>
          {errors.bio && <div className="pf-error">{errors.bio.message}</div>}
        </div>

        <div className="pf-row">
          <div>
            <label className="pf-label" htmlFor="timezone">Time zone</label>
            <Controller name="timezone" control={control} render={({ field }) => (
              <select id="timezone" className="pf-select" {...field}>
                {timezones.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            )}/>
            {errors.timezone && <div className="pf-error">{errors.timezone.message}</div>}
          </div>
          <div>
            <label className="pf-label" htmlFor="locale">Locale</label>
            <Controller name="locale" control={control} render={({ field }) => (
              <select id="locale" className="pf-select" {...field}>
                {locales.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            )}/>
            {errors.locale && <div className="pf-error">{errors.locale.message}</div>}
          </div>
        </div>

        <div className="pf-row">
          <div>
            <label className="pf-label" htmlFor="school">School</label>
            <input id="school" className="pf-input" {...register('school')} />
          </div>
          <div>
            <label className="pf-label" htmlFor="program">Program</label>
            <input id="program" className="pf-input" {...register('program')} />
          </div>
        </div>

        <div className="pf-row">
          <div>
            <label className="pf-label" htmlFor="graduationYear">Graduation year</label>
            <input id="graduationYear" type="number" className="pf-input" {...register('graduationYear')} />
            {errors.graduationYear && <div className="pf-error">{errors.graduationYear.message as string}</div>}
          </div>
        </div>

        <div className="pf-card-title" style={{ marginTop: 16 }}>Socials</div>
        <div className="pf-row">
          <div>
            <label className="pf-label" htmlFor="github">GitHub</label>
            <input id="github" className="pf-input" placeholder="https://github.com/username" {...register('socials.github')} />
          </div>
          <div>
            <label className="pf-label" htmlFor="linkedin">LinkedIn</label>
            <input id="linkedin" className="pf-input" placeholder="https://linkedin.com/in/username" {...register('socials.linkedin')} />
          </div>
        </div>
        <div>
          <label className="pf-label" htmlFor="website">Website</label>
          <input id="website" className="pf-input" placeholder="https://example.com" {...register('socials.website')} />
        </div>
      </div>
    </div>
  );
}

