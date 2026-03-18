"use client";

import { Galaxy } from "@react-bits/Galaxy-JS-CSS";

export default function GalaxyBackground() {
  return (
    <div className="w-full h-full">
      <Galaxy
        starSpeed={0.5}
        density={1}
        hueShift={140}
        speed={1}
        glowIntensity={0.3}
        saturation={0}
        mouseRepulsion
        repulsionStrength={2}
        twinkleIntensity={0.3}
        rotationSpeed={0.1}
        transparent
      />
    </div>
  );
}
