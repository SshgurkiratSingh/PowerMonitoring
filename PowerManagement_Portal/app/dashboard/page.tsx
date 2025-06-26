import { Card } from "@heroui/card";
import { Button } from "@heroui/button";

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Devices</p>
              <h1 className="text-3xl font-bold">124</h1>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <div className="w-6 h-6 text-blue-500">⚡</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Online Devices</p>
              <h1 className="text-3xl font-bold">98</h1>
            </div>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Active Alerts</p>
              <h1 className="text-3xl font-bold">7</h1>
            </div>
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <div className="w-6 h-6 text-yellow-500">⚠️</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Power Consumption</p>
              <h1 className="text-3xl font-bold">1.2 MW</h1>
            </div>
            <div className="p-2 bg-red-500/20 rounded-lg">
              <div className="w-6 h-6 text-red-500">📊</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-lg border border-white/10">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button
              color="primary"
              variant="ghost"
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="text-2xl mb-2">🗺️</span>
              View Map
            </Button>
            <Button
              color="primary"
              variant="ghost"
              className="h-20 flex flex-col items-center justify-center"
            >
              <span className="text-2xl mb-2">📅</span>
              Schedules
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-lg border border-white/10">
          <h3 className="text-xl font-semibold mb-4">Recent Alerts</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <p className="text-gray-800">
                Voltage fluctuation detected in Device #45
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <p className="text-gray-800">
                Communication lost with Device #23
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Map Preview */}
      <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-lg border border-white/10">
        <h3 className="text-xl font-semibold mb-4">Device Locations</h3>
        <div className="h-[400px] bg-gray-800/50 rounded-lg flex items-center justify-center">
          <p className="text-gray-400">Interactive Map Loading...</p>
        </div>
      </Card>
    </div>
  );
}
