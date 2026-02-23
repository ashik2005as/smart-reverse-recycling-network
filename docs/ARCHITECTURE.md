# System Architecture — Smart Reverse Recycling Network

## Overview

The platform is composed of four main layers:

1. **Presentation Layer** — React frontend
2. **API Layer** — FastAPI backend
3. **Intelligence Layer** — AI/ML models
4. **Data Layer** — PostgreSQL + Redis

---

## Data Flow

```
[IoT Sensors / User Input]
         │
         ▼
[FastAPI REST API] ──────────────────────────────┐
    │        │                                   │
    │        ▼                                   │
    │  [AI/ML Models]                            │
    │   Battery LSTM                             │
    │   Solar Conv1D+GRU                         │
    │   Decision Engine (MCDA)                   │
    │   VRP Optimizer (OR-Tools)                 │
    │   Material Recovery Twin                   │
    │        │                                   │
    ▼        ▼                                   │
[PostgreSQL + PostGIS]  [Redis Cache]            │
         │                                       │
         └───────────────────────────────────────┘
                         │
                         ▼
              [React Frontend SPA]
              Dashboard / Analytics
              Interactive Maps (Leaflet)
              Charts (Chart.js)
```

---

## Component Details

### Frontend (React + Vite)

- **State management**: React hooks (useState, useEffect)
- **Routing**: React Router v6 with nested routes
- **Charts**: Chart.js via react-chartjs-2 (Line, Bar, Doughnut)
- **Maps**: Leaflet.js via react-leaflet
- **HTTP client**: Axios with mock fallback for offline demo

### Backend (FastAPI)

- **CORS**: Configured for frontend dev server
- **Validation**: Pydantic v2 models for all request/response schemas
- **Database**: SQLAlchemy ORM with graceful fallback to mock data
- **Routers**: Modular APIRouter per domain

### AI/ML Pipeline

#### Battery Health (LSTM)
```
Input: [voltage, current, temperature, cycles, capacity] × 10 time steps
Architecture: LSTM(64) → LSTM(32) → Dense(16) → Dense(1, sigmoid)
Output: SOH score (0-1), multiplied by 100 for %
```

#### Solar Degradation (Conv1D + GRU)
```
Input: [efficiency, temperature, irradiance, dust, age] × 12 monthly steps
Architecture: Conv1D(32) → MaxPool → GRU(32) → Dense(16) → Dense(1, sigmoid)
Output: Degradation score (0-1)
```

#### Decision Engine (Multi-Criteria)
```
Criteria: SOH (40%), Market Demand (20%), Refurb Cost (20%), Material Value (20%)
Output: Second-life | Repair | Recycle + confidence score
```

#### VRP Optimizer
```
Algorithm: Google OR-Tools with PATH_CHEAPEST_ARC heuristic
Fallback: Nearest-neighbour greedy algorithm
Constraints: Vehicle capacity, time windows
Output: Optimised routes + fuel/CO2 savings
```

---

## Database Schema

```sql
-- Batteries
CREATE TABLE batteries (
  id                  SERIAL PRIMARY KEY,
  manufacturer        VARCHAR(100),
  capacity_kwh        FLOAT NOT NULL,
  voltage             FLOAT,
  current             FLOAT,
  current_soh         FLOAT,
  cycles              INTEGER,
  temperature         FLOAT,
  location            VARCHAR(200),
  status              VARCHAR(50) DEFAULT 'active',
  digital_passport_id VARCHAR(20) UNIQUE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ
);

-- Solar Panels
CREATE TABLE solar_panels (
  id                SERIAL PRIMARY KEY,
  manufacturer      VARCHAR(100),
  capacity_kw       FLOAT NOT NULL,
  efficiency        FLOAT,
  age_years         FLOAT,
  location          VARCHAR(200),
  temperature       FLOAT,
  degradation_score FLOAT,
  status            VARCHAR(50) DEFAULT 'active',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Collection Points (with PostGIS geometry)
CREATE TABLE collection_points (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  latitude     FLOAT NOT NULL,
  longitude    FLOAT NOT NULL,
  capacity     INTEGER NOT NULL,
  current_load INTEGER DEFAULT 0,
  type         VARCHAR(50) DEFAULT 'mixed',
  address      VARCHAR(300),
  contact      VARCHAR(100),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace Listings
CREATE TABLE marketplace_listings (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(300) NOT NULL,
  type        VARCHAR(50) NOT NULL,
  description VARCHAR(1000),
  price       FLOAT,
  condition   VARCHAR(100),
  seller      VARCHAR(200),
  location    VARCHAR(200),
  quantity    INTEGER DEFAULT 1,
  status      VARCHAR(50) DEFAULT 'available',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Material Recovery Records
CREATE TABLE material_recovery_records (
  id                  SERIAL PRIMARY KEY,
  source_type         VARCHAR(50) NOT NULL,
  source_id           INTEGER,
  lithium_kg          FLOAT DEFAULT 0,
  nickel_kg           FLOAT DEFAULT 0,
  cobalt_kg           FLOAT DEFAULT 0,
  silver_kg           FLOAT DEFAULT 0,
  silicon_kg          FLOAT DEFAULT 0,
  copper_kg           FLOAT DEFAULT 0,
  manganese_kg        FLOAT DEFAULT 0,
  economic_value_usd  FLOAT DEFAULT 0,
  co2_saved_kg        FLOAT DEFAULT 0,
  recycler            VARCHAR(200),
  processed_at        TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Security Considerations

- All secrets stored in `.env` (never committed)
- CORS restricted to known origins in production
- Input validation via Pydantic on all endpoints
- Database connection pooling with `pool_pre_ping`
- Docker containers run as non-root (best practice)
