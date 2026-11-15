import type { LonLat, ScienceObjective } from './types';
import { haversineM } from './mars-math';

export interface LocationPreset {
  id: string;
  name: string;
  tag: string;
  location: LonLat;
  elevationM: number;
  description: string;
}

export const START_PRESETS: LocationPreset[] = [
  {
    id: 'octavia-butler',
    name: 'Octavia E. Butler Landing (Perseverance Base)',
    tag: 'Primary Landing Base',
    location: { lon: 77.4509, lat: 18.4446 },
    elevationM: -2570,
    description: 'Touchdown site on flat basaltic floor of Jezero Crater.',
  },
  {
    id: 'nili-planum-outpost',
    name: 'Nili Planum Highlands Outpost',
    tag: 'Highland Station',
    location: { lon: 77.2000, lat: 18.5500 },
    elevationM: -2100,
    description: 'Elevated Noachian plateau rich in clay minerals.',
  },
  {
    id: 'jezero-central-camp',
    name: 'Jezero Crater Central Camp',
    tag: 'Basin Hab',
    location: { lon: 77.5800, lat: 18.3800 },
    elevationM: -2540,
    description: 'Deep impact basin floor near ancient paleolake center.',
  },
  {
    id: 'seitah-north-station',
    name: 'Séítah North Field Station',
    tag: 'Geology Station',
    location: { lon: 77.4200, lat: 18.4400 },
    elevationM: -2560,
    description: 'Edge of fractured igneous olivine-rich bedrock.',
  },
];

export const HAVEN_PRESETS: LocationPreset[] = [
  {
    id: 'delta-refuge',
    name: 'Western Delta Refuge Habitat',
    tag: 'Safe Haven Hab',
    location: { lon: 77.3820, lat: 18.4280 },
    elevationM: -2515,
    description: 'Pressurized biological research shelter at base of delta.',
  },
  {
    id: 'kodiak-shelter',
    name: 'Kodiak Mesa Emergency Shelter',
    tag: 'Emergency Cache',
    location: { lon: 77.3450, lat: 18.4120 },
    elevationM: -2480,
    description: 'Elevated shelter with solar charging and backup oxygen tanks.',
  },
  {
    id: 'perseverance-rendezvous',
    name: 'Perseverance Rover Mobile Haven',
    tag: 'Mobile Rover',
    location: { lon: 77.4100, lat: 18.4600 },
    elevationM: -2530,
    description: 'Autonomous rover with auxiliary oxygen recharge port.',
  },
  {
    id: 'neretva-cache',
    name: 'Neretva Fluvial Supply Cache',
    tag: 'Survival Cache',
    location: { lon: 77.2950, lat: 18.5150 },
    elevationM: -2390,
    description: 'Secured canyon mouth depot with survival medical supplies.',
  },
];

export const JEZERO_SCIENCE_TARGETS: ScienceObjective[] = [
  {
    id: 'jezero-delta-front',
    name: 'Jezero Western Delta Scarp Front',
    category: 'Deltaic Sediment',
    location: { lon: 77.382, lat: 18.428 },
    elevationM: -2515,
    mineralPotentialScore: 98,
    scientificSignificance:
      'Ancient fluvial delta deposit rich in smectite clays, iron/magnesium phyllosilicates, and fine-grained mudstones capable of preserving organic carbon and micro-fossils.',
    minerals: ['Fe/Mg Smectite Clay', 'Hydrated Silica', 'Detrital Carbonates', 'Sulfate Veins'],
    description:
      'Primary astrobiology target where ancient river waters decelerated into the Jezero paleolake ~3.7 billion years ago.',
  },
  {
    id: 'kodiak-butte',
    name: 'Kodiak Butte Isolated Mesa',
    category: 'Deltaic Sediment',
    location: { lon: 77.345, lat: 18.412 },
    elevationM: -2480,
    mineralPotentialScore: 89,
    scientificSignificance:
      'Erosional delta remnant revealing stepped topset and dipping foreset sedimentary beds, providing unambiguous evidence of a sustained ancient river lake.',
    minerals: ['Foreset Sandstone', 'Fluvial Conglomerates', 'Silica-Rich Silt'],
    description:
      'A solitary steep-sided mesa providing an intact cross-sectional window into the delta depositional timeline.',
  },
  {
    id: 'belva-crater',
    name: 'Belva Crater Rim Exposure',
    category: 'Crater Scarp',
    location: { lon: 77.362, lat: 18.498 },
    elevationM: -2610,
    mineralPotentialScore: 92,
    scientificSignificance:
      'Secondary impact excavation through the delta sequence, exposing deep hydrothermal conglomerates and massive metre-scale boulders transported by flood episodes.',
    minerals: ['Boulder Conglomerate', 'Clay-Bearing Clasts', 'Hydrothermal Quartz'],
    description:
      'A 1 km wide impact crater revealing subsurface delta stratigraphy without requiring drilling.',
  },
  {
    id: 'seitah-dunes',
    name: 'Séítah Southern Dune & Olivine Unit',
    category: 'Volcanic Floor',
    location: { lon: 77.435, lat: 18.41 },
    elevationM: -2580,
    mineralPotentialScore: 85,
    scientificSignificance:
      'Coarse-grained igneous cumulate rock composed predominantly of olivine and pyroxene crystals, representing some of the oldest bedrock in the Jezero basin.',
    minerals: ['Olivine Cumulate', 'Augite Pyroxene', 'Carbonate Cement'],
    description:
      'Layered igneous terrain interspersed with active aeolian sand dunes that present rover slip hazards.',
  },
  {
    id: 'neretva-vallis-inlet',
    name: 'Neretva Vallis Fluvial Canyon',
    category: 'Clay Mineral',
    location: { lon: 77.295, lat: 18.515 },
    elevationM: -2390,
    mineralPotentialScore: 94,
    scientificSignificance:
      'The primary catastrophic flood breach that carved through the western crater rim, washing highland bedrock from Nili Planum into Jezero.',
    minerals: ['Noachian Clay Clasts', 'Altered Basalt', 'Hydrated Salts'],
    description:
      'A grand canyon-like incision cutting through the ancient crater wall with accessible terrace levels.',
  },
  {
    id: 'marginal-carbonates',
    name: 'Marginal Carbonate Bathtub Ring',
    category: 'Carbonates',
    location: { lon: 77.485, lat: 18.52 },
    elevationM: -2490,
    mineralPotentialScore: 96,
    scientificSignificance:
      'Orbital CRISM detections show concentrated magnesium carbonate along the ancient lake shoreline. Carbonates on Earth often form via microbial stromatolite precipitation.',
    minerals: ['Magnesite', 'Dolomitic Carbonate', 'Chert Silicates'],
    description:
      'A shoreline terrace that once bounded the stable high-water mark of the ancient Jezero lake.',
  },
];

/**
 * Multi-criteria ranking function for scientific exploration sites.
 * Evaluates candidate destinations based on:
 * 1. Mineral Potential (35%)
 * 2. Proximity to Current Location (35%)
 * 3. Relative Elevation/Slope Accessibility (30%)
 */
export function rankScienceObjectives(
  startPoint: LonLat,
  targets: ScienceObjective[] = JEZERO_SCIENCE_TARGETS
): ScienceObjective[] {
  // First compute distances
  const scored = targets.map((target) => {
    const distM = haversineM(startPoint, target.location);
    // Normalized distance score: 100 at 0m, 0 at 25km
    const distScore = Math.max(0, 100 - (distM / 25000) * 100);

    // Approximate difficulty from elevation delta
    const elevDelta = Math.abs(target.elevationM - (-2570)); // Baseline landing elevation
    const slopeDifficulty = Math.min(100, (elevDelta / 200) * 80);

    // Composite Mission Success Score
    const compositeScore =
      target.mineralPotentialScore * 0.45 +
      distScore * 0.35 +
      (100 - slopeDifficulty) * 0.2;

    return {
      ...target,
      distanceFromStartM: distM,
      slopeDifficultyScore: Math.round(slopeDifficulty),
      missionSuccessScore: Math.round(compositeScore),
    };
  });

  // Sort descending by mission success score
  return scored.sort((a, b) => (b.missionSuccessScore ?? 0) - (a.missionSuccessScore ?? 0));
}
