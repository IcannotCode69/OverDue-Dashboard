import React from "react";
import { listGrades } from "../../data/local";

export default function GpaWidget() {
  const grades = listGrades();
  const totalWeight = grades.reduce((s, g) => s + (g.weight || 0), 0);
  const weighted = grades.reduce((s, g) => s + (g.score || 0) * (g.weight || 0), 0);
  const gpa = totalWeight > 0 ? (weighted / totalWeight) : null;

  return (
    <div>
      {gpa == null ? (
        <div style={{ color: 'rgba(255,255,255,0.8)' }}>
          No grades yet. <a href="/grades" style={{ color: '#93c5fd' }}>Add grades in /grades</a>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{(gpa/25).toFixed(2)} GPA</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{grades.length} items, weighted average {(gpa).toFixed(1)}</div>
        </div>
      )}
    </div>
  );
}
