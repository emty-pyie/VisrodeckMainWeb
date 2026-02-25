import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative bg-black py-24">
        {/* HERO BOTTOM SPACER */}
<div className="h-24 bg-gradient-to-b from-transparent to-black"></div>




        {/* Background Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />

        {/* Radial Glow */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl opacity-30" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6 text-sm font-mono text-primary">
              Implementing Ideas — Engineering Systems
            </div>

            <h1 className="text-7xl font-bold mb-6 leading-tight tracking-tight">
              Building the future of<br />
              <span className="text-primary">Digital Systems</span>
            </h1>

            <p className="text-xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
              We design scalable platforms, intelligent automation tools, and secure
              digital infrastructure engineered for performance, control, and long-term evolution.
            </p>

            <div className="flex gap-4 flex-wrap">
              <Link
                to="/signup"
                className="px-8 py-4 bg-primary hover:bg-primary-dark text-black font-bold rounded-lg transition font-mono"
              >
                Get Started
              </Link>

              <a
                href="#products"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition font-mono"
              >
                Explore Ecosystem
              </a>
            </div>
          </div>
        </div>
      </section>
{/* TOP EVENTS / BANNERS */}
<section className="border-t border-white/5 bg-black py-16 sm:py-20">
  <div className="max-w-7xl mx-auto px-5 sm:px-6">

    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
      <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
        Latest <span className="text-primary">Announcements</span>
      </h2>

      <Link
        to="/news"
        className="text-sm font-mono text-gray-400 hover:text-white transition"
      >
        View All →
      </Link>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      {/* CARD */}
      <div className="group rounded-xl overflow-hidden border border-white/10 bg-gray-900">

        <div className="aspect-[16/9] overflow-hidden">
          <img
            src="YOUR_BANNER_IMAGE_1"
            alt="Relay Update"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        </div>

        <div className="p-5">
          <div className="text-xs font-mono text-primary mb-2">
            UPDATE
          </div>

          <h3 className="text-lg font-semibold mb-2">
            Relay Infrastructure Upgrade
          </h3>

          <p className="text-gray-400 text-sm leading-relaxed">
            Encryption and performance improvements deployed
            across messaging nodes.
          </p>
        </div>
      </div>

      {/* CARD 2 */}
      <div className="group rounded-xl overflow-hidden border border-white/10 bg-gray-900">
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src="YOUR_BANNER_IMAGE_2"
            alt="Jane Development"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        </div>

        <div className="p-5">
          <div className="text-xs font-mono text-emerald-400 mb-2">
            DEVELOPMENT
          </div>

          <h3 className="text-lg font-semibold mb-2">
            Visrodeck Runtime Enviroment
          </h3>

          <p className="text-gray-400 text-sm leading-relaxed">
            Core infrastructure layer development underway with modular service architecture.
          </p>
        </div>
      </div>

      {/* CARD 3 */}
      <div className="group rounded-xl overflow-hidden border border-white/10 bg-gray-900">
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src="YOUR_BANNER_IMAGE_3"
            alt="Ecosystem Roadmap"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        </div>

        <div className="p-5">
          <div className="text-xs font-mono text-purple-400 mb-2">
            UPDATE
          </div>

          <h3 className="text-lg font-semibold mb-2">
            Visrodeck Studio
          </h3>

          <p className="text-gray-400 text-sm leading-relaxed">
            Studio Passed Alpha testing and beta version rolling out soon
          </p>
        </div>
      </div>

    </div>
  </div>
</section>
      {/* PROJECTS SECTION */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* RELAY */}
          <ProjectCard
            title="Visrodeck Relay"
            badge="LIVE NOW"
            badgeStyle="bg-primary/10 text-primary border-primary/30"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-4z" />
              </svg>
            }
            description="End-to-end encrypted messaging powered by zero-knowledge architecture, anonymous device keys, and strict no-tracking principles."
            linkLabel="Launch Relay →"
            external="https://relay.visrodeck.com"
          />

          {/* JANE */}
          <ProjectCard
            title="Jane Assistant"
            badge="IN DEVLOPMENT"
            badgeStyle="bg-gray-700 text-gray-400 border-gray-600"
            icon={
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-12 h-12 text-emerald-400"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6h16v12H4zM8 10l3 2-3 2M13 14h3"
    />
  </svg>
}

            description="A local-first AI desktop assistant capable of executing system-level tasks with administrator control — engineered for automation and performance."
            linkLabel="Learn More →"
          />

          {/* LABS */}
          <ProjectCard
            title="Visrodeck Labs"
            badge="IN DEVELOPMENT"
            badgeStyle="bg-gray-700 text-gray-400 border-gray-600"
            icon={
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-12 h-12 text-purple-400"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 3h6M10 3v4l-5 9a3 3 0 003 4h8a3 3 0 003-4l-5-9V3"
    />
  </svg>
}

            description="A research-driven collaboration platform enabling real-time communication, structured discussions, file sharing, and repository integration."
            linkLabel="Request Early Access →"
          />

          {/* STUDIO */}
          <ProjectCard
            title="Visrodeck Studio"
            badge="TESTING"
            badgeStyle="bg-gray-700 text-gray-400 border-gray-600"
            icon={<div className="text-3xl font-mono text-blue-400">&lt;/&gt;</div>}
            description="A performance-focused code editor engineered for system-level development, privacy-first workflows, and native tooling integration."
            linkLabel="Learn More →"
          />

          {/* CORE */}
          <ProjectCard
            title="Visrodeck Runtime Enviroment"
            badge="CONCEPT"
            badgeStyle="bg-gray-700 text-gray-400 border-gray-600"
            icon={<div className="text-3xl text-orange-400">⚙</div>}
            description="A modular runtime environment providing core services for Visrodeck applications, including secure identity management, encrypted storage, and inter-process communication."
            linkLabel="View Architecture →"
          />

          {/* CLOUD */}
          <ProjectCard
            title="Visrodeck Cloud"
            badge="FUTURE"
            badgeStyle="bg-gray-700 text-gray-400 border-gray-600"
            icon={<div className="text-3xl text-cyan-400">☁</div>}
            description="Secure distributed infrastructure for hosting Visrodeck applications with encrypted storage and compute isolation."
            linkLabel="Coming Soon →"
          />

        </div>
      </section>

      {/* ECOSYSTEM DEEP SECTION */}
<section className="bg-black border-t border-white/5 py-32">
  <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">

    {/* TEXT SIDE */}
    <div>

      <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
        What Are We,
        <span className="text-primary"> Up to?</span>
      </h2>

      <p className="text-gray-400 text-lg leading-relaxed mb-8">
       Visrodeck Technology is building an integrated digital ecosystem designed to support secure communication, intelligent automation, and research driven development. Our goal is to create a structured platform where developers, researchers, and system builders can collaborate, experiment, and deploy scalable digital solutions within a unified architectural framework.
      </p>

      <p className="text-gray-400 text-lg leading-relaxed mb-8">
       Visrodeck Relay serves as our privacy first encrypted communication layer, implementing zero-trust principles and secure node infrastructure. Beyond secure messaging, the broader Visrodeck ecosystem is focused on enabling research environments, automation frameworks, and modular infrastructure  forming a cohesive technology stack engineered for performance, autonomy, and long-term evolution.
      </p>

      <p className="text-gray-400 text-lg leading-relaxed">
        Our roadmap includes distributed infrastructure layers,
        secure identity frameworks, privacy focused cloud services,
        and AI native development environments  forming a cohesive,
        sovereign technology stack under a unified architecture.
      </p>

    </div>

    {/* IMAGE SIDE */}
    <div className="relative">

      <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-3xl opacity-40"></div>

      <img
        src="https://cdn.discordapp.com/attachments/1373731317078032506/1473741043743850557/lewda.png?ex=69974fcd&is=6995fe4d&hm=06e763ff3215168591908d407b3f23f8b5c07b85f69f451a805d1d2c502fc59b"
        alt="Visrodeck ecosystem architecture diagram"
        className="relative rounded-3xl border border-white/10 shadow-2xl"
      />

    </div>

  </div>
</section>

<div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">

  {/* YOU */}
  <div className="border border-white/10 rounded-xl p-8 bg-gray-900/50 hover:border-primary/40 transition">

    <h3 className="text-xl font-bold mb-1">
      Kohlrausch Lazuli
    </h3>

    <p className="text-sm text-gray-400 mb-4">
      Founder / Systems Architect
    </p>

    <p className="text-sm text-primary font-mono mb-4">
      Infrastructure • Security • Architecture
    </p>

    <p className="text-gray-400 text-sm leading-relaxed">
      Architecting the Visrodeck ecosystem — focusing on privacy-first
      infrastructure, encryption systems, and long-term platform strategy.
    </p>

  </div>

  {/* RAJA */}
  <div className="border border-white/10 rounded-xl p-8 bg-gray-900/50 hover:border-primary/40 transition">

    <h3 className="text-xl font-bold mb-1">
      Bynatics 
    </h3>

    <p className="text-sm text-gray-400 mb-4">
      Co-Founder
    </p>

    <p className="text-sm text-emerald-400 font-mono mb-4">
      Product • Growth • Operations
    </p>

    <p className="text-gray-400 text-sm leading-relaxed">
      Driving product direction, operational execution, and strategic
      expansion of the Visrodeck technology ecosystem.
    </p>

  </div>

</div>



      {/* FOOTER */}
      <footer className="bg-black border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="font-mono text-xl font-bold mb-4">
                VISRODECK TECHNOLOGY
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Engineering scalable digital systems for secure communication,
                intelligent automation, and collaborative innovation.
              </p>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex justify-between items-center text-sm text-gray-500">
            <p>2026 Visrodeck Technology. All rights reserved.</p>
            <span className="font-mono">visrodeck.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


/* REUSABLE CARD COMPONENT */
function ProjectCard({ title, badge, badgeStyle, icon, description, linkLabel, external }) {
  return (
    <div className="bg-gray-800/50 border border-white/5 rounded-2xl p-8 hover:border-primary/40 transition group">
      <div className="mb-6">{icon}</div>

      <h3 className="text-2xl font-bold mb-4">{title}</h3>

      <div className={`inline-block px-3 py-1 rounded-full text-xs font-mono mb-4 border ${badgeStyle}`}>
        {badge}
      </div>

      <p className="text-gray-300 mb-6 leading-relaxed">{description}</p>

      {external ? (
        <a
          href={external}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-mono text-sm group-hover:underline"
        >
          {linkLabel}
        </a>
      ) : (
        <Link to="#" className="text-primary font-mono text-sm group-hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
