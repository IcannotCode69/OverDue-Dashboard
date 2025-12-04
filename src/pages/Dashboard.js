import React from "react";
import DashboardGrid from "../features/dashboard/DashboardGrid";
import PageHeader from "../components/layout/PageHeader";

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your schedule, tasks, and smart study suggestions."
      />
      <DashboardGrid />
    </div>
  );
}
