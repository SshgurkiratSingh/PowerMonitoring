import { Link } from "@heroui/link";
import { Button } from "@heroui/button"; // Using HeroUI Button
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card"; // Using HeroUI Card
import { siteConfig } from "@/config/site"; // Assuming siteConfig might still be useful for other links or info
import { title, subtitle } from "@/components/primitives";
// It's good practice to define icons that might be used, or import them if they are generic enough
// For now, let's assume some placeholder icons or simple text for features
// import { PowerIcon, ScheduleIcon, GroupIcon } from "@/components/icons"; // Example, if you have these

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-start gap-8 py-8 md:py-12 min-h-screen bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900 text-white">
      <div className="inline-block max-w-3xl text-center justify-center mt-16">
        <h1 className={title({ class: "from-sky-400 to-blue-600 bg-clip-text text-transparent bg-gradient-to-r" })}>
          Centralized Control & Monitoring System
        </h1>
        <p className={subtitle({ class: "mt-6 text-slate-300 backdrop-blur-sm p-2 rounded-md bg-white/5" })}>
          Real-time management and monitoring of outdoor electrical panels. Empowering you with advanced control features for smart energy management.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-5xl w-full px-6">
        {/* Feature Cards */}
        <Card className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 shadow-xl hover:shadow-sky-500/30 transition-shadow">
          <CardHeader className="flex gap-3 items-center">
            {/* <PowerIcon className="text-sky-400" size={32} /> */}
            <div className="flex flex-col">
              <p className="text-xl font-semibold text-sky-300">Remote Control</p>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-slate-300">
              Instantly switch your electrical panels ON or OFF from anywhere. Secure, reliable remote access to your infrastructure.
            </p>
          </CardBody>
          <CardFooter>
            <Button color="primary" variant="ghost" className="border-sky-500 text-sky-400 hover:bg-sky-500 hover:text-white transition-colors">
              Manage Remotely
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 shadow-xl hover:shadow-teal-500/30 transition-shadow">
          <CardHeader className="flex gap-3 items-center">
            {/* <ScheduleIcon className="text-teal-400" size={32} /> */}
            <div className="flex flex-col">
              <p className="text-xl font-semibold text-teal-300">Schedule Programming</p>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-slate-300">
              Easily set up and modify operating schedules for your lighting and power distribution systems. Optimize energy usage effortlessly.
            </p>
          </CardBody>
          <CardFooter>
            <Button color="secondary" variant="ghost" className="border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white transition-colors">
              Set Schedules
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 shadow-xl hover:shadow-indigo-500/30 transition-shadow">
          <CardHeader className="flex gap-3 items-center">
            {/* <GroupIcon className="text-indigo-400" size={32} /> */}
            <div className="flex flex-col">
              <p className="text-xl font-semibold text-indigo-300">Group Management</p>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-slate-300">
              Manage multiple CCMS panels as groups. Apply settings or schedules to entire zones with a single command.
            </p>
          </CardBody>
          <CardFooter>
            <Button color="default" variant="ghost" className="border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors">
              Manage Groups
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-16 text-center">
        <p className="text-slate-400">
          Leveraging dual communication (GPRS & LoRa RF) for unparalleled connectivity.
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Secure. Scalable. Smart.
        </p>
      </div>
    </section>
  );
}
