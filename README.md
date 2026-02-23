# ♻️ Smart Reverse Recycling Network

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688.svg)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ed.svg)](https://docker.com)
[![SIH 2024](https://img.shields.io/badge/SIH-2024-orange.svg)](#sih-demo-plan)

> **AI-Driven National Platform for Recycling Solar Panels & EV Batteries**  
> Smart India Hackathon (SIH) 2024 Project

---

## 🌍 Problem Statement

India faces a growing e-waste crisis:

| Challenge | Scale |
|-----------|-------|
| EV batteries reaching end-of-life | ~45,000 MT by 2024 |
| Degrading solar PV panels | ~12,000 MT by 2024 |
| Lack of reverse logistics infrastructure | No unified platform |
| Material recovery efficiency | < 40% informal sector |
| Illegal dumping incidents | 3,000+ per year |

There is **no unified intelligent platform** for lifecycle tracking, optimised recycling, and stakeholder coordination.

---

## 💡 Solution Overview

A national digital platform that uses **AI + IoT + Optimization** algorithms to:

1. 🔋 **Predict** battery/panel end-of-life
2. ♻️ **Recommend** reuse vs repair vs recycle
3. 🚛 **Optimise** collection logistics (VRP)
4. ⚗️ **Estimate** recoverable material value
5. 🏪 **Connect** stakeholders via marketplace
6. 🏛️ **Enable** government oversight & ESG reporting

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SMART RECYCLING PLATFORM                     │
├────────────────┬────────────────────┬───────────────────────────────┤
│   FRONTEND     │      BACKEND       │       AI/ML MODELS            │
│ React + Vite   │  FastAPI + Python  │  TensorFlow / OR-Tools        │
│                │                    │                               │
│ Dashboard      │ /api/battery       │ Battery LSTM (SOH prediction) │
│ BatteryHealth  │ /api/solar         │ Solar Conv1D+GRU (degradation)│
│ SolarDegrad.   │ /api/route         │ Decision Engine (MCDA)        │
│ RouteOptimizer │ /api/material-     │ VRP Optimizer (OR-Tools)      │
│ MaterialRecov  │   recovery         │ Material Recovery Twin        │
│ Marketplace    │ /api/marketplace   │                               │
│ GovDashboard   │ /api/dashboard     │                               │
│                │ /api/gov           │                               │
├────────────────┴────────────────────┴───────────────────────────────┤
│              PostgreSQL (PostGIS) + Redis Cache                      │
└─────────────────────────────────────────────────────────────────────┘

IoT Devices --> MQTT Broker --> Backend --> AI Models --> Frontend
                                   |
                             Notification Service
                                   |
                           ┌───────┴────────┐
                           │  Stakeholders   │
                           │ Recyclers/Govt  │
                           └────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | UI framework |
| Routing | React Router v6 | SPA navigation |
| Charts | Chart.js + react-chartjs-2 | Data visualisation |
| Maps | Leaflet + react-leaflet | Interactive maps |
| Backend | FastAPI (Python 3.11) | REST API |
| ORM | SQLAlchemy | Database ORM |
| Database | PostgreSQL + PostGIS | Geospatial data |
| Cache | Redis | Route cache, sessions |
| ML Battery | TensorFlow / Keras LSTM | SOH prediction |
| ML Solar | TensorFlow / Keras Conv1D+GRU | Degradation forecasting |
| Routing | Google OR-Tools | VRP optimisation |
| Container | Docker + Compose | Deployment |

---

## ✨ Features

### 🔋 Battery Health Prediction
- LSTM-based State of Health (SOH) analysis
- Remaining Useful Life (RUL) estimation
- Thermal anomaly detection
- **Battery Digital Passport** — unique lifecycle ID per battery
- Carbon credit estimation

### ☀️ Solar Panel Degradation Analysis
- Time-series efficiency degradation forecasting
- Hotspot risk assessment
- Optimal replacement timing
- 10-year efficiency projection charts

### 🗺️ Route Optimizer
- Capacitated Vehicle Routing Problem (VRP) solver
- OR-Tools integration with nearest-neighbour fallback
- Fuel cost & CO2 savings calculation
- Interactive Leaflet map with collection point status

### ♻️ Material Recovery Estimator
- Digital twin for Lithium, Nickel, Cobalt, Silver, Silicon recovery
- Economic value calculation at market prices
- CO2 savings vs virgin mining
- Water consumption reduction

### 🏪 Marketplace
- Second-life battery & solar panel listings
- Pickup booking interface
- Seller/buyer matching

### 🏛️ Government Dashboard
- National waste concentration heatmap
- 5-year waste forecast by state
- Recycler capacity utilisation
- Illegal dumping alerts
- **ESG Impact Metrics** — carbon credits, jobs formalised, water saved

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/ashik2005as/smart-reverse-recycling-network.git
cd smart-reverse-recycling-network

# Start all services
docker compose up --build

# Access the platform
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/api/docs
```

### Option 2: Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # Edit .env with your DB credentials
uvicorn main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev                       # Starts on http://localhost:3000
```

#### AI Models (optional — demo works without training)

```bash
cd ai_models
pip install -r requirements.txt

# Train battery model
python battery_health/train.py --epochs 50

# Train solar model
python solar_degradation/train.py --epochs 40
```

---

## 📖 API Documentation

Full API docs available at `http://localhost:8000/api/docs` (Swagger UI)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/battery/predict` | POST | AI battery health analysis |
| `/api/battery/` | GET | List batteries |
| `/api/solar/predict` | POST | AI solar degradation analysis |
| `/api/route/optimize` | POST | VRP route optimisation |
| `/api/route/points` | GET | Collection points |
| `/api/material-recovery/estimate` | POST | Material recovery estimation |
| `/api/marketplace/` | GET/POST | Marketplace listings |
| `/api/marketplace/book` | POST | Book pickup |
| `/api/dashboard/metrics` | GET | Platform KPIs |
| `/api/gov/heatmap` | GET | Waste heatmap data |
| `/api/gov/alerts` | GET | Dumping alerts |
| `/api/gov/esg-metrics` | GET | ESG metrics |

See [`docs/API.md`](docs/API.md) for full request/response examples.

---

## 📁 Project Structure

```
smart-reverse-recycling-network/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── BatteryHealth.jsx
│   │   │   ├── SolarDegradation.jsx
│   │   │   ├── RouteOptimizer.jsx
│   │   │   ├── MaterialRecovery.jsx
│   │   │   ├── Marketplace.jsx
│   │   │   └── GovDashboard.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   ├── ChartWidget.jsx
│   │   │   ├── MapView.jsx
│   │   │   └── Footer.jsx
│   │   └── styles/global.css
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── Dockerfile
├── backend/                     # FastAPI backend
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   ├── schemas/
│   ├── routers/
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── ai_models/                   # AI/ML models
│   ├── battery_health/
│   ├── solar_degradation/
│   ├── decision_engine/
│   ├── route_optimizer/
│   ├── material_recovery/
│   └── requirements.txt
├── docs/
│   ├── ARCHITECTURE.md
│   └── API.md
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🔑 Key Innovations

### 1. Battery Digital Passport
Each battery receives a unique `DP-XXXXXXXX` identifier tracking its complete lifecycle from manufacture through second-life deployment to final recycling.

### 2. Carbon Credit Calculator
Quantifies carbon credits earned through proper recycling vs illegal dumping or virgin material mining.

### 3. ESG Impact Dashboard
Environmental, Social, Governance scoring visible to government authorities — trees equivalent, jobs formalised, water saved, compliance score.

---

## 👥 Team

| Role | Responsibility |
|------|---------------|
| Full-Stack Developer | Frontend + Backend integration |
| ML Engineer | Battery SOH & solar degradation models |
| IoT Engineer | Sensor data pipeline |
| Operations Research | VRP optimisation |
| Domain Expert | Battery chemistry, recycling processes |

---

## 🎯 SIH Demo Plan

1. **Live Dashboard** — Show real-time KPI cards and charts
2. **Battery Analysis** — Upload sample battery data, get SOH prediction + Digital Passport
3. **Solar Degradation** — Show 10-year efficiency forecast chart
4. **Route Map** — Run VRP optimisation on 10 Indian cities
5. **Material Recovery** — Calculate value from 50 battery packs
6. **Marketplace** — Demo pickup booking flow
7. **Gov Dashboard** — Show national heatmap + ESG metrics

---

## 📄 License

MIT © 2024 Smart Reverse Recycling Network Team
