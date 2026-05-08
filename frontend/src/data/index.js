// ─────────────────────────────────────────────────────────────────
//  CarbonWise — Master Data  v3.0
//
//  METHODOLOGY:
//  Lifecycle CO₂ = Manufacturing + Operational + End-of-Life
//
//  Manufacturing (mfg):      EEA 2023 doi:10.2760/141427 + EPA LCAT tool
//                            Per-vehicle sources listed in mfgSrc field
//  Battery disposal (battDisp): Ellingsen et al. 2016 (doi:10.1021/acs.est.5b05076)
//                               Romare & Dahlöf 2017 (IVL Report C243)
//                               EEA Report No 14/2021 — 0.14 t CO₂/kWh net disposal
//  EV consumption (kWhPer100km): ARAI/MIDC homologation × 1.25 real-world factor
//  ICE consumption (lPer100km):  ARAI combined cycle × 1.18 real-world factor
//  ICE CO₂ factor: 2.31 kg CO₂/litre petrol (IPCC AR6 WG3, MoEFCC India)
// ─────────────────────────────────────────────────────────────────

export const CARS = {
  // ── EVs ─────────────────────────────────────────────────────────────────────────────────────
  // kwhPer100km = ARAI/MIDC certified × 1.25 real-world factor
  // battDisp sources: Ellingsen 2016 / Romare 2017 / EEA 2021 (0.14t/kWh net)
  'nexon-ev':     { name: 'Tata Nexon EV',             brand: 'Tata Motors',    type: 'ev',     mfg: 12.0, kwhPer100km: 14.0, lPer100km: null, battDisp: 4.2,  battKwh: 30.2, price: '₹14–20L', tier: 'mid',  rating: 'A',  year: 2024, mfgSrc: 'EEA 2023',                battSrc: 'Ellingsen 2016' },
  'mg-zs-ev':     { name: 'MG ZS EV',                  brand: 'MG Motors',      type: 'ev',     mfg: 14.2, kwhPer100km: 15.2, lPer100km: null, battDisp: 7.0,  battKwh: 50.3, price: '₹18–25L', tier: 'mid',  rating: 'A',  year: 2024, mfgSrc: 'EEA 2023',                battSrc: 'Ellingsen 2016' },
  'tiago-ev':     { name: 'Tata Tiago EV',             brand: 'Tata Motors',    type: 'ev',     mfg: 9.8,  kwhPer100km: 13.1, lPer100km: null, battDisp: 2.7,  battKwh: 19.2, price: '₹8–12L',  tier: 'low',  rating: 'A',  year: 2024, mfgSrc: 'EEA 2023',                battSrc: 'Ellingsen 2016' },
  'byd-atto3':    { name: 'BYD Atto 3',                brand: 'BYD',            type: 'ev',     mfg: 15.1, kwhPer100km: 16.0, lPer100km: null, battDisp: 8.5,  battKwh: 60.5, price: '₹34–38L', tier: 'high', rating: 'A',  year: 2024, mfgSrc: 'EEA 2023',                battSrc: 'Romare 2017' },
  'tesla-model3': { name: 'Tesla Model 3 LR',          brand: 'Tesla',          type: 'ev',     mfg: 16.0, kwhPer100km: 13.2, lPer100km: null, battDisp: 10.5, battKwh: 75.0, price: '₹40–60L', tier: 'high', rating: 'A',  year: 2024, mfgSrc: 'Tesla Impact Report 2022', battSrc: 'Tesla 2022' },
  'tigor-ev':     { name: 'Tata Tigor EV',             brand: 'Tata Motors',    type: 'ev',     mfg: 11.0, kwhPer100km: 14.4, lPer100km: null, battDisp: 3.6,  battKwh: 26.0, price: '₹12–14L', tier: 'mid',  rating: 'A',  year: 2024, mfgSrc: 'EEA 2023',                battSrc: 'EEA 2021' },
  'comet-ev':     { name: 'MG Comet EV',               brand: 'MG Motors',      type: 'ev',     mfg: 8.0,  kwhPer100km: 11.3, lPer100km: null, battDisp: 2.4,  battKwh: 17.3, price: '₹7–9L',   tier: 'low',  rating: 'A',  year: 2024, mfgSrc: 'EEA 2023',                battSrc: 'EEA 2021' },
  'kia-ev6':      { name: 'Kia EV6',                   brand: 'Kia',            type: 'ev',     mfg: 18.0, kwhPer100km: 14.4, lPer100km: null, battDisp: 10.8, battKwh: 77.4, price: '₹60–65L', tier: 'high', rating: 'A',  year: 2024, mfgSrc: 'EEA 2023',                battSrc: 'Romare 2017' },
  // ── HYBRIDS ─────────────────────────────────────────────────────────────────────────────────
  // lPer100km = ARAI certified × 1.18 real-world factor
  'prius':        { name: 'Toyota Prius',               brand: 'Toyota',         type: 'hybrid', mfg: 7.8,  kwhPer100km: null, lPer100km: 3.5,  battDisp: 1.2,  battKwh: 8.8,  price: '₹42–50L', tier: 'high', rating: 'A+', year: 2024, mfgSrc: 'Toyota LCA 2022',         battSrc: 'EPA 2021' },
  'city-hybrid':  { name: 'Honda City Hybrid',         brand: 'Honda',          type: 'hybrid', mfg: 7.2,  kwhPer100km: null, lPer100km: 4.0,  battDisp: 0.2,  battKwh: 1.3,  price: '₹19–21L', tier: 'mid',  rating: 'A',  year: 2024, mfgSrc: 'Honda LCA 2021',          battSrc: 'EPA 2021' },
  'vitara-hybrid':{ name: 'Maruti Grand Vitara Hybrid',brand: 'Maruti Suzuki',  type: 'hybrid', mfg: 8.9,  kwhPer100km: null, lPer100km: 4.8,  battDisp: 0.2,  battKwh: 1.3,  price: '₹16–24L', tier: 'mid',  rating: 'A',  year: 2024, mfgSrc: 'Suzuki CSR 2023',         battSrc: 'EPA 2021' },
  'camry-hybrid': { name: 'Toyota Camry Hybrid',       brand: 'Toyota',         type: 'hybrid', mfg: 10.2, kwhPer100km: null, lPer100km: 4.2,  battDisp: 0.9,  battKwh: 6.5,  price: '₹46–50L', tier: 'high', rating: 'A',  year: 2024, mfgSrc: 'Toyota LCA 2022',         battSrc: 'EPA 2021' },
  'hycross':      { name: 'Toyota Innova Hycross HEV', brand: 'Toyota',         type: 'hybrid', mfg: 11.0, kwhPer100km: null, lPer100km: 5.1,  battDisp: 0.5,  battKwh: 3.2,  price: '₹24–31L', tier: 'high', rating: 'A',  year: 2024, mfgSrc: 'Toyota LCA 2022',         battSrc: 'EPA 2021' },
  // ── ICE ─────────────────────────────────────────────────────────────────────────────────────
  // lPer100km = ARAI certified × 1.18 real-world factor
  'swift':        { name: 'Maruti Swift',              brand: 'Maruti Suzuki',  type: 'ice',    mfg: 5.1,  kwhPer100km: null, lPer100km: 6.0,  battDisp: 0,    battKwh: 0,    price: '₹6–9L',   tier: 'low',  rating: 'B',  year: 2024, mfgSrc: 'EEA fleet avg 2023',      battSrc: 'N/A' },
  'creta':        { name: 'Hyundai Creta',             brand: 'Hyundai',        type: 'ice',    mfg: 6.3,  kwhPer100km: null, lPer100km: 9.0,  battDisp: 0,    battKwh: 0,    price: '₹11–20L', tier: 'mid',  rating: 'C',  year: 2024, mfgSrc: 'EEA fleet avg 2023',      battSrc: 'N/A' },
  'innova':       { name: 'Toyota Innova Crysta',      brand: 'Toyota',         type: 'ice',    mfg: 7.4,  kwhPer100km: null, lPer100km: 11.1, battDisp: 0,    battKwh: 0,    price: '₹20–27L', tier: 'mid',  rating: 'C',  year: 2024, mfgSrc: 'EEA fleet avg 2023',      battSrc: 'N/A' },
  'brezza':       { name: 'Maruti Brezza',             brand: 'Maruti Suzuki',  type: 'ice',    mfg: 5.4,  kwhPer100km: null, lPer100km: 7.6,  battDisp: 0,    battKwh: 0,    price: '₹8–14L',  tier: 'mid',  rating: 'B',  year: 2024, mfgSrc: 'EEA fleet avg 2023',      battSrc: 'N/A' },
  'seltos':       { name: 'Kia Seltos',                brand: 'Kia',            type: 'ice',    mfg: 6.1,  kwhPer100km: null, lPer100km: 8.4,  battDisp: 0,    battKwh: 0,    price: '₹11–20L', tier: 'mid',  rating: 'C',  year: 2024, mfgSrc: 'EEA fleet avg 2023',      battSrc: 'N/A' },
  'fortuner':     { name: 'Toyota Fortuner',           brand: 'Toyota',         type: 'ice',    mfg: 9.0,  kwhPer100km: null, lPer100km: 11.8, battDisp: 0,    battKwh: 0,    price: '₹32–50L', tier: 'high', rating: 'C',  year: 2024, mfgSrc: 'EEA fleet avg 2023',      battSrc: 'N/A' },
  'scorpio-n':    { name: 'Mahindra Scorpio N',        brand: 'Mahindra',       type: 'ice',    mfg: 8.0,  kwhPer100km: null, lPer100km: 10.8, battDisp: 0,    battKwh: 0,    price: '₹13–24L', tier: 'mid',  rating: 'C',  year: 2024, mfgSrc: 'EEA fleet avg 2023',      battSrc: 'N/A' },
};

// ── GRID INTENSITY DATA ─────────────────────────────────────────
// Unit: kg CO₂ per kWh

export const GRID_DATA = {
  india: {
    label: '🇮🇳 India',
    isCountry: true,
    states: {
      // Source: CEA National Electricity Plan 2023 (cea.nic.in)
      MH: { label: 'Maharashtra',      intensity: 0.82, source: 'CEA 2023' },
      JH: { label: 'Jharkhand',        intensity: 1.10, source: 'CEA 2023' },
      MP: { label: 'Madhya Pradesh',   intensity: 0.96, source: 'CEA 2023' },
      DL: { label: 'Delhi',            intensity: 0.78, source: 'CEA 2023' },
      RJ: { label: 'Rajasthan',        intensity: 0.85, source: 'CEA 2023' },
      UP: { label: 'Uttar Pradesh',    intensity: 0.90, source: 'CEA 2023' },
      GJ: { label: 'Gujarat',          intensity: 0.75, source: 'CEA 2023' },
      TN: { label: 'Tamil Nadu',       intensity: 0.62, source: 'CEA 2023' },
      KA: { label: 'Karnataka',        intensity: 0.55, source: 'CEA 2023' },
      KL: { label: 'Kerala',           intensity: 0.18, source: 'CEA 2023' },
      HP: { label: 'Himachal Pradesh', intensity: 0.12, source: 'CEA 2023' },
      UK: { label: 'Uttarakhand',      intensity: 0.15, source: 'CEA 2023' },
      PB: { label: 'Punjab',           intensity: 0.70, source: 'CEA 2023' },
      WB: { label: 'West Bengal',      intensity: 0.88, source: 'CEA 2023' },
      AP: { label: 'Andhra Pradesh',   intensity: 0.68, source: 'CEA 2023' },
      TS: { label: 'Telangana',        intensity: 0.72, source: 'CEA 2023' },
      OR: { label: 'Odisha',           intensity: 0.95, source: 'CEA 2023' },
      GA: { label: 'Goa',              intensity: 0.60, source: 'CEA 2023' },
    }
  },
  // Source: IEA Electricity 2023 (iea.org/data-and-statistics)
  norway:       { label: '🇳🇴 Norway',        intensity: 0.02, source: 'IEA 2023' },
  france:       { label: '🇫🇷 France',        intensity: 0.06, source: 'IEA 2023' },
  switzerland:  { label: '🇨🇭 Switzerland',   intensity: 0.07, source: 'IEA 2023' },
  sweden:       { label: '🇸🇪 Sweden',        intensity: 0.08, source: 'IEA 2023' },
  austria:      { label: '🇦🇹 Austria',       intensity: 0.14, source: 'IEA 2023' },
  portugal:     { label: '🇵🇹 Portugal',      intensity: 0.18, source: 'IEA 2023' },
  spain:        { label: '🇪🇸 Spain',         intensity: 0.22, source: 'IEA 2023' },
  denmark:      { label: '🇩🇰 Denmark',       intensity: 0.19, source: 'IEA 2023' },
  finland:      { label: '🇫🇮 Finland',       intensity: 0.12, source: 'IEA 2023' },
  germany:      { label: '🇩🇪 Germany',       intensity: 0.38, source: 'IEA 2023' },
  uk:           { label: '🇬🇧 United Kingdom',intensity: 0.23, source: 'IEA 2023' },
  ireland:      { label: '🇮🇪 Ireland',       intensity: 0.31, source: 'IEA 2023' },
  netherlands:  { label: '🇳🇱 Netherlands',   intensity: 0.28, source: 'IEA 2023' },
  belgium:      { label: '🇧🇪 Belgium',       intensity: 0.17, source: 'IEA 2023' },
  italy:        { label: '🇮🇹 Italy',         intensity: 0.29, source: 'IEA 2023' },
  greece:       { label: '🇬🇷 Greece',        intensity: 0.39, source: 'IEA 2023' },
  poland:       { label: '🇵🇱 Poland',        intensity: 0.72, source: 'IEA 2023' },
  czechia:      { label: '🇨🇿 Czechia',       intensity: 0.41, source: 'IEA 2023' },
  romania:      { label: '🇷🇴 Romania',       intensity: 0.26, source: 'IEA 2023' },
  ukraine:      { label: '🇺🇦 Ukraine',       intensity: 0.35, source: 'IEA 2023' },
  turkey:       { label: '🇹🇷 Turkey',        intensity: 0.46, source: 'IEA 2023' },
  // Source: EPA eGRID 2023
  usa:          { label: '🇺🇸 USA',           intensity: 0.42, source: 'EPA 2023' },
  canada:       { label: '🇨🇦 Canada',        intensity: 0.14, source: 'IEA 2023' },
  brazil:       { label: '🇧🇷 Brazil',        intensity: 0.09, source: 'IEA 2023' },
  mexico:       { label: '🇲🇽 Mexico',        intensity: 0.46, source: 'IEA 2023' },
  argentina:    { label: '🇦🇷 Argentina',     intensity: 0.31, source: 'IEA 2023' },
  chile:        { label: '🇨🇱 Chile',         intensity: 0.28, source: 'IEA 2023' },
  colombia:     { label: '🇨🇴 Colombia',      intensity: 0.17, source: 'IEA 2023' },
  china:        { label: '🇨🇳 China',         intensity: 0.61, source: 'IEA 2023' },
  japan:        { label: '🇯🇵 Japan',         intensity: 0.47, source: 'IEA 2023' },
  south_korea:  { label: '🇰🇷 South Korea',   intensity: 0.44, source: 'IEA 2023' },
  singapore:    { label: '🇸🇬 Singapore',     intensity: 0.41, source: 'IEA 2023' },
  thailand:     { label: '🇹🇭 Thailand',      intensity: 0.52, source: 'IEA 2023' },
  vietnam:      { label: '🇻🇳 Vietnam',       intensity: 0.55, source: 'IEA 2023' },
  indonesia:    { label: '🇮🇩 Indonesia',     intensity: 0.71, source: 'IEA 2023' },
  malaysia:     { label: '🇲🇾 Malaysia',      intensity: 0.63, source: 'IEA 2023' },
  bangladesh:   { label: '🇧🇩 Bangladesh',    intensity: 0.59, source: 'IEA 2023' },
  pakistan:     { label: '🇵🇰 Pakistan',      intensity: 0.45, source: 'IEA 2023' },
  sri_lanka:    { label: '🇱🇰 Sri Lanka',     intensity: 0.38, source: 'IEA 2023' },
  uae:          { label: '🇦🇪 UAE',           intensity: 0.40, source: 'IEA 2023' },
  saudi:        { label: '🇸🇦 Saudi Arabia',  intensity: 0.68, source: 'IEA 2023' },
  israel:       { label: '🇮🇱 Israel',        intensity: 0.43, source: 'IEA 2023' },
  south_africa: { label: '🇿🇦 South Africa',  intensity: 0.92, source: 'IEA 2023' },
  nigeria:      { label: '🇳🇬 Nigeria',       intensity: 0.43, source: 'IEA 2023' },
  kenya:        { label: '🇰🇪 Kenya',         intensity: 0.04, source: 'IEA 2023' },
  egypt:        { label: '🇪🇬 Egypt',         intensity: 0.48, source: 'IEA 2023' },
  australia:    { label: '🇦🇺 Australia',     intensity: 0.55, source: 'IEA 2023' },
  new_zealand:  { label: '🇳🇿 New Zealand',   intensity: 0.10, source: 'IEA 2023' },
};

// ── GREENWASHING DATABASE ────────────────────────────────────────
export const GREENWASH_DB = [
  { brand: 'Hyundai', model: 'Creta',   claim: '"Eco Mode saves 40%"',        reality: 'Real-world saving: 8–13%. Based on ARAI lab cycle, not real roads.',           severity: 'high'   },
  { brand: 'Toyota',  model: 'Fortuner',claim: '"Green for the Future"',       reality: 'No lifecycle data published. Self-declared tagline, zero third-party audit.',   severity: 'medium' },
  { brand: 'Maruti',  model: 'Baleno',  claim: '"Low CO₂ Champion"',           reality: 'Tailpipe-only metric. ~5t manufacturing CO₂ unreported (EEA fleet avg 2023).', severity: 'medium' },
  { brand: 'MG',      model: 'Hector',  claim: '"Internet Car, Clean Future"', reality: '2.0L petrol engine. ~9.2 L/100km real world. No lifecycle data provided.',     severity: 'high'   },
  { brand: 'Kia',     model: 'Seltos',  claim: '"Drive Green, Live Clean"',    reality: '8.0 L/100km petrol (ARAI). No hybrid option at launch. Zero LCA data.',        severity: 'medium' },
];

// ── GREENWASH KEYWORD SCORING ────────────────────────────────────
// Baseline 70 (neutral). Verdict: >65 honest, 41–65 misleading, ≤40 greenwashing
export const GREENWASH_FLAGS = [
  { term: 'zero emission',     score: -18, msg: '"Zero emissions" ignores 12–16t manufacturing CO₂ (EEA 2023). Every EV has a carbon debt before moving 1km.' },
  { term: 'carbon neutral',    score: -22, msg: '"Carbon neutral" claims rarely include full supply chain. Ask: certified by whom? By what date?' },
  { term: 'eco mode',          score: -8,  msg: '"Eco mode" savings are ARAI lab-tested, not real-world. Real saving: 8–13%, not 30–40%.' },
  { term: 'green future',      score: -8,  msg: 'Vague "green future" language with no lifecycle data, no third-party verification.' },
  { term: 'clean energy',      score: -8,  msg: '"Clean energy" depends on your state grid. In Jharkhand (1.10 kg/kWh), an EV is dirtier than a Prius.' },
  { term: 'sustainable',       score: -5,  msg: 'Unverified "sustainable" claim — no ISO 14040 LCA data provided.' },
  { term: 'co2 free',          score: -20, msg: 'No car is CO₂-free. Manufacturing alone = 5–16t CO₂ (EPA lifecycle methodology).' },
  { term: '100%',              score: -10, msg: 'Absolute percentage claims are almost never lifecycle-verified.' },
  { term: 'net zero',          score: -15, msg: '"Net zero" — by when? Scope 1, 2, or 3? Verified by whom?' },
  { term: 'green',             score: -6,  msg: 'Unqualified "green" label — no ISO 14040 lifecycle data provided.' },
  { term: 'pollution free',    score: -14, msg: 'Tailpipe-only metric. Ignores manufacturing and grid-source emissions.' },
  { term: 'third party',       score: +10, msg: null },
  { term: 'verified',          score: +8,  msg: null },
  { term: 'lifecycle',         score: +12, msg: null },
  { term: 'independent audit', score: +10, msg: null },
  { term: 'iso 14040',         score: +15, msg: null },
  { term: 'lca',               score: +12, msg: null },
];

// ── HELPERS ─────────────────────────────────────────────────────

/** Calculate full lifecycle CO₂ for a car. Returns tonnes CO₂. */
export function calcLifecycle(carKey, gridIntensity, kmPerDay, years) {
  const car = CARS[carKey];
  if (!car) return null;
  const totalKm = kmPerDay * 365 * years;
  let fuelCO2;
  if (car.type === 'ev') {
    fuelCO2 = (car.kwhPer100km / 100) * gridIntensity * totalKm;
  } else {
    // IPCC AR6 WG3: 2.31 kg CO₂/litre petrol
    fuelCO2 = (car.lPer100km / 100) * 2.31 * totalKm;
  }
  return {
    ...car,
    key: carKey,
    fuel: Math.round(fuelCO2 * 10) / 10,
    total: Math.round((car.mfg + fuelCO2 + car.battDisp) * 10) / 10,
  };
}

/**
 * Compute year-by-year cumulative CO₂ series for two cars.
 * Used by D3BreakevenChart and for finding the exact breakeven year.
 */
export function calcBreakevenSeries(carAKey, carBKey, gridIntensity, kmPerDay) {
  const carA = CARS[carAKey];
  const carB = CARS[carBKey];
  if (!carA || !carB) return null;

  const seriesA = [], seriesB = [];
  let breakevenYear = null;

  for (let year = 1; year <= 20; year++) {
    const totalKm = kmPerDay * 365 * year;
    const aOp = carA.type === 'ev'
      ? (carA.kwhPer100km / 100) * gridIntensity * totalKm
      : (carA.lPer100km / 100) * 2.31 * totalKm;
    const bOp = carB.type === 'ev'
      ? (carB.kwhPer100km / 100) * gridIntensity * totalKm
      : (carB.lPer100km / 100) * 2.31 * totalKm;

    const aTotal = Math.round((carA.mfg + aOp + carA.battDisp) * 10) / 10;
    const bTotal = Math.round((carB.mfg + bOp + carB.battDisp) * 10) / 10;

    seriesA.push(aTotal);
    seriesB.push(bTotal);

    if (breakevenYear === null && aTotal < bTotal) breakevenYear = year;
  }

  return { seriesA, seriesB, breakevenYear, carAName: carA.name, carBName: carB.name };
}

/** Get grid intensity for a country/state combo. */
export function getGridIntensity(countryKey, stateKey) {
  if (countryKey === 'india' && stateKey) {
    return GRID_DATA.india.states[stateKey]?.intensity ?? 0.82;
  }
  return GRID_DATA[countryKey]?.intensity ?? 0.42;
}

/** Map total CO₂ (tonnes) to a letter rating. */
export function getRating(total) {
  if (total <= 20) return 'A+';
  if (total <= 30) return 'A';
  if (total <= 45) return 'B';
  if (total <= 65) return 'C';
  return 'D';
}

/**
 * Compute a ± uncertainty range for a lifecycle total.
 * Sources of uncertainty:
 *   - Manufacturing: ±15% (EEA range across model years, assembly location variation)
 *   - Real-world consumption correction: ±10% (ARAI→real-world factor 1.18–1.30 for ICE, 1.20–1.35 for EV)
 *   - Battery disposal: ±20% (recycling rate uncertainty, Ellingsen 2016)
 *   - Grid intensity: ±8% (CEA regional sub-grid variation, seasonal)
 * Combined uncertainty: roughly ±18–22% of total (correlated, not fully independent)
 * We conservatively report ±20% rounded to 1 decimal.
 *
 * Note on ICE manufacturing: figures for India-assembled cars use EEA EU fleet averages
 * (EEA 2023 doi:10.2760/141427) as a proxy. India-assembled vehicles may differ by ±1–2t
 * due to local supply chain differences (Tata, Maruti). This is included in the uncertainty range.
 */
export function getConfidenceRange(result) {
  if (!result) return null;
  const uncertainty = 0.20; // ±20%
  const lo = Math.round((result.total * (1 - uncertainty)) * 10) / 10;
  const hi = Math.round((result.total * (1 + uncertainty)) * 10) / 10;
  return { lo, hi, pct: 20 };
}

/** Rating legend items for display. */
export const RATING_LEGEND = [
  { rating: 'A+', label: '≤20t', cls: 'rating-aplus', desc: 'Excellent — best-in-class lifecycle carbon' },
  { rating: 'A',  label: '≤30t', cls: 'rating-a',    desc: 'Good — significantly cleaner than average' },
  { rating: 'B',  label: '≤45t', cls: 'rating-b',    desc: 'Average — room for improvement' },
  { rating: 'C',  label: '≤65t', cls: 'rating-c',    desc: 'Poor — high lifecycle carbon, consider alternatives' },
  { rating: 'D',  label: '>65t', cls: 'rating-d',    desc: 'Very poor — avoid if climate impact matters to you' },
];
