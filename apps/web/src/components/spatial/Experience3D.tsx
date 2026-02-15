
import React, { useRef, useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, PerspectiveCamera, Stars, Float, Text, MeshReflectorMaterial, MeshTransmissionMaterial, ContactShadows, SoftShadows, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Moon, Sun, ShieldCheck, Zap, Activity, ArrowRight } from "lucide-react";

// --- Types ---
type StyleType = "minimalist" | "luxury" | "boho";

interface BIMData {
    material: string;
    provenance: string;
    sustainability: string;
    description: string;
}

const STYLES_BIM: Record<StyleType, BIMData> = {
    minimalist: {
        material: "Honed Bianco Carrara Marble",
        provenance: "Carrara, Italy",
        sustainability: "Zero-VOC Sealing, Recycled Substrate",
        description: "A sanctuary of clinical precision and ethereal light."
    },
    luxury: {
        material: "Liquid Gold Leaf & Hand-Polished Brass",
        provenance: "Burlington Arcade Artisans, London",
        sustainability: "Ethically Sourced Precious Metals",
        description: "The unapologetic architecture of dominance and legacy."
    },
    boho: {
        material: "Reclaimed Teak & Organic Hemp Fiber",
        provenance: "Ubud, Bali",
        sustainability: "100% Carbon Neutral Production",
        description: "A biologically rewarding environment of tactile warmth."
    }
};

interface StyleObjectProps {
    position: [number, number, number];
    type: StyleType;
    onHover: (type: StyleType | null) => void;
    isActive: boolean;
}

// --- Components ---

const MinimalistObject = ({ position, onHover, isActive }: StyleObjectProps) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        const scale = isActive ? 1.4 : 1;
        meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    });

    return (
        <Float floatIntensity={2} rotationIntensity={1}>
            <mesh
                ref={meshRef}
                position={position}
                onPointerOver={() => onHover("minimalist")}
                onPointerOut={() => onHover(null)}
                castShadow
            >
                <boxGeometry args={[1.5, 1.5, 1.5]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    roughness={0.05}
                    metalness={0.05}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    transmission={0.3}
                    thickness={0.5}
                />
            </mesh>
            <Text
                position={[position[0], position[1] - 2, position[2]]}
                fontSize={0.2}
                color="white"
                anchorX="center"
                anchorY="middle"
                maxWidth={2}
                textAlign="center"
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
            >
                MINIMALIST PRECISION
            </Text>
        </Float>
    );
};

const LuxuryObject = ({ position, onHover, isActive }: StyleObjectProps) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.y -= 0.02;
        const scale = isActive ? 1.5 : 1;
        meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    });

    return (
        <Float floatIntensity={1.5} rotationIntensity={0.5}>
            <mesh
                ref={meshRef}
                position={position}
                onPointerOver={() => onHover("luxury")}
                onPointerOut={() => onHover(null)}
                castShadow
            >
                <octahedronGeometry args={[1.2, 0]} />
                <MeshTransmissionMaterial
                    backside
                    samples={16}
                    resolution={512}
                    thickness={0.8}
                    roughness={0}
                    anisotropy={1}
                    chromaticAberration={0.2}
                    color="#ffd700"
                />
            </mesh>
            <Text
                position={[position[0], position[1] - 2, position[2]]}
                fontSize={0.2}
                color="#ffd700"
                anchorX="center"
                anchorY="middle"
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
            >
                UHNWI LEGACY
            </Text>
        </Float>
    );
};

const BohoObject = ({ position, onHover, isActive }: StyleObjectProps) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.z += 0.01;
        const scale = isActive ? 1.4 : 1;
        meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    });

    return (
        <Float floatIntensity={3} rotationIntensity={2}>
            <mesh
                ref={meshRef}
                position={position}
                onPointerOver={() => onHover("boho")}
                onPointerOut={() => onHover(null)}
                castShadow
            >
                <torusKnotGeometry args={[0.8, 0.3, 128, 32]} />
                <meshStandardMaterial
                    color="#dba159"
                    roughness={0.9}
                    metalness={0.1}
                />
            </mesh>
            <Text
                position={[position[0], position[1] - 2, position[2]]}
                fontSize={0.2}
                color="#dba159"
                anchorX="center"
                anchorY="middle"
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
            >
                BIOPHILIC TEXTURE
            </Text>
        </Float>
    );
};

function Scene({ onStyleUpdate, time }: { onStyleUpdate: (style: StyleType | null) => void, time: number }) {
    const [activeStyle, setActiveStyle] = useState<StyleType | null>(null);

    // Silent Profiling Logic
    useEffect(() => {
        let interval: any;
        if (activeStyle) {
            interval = setInterval(() => {
                onStyleUpdate(activeStyle);
            }, 500);
        }
        return () => clearInterval(interval);
    }, [activeStyle, onStyleUpdate]);

    const handleHover = (type: StyleType | null) => {
        setActiveStyle(type);
        onStyleUpdate(type);
    };

    // Derived lighting based on circadian cycle
    const lightIntensity = Math.max(0.1, Math.sin((time / 24) * Math.PI) * 1.5);
    const sunColor = new THREE.Color().setHSL(0.1, 0.8, lightIntensity > 1 ? 0.9 : 0.6);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
            <Environment preset={time > 6 && time < 18 ? "city" : "night"} />

            <ambientLight intensity={lightIntensity * 0.2} />
            <directionalLight
                position={[10, 10, 5]}
                intensity={lightIntensity}
                color={sunColor}
                castShadow
                shadow-mapSize={[1024, 1024]}
            />

            {/* Objects */}
            <group position={[-3.5, 0, 0]}>
                <MinimalistObject position={[0, 0, 0]} type="minimalist" onHover={handleHover} isActive={activeStyle === "minimalist"} />
            </group>

            <group position={[0, 0.5, 0]}>
                <LuxuryObject position={[0, 0, 0]} type="luxury" onHover={handleHover} isActive={activeStyle === "luxury"} />
            </group>

            <group position={[3.5, 0, 0]}>
                <BohoObject position={[0, 0, 0]} type="boho" onHover={handleHover} isActive={activeStyle === "boho"} />
            </group>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
                <planeGeometry args={[50, 50]} />
                <MeshReflectorMaterial
                    blur={[400, 100]}
                    resolution={1024}
                    mixBlur={1}
                    mixStrength={50}
                    roughness={1}
                    depthScale={1.2}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color="#050505"
                    metalness={0.5}
                />
            </mesh>

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </>
    );
}

// --- Main Export ---
export const Experience3D = () => {
    const [scores, setScores] = useState<Record<StyleType, number>>({
        minimalist: 0,
        luxury: 0,
        boho: 0,
    });
    const [activeHover, setActiveHover] = useState<StyleType | null>(null);
    const [time, setTime] = useState(12); // Default to Noon

    const handleStyleUpdate = useCallback((style: StyleType | null) => {
        setActiveHover(style);
        if (style) {
            setScores((prev) => ({
                ...prev,
                [style]: prev[style] + 1,
            }));
        }
    }, []);

    const dominantStyle = useMemo(() => {
        const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
        const max = sorted[0];
        return max[1] > 10 ? (max[0] as StyleType) : null;
    }, [scores]);

    return (
        <div className="relative w-full h-full bg-black font-sans selection:bg-white/20">
            <Canvas shadows dpr={[1, 2]}>
                <Suspense fallback={
                    <Html center>
                        <div className="flex flex-col items-center gap-4 w-64 justify-center text-center">
                            <div className="w-12 h-[1px] bg-white/40 animate-pulse" />
                            <p className="text-[10px] text-white/60 uppercase tracking-[0.5em]">Synthesizing Environment</p>
                        </div>
                    </Html>
                }>
                    <Scene onStyleUpdate={handleStyleUpdate} time={time} />
                </Suspense>
            </Canvas>

            {/* --- Profiling HUD (Glassmorphism) --- */}
            <div className="absolute top-8 left-8 p-8 max-w-sm rounded-[2rem] border border-white/5 bg-black/40 backdrop-blur-2xl pointer-events-none">
                <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-4 h-4 text-white/60 animate-pulse" />
                    <h3 className="text-white/40 text-[10px] tracking-[0.4em] uppercase font-medium">
                        Neuroaesthetic Profiling
                    </h3>
                </div>

                <div className="space-y-5">
                    {(Object.keys(scores) as StyleType[]).map((style) => (
                        <div key={style} className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className={`text-[10px] uppercase tracking-widest transition-colors duration-500 ${activeHover === style ? 'text-white' : 'text-white/20'}`}>
                                    {style}
                                </span>
                                <span className="text-[10px] text-white/10 tabular-nums">
                                    {Math.floor(Math.min((scores[style] / 50) * 100, 100))}%
                                </span>
                            </div>
                            <div className="w-48 h-[2px] bg-white/5 overflow-hidden">
                                <motion.div
                                    className="h-full bg-white"
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${Math.min((scores[style] / 50) * 100, 100)}%`,
                                        opacity: activeHover === style ? 1 : 0.3
                                    }}
                                    transition={{ duration: 1, ease: "circOut" }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-5 h-5 rounded-full border border-black bg-white/10" />
                        ))}
                    </div>
                    <p className="text-[9px] text-white/30 uppercase tracking-tighter">
                        Live Behavioral Stream Active
                    </p>
                </div>
            </div>

            {/* --- Circadian Controls --- */}
            <div className="absolute top-8 right-8 flex flex-col items-center gap-4">
                <div className="p-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl flex flex-col gap-4">
                    <button
                        onClick={() => setTime(prev => (prev + 1) % 24)}
                        className="p-3 hover:bg-white/10 rounded-full transition-colors group relative"
                    >
                        {time > 6 && time < 18 ? <Sun className="w-4 h-4 text-white/50" /> : <Moon className="w-4 h-4 text-white/50" />}
                        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black/80 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/5">
                            {time}:00 - Circadian Shift
                        </span>
                    </button>
                    <button className="p-3 hover:bg-white/10 rounded-full transition-colors group relative">
                        <Zap className="w-4 h-4 text-white/50" />
                        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black/80 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/5">
                            Pixel Streaming Optimized
                        </span>
                    </button>
                </div>
            </div>

            {/* --- BIM / Style Metadata Panel --- */}
            <AnimatePresence>
                {activeHover && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute bottom-12 right-12 p-10 max-w-md rounded-[2.5rem] border border-white/10 bg-black/60 backdrop-blur-3xl"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <ShieldCheck className="w-5 h-5 text-white/80" />
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium">BIM TECHNICAL SPEC</p>
                                <h4 className="text-xl font-display font-light text-white uppercase tracking-widest">{activeHover}</h4>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[9px] text-white/20 uppercase tracking-widest mb-1">Material</p>
                                    <p className="text-xs text-white/80 font-light leading-relaxed">{STYLES_BIM[activeHover].material}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-white/20 uppercase tracking-widest mb-1">Provenance</p>
                                    <p className="text-xs text-white/80 font-light leading-relaxed">{STYLES_BIM[activeHover].provenance}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[9px] text-white/20 uppercase tracking-widest mb-1">Sustainability Index</p>
                                <p className="text-xs text-white/80 font-light leading-relaxed">{STYLES_BIM[activeHover].sustainability}</p>
                            </div>
                            <p className="text-xs text-white/40 italic font-light leading-loose pt-4 border-t border-white/5">
                                "{STYLES_BIM[activeHover].description}"
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Detected Identity Indicator */}
            {dominantStyle && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute bottom-12 left-12 space-y-6"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-[1px] h-12 bg-gradient-to-t from-white/40 to-transparent" />
                        <div>
                            <p className="text-white/20 text-[10px] tracking-[0.3em] uppercase mb-1">Identified Vibe</p>
                            <h2 className="text-3xl text-white font-display font-light uppercase tracking-[0.3em]">
                                {dominantStyle}
                            </h2>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    >
                        Request Bespoke Proposal
                        <ArrowRight className="w-3 h-3" />
                    </motion.button>
                </motion.div>
            )}

            {/* AI Calibration Indicator */}
            <AnimatePresence>
                {activeHover && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-8 h-8 rounded-full border border-white/20 border-t-white animate-spin" />
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-medium animate-pulse">
                                Intent Calibration Active
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Audio Signal */}
            <div className="absolute bottom-8 right-8">
                <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
                    <div className="flex gap-[2px]">
                        {[0, 1, 2, 3].map(i => (
                            <motion.div
                                key={i}
                                className="w-[2px] bg-white/40"
                                animate={{ height: [4, 12, 6, 10, 4] }}
                                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                            />
                        ))}
                    </div>
                    <span className="text-[9px] text-white/40 uppercase tracking-widest font-medium">Spatial Atmos: ON</span>
                </div>
            </div>
        </div>
    );
};
