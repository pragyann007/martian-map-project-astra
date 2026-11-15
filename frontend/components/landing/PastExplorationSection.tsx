"use client";

import Image from "next/image";
import {
  ExternalLink,
  Radio,
  Compass,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Volume2,
  Wind,
  Cpu,
  Navigation as NavIcon,
  Shield,
  Gauge,
  Flame,
  CheckCircle2,
  Calendar,
} from "lucide-react";

interface TimelineItem {
  id: string;
  number: string;
  year: string;
  heading: string;
  spacecraft: string;
  agency: string;
  milestone: string;
  impact: string;
  image: string;
  icon: typeof Radio;
  telemetry: string;
  badge: string;
}

const HISTORICAL_TIMELINE: TimelineItem[] = [
  {
    id: "mariner-4",
    number: "01",
    year: "1964",
    heading: "The First Flyby — Mariner 4 (NASA)",
    spacecraft: "Mariner 4",
    agency: "NASA",
    milestone: "Captured the first close-up photographs of another planet.",
    impact:
      'Sent back 21 grainy images revealing a cratered, desert-like world rather than artificial "canals."',
    image: "/assets/missions/mariner-4.jpg",
    icon: Radio,
    telemetry: "Closest Approach: 9,846 km // 21 Telemetry Frames",
    badge: "FIRST PLANETARY FLYBY",
  },
  {
    id: "mariner-9-mars-3",
    number: "02",
    year: "1971",
    heading: "First Orbit & Soft Landing — Mariner 9 (NASA) & Mars 3 (USSR)",
    spacecraft: "Mariner 9 & Mars 3",
    agency: "NASA & USSR",
    milestone:
      "Mariner 9 became the first spacecraft to orbit Mars, mapping approximately 80% of its surface.",
    impact:
      "The Soviet Mars 3 achieved the first soft touchdown on Martian soil before losing contact after approximately 20 seconds.",
    image: "/assets/missions/mariner-9-mars-3.jpg",
    icon: NavIcon,
    telemetry: "7,329 Orbital Photos // First Planetary Soft Landing",
    badge: "FIRST ORBIT & TOUCHDOWN",
  },
  {
    id: "viking-1-2",
    number: "03",
    year: "1976",
    heading: "First Long-Term Surface Labs — Viking 1 & 2 (NASA)",
    spacecraft: "Viking 1 & 2",
    agency: "NASA",
    milestone:
      "The first successful landers to operate on Mars for extended periods.",
    impact:
      "Captured the first clear color panoramas from the surface and conducted biology experiments on Martian soil.",
    image: "/assets/missions/viking-1-2.jpg",
    icon: Activity,
    telemetry: "6+ Years Surface Ops // Biological Soil Gas Chromatograph",
    badge: "FIRST SURFACE LABORATORIES",
  },
  {
    id: "pathfinder-sojourner",
    number: "04",
    year: "1997",
    heading: "The First Wheeled Rover — Mars Pathfinder & Sojourner (NASA)",
    spacecraft: "Mars Pathfinder & Sojourner",
    agency: "NASA",
    milestone: "Deployed Sojourner, a microwave-sized, six-wheeled rover.",
    impact:
      "Demonstrated that mobile robots could navigate rocky Martian terrain and independently analyze rocks.",
    image: "/assets/missions/pathfinder-sojourner.jpg",
    icon: Compass,
    telemetry: "11.5 kg Mass // Alpha Proton X-Ray Spectrometer (APXS)",
    badge: "FIRST WHEELED ROBOTIC ROVER",
  },
  {
    id: "water-and-interior",
    number: "05",
    year: "2004–2018",
    heading: "Water & Deep Interior — Spirit, Opportunity, Phoenix & InSight (NASA)",
    spacecraft: "Spirit, Opportunity, Phoenix & InSight",
    agency: "NASA",
    milestone:
      "Spirit and Opportunity explored Mars for years, with Opportunity lasting over 14 years.",
    impact:
      "Their discoveries provided evidence of ancient liquid water. Phoenix uncovered subsurface water ice in 2008, while InSight studied the Martian interior and recorded more than 1,300 marsquakes.",
    image: "/assets/missions/water-and-interior.jpg",
    icon: Layers,
    telemetry: "14+ Yrs Traverse // SEIS Recorded 1,300+ Marsquakes",
    badge: "WATER EVIDENCE & SEISMOLOGY",
  },
];

interface PerseveranceFact {
  number: string;
  title: string;
  description: string;
  badge: string;
  icon: typeof Wind;
}

const PERSEVERANCE_FACTS: PerseveranceFact[] = [
  {
    number: "01",
    title: "First Off-World Flight",
    description:
      "Perseverance carried the Ingenuity helicopter, which completed 72 historic flights on Mars before retiring in 2024.",
    badge: "Aerospace Pioneer",
    icon: Wind,
  },
  {
    number: "02",
    title: "Making Oxygen on Mars",
    description:
      "Its MOXIE instrument successfully converted carbon dioxide from the thin Martian atmosphere into oxygen, demonstrating technology relevant to future human exploration.",
    badge: "ISRU Atmosphere",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "First Sounds of Mars",
    description:
      "Its microphones recorded Martian wind, rover-wheel sounds, and laser zaps.",
    badge: "Acoustic Telemetry",
    icon: Volume2,
  },
  {
    number: "04",
    title: "Rock-Vaporizing Laser",
    description:
      "Its SuperCam instrument uses a laser to analyze the chemical composition of distant rock targets.",
    badge: "Laser Spectroscopy",
    icon: Zap,
  },
  {
    number: "05",
    title: "Hidden Passengers",
    description:
      "The rover carries a microchip containing 10.9 million submitted names, alongside a meteorite fragment from Mars.",
    badge: "Payload Heritage",
    icon: Cpu,
  },
];

export function PastExplorationSection() {
  return (
    <section
      id="past-exploration"
      className="relative w-full py-32 bg-transparent border-t border-white/20 text-[#E8E5DF]"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        {/* Section Tag with clean dividers */}
        <div className="w-full border-t border-white/30" />
        <div className="flex items-center justify-between py-4">
          <div className="text-xs uppercase tracking-[0.28em] text-[#E9A16A] font-semibold">
            04 // PAST EXPLORATION
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-[#E8E5DF]/70">
            CHRONOLOGY & TELEMETRY
          </div>
        </div>
        <div className="w-full border-b border-white/30" />

        {/* Section Heading & Subtitle (Always 100% visible) */}
        <div className="pt-16 pb-16 max-w-4xl space-y-5">
          <div className="inline-flex items-center px-3 py-1 rounded-xs bg-[#E96A3D]/15 border border-[#E96A3D]/40 text-xs font-mono uppercase tracking-[0.2em] text-[#E9A16A]">
            <Calendar className="w-3.5 h-3.5 mr-2" />
            <span>HISTORICAL ARCHIVES // 1964 — PRESENT</span>
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-black uppercase tracking-tight text-white leading-[1.05]">
            Past Exploration: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E96A3D] via-[#E9A16A] to-white">
              Humanity&apos;s Journey to the Red Planet
            </span>
          </h2>
          <p className="text-base sm:text-xl text-[#E8E5DF] leading-relaxed max-w-3xl">
            From grainy 1960s flyby snapshots to nuclear-powered robotic
            geologists, explore the missions that unlocked the secrets of Mars.
          </p>
        </div>

        {/* =========================================================================
            PART 1 — HISTORICAL TIMELINE (1964–2018)
           ========================================================================= */}
        <div className="pt-4 pb-20">
          <div className="flex items-center space-x-3 pb-8 text-xs font-heading font-semibold uppercase tracking-[0.2em] text-[#E9A16A]">
            <Compass className="w-4 h-4 text-[#E96A3D]" />
            <span>PART 1 — HISTORICAL TIMELINE (1964–2018)</span>
          </div>

          <div className="relative">
            {/* Continuous Vertical Connecting Line */}
            <div className="hidden md:block absolute left-[31px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-[#E96A3D] via-[#E9A16A]/50 to-[#C66B3D]/30 z-0" />

            <div className="space-y-8 relative z-10">
              {HISTORICAL_TIMELINE.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="timeline-card group relative grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 rounded-sm bg-[#090A0C]/90 backdrop-blur-md border border-white/20 hover:border-[#E96A3D]/80 transition-all duration-300 shadow-2xl hover:shadow-[#E96A3D]/10"
                  >
                    {/* Left node & prominent date column */}
                    <div className="md:col-span-3 flex md:flex-col items-center md:items-start justify-between md:justify-start gap-4 border-b md:border-b-0 md:border-r border-white/15 pb-4 md:pb-0 md:pr-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-sm bg-white/5 border border-white/25 flex items-center justify-center text-[#E9A16A] group-hover:bg-[#E96A3D]/20 group-hover:border-[#E96A3D] transition-colors shrink-0">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-[11px] font-mono text-[#E9A16A] uppercase tracking-wider font-semibold">
                            MILESTONE {item.number}
                          </div>
                          <div className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
                            {item.year}
                          </div>
                        </div>
                      </div>

                      <div className="inline-flex items-center px-2.5 py-1 rounded-xs text-[10px] uppercase font-mono tracking-wider bg-white/5 text-[#E9A16A] border border-white/15 font-semibold">
                        {item.agency}
                      </div>
                    </div>

                    {/* Right content column */}
                    <div className="md:col-span-9 space-y-4">
                      <div>
                        <div className="text-xs uppercase font-mono tracking-widest text-[#E9A16A] font-semibold">
                          {item.badge}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-tight pt-1">
                          {item.heading}
                        </h3>
                      </div>

                      {/* Content + Archival Mission Photograph Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                        {/* Text columns: Milestone and Scientific impact */}
                        <div className="lg:col-span-7 space-y-3 flex flex-col justify-between">
                          {/* Milestone details */}
                          <div className="p-4 rounded-sm bg-white/[0.04] border border-white/10 space-y-1">
                            <div className="text-[11px] font-mono uppercase tracking-wider text-[#E9A16A] font-bold flex items-center space-x-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#E96A3D]" />
                              <span>Mission Milestone:</span>
                            </div>
                            <p className="text-white font-medium pl-5 text-sm sm:text-base leading-relaxed">
                              {item.milestone}
                            </p>
                          </div>

                          {/* Scientific impact details */}
                          <div className="p-4 rounded-sm bg-white/[0.04] border border-white/10 space-y-1">
                            <div className="text-[11px] font-mono uppercase tracking-wider text-[#E8E5DF]/80 font-bold flex items-center space-x-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#E9A16A]" />
                              <span>Scientific Impact:</span>
                            </div>
                            <p className="text-[#E8E5DF] pl-5 text-sm sm:text-base leading-relaxed">
                              {item.impact}
                            </p>
                          </div>
                        </div>

                        {/* Mission Archival Image Showcase */}
                        <div className="lg:col-span-5 relative min-h-[190px] sm:min-h-[210px] rounded-sm border border-white/20 hover:border-[#E96A3D]/70 overflow-hidden bg-black/60 shadow-lg group/img transition-all duration-300">
                          <Image
                            src={item.image}
                            alt={item.heading}
                            fill
                            className="object-cover object-center group-hover/img:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 35vw, 320px"
                          />
                          {/* Archival dark gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                          {/* Archival tag badge */}
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-xs bg-black/80 border border-white/20 text-[9px] font-mono uppercase tracking-widest text-[#E9A16A]">
                            ARCHIVAL
                          </div>

                          {/* Bottom caption with spacecraft name */}
                          <div className="absolute bottom-2.5 left-3 right-3 text-[11px] font-mono text-white font-medium truncate drop-shadow-md">
                            {item.spacecraft}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 text-[11px] font-mono text-[#E8E5DF]/70 uppercase tracking-widest flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E96A3D] animate-pulse" />
                        <span>{item.telemetry}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================================
            PART 2 — FEATURE SPOTLIGHT: PERSEVERANCE ROVER
           ========================================================================= */}
        <div className="pt-8 pb-20">
          <div className="p-8 sm:p-12 rounded-sm bg-[#090A0C]/95 backdrop-blur-md border border-[#E96A3D]/50 shadow-2xl relative overflow-hidden space-y-10">
            {/* Background telemetry accents */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-[#E96A3D]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="space-y-4 border-b border-white/15 pb-8 relative z-10">
              <div className="inline-flex items-center px-3 py-1 rounded-xs bg-[#E96A3D]/15 border border-[#E96A3D]/40 text-xs font-mono uppercase tracking-[0.2em] text-[#E9A16A]">
                <Flame className="w-3.5 h-3.5 mr-2" />
                <span>PART 2 — FEATURE SPOTLIGHT</span>
              </div>
              <h3 className="text-3xl sm:text-5xl font-heading font-black uppercase tracking-tight text-white leading-tight">
                MEET PERSEVERANCE — THE NEXT CHAPTER OF MARTIAN EXPLORATION
              </h3>
            </div>

            {/* Two-column layout on desktop, stacked on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative z-10">
              {/* Mission Narrative (7 cols) */}
              <div className="lg:col-span-7 space-y-6 text-sm sm:text-base text-[#E8E5DF] leading-relaxed">
                <p className="text-base sm:text-lg text-white font-medium">
                  Landing on February 18, 2021, Perseverance is one of the most
                  advanced robotic astrobiologists ever sent to Mars.
                </p>
                <p>
                  Exploring Jezero Crater, an ancient river delta and lakebed,
                  its primary mission is to search for signs of ancient microbial
                  life and collect core samples for possible future return to
                  Earth.
                </p>

                {/* Rover Scientific Instruments schematic diagram */}
                <div className="p-5 rounded-sm bg-black/50 border border-white/15 space-y-3">
                  <div className="text-xs uppercase font-mono tracking-widest text-[#E9A16A] font-semibold flex items-center justify-between">
                    <span>Active Science Suite Instrumentation</span>
                    <span className="text-[10px] text-white/50">NASA / JPL-CALTECH</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs font-mono">
                    <div className="p-2.5 rounded bg-white/5 border border-white/10">
                      <div className="text-white font-bold">Mastcam-Z</div>
                      <div className="text-[10px] text-[#E8E5DF]/70">Stereoscopic Zoom</div>
                    </div>
                    <div className="p-2.5 rounded bg-white/5 border border-white/10">
                      <div className="text-white font-bold">SuperCam</div>
                      <div className="text-[10px] text-[#E8E5DF]/70">Laser Chemistry</div>
                    </div>
                    <div className="p-2.5 rounded bg-white/5 border border-white/10">
                      <div className="text-white font-bold">PIXL & SHERLOC</div>
                      <div className="text-[10px] text-[#E8E5DF]/70">Microbial Organics</div>
                    </div>
                    <div className="p-2.5 rounded bg-white/5 border border-white/10">
                      <div className="text-white font-bold">MOXIE</div>
                      <div className="text-[10px] text-[#E8E5DF]/70">Oxygen Generator</div>
                    </div>
                    <div className="p-2.5 rounded bg-white/5 border border-white/10">
                      <div className="text-white font-bold">RIMFAX</div>
                      <div className="text-[10px] text-[#E8E5DF]/70">Subsurface Radar</div>
                    </div>
                    <div className="p-2.5 rounded bg-white/5 border border-white/10">
                      <div className="text-white font-bold">MEDA</div>
                      <div className="text-[10px] text-[#E8E5DF]/70">Atmosphere Sensors</div>
                    </div>
                  </div>
                </div>

                {/* NASA Live Location Map Button */}
                <div className="pt-2">
                  <a
                    href="https://mars.nasa.gov/mars2020/mission/where-is-the-rover/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center space-x-3 px-7 py-3.5 rounded-sm bg-[#E96A3D] hover:bg-[#d8582c] text-white font-heading font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#E96A3D]/25 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <span>TRACK LIVE ROVER LOCATION (NASA)</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Quick Stats & Status Cards (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[#E9A16A] font-semibold pb-2 border-b border-white/20">
                  Quick Stats & Mission Records
                </div>

                {/* Card 1: Current Location */}
                <div className="p-5 rounded-sm bg-white/5 border border-white/20 hover:border-[#E96A3D]/70 transition-colors space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#E9A16A] uppercase tracking-wider">
                    <span className="flex items-center space-x-1.5">
                      <NavIcon className="w-3.5 h-3.5" />
                      <span>Current Location</span>
                    </span>
                    <span className="text-[#E8E5DF]/70">Jezero Western Rim</span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    Western rim of Jezero Crater, investigating ancient rocks in the Lac de Charmes region.
                  </p>
                </div>

                {/* Card 2: Distance Record */}
                <div className="p-5 rounded-sm bg-white/5 border border-white/20 hover:border-[#E96A3D]/70 transition-colors space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#E9A16A] uppercase tracking-wider">
                    <span className="flex items-center space-x-1.5">
                      <Gauge className="w-3.5 h-3.5" />
                      <span>All-Time Driving Record</span>
                    </span>
                    <span className="text-[#E9A16A] font-bold">28.12 mi (45.25 km)</span>
                  </div>
                  <p className="text-sm text-[#E8E5DF]">
                    Traveled over 28.12 miles (45.25 km), breaking Opportunity&apos;s all-time off-world driving record in October 2026.
                  </p>
                </div>

                {/* Card 3: Size & Power */}
                <div className="p-5 rounded-sm bg-white/5 border border-white/20 hover:border-[#E96A3D]/70 transition-colors space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#E9A16A] uppercase tracking-wider">
                    <span className="flex items-center space-x-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Size & Power Architecture</span>
                    </span>
                    <span className="text-[#E8E5DF]/70">MMRTG Nuclear</span>
                  </div>
                  <p className="text-sm text-[#E8E5DF]">
                    Approximately SUV-sized, 10 feet long, weighing around 2,260 lbs, powered by a plutonium-238 radioisotope power system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            PART 3 — FIVE THINGS THAT MAKE PERSEVERANCE EXTRAORDINARY
           ========================================================================= */}
        <div className="pt-4 pb-12">
          <div className="pb-8 space-y-2">
            <div className="text-xs uppercase tracking-[0.25em] text-[#E9A16A] font-semibold">
              PART 3 — ENGINEERING & SCIENTIFIC MILESTONES
            </div>
            <h3 className="text-2xl sm:text-4xl font-heading font-black uppercase tracking-tight text-white">
              FIVE THINGS THAT MAKE PERSEVERANCE EXTRAORDINARY
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PERSEVERANCE_FACTS.map((fact) => {
              const Icon = fact.icon;
              return (
                <div
                  key={fact.number}
                  className="fact-card group p-6 sm:p-7 rounded-sm bg-[#090A0C]/90 backdrop-blur-md border border-white/20 hover:border-[#E96A3D] transition-all duration-300 shadow-xl hover:-translate-y-1 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/15">
                      <span className="text-xl font-bold font-mono text-[#E9A16A]">
                        {fact.number}
                      </span>
                      <div className="w-9 h-9 rounded-sm bg-white/5 border border-white/20 flex items-center justify-center text-[#E9A16A] group-hover:bg-[#E96A3D]/20 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[#E9A16A]">
                        {fact.badge}
                      </div>
                      <h4 className="text-lg font-heading font-bold text-white group-hover:text-[#E9A16A] transition-colors">
                        {fact.title}
                      </h4>
                    </div>

                    <p className="text-xs sm:text-sm text-[#E8E5DF] leading-relaxed">
                      {fact.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 text-[10px] font-mono text-[#E8E5DF]/60 uppercase tracking-widest">
                    Mars 2020 Mission Telemetry
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
