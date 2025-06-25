"use client";

import React from 'react';
import { Alert as PrismaAlert, AlertLevel } from '@prisma/client';

interface AlertHistoryProps {
  alerts: PrismaAlert[];
}

const AlertHistory: React.FC<AlertHistoryProps> = ({ alerts }) => {

  const getAlertRowClass = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.CRITICAL:
        return "bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800";
      case AlertLevel.WARNING:
        return "bg-yellow-100 dark:bg-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-700";
      case AlertLevel.INFO:
        return "bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800";
      default:
        return "bg-gray-50 dark:bg-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-600";
    }
  };

   const getAlertTextColor = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.CRITICAL:
        return "text-red-700 dark:text-red-300 font-semibold";
      case AlertLevel.WARNING:
        return "text-yellow-700 dark:text-yellow-300 font-semibold";
      case AlertLevel.INFO:
        return "text-blue-700 dark:text-blue-300";
      default:
        return "text-gray-600 dark:text-gray-300";
    }
  };


  if (!alerts || alerts.length === 0) {
    return (
      <div className="p-4 sm:p-6 bg-white dark:bg-neutral-800 shadow-lg rounded-lg">
        <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-2">Alert History</h3>
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">No historical alerts found for this device.</p>
      </div>
    );
  }

  // Sort alerts by date, newest first (though API already does this)
  const sortedAlerts = [...alerts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-neutral-800 shadow-lg rounded-lg">
      <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mb-4">Alert History</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-neutral-700">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Level</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Message</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedAlerts.map((alert) => (
              <tr key={alert.id} className={`${getAlertRowClass(alert.level)} transition-colors duration-150 ease-in-out`}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  {new Date(alert.createdAt).toLocaleString()}
                </td>
                <td className={`px-4 py-3 whitespace-nowrap text-sm ${getAlertTextColor(alert.level)}`}>
                  {alert.level}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 break-words">
                  {alert.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertHistory;
