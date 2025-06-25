"use client";

import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Container from '@/app/components/container';
import Heading from '@/app/components/Heading';
import ClientOnly from '@/app/components/ClientOnly';
import Button from '@/app/components/Button'; // Assuming a generic Button component exists

const SampleDataPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeedData = async () => {
    setIsLoading(true);
    setMessage(null);
    setError(null);
    toast.loading('Attempting to add sample data to the database...', { id: 'seeding-toast' });

    try {
      const response = await axios.post('/api/seed-sample-data');
      setMessage(response.data.message || 'Sample data seeding process initiated successfully. Check application and server logs.');
      toast.success('Sample data seeding initiated!', { id: 'seeding-toast' });
    } catch (err: any) {
      console.error("Failed to seed sample data:", err);
      const errorMsg = err.response?.data?.error || err.message || 'An unknown error occurred while seeding data.';
      setError(errorMsg);
      toast.error(`Seeding failed: ${errorMsg}`, { id: 'seeding-toast' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClientOnly>
      <Container>
        <div className="max-w-2xl mx-auto py-10">
          <Heading
            title="Sample Data Management"
            subtitle="Use this page to populate the database with sample data for development and testing."
            center
          />

          <div className="mt-8 p-6 bg-white dark:bg-neutral-800 shadow-xl rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-4 text-neutral-700 dark:text-neutral-200">
              Add Predefined Sample Data Set
            </h2>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              Clicking the button below will add a predefined set of sample CCMS devices,
              along with associated telemetry records, alerts, and schedules.
              This is useful for populating a fresh database for demonstration or testing.
              If sample devices (e.g., CCMS-SAMPLE-001) already exist, they might be skipped or updated.
            </p>

            {/* Using a generic div styled as a button if Button component is too specific */}
            <button
              onClick={handleSeedData}
              disabled={isLoading}
              className="
                px-6 py-3
                bg-blue-600
                text-white
                font-semibold
                rounded-lg
                shadow-md
                hover:bg-blue-700
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:ring-opacity-75
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition ease-in-out duration-150
              "
            >
              {isLoading ? 'Seeding Data...' : 'Add Sample Data to Database'}
            </button>

            {message && (
              <div className="mt-6 p-3 bg-green-100 dark:bg-green-800/30 border border-green-300 dark:border-green-600 text-green-700 dark:text-green-200 rounded-md text-sm">
                {message}
              </div>
            )}
            {error && (
              <div className="mt-6 p-3 bg-red-100 dark:bg-red-800/30 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 rounded-md text-sm">
                Error: {error}
              </div>
            )}
            <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
              <p><strong>Note:</strong> This operation directly modifies the database.</p>
              <p>Ensure you are in a development or testing environment.</p>
              <p>The process might take a few moments to complete.</p>
            </div>
          </div>
        </div>
      </Container>
    </ClientOnly>
  );
};

export default SampleDataPage;
