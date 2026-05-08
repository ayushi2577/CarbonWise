"""
CarbonWise — Django API Views  v4.0
=====================================
All vehicle, grid, and greenwashing data is now loaded from CSV files
at startup via api/data_loader.py (EPA + EEA datasets).

Endpoints:
  POST /api/lifecycle/    — Calculate lifecycle CO2 for selected cars
  POST /api/chat/         — AI assistant (Groq LLaMA)
  POST /api/greenwash/    — Greenwashing text analyser
  GET  /api/cars/         — List all vehicles (from CSV)
  GET  /api/grids/        — List all grid regions (from CSV)
  GET  /api/data-sources/ — Show CSV provenance metadata
  GET  /api/health/       — Health check
"""

import json
import urllib.request
import urllib.error
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# Load all data from CSVs at import time (once per server start)
from api.data_loader import CARS, GRID_DATA, GRID_RICH, GREENWASH_DB, DATA_SOURCES

GREENWASH_FLAGS = [
    ('zero emission',    -18, '"Zero emissions" ignores 12-16t manufacturing CO2 (EEA 2023). Every EV has a carbon debt before moving 1km.'),
    ('carbon neutral',   -22, '"Carbon neutral" claims rarely include full supply chain. Ask: certified by whom? By what date?'),
    ('eco mode',          -8, '"Eco mode" savings are ARAI lab-tested, not real-world. Real saving: 8-13%, not 30-40%.'),
    ('green future',      -8, 'Vague "green future" language with no lifecycle data, no third-party verification.'),
    ('clean energy',      -8, '"Clean energy" depends on your state grid. In Jharkhand (1.10 kg/kWh), an EV is dirtier than a Prius.'),
    ('sustainable',       -5, 'Unverified "sustainable" claim - no ISO 14040 LCA data provided.'),
    ('co2 free',         -20, 'No car is CO2-free. Manufacturing alone = 5-16t CO2 (EPA lifecycle methodology).'),
    ('100%',             -10, 'Absolute percentage claims are almost never lifecycle-verified.'),
    ('net zero',         -15, '"Net zero" - by when? Scope 1, 2, or 3? Verified by whom?'),
    ('green',             -6, 'Unqualified "green" label - no ISO 14040 lifecycle data provided.'),
    ('pollution free',   -14, 'Tailpipe-only metric. Ignores manufacturing and grid-source emissions.'),
    ('third party',      +10, None),
    ('verified',          +8, None),
    ('lifecycle',        +12, None),
    ('independent audit',+10, None),
    ('iso 14040',        +15, None),
    ('lca',              +12, None),
]

AI_SYSTEM = """You are CarbonWise AI - a concise, opinionated expert on vehicle lifecycle carbon emissions in India and globally.
You receive live calculated results from our lifecycle model (mfg + fuel/energy + battery disposal).
Data pipeline: EPA fueleconomy.gov + LCAT Tool 2023 | EEA 2023 doi:10.2760/141427 | CEA 2023 India grids | IEA 2023 global grids.
Key formulas: EV op CO2 = (kWh/100km / 100) x grid_intensity x total_km [ARAI x1.25 real-world]
ICE op CO2 = (L/100km / 100) x 2.31 kg/L x total_km [ARAI x1.18, IPCC AR6]
Battery disposal: EEA 2021 0.14t/kWh. Manufacturing: EEA 2023.
Be specific and direct. Use live context numbers. Max 3 short paragraphs. Flag greenwashing if relevant."""


def calc_lifecycle(car_key, grid_intensity, km_per_day, years):
    car = CARS.get(car_key)
    if not car:
        return None
    total_km = km_per_day * 365 * years
    if car['type'] == 'ev':
        kwh = car.get('kwhPer100km') or 0
        fuel_co2 = (kwh / 100) * grid_intensity * total_km
    else:
        litres = car.get('lPer100km') or 0
        fuel_co2 = (litres / 100) * 2.31 * total_km
    mfg = car.get('mfg', 0)
    batt_disp = car.get('battDisp', 0)
    total = mfg + fuel_co2 + batt_disp
    return {
        'key': car_key, 'name': car['name'], 'brand': car['brand'],
        'type': car['type'], 'price': car['price'], 'rating': car['rating'],
        'mfg': round(mfg, 1), 'battDisp': round(batt_disp, 1),
        'fuel': round(fuel_co2, 1), 'total': round(total, 1),
        'data_source': car.get('data_source', 'unknown'),
        'mfg_src': car.get('mfgSrc', ''), 'batt_src': car.get('battSrc', ''),
        'lca_standard': car.get('lca_standard', ''),
        'ghg_score': car.get('ghg_score'), 'epa_source': car.get('epa_source', ''),
    }


def call_groq(messages, max_tokens=400, model=None):
    """
    Call Groq API. Uses llama-3.1-8b-instant by default — much faster than 70b.
    Override model via settings.GROQ_MODEL or pass model= directly.
    """
    api_key = getattr(settings, 'GROQ_API_KEY', None)
    if not api_key or api_key in ('paste_your_groq_key_here', 'gsk_your_key_here', ''):
        return "AI is not configured. Please set GROQ_API_KEY in your .env file."
    chosen_model = model or getattr(settings, 'GROQ_MODEL', 'llama-3.1-8b-instant')
    payload = json.dumps({
        'model': chosen_model,
        'max_tokens': max_tokens,
        'messages': messages,
        'temperature': 0.3,   # lower = faster + more deterministic
    }).encode('utf-8')
    req = urllib.request.Request(
        'https://api.groq.com/openai/v1/chat/completions', data=payload,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
            'User-Agent': 'carbonwise/4.0',
        },
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            data = json.loads(response.read())
            return data['choices'][0]['message']['content']
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:300]
        return f'AI error {e.code}: {body}'
    except urllib.error.URLError as e:
        return f'AI connection error: {str(e.reason)}'
    except Exception as e:
        return f'AI error: {str(e)}'


GREENWASH_SYSTEM = """You are a vehicle lifecycle carbon expert specialising in greenwashing detection.
Analyse the given car marketing claim against real lifecycle data (EPA, EEA 2023, IPCC AR6).
Respond ONLY with a valid JSON object — no markdown, no backticks, no preamble.
Schema: {"score":<int 0-100>,"verdict":"<honest|misleading|greenwashing>","summary":"<2-3 sentences>","flags":["<issue>"],"what_they_should_say":"<honest 1-sentence version>"}
Scoring: deduct for zero-emission/carbon-neutral ignoring manufacturing, vague % savings, no lifecycle data, no third-party audit.
Add for ISO 14040 LCA citation, independent verification, full supply-chain disclosure.
Above 65=honest, 41-65=misleading, ≤40=greenwashing."""


@csrf_exempt
@require_http_methods(['POST'])
def chat(request):
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    user_message = body.get('message', '').strip()
    if not user_message:
        return JsonResponse({'error': 'message required'}, status=400)
    context = body.get('context', '')
    history = body.get('history', [])
    messages = [{'role': 'system', 'content': AI_SYSTEM}]
    # Normalise role: frontend uses 'ai', Groq requires 'assistant'
    role_map = {'ai': 'assistant', 'user': 'user', 'assistant': 'assistant'}
    for h in history[-6:]:
        role = role_map.get(h.get('role', ''))
        if role and h.get('text', '').strip():
            messages.append({'role': role, 'content': h['text']})
    if context:
        user_message = f"{user_message}\n\n[Context: {context}]"
    messages.append({'role': 'user', 'content': user_message})
    return JsonResponse({'reply': call_groq(messages)})


@csrf_exempt
@require_http_methods(['POST'])
def greenwash_ai(request):
    """AI-powered greenwashing analyser — replaces the old direct Claude API call."""
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    claim = body.get('text', '').strip()
    if not claim:
        return JsonResponse({'error': 'text required'}, status=400)
    messages = [
        {'role': 'system', 'content': GREENWASH_SYSTEM},
        {'role': 'user', 'content': f'Analyse this claim: "{claim}"'},
    ]
    raw = call_groq(messages, max_tokens=600)
    # strip any accidental markdown fences
    clean = raw.replace('```json', '').replace('```', '').strip()
    try:
        result = json.loads(clean)
    except json.JSONDecodeError:
        # fallback: return raw text so the caller can still show something
        return JsonResponse({'error': 'parse_failed', 'raw': raw}, status=502)
    return JsonResponse(result)


@csrf_exempt
@require_http_methods(['POST'])
def lifecycle(request):
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    car_keys = body.get('cars', [])
    grid_key = body.get('grid', 'MH')
    km_per_day = float(body.get('km', 40))
    years = float(body.get('years', 8))
    grid_intensity = GRID_DATA.get(grid_key, 0.82)
    grid_info = GRID_RICH.get(grid_key, {})
    results = [r for key in car_keys if (r := calc_lifecycle(key, grid_intensity, km_per_day, years))]
    results.sort(key=lambda x: x['total'])
    return JsonResponse({'results': results, 'grid_intensity': grid_intensity, 'grid_info': grid_info, 'data_sources': DATA_SOURCES})


@csrf_exempt
@require_http_methods(['POST'])
def greenwash(request):
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    text = body.get('text', '').lower()
    score = 70
    flags = []
    for term, pts, msg in GREENWASH_FLAGS:
        if term in text:
            score += pts
            if msg:
                flags.append(msg)
    score = max(5, min(95, score))
    verdict = 'honest' if score > 65 else 'misleading' if score > 40 else 'greenwashing'
    matched_claims = [c for c in GREENWASH_DB if c['brand'].lower() in text or c['model'].lower() in text]
    return JsonResponse({'score': score, 'flags': flags, 'verdict': verdict, 'matched_claims': matched_claims})


@require_http_methods(['GET'])
def cars_list(request):
    return JsonResponse({
        'cars': [{'key': k, 'name': v['name'], 'brand': v['brand'], 'type': v['type'],
                  'price': v['price'], 'rating': v['rating'], 'segment': v.get('segment', ''),
                  'ghg_score': v.get('ghg_score'), 'data_source': v.get('data_source', ''),
                  'lca_standard': v.get('lca_standard', '')} for k, v in CARS.items()],
        'total': len(CARS), 'data_sources': DATA_SOURCES,
    })


@require_http_methods(['GET'])
def grids_list(request):
    return JsonResponse({'grids': GRID_RICH, 'total': len(GRID_RICH), 'data_sources': DATA_SOURCES})


@require_http_methods(['GET'])
def data_sources_view(request):
    return JsonResponse({
        'datasets': [
            {'id': 'epa_fuel_economy', 'file': 'data/epa_fuel_economy.csv',
             'source': 'EPA fueleconomy.gov + EPA LCAT Tool 2023',
             'url': 'https://www.fueleconomy.gov/feg/download.shtml',
             'covers': 'Fuel ratings, GHG scores, air pollution scores',
             'records': DATA_SOURCES.get('epa_records', 0)},
            {'id': 'eea_lifecycle_emissions', 'file': 'data/eea_lifecycle_emissions.csv',
             'source': 'EEA 2023 doi:10.2760/141427 + per-OEM LCA reports',
             'url': 'https://www.eea.europa.eu/publications/co2-emissions-from-cars-the-facts-2023',
             'covers': 'Manufacturing CO2, battery disposal CO2, real-world energy use',
             'records': DATA_SOURCES.get('eea_records', 0)},
            {'id': 'eea_grid_intensity', 'file': 'data/eea_grid_intensity.csv',
             'source': 'CEA 2023 (India) + IEA Electricity 2023 + EPA eGRID 2023',
             'url': 'https://cea.nic.in | https://iea.org | https://epa.gov/egrid',
             'covers': f'{len(GRID_RICH)} grid regions - India states + 40+ countries',
             'records': len(GRID_RICH)},
            {'id': 'greenwashing_claims', 'file': 'data/greenwashing_claims.csv',
             'source': 'EEA Greenwashing Report 2022 + NDTV Auto + AutoCarIndia',
             'url': 'https://www.eea.europa.eu/publications/greenwashing',
             'covers': f'{len(GREENWASH_DB)} verified brand-specific greenwashing claims',
             'records': len(GREENWASH_DB)},
        ],
        'load_stats': DATA_SOURCES,
    })


@require_http_methods(['GET'])
def health(request):
    return JsonResponse({
        'status': 'ok', 'version': '4.0.0', 'project': 'CarbonWise',
        'data_backend': 'CSV -> EPA + EEA + CEA + IEA',
        'vehicles_loaded': len(CARS), 'grids_loaded': len(GRID_RICH),
        'greenwash_claims': len(GREENWASH_DB), 'data_sources': DATA_SOURCES,
    })
