import { useState, useEffect, useMemo } from "react";
import { useFlowConfig } from "@/hooks/useFlowConfig";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/primitives/interactive";
import { Save, Plus, Trash2, ChevronDown, ChevronRight, Loader2, Search } from "lucide-react";
import type { CityTier } from "@/addons/calculators/components/data/types";

/* ── Types ──────────────────────────────────────────────────────── */

type LocationData = Record<string, Record<string, CityTier>>;

interface TierDef {
  label: string;
  multiplier: number;
  color: string;
}

type TierMap = Record<CityTier, TierDef>;

const TIER_ORDER: CityTier[] = ["metro", "tier1", "tier2"];

const TIER_BADGE: Record<CityTier, string> = {
  metro:  "bg-red-500/20 text-red-400 border-red-500/30",
  tier1:  "bg-orange-500/20 text-orange-400 border-orange-500/30",
  tier2:  "bg-teal-500/20 text-teal-400 border-teal-500/30",
};

/* ── Component ──────────────────────────────────────────────────── */

export function LocationsEditor() {
  /* --- Location Data (states → cities → tier) --- */
  const {
    data: locData,
    isLoading: locLoading,
    save: saveLoc,
    isSaving: locSaving,
  } = useFlowConfig<LocationData>("location_data");

  const [locations, setLocations] = useState<LocationData>({});
  const [locDirty, setLocDirty] = useState(false);
  const [expandedState, setExpandedState] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  /* --- Tiers --- */
  const {
    data: tierData,
    isLoading: tierLoading,
    save: saveTiers,
    isSaving: tierSaving,
  } = useFlowConfig<TierMap>("city_tiers");

  const [tiers, setTiers] = useState<TierMap>({} as TierMap);
  const [tiersDirty, setTiersDirty] = useState(false);

  /* --- Add city form --- */
  const [newState, setNewState] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newTier, setNewTier] = useState<CityTier>("tier1");

  useEffect(() => {
    if (locData && !locDirty) setLocations(locData as LocationData);
  }, [locData, locDirty]);

  useEffect(() => {
    if (tierData && !tiersDirty && Object.keys(tierData).length > 0) {
      setTiers(tierData as TierMap);
    }
  }, [tierData, tiersDirty]);

  /* --- Filtered states --- */
  const filteredStates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return Object.entries(locations);
    return Object.entries(locations).filter(([state, cities]) => {
      return (
        state.toLowerCase().includes(q) ||
        Object.keys(cities).some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [locations, search]);

  /* --- Handlers --- */
  const changeCityTier = (state: string, city: string, tier: CityTier) => {
    setLocations((prev) => ({
      ...prev,
      [state]: { ...prev[state], [city]: tier },
    }));
    setLocDirty(true);
  };

  const deleteCity = (state: string, city: string) => {
    setLocations((prev) => {
      const cities = { ...prev[state] };
      delete cities[city];
      if (Object.keys(cities).length === 0) {
        const next = { ...prev };
        delete next[state];
        return next;
      }
      return { ...prev, [state]: cities };
    });
    setLocDirty(true);
  };

  const addCity = () => {
    const s = newState.trim();
    const c = newCity.trim();
    if (!s || !c) return;
    setLocations((prev) => ({
      ...prev,
      [s]: { ...(prev[s] ?? {}), [c]: newTier },
    }));
    setLocDirty(true);
    setNewCity("");
    setExpandedState(s);
  };

  const updateTierField = (
    tier: CityTier,
    field: keyof TierDef,
    val: string | number
  ) => {
    setTiers((prev) => ({
      ...prev,
      [tier]: { ...prev[tier], [field]: val },
    }));
    setTiersDirty(true);
  };

  if (locLoading || tierLoading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--admin-primary))]" />
      </div>
    );

  const totalCities = Object.values(locations).reduce(
    (acc, cities) => acc + Object.keys(cities).length,
    0
  );

  return (
    <div className="space-y-6">
      {/* ── City Tiers editor ───────────────────────────────── */}
      <section className="rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-[hsl(var(--admin-text))] uppercase tracking-widest">
              City Tier Multipliers
            </h3>
            <p className="text-[10px] text-[hsl(var(--admin-text-muted))] mt-0.5">
              Rates are multiplied by these factors based on location
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => saveTiers(tiers, { onSuccess: () => setTiersDirty(false) })}
            disabled={!tiersDirty || tierSaving}
            className="h-7 text-xs gap-1 bg-[hsl(var(--admin-primary))] text-black"
          >
            {tierSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TIER_ORDER.map((tier) => {
            const t = tiers[tier];
            if (!t) return null;
            return (
              <div
                key={tier}
                className="rounded-lg border border-[hsl(var(--admin-border))]/50 bg-[hsl(var(--admin-surface))]/50 p-3 space-y-2"
              >
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${TIER_BADGE[tier]}`}>
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: t.color }}
                  />
                  {tier.toUpperCase()}
                </div>
                <div className="space-y-1.5">
                  <div>
                    <label htmlFor={`tier-label-${tier}`} className="text-[10px] text-[hsl(var(--admin-text-muted))]">Label</label>
                    <Input
                      id={`tier-label-${tier}`}
                      value={t.label}
                      onChange={(e) => updateTierField(tier, "label", e.target.value)}
                      className="h-7 text-xs bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label htmlFor={`tier-mult-${tier}`} className="text-[10px] text-[hsl(var(--admin-text-muted))]">Multiplier</label>
                      <Input
                        id={`tier-mult-${tier}`}
                        type="number"
                        step="0.05"
                        value={t.multiplier}
                        onChange={(e) => updateTierField(tier, "multiplier", +e.target.value)}
                        className="h-7 text-xs bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor={`tier-color-${tier}`} className="text-[10px] text-[hsl(var(--admin-text-muted))]">Color (hex)</label>
                      <div className="flex items-center gap-1">
                        <input
                          id={`tier-color-${tier}`}
                          type="color"
                          value={t.color}
                          onChange={(e) => updateTierField(tier, "color", e.target.value)}
                          className="h-7 w-8 rounded cursor-pointer border border-[hsl(var(--admin-border))] bg-transparent p-0.5"
                        />
                        <Input
                          value={t.color}
                          onChange={(e) => updateTierField(tier, "color", e.target.value)}
                          className="h-7 text-xs flex-1 bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── States & Cities ─────────────────────────────────── */}
      <section className="rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))] p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-[hsl(var(--admin-text))] uppercase tracking-widest">
              States &amp; Cities
            </h3>
            <p className="text-[10px] text-[hsl(var(--admin-text-muted))] mt-0.5">
              {Object.keys(locations).length} states · {totalCities} cities
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => saveLoc(locations, { onSuccess: () => setLocDirty(false) })}
            disabled={!locDirty || locSaving}
            className="h-7 text-xs gap-1 bg-[hsl(var(--admin-primary))] text-black"
          >
            {locSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save
          </Button>
        </div>

        {/* Add city row */}
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-[hsl(var(--admin-border))]/40">
          <Input
            value={newState}
            onChange={(e) => setNewState(e.target.value)}
            placeholder="State name"
            className="h-7 text-xs w-36 bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
          />
          <Input
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCity()}
            placeholder="City name"
            className="h-7 text-xs w-36 bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
          />
          <select
            value={newTier}
            onChange={(e) => setNewTier(e.target.value as CityTier)}
            className="h-7 text-xs px-2 rounded-md bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
          >
            {TIER_ORDER.map((t) => (
              <option key={t} value={t}>{tiers[t]?.label ?? t}</option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            onClick={addCity}
            className="h-7 text-xs gap-1"
          >
            <Plus className="w-3 h-3" />
            Add City
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[hsl(var(--admin-text-muted))]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter states or cities…"
            className="h-7 text-xs pl-7 bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]"
          />
        </div>

        {/* State accordion list */}
        <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
          {filteredStates.map(([state, cities]) => {
            const isOpen = expandedState === state;
            const cityCount = Object.keys(cities).length;
            return (
              <div
                key={state}
                className="rounded-lg border border-[hsl(var(--admin-border))]/40 overflow-hidden"
              >
                {/* State header */}
                <button
                  onClick={() => setExpandedState(isOpen ? null : state)}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-[hsl(var(--admin-surface))]/60 hover:bg-[hsl(var(--admin-surface))] transition-colors text-left"
                >
                  {isOpen
                    ? <ChevronDown className="w-3 h-3 text-[hsl(var(--admin-text-muted))] shrink-0" />
                    : <ChevronRight className="w-3 h-3 text-[hsl(var(--admin-text-muted))] shrink-0" />
                  }
                  <span className="text-xs font-semibold text-[hsl(var(--admin-text))] flex-1">{state}</span>
                  <span className="text-[10px] text-[hsl(var(--admin-text-muted))]">{cityCount} {cityCount === 1 ? "city" : "cities"}</span>
                </button>

                {/* City rows */}
                {isOpen && (
                  <div className="divide-y divide-[hsl(var(--admin-border))]/20">
                    {Object.entries(cities).map(([city, tier]) => (
                      <div key={city} className="flex items-center gap-3 px-4 py-1.5 group">
                        <span className="text-xs text-[hsl(var(--admin-text))] flex-1">{city}</span>
                        <select
                          value={tier}
                          onChange={(e) => changeCityTier(state, city, e.target.value as CityTier)}
                          className="h-6 text-[11px] px-1.5 rounded bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
                        >
                          {TIER_ORDER.map((t) => (
                            <option key={t} value={t}>{tiers[t]?.label ?? t}</option>
                          ))}
                        </select>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${TIER_BADGE[tier as CityTier]}`}>
                          {tier}
                        </span>
                        <button
                          onClick={() => deleteCity(state, city)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {filteredStates.length === 0 && (
            <p className="text-center py-8 text-xs text-[hsl(var(--admin-text-muted))]">
              No states match your search
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
