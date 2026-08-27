import React from "react";
import { Comparison } from "../components/landing/comparison";
import { Features } from "../components/landing/features";
import { HeroDownload } from "../components/landing/hero-download";
import { ScreenshotShowcase } from "../components/landing/screenshot-showcase";
import { Footer } from "../components/layout/footer";
import { Header } from "../components/layout/header";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090a0f] text-[#e1e7ec] font-mono flex flex-col selection:bg-[#00ff66] selection:text-black">
      <Header releaseTag="v0.0.1" />
      <section className="relative pt-24 pb-16 px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl text-white">
          The <span className="text-[#00ff66] text-glow-primary">Lightweight</span> Desktop Client for Docker
        </h1>
        <p className="mt-6 text-base sm:text-lg text-[#7b849b] max-w-2xl leading-relaxed">
          No cloud telemetry. No heavy Electron runtime. Just real-time kernel CPU metrics, live streaming logs, and instant container controls built with Go and Next.js.
        </p>
         <HeroDownload />
      </section>
       <ScreenshotShowcase />
      <Features />
      <Comparison />
      <Footer />
    </div>
  );
}
