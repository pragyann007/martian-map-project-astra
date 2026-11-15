import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mode, activeStrategy, astronaut, terrainType, startPoint, destinationPoint, routes } = body;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

    // Structured prompt grounded in factual telemetry data
    const prompt = `
You are the NASA EVA Flight Surgeon and Chief Science Officer for Mars Mission Astra (Jezero Crater, Mars).
Analyze the following real-time mathematical route telemetry calculated over ${terrainType}.

MISSION STATE:
- Mode: ${mode === 'survival' ? 'ASTRONAUT EMERGENCY SURVIVAL' : 'SCIENTIFIC EXPLORATION PLANNING'}
- Active Route Strategy: ${activeStrategy.toUpperCase()}
- Astronaut: ${astronaut.name}
- Suit Oxygen Remaining: ${astronaut.oxygenRemainingL} L (Capacity: ${astronaut.oxygenCapacityL} L)
- Suit Battery: ${astronaut.batteryRemainingPct}% (${astronaut.batteryCapacityWh} Wh)
- Emergency Suit Leak Status: ${astronaut.isEmergencyLeak ? `ACTIVE BREACH (${astronaut.leakRateLpm} L/min leak rate)` : 'NOMINAL (No leak)'}
- Coordinate Vector: From [${startPoint.lon.toFixed(4)}°E, ${startPoint.lat.toFixed(4)}°N] to [${destinationPoint.lon.toFixed(4)}°E, ${destinationPoint.lat.toFixed(4)}°N]

CALCULATED ROUTE COMPARISON (DETERMINISTIC DATA):
1. Euclidean Shortest Path:
   - Distance: ${routes.shortest?.distanceM} m | Duration: ${routes.shortest?.durationSec} s
   - Max Slope: ${routes.shortest?.maxSlopeDeg?.toFixed(1)}° | Critical Slope Segments: ${routes.shortest?.criticalSlopeSegments ?? 0}
   - Oxygen Required: ${routes.shortest?.oxygenConsumedL?.toFixed(1)} L
   - Survival Probability: ${((routes.shortest?.survivalProbability ?? 0) * 100).toFixed(0)}%

2. Terrain-Conscious Survival Path:
   - Distance: ${routes.survival?.distanceM} m | Duration: ${routes.survival?.durationSec} s
   - Max Slope: ${routes.survival?.maxSlopeDeg?.toFixed(1)}° | Critical Slope Segments: ${routes.survival?.criticalSlopeSegments ?? 0}
   - Oxygen Required: ${routes.survival?.oxygenConsumedL?.toFixed(1)} L
   - Survival Probability: ${((routes.survival?.survivalProbability ?? 0) * 100).toFixed(0)}%

3. Science-Focused Route:
   - Distance: ${routes.science?.distanceM} m | Duration: ${routes.science?.durationSec} s
   - Max Slope: ${routes.science?.maxSlopeDeg?.toFixed(1)}° | Survival Probability: ${((routes.science?.survivalProbability ?? 0) * 100).toFixed(0)}%

TASK:
Provide a concise, professional, mission-critical EVA Tactical Advisory (under 200 words) using Markdown bullet points:
1. Executive Decision: Clearly state which route the astronaut MUST take and why. Explain why the shortest Euclidean path is dangerous or fatal (e.g. climbing the delta scarp triggers hypoxia or rollover).
2. Consumable & Terrain Breakdown: Cite the exact numbers (oxygen margin remaining, slope degrees, and time).
3. Tactical Action Item: One direct operational directive for the astronaut on the ground.
Do NOT invent fake numbers; use only the provided telemetry.
`;

    if (apiKey) {
      const response = await generateText({
        model: google('gemini-2.5-flash'),
        prompt,
      });

      return NextResponse.json({ briefing: response.text });
    }

    // High-fidelity Flight Surgeon deterministic fallback if API key is not yet configured
    const s = routes[activeStrategy] || routes.survival;
    const shortest = routes.shortest;
    const isLeak = astronaut.isEmergencyLeak;
    const o2Margin = astronaut.oxygenRemainingL - (s?.oxygenConsumedL ?? 0);
    const shortestO2Margin = astronaut.oxygenRemainingL - (shortest?.oxygenConsumedL ?? 0);

    const fallbackBriefing = `### 🛰️ EVA FLIGHT SURGEON & SCIENCE OFFICER BRIEFING

**1. Tactical Decision: ${activeStrategy === 'survival' ? 'AFFIRMATIVE — PROCEED ON SURVIVAL PATH' : activeStrategy === 'shortest' ? '⚠️ CAUTION — ELEVATED RISK ON DIRECT TRANSECT' : 'PROCEED WITH SCIENCE TRANSECT'}**
* The **Euclidean Shortest Path** is ${shortest?.maxSlopeDeg > 20 ? 'FATAL' : 'HIGH RISK'}: it attempts to scale slopes up to **${shortest?.maxSlopeDeg?.toFixed(1)}°** across the delta scarp. ${shortestO2Margin <= 0 ? 'Oxygen will deplete before reaching the destination.' : 'High metabolic demand dangerously degrades suit reserves.'}
* The **Survival Route** adds ${((s?.distanceM - shortest?.distanceM) / 1000).toFixed(2)} km of detour, but stays on gentle natural grades (Max Slope: **${s?.maxSlopeDeg?.toFixed(1)}°**), reducing oxygen consumption to **${s?.oxygenConsumedL?.toFixed(1)} L**.

**2. Consumable Status & Margins**
* **Reserve Oxygen Margin:** **${o2Margin.toFixed(1)} L** remaining at destination (${((s?.survivalProbability ?? 0) * 100).toFixed(0)}% survival probability).
* **Suit Telemetry:** ${isLeak ? `Active pressure breach (-${astronaut.leakRateLpm} L/min). Transit duration of ${(s?.durationSec / 60).toFixed(0)} min is within critical hypoxia threshold.` : 'All life support systems nominal.'}

**3. Operational Directive**
* Maintain steady 1.0 m/s cadence along the designated waypoint contour. Avoid shortcuts across loose scree slopes.`;

    return NextResponse.json({ briefing: fallbackBriefing });
  } catch (error) {
    console.error('Error generating route briefing:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI explanation', details: String(error) },
      { status: 500 }
    );
  }
}
