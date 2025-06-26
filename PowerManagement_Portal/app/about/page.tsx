import { title, subtitle } from "@/components/primitives"; // Assuming subtitle might be useful

export default function AboutPage() {
  return (
    <section className="flex flex-col items-center justify-start gap-8 py-8 md:py-12 min-h-screen bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900 text-white">
      <div className="inline-block max-w-3xl text-center justify-center mt-16 px-6">
        <h1 className={title({ class: "from-teal-400 to-cyan-600 bg-clip-text text-transparent bg-gradient-to-r" })}>
          About the CCMS Portal
        </h1>
        <p className={subtitle({ class: "mt-6 text-slate-300 backdrop-blur-sm p-4 rounded-lg bg-white/5 leading-relaxed" })}>
          The Centralized Control and Monitoring System (CCMS) web portal is a robust, user-friendly platform
          designed for real-time management and monitoring of outdoor electrical panels. It is specifically
          tailored for three-phase, 20KW lighting and power distribution applications.
        </p>
      </div>

      <div className="max-w-4xl w-full px-6 mt-8 space-y-8">
        <div className="p-6 bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-xl">
          <h2 className="text-2xl font-semibold text-teal-300 mb-3">Our Mission</h2>
          <p className="text-slate-300 leading-relaxed">
            To empower municipal authorities, facility managers, and maintenance teams with a single, intuitive
            dashboard to oversee their entire electrical infrastructure. We focus on reliability, security,
            and scalability to enable data-driven decisions for energy management and cost optimization.
          </p>
        </div>

        <div className="p-6 bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-xl">
          <h2 className="text-2xl font-semibold text-cyan-300 mb-3">Core Features</h2>
          <ul className="list-disc list-inside text-slate-300 space-y-2 leading-relaxed">
            <li>At-a-glance dashboard: Total panels, status (ON/OFF/FAULT), operational lights.</li>
            <li>Real-time analytics: Power consumption, energy savings, load distribution.</li>
            <li>Dynamic map interface: Visualize geographic locations of CCMS panels.</li>
            <li>Detailed panel status: Three-phase voltage, current, power, power factor, historical trends, event logs.</li>
            <li>Advanced control: Remote ON/OFF, schedule programming, group control.</li>
            <li>Parameter adjustment: CT ratio, RTC time, function enabling/disabling.</li>
            <li>Dual communication (GPRS & LoRa RF): Ensuring connectivity in challenging environments.</li>
            <li>Robust backup functionality for uninterrupted operation.</li>
          </ul>
        </div>

        <div className="p-6 bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-xl">
          <h2 className="text-2xl font-semibold text-sky-300 mb-3">Security & Scalability</h2>
          <p className="text-slate-300 leading-relaxed">
            Security is paramount, featuring multi-level password protection, role-based access controls,
            and encrypted communication. All actions are logged for audit purposes. The portal also includes
            automated fault and network-off reporting.
          </p>
          <p className="text-slate-300 mt-3 leading-relaxed">
            Designed for scalability, the CCMS web portal can accommodate future expansion, additional device
            types, and evolving IoT standards. Its responsive design ensures seamless access from desktops,
            tablets, and mobile devices.
          </p>
        </div>
      </div>

      <div className="mt-12 text-center px-6">
        <p className="text-slate-400">
          An indispensable tool for modern smart city and industrial energy management.
        </p>
      </div>
    </section>
  );
}
