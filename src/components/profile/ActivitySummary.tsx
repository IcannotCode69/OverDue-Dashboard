import * as React from 'react';
import { CalendarCheck2, CheckCircle2, Percent, Flame } from 'lucide-react';

type Props = {
  upcomingDue: number;
  completedThisWeek: number;
  overallPercent: number;
  streakDays: number;
};

export default function ActivitySummary({ upcomingDue, completedThisWeek, overallPercent, streakDays }: Props) {
  return (
    <div className="pf-card">
      <div className="pf-card-body">
        <div className="pf-card-title">Activity</div>
        <div className="pf-kpis-scroll" aria-label="Activity stats scroller">
          <div className="pf-kpis">
          <div className="pf-kpi" aria-label="Upcoming Due">
            <div className="pf-kpi-label"><CalendarCheck2 size={14}/> Upcoming Due</div>
            <div className="pf-kpi-value">{upcomingDue}</div>
          </div>
          <div className="pf-kpi" aria-label="Completed this Week">
            <div className="pf-kpi-label"><CheckCircle2 size={14}/> Completed (Week)</div>
            <div className="pf-kpi-value">{completedThisWeek}</div>
          </div>
          <div className="pf-kpi" aria-label="Overall Percent">
            <div className="pf-kpi-label"><Percent size={14}/> Overall %</div>
            <div className="pf-kpi-value">{overallPercent}%</div>
          </div>
          <div className="pf-kpi" aria-label="Streak">
            <div className="pf-kpi-label"><Flame size={14}/> Streak</div>
            <div className="pf-kpi-value">{streakDays}d</div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
