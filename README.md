# CarbonWise — Lifecycle Vehicle Emissions Intelligence


> "Google Flights for sustainable cars" — full lifecycle CO₂ comparison platform with EPA + EEA data pipeline.

---

## 🚀 Quick Start

### 1. Backend (Django + Python)

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
# → runs on http://localhost:8000
```

**Optional — AI chat (Groq, free):**
```bash
export GROQ_API_KEY=gsk_your_key_here   # get free at console.groq.com
```

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
# → runs on http://localhost:5173
```

Open http://localhost:5173 — the Vite proxy forwards `/api/*` to Django automatically.

---

## 📁 Project Structure

```
carbonwise/
├── backend/
│   ├── api/
│   │   ├── data_loader.py      ← CSV pipeline (EPA + EEA → CARS dict)
│   │   ├── views.py            ← Django API endpoints
│   │   └── urls.py
│   ├── data/                   ← 📊 DATA SOURCE CSVs
│   │   ├── epa_fuel_economy.csv          (EPA fueleconomy.gov + LCAT 2023)
│   │   ├── eea_lifecycle_emissions.csv   (EEA 2023 doi:10.2760/141427)
│   │   ├── eea_grid_intensity.csv        (CEA 2023 + IEA 2023 + EPA eGRID)
│   │   └── greenwashing_claims.csv       (EEA 2022 + NDTV + AutoCarIndia)
│   └── requirements.txt
│
├── frontend/
│   ├── public/data/            ← Same CSVs served statically
│   ├── src/
│   │   ├── data/
│   │   │   ├── index.js        ← Master data + calc helpers (LCA formulas)
│   │   │   └── csvLoader.js    ← Runtime CSV loader (Papa Parse)
│   │   ├── pages/              ← Home, Compare, Calculator, Insights, ...
│   │   └── components/         ← Navbar, Footer, AIChat, D3BreakevenChart
│   └── package.json
```

---

## 📊 Data Sources

| Dataset | File | Source |
|---|---|---|
| Fuel Economy | `epa_fuel_economy.csv` | EPA fueleconomy.gov + LCAT Tool 2023 |
| Lifecycle CO₂ | `eea_lifecycle_emissions.csv` | EEA 2023 doi:10.2760/141427 |
| Grid Intensity | `eea_grid_intensity.csv` | CEA 2023 · IEA 2023 · EPA eGRID 2023 |
| Greenwashing | `greenwashing_claims.csv` | EEA 2022 · NDTV Auto · AutoCarIndia |

**Methodology:**
- Manufacturing CO₂: EEA 2023 per-vehicle LCA + OEM reports (ISO 14040/14044)
- Battery disposal: 0.14 t CO₂/kWh (Ellingsen 2016 / Romare 2017 / EEA 2021)
- EV real-world: ARAI certified × 1.25 factor
- ICE real-world: ARAI certified × 1.18 factor
- ICE CO₂: 2.31 kg/litre petrol (IPCC AR6 WG3)

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health/` | Health check + data load stats |
| GET | `/api/cars/` | All vehicles with LCA data |
| GET | `/api/grids/` | All grid regions (67 regions) |
| GET | `/api/data-sources/` | CSV provenance metadata |
| POST | `/api/lifecycle/` | Calculate lifecycle CO₂ |
| POST | `/api/greenwash/` | Greenwashing score + CSV claims match |
| POST | `/api/chat/` | AI assistant (Groq LLaMA) |

---

## ✅ Judging Criteria Met

- **Relevance**: Full LCA (manufacturing + fuel + battery disposal), grid-adjusted
- **Feasibility**: React + Django + D3.js · Runs on localhost, deployable to Vercel/Railway
- **Innovation**: EPA + EEA CSV data pipeline · Greenwashing detector with CSV claims DB
- **Functionality**: Compare, Calculator, AI chat, Greenwash detector — all working
- **Code Quality**: Modular data_loader.py, typed CSV fields, provenance endpoint
- **UI/UX**: D3 breakeven chart, Chart.js bar chart, framer-motion animations

---

Built with React · Vite · Django · D3.js · Chart.js · Framer Motion · Groq AI
