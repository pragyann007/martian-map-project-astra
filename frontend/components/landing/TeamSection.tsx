"use client";

import Image from "next/image";
import { Crown, Sparkles, Users, Compass } from "lucide-react";

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M6.94 8.5A1.56 1.56 0 1 1 6.93 5.4a1.56 1.56 0 0 1 .01 3.1ZM5.5 9.8h2.9v8.7H5.5V9.8Zm4.8 0h2.77v1.19h.04c.39-.73 1.33-1.5 2.74-1.5 2.93 0 3.47 1.93 3.47 4.43v6.58h-2.9v-6.16c0-1.47-.03-3.36-2.05-3.36s-2.36 1.6-2.36 3.26v6.26H10.3V9.8Z" />
    </svg>
  );
}

interface TeamMember {
  id: string;
  name: string;
  initials: string;
  image?: string;
  isOwner?: boolean;
  avatarGradient: string;
  ringColor: string;
  accentColor: string;
  linkedin: string;
  role: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "prince-timilsina",
    name: "Prince Timilsina",
    initials: "PT",
    image: "/assets/members/prince-timalsina.png",
    isOwner: true,
    avatarGradient: "from-[#E96A3D] via-[#C66B3D] to-[#8C3A16]",
    ringColor: "border-[#E96A3D] shadow-[0_0_25px_rgba(233,106,61,0.6)]",
    accentColor: "text-[#E9A16A]",
    linkedin: "https://www.linkedin.com/in/princetimilsina/",
    role: "PROJECT ASTRA // LEADER & DEVELOPER",
  },
  {
    id: "pragyan-thapaliya",
    name: "Pragyan Thapaliya",
    initials: "PT",
    image: "/assets/members/pragyan-thapaliya.jpg",
    avatarGradient: "from-[#2A3B50] via-[#1E293B] to-[#0F172A]",
    ringColor: "border-white/30 group-hover:border-[#E9A16A]/80 group-hover:shadow-[0_0_15px_rgba(233,161,106,0.35)]",
    accentColor: "text-white/80",
    linkedin: "https://www.linkedin.com/in/pragyann/",
    role: "PROJECT ASTRA // PRODUCT DEVELOPMENT",
  },
   {
    id: "rijan-maharjan",
    name: "Rijan Maharjan",
    initials: "RM",
    image: "/assets/members/rijan-maharjan.jpg",
    avatarGradient: "from-[#1A2E26] via-[#0E1C17] to-[#050C0A]",
    ringColor: "border-white/30 group-hover:border-[#E9A16A]/80 group-hover:shadow-[0_0_15px_rgba(233,161,106,0.35)]",
    accentColor: "text-white/80",
    linkedin: "https://www.linkedin.com/in/rijan-maharjan-862274331/",
    role: "PROJECT ASTRA // PRODUCT DEVELOPMENT",
  },
  {
    id: "prabhat-dhoj-tulachan",
    name: "Prabhat Dhoj Tulachan",
    initials: "PD",
    image: "/assets/members/prabhat.jpg",
    avatarGradient: "from-[#332211] via-[#1E1B18] to-[#0D0B0A]",
    ringColor: "border-white/30 group-hover:border-[#E96A3D]/80 group-hover:shadow-[0_0_15px_rgba(233,106,61,0.35)]",
    accentColor: "text-white/80",
    linkedin: "https://www.linkedin.com/in/prabhat-d-tulachan-0901b2307/",
    role: "PROJECT ASTRA // PRODUCT RESEARCH",
  },
  {
    id: "yug-pradhan",
    name: "Yug Pradhan",
    initials: "YP",
    image: "/assets/members/yug-pradhan.jpeg",
    avatarGradient: "from-[#1F2937] via-[#111827] to-[#030712]",
    ringColor: "border-white/30 group-hover:border-[#E9A16A]/80 group-hover:shadow-[0_0_15px_rgba(233,161,106,0.35)]",
    accentColor: "text-white/80",
    linkedin: "https://www.linkedin.com/in/yug-pradhan-273176321/",
    role: "PROJECT ASTRA // PRODUCT RESEARCH & DEVELOPMENT",
  },
  {
    id: "dripshak-bachhar",
    name: "Dripshak Bachhar",
    initials: "DB",
    image: "/assets/members/dripsak.jpg",
    avatarGradient: "from-[#2E1A47] via-[#1A102E] to-[#0B0614]",
    ringColor: "border-white/30 group-hover:border-[#E96A3D]/80 group-hover:shadow-[0_0_15px_rgba(233,106,61,0.35)]",
    accentColor: "text-white/80",
    linkedin: "https://www.linkedin.com/in/dripshak-bachhar-291498326/",
    role: "PROJECT ASTRA // PRODUCT RESEARCH",
  },
 
];

export function TeamSection() {
  return (
    <section
      id="team"
      className="relative w-full py-32 bg-transparent border-t border-white/20 text-[#E8E5DF]"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        {/* Section Tag with dividers */}
        <div className="w-full border-t border-white/30" />
        <div className="flex items-center justify-between py-4">
          <div className="text-xs uppercase tracking-[0.28em] text-[#E9A16A] font-semibold">
            05 // PROJECT ASTRA
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-[#E8E5DF]/70">
            TEAM CREW MANIFEST
          </div>
        </div>
        <div className="w-full border-b border-white/30" />

        {/* Section Title & Editorial Content */}
        <div className="pt-16 pb-14 max-w-4xl space-y-6">
          <div className="inline-flex items-center px-3 py-1 rounded-xs bg-[#E96A3D]/15 border border-[#E96A3D]/40 text-xs font-mono uppercase tracking-[0.2em] text-[#E9A16A]">
            <Users className="w-3.5 h-3.5 mr-2" />
            <span>INTERPLANETARY CREW // SIX MINDS</span>
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-black uppercase tracking-tight text-white leading-tight">
            Think beyond boundaries. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E96A3D] via-[#E9A16A] to-white">
              Build with PROJECT ASTRA.
            </span>
          </h2>

          <div className="space-y-4 text-base sm:text-lg text-[#E8E5DF] leading-relaxed max-w-3xl pt-2">
            <p className="text-white font-medium">
              PROJECT ASTRA is a team of curious minds passionate about space,
              science, technology, and innovation. We believe in exploring ideas,
              conducting research, experimenting with technology, and turning
              creativity into meaningful solutions.
            </p>
            <p className="text-sm sm:text-base text-[#E8E5DF]/80">
              We welcome developers, researchers, designers, science enthusiasts,
              and curious learners who enjoy problem-solving and collaboration.
            </p>
          </div>
        </div>

        {/* Desktop: Two-Column, Three-Row Grid (All 6 members 100% visible) | Mobile: Single-Column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 pb-16">
          {TEAM_MEMBERS.map((member) => {
            return (
              <div
                key={member.id}
                className={`member-card group relative p-6 sm:p-7 rounded-sm backdrop-blur-md border transition-all duration-300 flex items-center space-x-6 shadow-xl hover:-translate-y-1 ${
                  member.isOwner
                    ? "bg-[#090A0C]/95 border-[#E96A3D]/70 hover:border-[#E96A3D] shadow-[#E96A3D]/15"
                    : "bg-[#090A0C]/85 border-white/20 hover:border-[#E96A3D]/60 hover:bg-[#090A0C]/95"
                }`}
              >
                {/* Circular Profile Avatar */}
                <div className="relative shrink-0">
                  <div
                    className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 bg-gradient-to-br ${member.avatarGradient} ${member.ringColor} relative overflow-hidden transition-all duration-300 group-hover:scale-105 flex items-center justify-center`}
                  >
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 640px) 72px, 80px"
                      />
                    ) : (
                      <span className="text-xl sm:text-2xl font-heading font-black text-white tracking-widest drop-shadow-md">
                        {member.initials}
                      </span>
                    )}

                    {/* Subtle astronaut visor reflection overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-10" />
                  </div>

                  {/* Owner badge icon overlay on avatar */}
                  {member.isOwner && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#E96A3D] border border-white flex items-center justify-center text-white shadow-md z-20">
                      <Crown className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Member Info: Name displayed prominently */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  {member.isOwner && (
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold tracking-widest uppercase bg-[#E96A3D] text-white shadow-sm shadow-[#E96A3D]/40">
                        <Sparkles className="w-3 h-3 mr-1" />
                        TEAM OWNER
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-tight truncate group-hover:text-[#E9A16A] transition-colors">
                      {member.name}
                    </h3>

                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`LinkedIn profile for ${member.name}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-[#E9A16A] transition hover:border-[#E9A16A]/70 hover:bg-[#E9A16A]/10 hover:text-white"
                    >
                      <LinkedInIcon />
                    </a>
                  </div>

                  <div className="text-xs font-mono text-[#E8E5DF]/70 tracking-wider uppercase">
                    {member.role}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Suggested Closing Statement */}
        <div className="pt-8 pb-6 border-t border-white/20 text-center">
          <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-[0.25em] text-[#E9A16A] pb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>MISSION CREED</span>
          </div>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black uppercase tracking-tight text-white">
            Six minds. One mission. Infinite possibilities.
          </p>
        </div>
      </div>
    </section>
  );
}
