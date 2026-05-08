"""
CarbonWise — CSV Data Loader  v1.0
====================================
Loads EPA and EEA CSV datasets at startup and merges them into
the unified CARS / GRID_DATA / GREENWASH_DB structures used by views.py.

Data sources:
  - data/epa_fuel_economy.csv       → EPA fueleconomy.gov + LCAT Tool 2023
  - data/eea_lifecycle_emissions.csv → EEA 2023 doi:10.2760/141427
  - data/eea_grid_intensity.csv      → CEA 2023 / IEA 2023 / EPA eGRID 2023
  - data/greenwashing_claims.csv     → Compiled from EEA/NDTV/AutoCarIndia

Methodology (applied during load):
  - EV real-world kWh/100km  = ARAI/MIDC certified × 1.25 (EEA real-world factor)
  - ICE real-world L/100km   = ARAI certified × 1.18 (WLTP→real-world, India traffic)
  - Battery disposal CO₂     = battery_kwh × 0.14 t/kWh  (EEA Report No 14/2021)
  - ICE CO₂ factor           = 2.31 kg CO₂/litre petrol   (IPCC AR6 WG3)
"""

import csv
import os
import logging

logger = logging.getLogger(__name__)

# ── Path to data directory (same folder as this file's parent = backend/)
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')


def _csv_path(filename):
    return os.path.normpath(os.path.join(DATA_DIR, filename))


def _safe_float(val, default=None):
    try:
        v = val.strip()
        return float(v) if v else default
    except (ValueError, AttributeError):
        return default


def _safe_int(val, default=0):
    try:
        v = val.strip()
        return int(v) if v else default
    except (ValueError, AttributeError):
        return default


# ─────────────────────────────────────────────
#  1. LOAD EEA LIFECYCLE EMISSIONS
# ─────────────────────────────────────────────

def load_eea_lifecycle():
    """
    Returns dict keyed by vehicle_key with full LCA fields.
    Source: data/eea_lifecycle_emissions.csv
    """
    records = {}
    path = _csv_path('eea_lifecycle_emissions.csv')

    try:
        with open(path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                key = row['vehicle_key'].strip()
                if not key:
                    continue

                mfg          = _safe_float(row.get('manufacturing_co2_tonnes'), 0.0)
                batt_kwh     = _safe_float(row.get('battery_kwh'), 0.0)
                batt_disp    = _safe_float(row.get('battery_disposal_co2_tonnes'), 0.0)

                # EEA CSV stores the already-computed disposal;
                # if missing, derive from battery_kwh × 0.14 t/kWh (EEA 2021)
                if batt_disp == 0.0 and batt_kwh > 0:
                    batt_disp = round(batt_kwh * 0.14, 3)

                kwh_realworld  = _safe_float(row.get('kwh_per_100km_realworld'))
                litres_realworld = _safe_float(row.get('litres_per_100km_realworld'))

                records[key] = {
                    'mfg':           mfg,
                    'battKwh':       batt_kwh,
                    'battDisp':      batt_disp,
                    'kwhPer100km':   kwh_realworld,       # already real-world adjusted
                    'lPer100km':     litres_realworld,    # already real-world adjusted
                    'lca_standard':  row.get('lca_standard', '').strip(),
                    'mfgSrc':        row.get('mfg_emission_source', '').strip(),
                    'battSrc':       row.get('battery_emission_source', '').strip(),
                    'methodology':   row.get('lifecycle_methodology', '').strip(),
                    'segment':       row.get('vehicle_segment', '').strip(),
                    'eea_loaded':    True,
                }

        logger.info(f"[DataLoader] EEA lifecycle: loaded {len(records)} vehicles from CSV")

    except FileNotFoundError:
        logger.error(f"[DataLoader] EEA lifecycle CSV not found at {path}")
    except Exception as e:
        logger.error(f"[DataLoader] Error loading EEA lifecycle CSV: {e}")

    return records


# ─────────────────────────────────────────────
#  2. LOAD EPA FUEL ECONOMY
# ─────────────────────────────────────────────

def load_epa_fuel_economy():
    """
    Returns dict keyed by vehicle_key with EPA ratings and scores.
    Source: data/epa_fuel_economy.csv
    """
    records = {}
    path = _csv_path('epa_fuel_economy.csv')

    try:
        with open(path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                key = row['vehicle_key'].strip()
                if not key:
                    continue
                records[key] = {
                    'fuel_type':        row.get('fuel_type', '').strip(),
                    'city_mpg':         _safe_float(row.get('city_mpg')),
                    'highway_mpg':      _safe_float(row.get('highway_mpg')),
                    'combined_mpg':     row.get('combined_mpg', '').strip(),
                    'co2_tailpipe_gpm': _safe_float(row.get('co2_tailpipe_gpm'), 0.0),
                    'annual_fuel_cost': _safe_float(row.get('annual_fuel_cost_usd')),
                    'ghg_score':        _safe_int(row.get('ghg_score')),
                    'air_pollution_score': _safe_int(row.get('air_pollution_score')),
                    'epa_source':       row.get('source', '').strip(),
                    'epa_loaded':       True,
                }

        logger.info(f"[DataLoader] EPA fuel economy: loaded {len(records)} vehicles from CSV")

    except FileNotFoundError:
        logger.error(f"[DataLoader] EPA fuel economy CSV not found at {path}")
    except Exception as e:
        logger.error(f"[DataLoader] Error loading EPA fuel economy CSV: {e}")

    return records


# ─────────────────────────────────────────────
#  3. LOAD EEA GRID INTENSITY
# ─────────────────────────────────────────────

def load_eea_grid_intensity():
    """
    Returns two dicts:
      - grid_flat: { region_key: intensity_float }  (for backward compat)
      - grid_rich: { region_key: { label, intensity, renewable_share, source, ... } }
    Source: data/eea_grid_intensity.csv
    """
    grid_flat = {}
    grid_rich = {}
    path = _csv_path('eea_grid_intensity.csv')

    try:
        with open(path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                key = row['region_key'].strip()
                if not key:
                    continue
                intensity = _safe_float(row.get('intensity_kg_co2_per_kwh'), 0.42)
                grid_flat[key] = intensity
                grid_rich[key] = {
                    'label':           row.get('region_label', key).strip(),
                    'intensity':       intensity,
                    'region_type':     row.get('region_type', '').strip(),
                    'country':         row.get('country', '').strip(),
                    'renewable_share': _safe_float(row.get('renewable_share_pct'), 0.0),
                    'fossil_share':    _safe_float(row.get('fossil_share_pct'), 100.0),
                    'nuclear_share':   _safe_float(row.get('nuclear_share_pct'), 0.0),
                    'year':            row.get('year', '2023').strip(),
                    'source':          row.get('source', '').strip(),
                    'source_url':      row.get('source_url', '').strip(),
                    'notes':           row.get('notes', '').strip(),
                    'csv_loaded':      True,
                }

        logger.info(f"[DataLoader] Grid intensity: loaded {len(grid_flat)} regions from CSV")

    except FileNotFoundError:
        logger.error(f"[DataLoader] Grid intensity CSV not found at {path}")
    except Exception as e:
        logger.error(f"[DataLoader] Error loading grid intensity CSV: {e}")

    return grid_flat, grid_rich


# ─────────────────────────────────────────────
#  4. LOAD GREENWASHING CLAIMS DB
# ─────────────────────────────────────────────

def load_greenwashing_claims():
    """
    Returns list of greenwashing claim dicts.
    Source: data/greenwashing_claims.csv
    """
    claims = []
    path = _csv_path('greenwashing_claims.csv')

    try:
        with open(path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                claims.append({
                    'brand':       row.get('brand', '').strip(),
                    'model':       row.get('model', '').strip(),
                    'vehicle_key': row.get('vehicle_key', '').strip(),
                    'claim':       row.get('claim_text', '').strip(),
                    'claim_type':  row.get('claim_type', '').strip(),
                    'reality':     row.get('reality_check', '').strip(),
                    'severity':    row.get('severity', 'medium').strip(),
                    'verified_by': row.get('verified_by', '').strip(),
                    'source_doc':  row.get('source_doc', '').strip(),
                    'year':        row.get('year', '').strip(),
                })

        logger.info(f"[DataLoader] Greenwashing DB: loaded {len(claims)} claims from CSV")

    except FileNotFoundError:
        logger.error(f"[DataLoader] Greenwashing claims CSV not found at {path}")
    except Exception as e:
        logger.error(f"[DataLoader] Error loading greenwashing claims CSV: {e}")

    return claims


# ─────────────────────────────────────────────
#  5. MASTER BUILD — merge EPA + EEA into CARS
# ─────────────────────────────────────────────

# Static fields not in CSVs (brand, name, price, tier, rating, year)
# These are display / market metadata — not part of emissions science
_STATIC_META = {
    'nexon-ev':      {'name': 'Tata Nexon EV',             'brand': 'Tata Motors',   'type': 'ev',     'price': '₹14–20L', 'tier': 'mid',  'rating': 'A',  'year': 2024},
    'mg-zs-ev':      {'name': 'MG ZS EV',                  'brand': 'MG Motors',     'type': 'ev',     'price': '₹18–25L', 'tier': 'mid',  'rating': 'A',  'year': 2024},
    'tiago-ev':      {'name': 'Tata Tiago EV',             'brand': 'Tata Motors',   'type': 'ev',     'price': '₹8–12L',  'tier': 'low',  'rating': 'A',  'year': 2024},
    'byd-atto3':     {'name': 'BYD Atto 3',                'brand': 'BYD',           'type': 'ev',     'price': '₹34–38L', 'tier': 'high', 'rating': 'A',  'year': 2024},
    'tesla-model3':  {'name': 'Tesla Model 3 LR',          'brand': 'Tesla',         'type': 'ev',     'price': '₹40–60L', 'tier': 'high', 'rating': 'A',  'year': 2024},
    'tigor-ev':      {'name': 'Tata Tigor EV',             'brand': 'Tata Motors',   'type': 'ev',     'price': '₹12–14L', 'tier': 'mid',  'rating': 'A',  'year': 2024},
    'comet-ev':      {'name': 'MG Comet EV',               'brand': 'MG Motors',     'type': 'ev',     'price': '₹7–9L',   'tier': 'low',  'rating': 'A',  'year': 2024},
    'kia-ev6':       {'name': 'Kia EV6',                   'brand': 'Kia',           'type': 'ev',     'price': '₹60–65L', 'tier': 'high', 'rating': 'A',  'year': 2024},
    'prius':         {'name': 'Toyota Prius',               'brand': 'Toyota',        'type': 'hybrid', 'price': '₹42–50L', 'tier': 'high', 'rating': 'A+', 'year': 2024},
    'city-hybrid':   {'name': 'Honda City Hybrid',         'brand': 'Honda',         'type': 'hybrid', 'price': '₹19–21L', 'tier': 'mid',  'rating': 'A',  'year': 2024},
    'vitara-hybrid': {'name': 'Maruti Grand Vitara Hybrid','brand': 'Maruti Suzuki', 'type': 'hybrid', 'price': '₹16–24L', 'tier': 'mid',  'rating': 'A',  'year': 2024},
    'camry-hybrid':  {'name': 'Toyota Camry Hybrid',       'brand': 'Toyota',        'type': 'hybrid', 'price': '₹46–50L', 'tier': 'high', 'rating': 'A',  'year': 2024},
    'hycross':       {'name': 'Toyota Innova Hycross HEV', 'brand': 'Toyota',        'type': 'hybrid', 'price': '₹24–31L', 'tier': 'high', 'rating': 'A',  'year': 2024},
    'swift':         {'name': 'Maruti Swift',              'brand': 'Maruti Suzuki', 'type': 'ice',    'price': '₹6–9L',   'tier': 'low',  'rating': 'B',  'year': 2024},
    'creta':         {'name': 'Hyundai Creta',             'brand': 'Hyundai',       'type': 'ice',    'price': '₹11–20L', 'tier': 'mid',  'rating': 'C',  'year': 2024},
    'innova':        {'name': 'Toyota Innova Crysta',      'brand': 'Toyota',        'type': 'ice',    'price': '₹20–27L', 'tier': 'mid',  'rating': 'C',  'year': 2024},
    'brezza':        {'name': 'Maruti Brezza',             'brand': 'Maruti Suzuki', 'type': 'ice',    'price': '₹8–14L',  'tier': 'mid',  'rating': 'B',  'year': 2024},
    'seltos':        {'name': 'Kia Seltos',                'brand': 'Kia',           'type': 'ice',    'price': '₹11–20L', 'tier': 'mid',  'rating': 'C',  'year': 2024},
    'fortuner':      {'name': 'Toyota Fortuner',           'brand': 'Toyota',        'type': 'ice',    'price': '₹32–50L', 'tier': 'high', 'rating': 'C',  'year': 2024},
    'scorpio-n':     {'name': 'Mahindra Scorpio N',        'brand': 'Mahindra',      'type': 'ice',    'price': '₹13–24L', 'tier': 'mid',  'rating': 'C',  'year': 2024},
}


def build_cars_db():
    """
    Merge EEA lifecycle CSV + EPA fuel economy CSV + static meta
    into the unified CARS dict used by views.py.

    Returns (CARS, GRID_DATA, GRID_RICH, GREENWASH_DB, data_sources)
    """
    eea  = load_eea_lifecycle()
    epa  = load_epa_fuel_economy()
    grid_flat, grid_rich = load_eea_grid_intensity()
    gw_claims = load_greenwashing_claims()

    cars = {}
    data_sources = {'eea_records': 0, 'epa_records': 0, 'fallback_records': 0}

    for key, meta in _STATIC_META.items():
        car = dict(meta)  # start with display meta

        eea_rec = eea.get(key, {})
        epa_rec = epa.get(key, {})

        if eea_rec:
            # ── PRIMARY: EEA lifecycle data
            car['mfg']         = eea_rec['mfg']
            car['battKwh']     = eea_rec['battKwh']
            car['battDisp']    = eea_rec['battDisp']
            car['kwhPer100km'] = eea_rec['kwhPer100km']
            car['lPer100km']   = eea_rec['lPer100km']
            car['lca_standard']= eea_rec['lca_standard']
            car['mfgSrc']      = eea_rec['mfgSrc']
            car['battSrc']     = eea_rec['battSrc']
            car['methodology'] = eea_rec['methodology']
            car['segment']     = eea_rec['segment']
            car['data_source'] = 'EEA CSV + EPA CSV'
            data_sources['eea_records'] += 1
        else:
            # This should not happen if CSVs are present, but safe fallback
            car['data_source'] = 'fallback_hardcoded'
            data_sources['fallback_records'] += 1
            logger.warning(f"[DataLoader] No EEA data for {key} — using fallback")

        if epa_rec:
            # ── SECONDARY: EPA ratings (augment, not override)
            car['ghg_score']        = epa_rec['ghg_score']
            car['air_pollution_score'] = epa_rec['air_pollution_score']
            car['annual_fuel_cost'] = epa_rec['annual_fuel_cost']
            car['epa_source']       = epa_rec['epa_source']
            data_sources['epa_records'] += 1

        cars[key] = car

    logger.info(
        f"[DataLoader] CARS built: {len(cars)} vehicles "
        f"(EEA={data_sources['eea_records']}, "
        f"EPA={data_sources['epa_records']}, "
        f"fallback={data_sources['fallback_records']})"
    )

    return cars, grid_flat, grid_rich, gw_claims, data_sources


# ─────────────────────────────────────────────
#  6. MODULE-LEVEL SINGLETON — loaded once at startup
# ─────────────────────────────────────────────

CARS, GRID_DATA, GRID_RICH, GREENWASH_DB, DATA_SOURCES = build_cars_db()
