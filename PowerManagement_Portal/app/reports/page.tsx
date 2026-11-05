"use client";

import { Card, CardBody } from "@heroui/card";

export default function ReportsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
        <p className="text-slate-400">Generate and view system reports (coming soon)</p>
      </div>
      <Card className="bg-slate-900/70 backdrop-blur-md border border-slate-700">
        <CardBody>
          <p className="text-slate-400">Reports functionality will be available in a future update.</p>
        </CardBody>
      </Card>
    </div>
  );
} 