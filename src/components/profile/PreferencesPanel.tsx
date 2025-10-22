import * as React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import type { Preferences } from '../../features/profile/types';
import { Info } from 'lucide-react';

const DEFAULT_PALETTE = ['#7c5cff', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

export default function PreferencesPanel() {
  const { control, watch, setValue } = useFormContext<any>();
  const colors: string[] = watch('categoryColors') || DEFAULT_PALETTE;

  function toggleColor(c: string) {
    const exists = colors.includes(c);
    const next = exists ? colors.filter((x) => x !== c) : [...colors, c];
    setValue('categoryColors', next, { shouldDirty: true, shouldValidate: true });
  }

  return (
    <div className="pf-card" aria-label="Preferences">
      <div className="pf-card-body">
        <div className="pf-card-title">Preferences</div>

        <div style={{ display:'grid', gap:12 }}>
          <label className="pf-switch">
            <Controller name="emailReminders" control={control} render={({ field }) => (
              <input type="checkbox" {...field} checked={!!field.value} />
            )} />
            Email notifications (reminders, grades)
          </label>

          <label className="pf-switch">
            <Controller name="pushReminders" control={control} render={({ field }) => (
              <input type="checkbox" {...field} checked={!!field.value} />
            )} />
            Push notifications
          </label>

          <div className="pf-row">
            <label className="pf-switch">
              <Controller name="calendar.autoImportIcs" control={control} render={({ field }) => (
                <input type="checkbox" {...field} checked={!!field.value} />
              )} />
              Calendar: Import .ics automatically
            </label>
            <label className="pf-switch">
              <Controller name="calendar.showCategoryColors" control={control} render={({ field }) => (
                <input type="checkbox" {...field} checked={!!field.value} />
              )} />
              Calendar: Show category colors
            </label>
          </div>

          <label className="pf-switch">
            <Controller name="grades.showWeighted" control={control} render={({ field }) => (
              <input type="checkbox" {...field} checked={!!field.value} />
            )} />
            Grades: Show weighted grade
            <span title="If enabled, overall grade displays weighted by points possible" style={{ display:'inline-flex', alignItems:'center', gap:4, marginLeft:6, color:'#cbd5ff' }}>
              <Info size={14} />
            </span>
          </label>

          <div>
            <div className="pf-hint" style={{ marginBottom: 8 }}>Category colors</div>
            <div className="pf-color-swatches">
              {DEFAULT_PALETTE.map((c) => (
                <button key={c} type="button" aria-label={`Toggle color ${c}`} className="pf-swatch" style={{ background:c, outline: colors.includes(c) ? '2px solid #fff' : 'none' }} onClick={() => toggleColor(c)} />
              ))}
            </div>
            <div className="pf-hint" style={{ marginTop: 8 }}>Preview</div>
            <div className="pf-chips">
              {colors.map((c) => (
                <span className="pf-chip" key={c} style={{ borderColor: c, background: c + '33' }}>Category</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

