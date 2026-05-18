# CarbonWise — Lifecycle Vehicle Emissions Intelligence

> **The "Google Flights for sustainable cars" — full lifecycle CO₂ comparison, greenwash detection, and AI-powered carbon advice, built on EPA + EEA data.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Django](https://img.shields.io/badge/Django-4-092E20?style=flat-square&logo=django&logoColor=white)](https://djangoproject.com)
[![Data](https://img.shields.io/badge/Data-EPA%20%2F%20EEA%20%2F%20CEA-2ea44f?style=flat-square&logo=databricks&logoColor=white)](https://www.eea.europa.eu)
[![AI](https://img.shields.io/badge/AI-Groq%20LLaMA-FF6B35?style=flat-square&logo=meta&logoColor=white)](https://console.groq.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-carbonwise--ivew.onrender.com-46E3B7?style=flat-square&logo=render&logoColor=white)](https://carbonwise-ivew.onrender.com)

---

## Live Demo

> **[carbonwise-ivew.onrender.com](https://carbonwise-ivew.onrender.com)**

![CarbonWise Homepage](assets/a6.webp)

---

## What It Does

CarbonWise is a full-stack vehicle emissions intelligence platform that lets car buyers, researchers, and curious users cut through automaker greenwashing and see the **true lifecycle carbon cost** of any vehicle — without writing a single line of code.

It accounts for manufacturing emissions, real-world fuel/energy use, battery disposal, and your state's grid intensity — giving you an honest, science-backed picture instead of tailpipe-only marketing numbers.

---

### Compare Cars

Head-to-head lifecycle battle for up to 3 vehicles simultaneously. Adjust for your state's grid intensity and driving pattern. Includes a D3-powered breakeven chart showing exactly when (or whether) an EV pays off its manufacturing carbon debt vs. a petrol alternative.

### Truth Mirror (Greenwash Detector)

Search any car — get an instant verdict: **Genuinely Green**, **Partially Green**, or **Greenwashing**. Backed by a curated database of real claims from EEA 2022, NDTV Auto, and AutoCarIndia cross-referenced against LCA data.

![Showroom Truth Mirror — search](assets/a1.webp)
![Showroom Truth Mirror — hero](assets/a5.webp)

### Personal Calculator

Enter your state, daily km, and years of ownership — get a full lifecycle CO₂ breakdown for any vehicle. Impact is translated into real terms: Delhi→Mumbai flights, trees needed to offset, and savings vs. the average Indian car.

### Showroom Mirror

In-dealership tool — scan/search any car on the lot, get its lifecycle rating (A+ to C), state-adjusted emissions, and a QR-shareable report. Detects greenwashing claims in real-time.

### The Reality

Education page exposing the five most common greenwashing tactics used by Indian automakers — with the data to back every claim. Sourced from WHO, IEA, CEA, and SIAM.

![Methodology section](assets/a2.webp)

### Community

Climate news aggregator from Down To Earth, Electrek, and Carbon Brief — plus a real switcher story feed from EV adopters across India with verified state-grid-adjusted savings.

![Community — news feed](assets/a4.webp)

### GoGreen Hub

Tool gateway — routes users to the right tool (Compare, Calculator, Showroom Mirror) based on their situation.

![GoGreen Hub](assets/a3.webp)

---

## Quick Start

**Prerequisites:** Node.js 18+ · Python 3.9+

### 1. Clone

```bash
git clone https://github.com/<your-username>/carbonwise.git
cd carbonwise
```

### 2. Backend (Django)

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
# → http://localhost:8000
```

**Optional — AI chat (free Groq key):**

```bash
export GROQ_API_KEY=gsk_your_key_here   # free at console.groq.com
```

### 3. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) — Vite proxies `/api/*` to Django automatically. No configuration needed.

---

## Project Structure

```
carbonwise/
├── backend/
│   ├── api/
│   │   ├── data_loader.py      ← CSV pipeline (EPA + EEA → CARS dict)
│   │   ├── views.py            ← Django REST endpoints
│   │   └── urls.py
│   ├── data/
│   │   ├── epa_fuel_economy.csv          ← EPA fueleconomy.gov + LCAT 2023
│   │   ├── eea_lifecycle_emissions.csv   ← EEA 2023 doi:10.2760/141427
│   │   ├── eea_grid_intensity.csv        ← CEA 2023 + IEA 2023 + EPA eGRID
│   │   └── greenwashing_claims.csv       ← EEA 2022 + NDTV + AutoCarIndia
│   └── requirements.txt
│
├── frontend/
│   ├── public/data/            ← Same CSVs served statically (no backend needed)
│   └── src/
│       ├── data/
│       │   └── index.js        ← Master data + LCA calc helpers
│       ├── pages/
│       │   ├── Home.jsx            ← Landing page + Truth Mirror widget
│       │   ├── Compare.jsx         ← 3-car lifecycle comparison
│       │   ├── Calculator.jsx      ← Personal emissions calculator
│       │   ├── ShowroomMirror.jsx  ← Dealership greenwash detector
│       │   ├── GoGreen.jsx         ← Tool gateway
│       │   ├── TheReality.jsx      ← Education + greenwash tactics
│       │   ├── Community.jsx       ← News feed + switcher stories
│       │   └── About.jsx           ← Team + methodology
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── AIChat.jsx              ← Floating Groq LLaMA assistant
│       │   └── D3BreakevenChart.jsx    ← D3 crossover visualisation
│       └── styles/globals.css      ← Full design system
```

---

## Data Sources

| Dataset | File | Source |
|---------|------|--------|
| Fuel Economy | `epa_fuel_economy.csv` | EPA fueleconomy.gov + LCAT Tool 2023 |
| Lifecycle CO₂ | `eea_lifecycle_emissions.csv` | EEA 2023 · doi:10.2760/141427 |
| Grid Intensity | `eea_grid_intensity.csv` | CEA 2023 · IEA 2023 · EPA eGRID 2023 |
| Greenwashing Claims | `greenwashing_claims.csv` | EEA 2022 · NDTV Auto · AutoCarIndia |

**Methodology:**

- **Manufacturing CO₂** — EEA 2023 per-vehicle LCA + OEM reports (ISO 14040/14044)
- **Battery disposal** — 0.14 t CO₂/kWh (Ellingsen 2016 / Romare 2017 / EEA 2021)
- **EV real-world range** — ARAI certified × 1.25 correction factor
- **ICE real-world consumption** — ARAI certified × 1.18 correction factor
- **ICE CO₂ per litre** — 2.31 kg/litre petrol (IPCC AR6 WG3)

---

## How the Lifecycle Calculator Works

The emissions model runs a **full LCA (Life Cycle Assessment)** for every vehicle:

```
For each vehicle + (state_grid, daily_km, years):
  1. Manufacturing CO₂    = EEA per-vehicle LCA value (tonnes)
  2. Operational CO₂      = daily_km × years × (grid_intensity or fuel_factor)
  3. Battery disposal CO₂ = battery_kWh × 0.14 t/kWh  [EVs only]
  4. Total lifecycle CO₂  = Manufacturing + Operational + Disposal
  5. Breakeven year       = solve for when EV total < ICE total
```

**Grid-adjusted EV emissions** mean the same Nexon EV scores very differently in Himachal Pradesh (hydro-heavy, 0.28 kg CO₂/kWh) vs. Jharkhand (coal-heavy, 0.92 kg CO₂/kWh) — a distinction no automaker publishes.

> **Ratings:** A+ (< 20t total) · A (20–35t) · B (35–50t) · C (> 50t). Based on EEA 2023 fleet benchmarks adjusted for Indian driving patterns.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/` | Health check + data load stats |
| GET | `/api/cars/` | All vehicles with LCA data |
| GET | `/api/grids/` | All 67 grid regions |
| GET | `/api/data-sources/` | CSV provenance metadata |
| POST | `/api/lifecycle/` | Calculate lifecycle CO₂ |
| POST | `/api/greenwash/` | Greenwashing score + CSV claims match |
| POST | `/api/chat/` | AI carbon advisor (Groq LLaMA) |

**Example — lifecycle comparison:**

```bash
curl -X POST http://localhost:8000/api/lifecycle/ \
  -H "Content-Type: application/json" \
  -d '{"cars": ["nexon-ev", "creta"], "grid": "DL", "km": 40, "years": 8}'
```

**Example — greenwash check:**

```bash
curl -X POST http://localhost:8000/api/greenwash/ \
  -H "Content-Type: application/json" \
  -d '{"text": "This vehicle produces zero emissions and is carbon neutral"}'
```

---

## Tech Stack

| Library | Purpose |
|---------|---------|
| [![React](https://img.shields.io/badge/React%2018-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev) | UI framework |
| [![Vite](https://img.shields.io/badge/Vite%205-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev) | Build tool + dev proxy |
| [![React Router](https://img.shields.io/badge/React%20Router%20v6-CA4245?style=flat-square&logo=reactrouter&logoColor=white)](https://reactrouter.com) | Client-side routing |
| [![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/) | Page + component animations |
| [![D3.js](https://img.shields.io/badge/D3.js-F9A03C?style=flat-square&logo=d3dotjs&logoColor=white)](https://d3js.org) | Breakeven crossover chart |
| [![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)](https://www.chartjs.org) | Lifecycle bar charts |
| [![Papa Parse](https://img.shields.io/badge/Papa%20Parse-5.4-lightgrey?style=flat-square)](https://www.papaparse.com) | Runtime CSV loader |
| [![Django](https://img.shields.io/badge/Django-092E20?style=flat-square&logo=django&logoColor=white)](https://djangoproject.com) | REST API + data pipeline |
| [![Groq](https://img.shields.io/badge/Groq%20LLaMA-FF6B35?style=flat-square&logo=meta&logoColor=white)](https://console.groq.com) | AI carbon advisor chat |

---

## Dependencies

**Frontend (`frontend/package.json`)**

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18 | UI framework |
| react-dom | ^18 | DOM renderer |
| react-router-dom | ^6 | Client-side routing |
| framer-motion | latest | Animations |
| d3 | latest | Breakeven chart |
| chart.js | latest | Bar charts |
| react-chartjs-2 | latest | Chart.js React wrapper |
| papaparse | ^5.4 | CSV parsing |
| vite | ^5 | Dev server + build |

**Backend (`backend/requirements.txt`)**

| Package | Purpose |
|---------|---------|
| django | Web framework + ORM |
| djangorestframework | REST API |
| django-cors-headers | CORS for frontend requests |
| gunicorn | Production WSGI server |
| groq | Groq LLaMA AI chat API |
| python-dotenv | Environment variable loading |

---

## Deploy to Render

The app is deployed on [Render](https://render.com) as two services — a Static Site for the frontend and a Web Service for the backend.

### Backend — Web Service

1. Go to [render.com](https://render.com) → **New → Web Service** and connect your GitHub repo
2. Set **Root Directory** to `backend/`
3. Set **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --noinput`
4. Set **Start Command:** `gunicorn carbonwise.wsgi:application`
5. Add the following environment variables:

| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | Your key from [console.groq.com](https://console.groq.com) |
| `SECRET_KEY` | Any long random string |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `your-backend-name.onrender.com` |

6. Click **Create Web Service** and note the generated URL (e.g. `https://carbonwise-api.onrender.com`)

### Frontend — Static Site

1. Go to [render.com](https://render.com) → **New → Static Site** and connect the same repo
2. Set **Root Directory** to `frontend/`, **Build Command** to `npm install && npm run build`, **Publish Directory** to `dist`
3. Add a **Rewrite Rule**: Source `/*` → Destination `/index.html` (required for React Router)
4. Add environment variable: `VITE_API_URL=https://your-backend-name.onrender.com`
5. Deploy — the frontend is live at your Render static site URL

> The frontend reads `VITE_API_URL` out of the box — no code changes needed.
> **Note:** Free tier web services spin down after inactivity; the first API call after idle may take ~30 seconds.

---

## Configuration

**Frontend** — create `frontend/.env.local` for local development:

```bash
VITE_API_URL=http://localhost:8000
```

**Backend** — set in environment or `backend/carbonwise/settings.py`:

```python
GROQ_API_KEY = 'gsk_your_key_here'   # free at console.groq.com
```

---

## Roadmap

- [ ] Add CMIP6 grid forecast — show how state grid intensities will shift by 2035
- [ ] Add fleet mode — compare 5+ vehicles for fleet procurement decisions
- [ ] Export comparison as PDF / shareable PNG card
- [ ] Live OBD-II integration for real-world fuel economy logging
- [ ] Carbon offset marketplace integration (verified projects only)

---

## Contributors

Ayushi Agrawal
Neha Malhotra
Reshmi Yadav
Jhalak Mittal

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Acknowledgements

- Fuel economy data from [EPA fueleconomy.gov](https://fueleconomy.gov) and LCAT Tool 2023
- Lifecycle emissions methodology from [EEA 2023](https://www.eea.europa.eu) · doi:10.2760/141427
- Grid intensity from [CEA India 2023](https://cea.nic.in), [IEA 2023](https://iea.org), [EPA eGRID](https://epa.gov/egrid)
- Greenwashing claims database from EEA 2022, NDTV Auto, and AutoCarIndia
- AI features powered by [Groq](https://console.groq.com) (LLaMA 3)
- Geocoding via [Nominatim / OpenStreetMap](https://nominatim.openstreetmap.org)
