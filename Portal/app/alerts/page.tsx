"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Container from "@/app/components/container";
import Heading from "@/app/components/Heading";
import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";
import { Alert as PrismaAlert, AlertLevel, CCMSDevice, Location } from "@prisma/client";
import Link from "next/link";

// Enhanced Alert type that includes device info
interface GlobalAlert extends Omit<PrismaAlert, 'device'> {
  device: {
    id: string; // DB ID of the device
    deviceId: string; // User-friendly device ID
    location?: Location | null; // Optional: if you want to show location info
  };
}

interface AlertsApiResponse {
  alerts: GlobalAlert[];
  totalAlerts: number;
  totalPages: number;
  currentPage: number;
}

const AllAlertsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [alertsData, setAlertsData] = useState<AlertsApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterLevel, setFilterLevel] = useState<string>(searchParams.get('level') || '');
  const [filterDeviceId, setFilterDeviceId] = useState<string>(searchParams.get('deviceId') || '');

  const fetchData = useCallback((page: number = 1, level?: string, deviceId?: string) => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", "15"); // Or make this configurable
    if (level) params.append("level", level);
    if (deviceId) params.append("deviceId", deviceId);

    // Update URL without navigating
    const newUrl = `/alerts?${params.toString()}`;
    window.history.pushState({...window.history.state, as: newUrl, url: newUrl}, '', newUrl);


    axios.get<AlertsApiResponse>(`/api/alerts?${params.toString()}`)
      .then((response) => {
        setAlertsData(response.data);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch alerts:", err);
        setError(err.response?.data?.error || "Failed to load alerts.");
        setAlertsData(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // router is stable, but searchParams is not. We handle searchParams internally.

 useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    const level = searchParams.get('level') || '';
    const deviceId = searchParams.get('deviceId') || '';
    setFilterLevel(level);
    setFilterDeviceId(deviceId);
    fetchData(page, level, deviceId);
  }, [searchParams, fetchData]);


  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(1, filterLevel, filterDeviceId);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (alertsData?.totalPages || 1)) {
        fetchData(newPage, filterLevel, filterDeviceId);
    }
  };

  const getAlertRowClass = (level: AlertLevel) => {
    // Consistent with AlertHistory component
    switch (level) {
      case AlertLevel.CRITICAL: return "bg-red-50 dark:bg-red-900/50 hover:bg-red-100 dark:hover:bg-red-800/50";
      case AlertLevel.WARNING: return "bg-yellow-50 dark:bg-yellow-800/50 hover:bg-yellow-100 dark:hover:bg-yellow-700/50";
      case AlertLevel.INFO: return "bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-800/50";
      default: return "bg-gray-50 dark:bg-neutral-700/50 hover:bg-gray-100 dark:hover:bg-neutral-600/50";
    }
  };

  const getAlertTextColor = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.CRITICAL: return "text-red-600 dark:text-red-400 font-semibold";
      case AlertLevel.WARNING: return "text-yellow-600 dark:text-yellow-400 font-semibold";
      case AlertLevel.INFO: return "text-blue-600 dark:text-blue-400";
      default: return "text-gray-700 dark:text-gray-200";
    }
  };

  if (isLoading && !alertsData) { // Show loading only on initial load
    return (
      <ClientOnly>
        <Container>
          <div className="pt-10 pb-20 flex justify-center items-center h-[60vh]">
            <Heading title="Loading All Alerts..." subtitle="Please wait while we fetch the alert data." center />
          </div>
        </Container>
      </ClientOnly>
    );
  }

  if (error && !alertsData) {
    return (
      <ClientOnly> <Container> <EmptyState title="Error Loading Alerts" subtitle={error} /> </Container> </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <Container>
        <div className="pt-10 pb-20">
          <Heading title="System-Wide Alerts" subtitle="Browse and filter all alerts from connected devices." />

          {/* Filter Section */}
          <form onSubmit={handleFilterSubmit} className="my-6 p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label htmlFor="deviceIdFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Device ID</label>
                <input
                  type="text"
                  id="deviceIdFilter"
                  value={filterDeviceId}
                  onChange={(e) => setFilterDeviceId(e.target.value)}
                  placeholder="e.g., CCMS001"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-neutral-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="levelFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Severity Level</label>
                <select
                  id="levelFilter"
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-neutral-700 dark:text-white"
                >
                  <option value="">All Levels</option>
                  {Object.values(AlertLevel).map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70" disabled={isLoading}>
                {isLoading ? 'Filtering...' : 'Apply Filters'}
              </button>
            </div>
          </form>

          {isLoading && <p className="text-center py-4">Loading alerts...</p>}
          {!isLoading && alertsData && alertsData.alerts.length === 0 && (
             <EmptyState title="No Alerts Found" subtitle="No alerts match your current filters, or no alerts have been recorded." />
          )}

          {!isLoading && alertsData && alertsData.alerts.length > 0 && (
            <>
              <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-neutral-700">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Device ID</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Level</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Message</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {alertsData.alerts.map((alert) => (
                      <tr key={alert.id} className={`${getAlertRowClass(alert.level)} transition-colors duration-150 ease-in-out`}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{new Date(alert.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                           <Link href={`/devices/${alert.device.id}`}>{alert.device.deviceId}</Link>
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${getAlertTextColor(alert.level)}`}>{alert.level}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 break-words max-w-xs truncate" title={alert.message}>{alert.message}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 truncate" title={alert.device.location?.address}>
                            {alert.device.location?.address || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex justify-between items-center">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Page {alertsData.currentPage} of {alertsData.totalPages} (Total: {alertsData.totalAlerts} alerts)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(alertsData.currentPage - 1)}
                    disabled={alertsData.currentPage <= 1 || isLoading}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-neutral-600 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(alertsData.currentPage + 1)}
                    disabled={alertsData.currentPage >= alertsData.totalPages || isLoading}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-neutral-600 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </Container>
    </ClientOnly>
  );
};

export default AllAlertsPage;
