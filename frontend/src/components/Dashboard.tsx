import React, { useEffect, useState } from "react";
import { RevenueSummary } from "./RevenueSummary";
import { SecureAPI } from "../lib/secureApi";

interface Property {
  id: string;
  name: string;
}

const Dashboard: React.FC = () => {
  // Properties come from the API so each tenant only sees its own
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesError, setPropertiesError] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');

  useEffect(() => {
    SecureAPI.getDashboardProperties()
      .then(({ properties }) => {
        setProperties(properties);
        if (properties.length > 0) setSelectedProperty(properties[0].id);
      })
      .catch((err) => {
        console.error(err);
        setPropertiesError('Failed to load properties');
      });
  }, []);
  // "YYYY-MM" from <input type="month">; empty means all time
  const [selectedMonth, setSelectedMonth] = useState('');
  const [year, month] = selectedMonth ? selectedMonth.split('-').map(Number) : [undefined, undefined];

  return (
    <div className="p-4 lg:p-6 min-h-full">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Property Management Dashboard</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h2 className="text-lg lg:text-xl font-medium text-gray-900 mb-2">Revenue Overview</h2>
                <p className="text-sm lg:text-base text-gray-600">
                  Monthly performance insights for your properties
                </p>
              </div>

              {/* Property Selector */}
              <div className="flex flex-col sm:items-end">
                <label className="text-xs font-medium text-gray-700 mb-1">Select Property</label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="block w-full sm:w-auto min-w-[200px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
                <label className="text-xs font-medium text-gray-700 mb-1 mt-3">Month</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="block w-full sm:w-auto min-w-[200px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                {!selectedMonth && <span className="text-xs text-gray-500 mt-1">Showing all time</span>}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {propertiesError && <div className="p-4 text-red-500 bg-red-50 rounded-lg">{propertiesError}</div>}
            {selectedProperty && <RevenueSummary propertyId={selectedProperty} month={month} year={year} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
