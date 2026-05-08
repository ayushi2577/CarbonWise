# CarbonWise — Django Backend

## Quick Start (3 commands)

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs at: http://localhost:8000

## Add Your Groq API Key

Open `carbonwise/settings.py` and set:
```python
GROQ_API_KEY = 'your_gsk_key_here'
```
Or set as environment variable:
```bash
export GROQ_API_KEY=your_gsk_key_here
python manage.py runserver
```
Free key at: https://console.groq.com

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/health/` | GET | Health check |
| `/api/chat/` | POST | AI carbon advisor |
| `/api/lifecycle/` | POST | Calculate lifecycle CO2 |
| `/api/greenwash/` | POST | Score a marketing claim |
| `/api/cars/` | GET | All vehicles in database |
| `/api/grids/` | GET | All grid intensities |

## Example: Chat Request
```bash
curl -X POST http://localhost:8000/api/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "I drive 40km/day in Delhi. Should I buy a Nexon EV?"}'
```

## Example: Lifecycle Calculation
```bash
curl -X POST http://localhost:8000/api/lifecycle/ \
  -H "Content-Type: application/json" \
  -d '{"cars": ["nexon-ev", "creta"], "grid": "DL", "km": 40, "years": 8}'
```

## Example: Greenwash Check
```bash
curl -X POST http://localhost:8000/api/greenwash/ \
  -H "Content-Type: application/json" \
  -d '{"text": "This vehicle produces zero emissions and is carbon neutral"}'
```
