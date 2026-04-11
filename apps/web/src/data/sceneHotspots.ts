export interface SceneHotspot {
  id: string;
  sceneId: string;
  x: number;
  y: number;
  label: string;
  brand: string;
  category: "furniture" | "lighting" | "surface" | "hardware" | "fixture" | "textile";
  specNote: string;
  targetUrl?: string;
}

/**
 * Scene hotspots linked to room scenes.
 * sceneId maps to a RoomJourney slug or a specific project slug.
 */
export const sceneHotspots: SceneHotspot[] = [
  {
    id: "sh-kitchen-1",
    sceneId: "kitchen",
    x: 40,
    y: 50,
    label: "Quartz Countertop",
    brand: "Caesarstone",
    category: "surface",
    specNote: "Arctic White, 20mm polished edge, integrated drainboard",
  },
  {
    id: "sh-kitchen-2",
    sceneId: "kitchen",
    x: 70,
    y: 35,
    label: "Pendant Lighting",
    brand: "Flos",
    category: "lighting",
    specNote: "IC Lights S1, brushed brass finish, dimmable",
  },
  {
    id: "sh-kitchen-3",
    sceneId: "kitchen",
    x: 55,
    y: 75,
    label: "Soft-Close Hinges",
    brand: "Häfele",
    category: "hardware",
    specNote: "Blumotion integrated, 110° opening angle",
  },
  {
    id: "sh-bedroom-1",
    sceneId: "bedroom",
    x: 45,
    y: 55,
    label: "Fluted Wall Paneling",
    brand: "Custom Millwork",
    category: "surface",
    specNote: "American Walnut, 12mm flutes, acoustic-backed",
  },
  {
    id: "sh-bedroom-2",
    sceneId: "bedroom",
    x: 65,
    y: 70,
    label: "Italian Marble Floor",
    brand: "Florim",
    category: "surface",
    specNote: "Magnum Oversize 120x260cm, Calacatta vein",
  },
  {
    id: "sh-living-1",
    sceneId: "living",
    x: 30,
    y: 60,
    label: "Modular Sofa",
    brand: "Natuzzi",
    category: "furniture",
    specNote: "L-shaped modular, brushed linen upholstery, reversible components",
  },
  {
    id: "sh-entry-1",
    sceneId: "entry",
    x: 50,
    y: 45,
    label: "Handle-less Push Cabinet",
    brand: "Blum",
    category: "hardware",
    specNote: "Servo-Drive electric, tip-on mechanical, white matte laminate",
  },
];
