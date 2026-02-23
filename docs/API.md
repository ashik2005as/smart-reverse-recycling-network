# API Documentation — Smart Reverse Recycling Network

Base URL: `http://localhost:8000`
Interactive Docs: `http://localhost:8000/api/docs`

---

## Authentication

Currently open (no auth) for hackathon demo.
Production should add JWT Bearer token authentication.

---

## Battery Endpoints

### POST `/api/battery/predict`

Run AI health analysis on battery parameters.

**Request:**
```json
{
  "voltage": 3.7,
  "current": 150.0,
  "temperature": 28.5,
  "cycles": 450,
  "capacity": 75.0,
  "manufacturer": "Tata Motors"
}
```

**Response:**
```json
{
  "soh": 84.2,
  "rul_cycles": 513,
  "thermal_anomaly": false,
  "recommendation": "Reuse — Battery in excellent condition for second-life applications",
  "confidence": 0.93,
  "digital_passport_id": "DP-A8B2C3D4",
  "carbon_credits": 1.94
}
```

### GET `/api/battery/`

List registered batteries.

**Response:**
```json
[
  {
    "id": 1,
    "manufacturer": "Tata Motors",
    "capacity_kwh": 75,
    "current_soh": 88.4,
    "status": "active"
  }
]
```

### POST `/api/battery/`

Register a new battery.

**Request:** BatteryCreate schema (see schemas/battery.py)

---

## Solar Panel Endpoints

### POST `/api/solar/predict`

Run AI degradation analysis.

**Request:**
```json
{
  "efficiency": 18.5,
  "age_years": 7.0,
  "temperature": 38.0,
  "capacity_kw": 10.0,
  "location": "Jaipur, Rajasthan",
  "manufacturer": "Adani Solar"
}
```

**Response:**
```json
{
  "degradation_score": 35.1,
  "current_efficiency": 18.5,
  "efficiency_drop_pct": 5.1,
  "optimal_replacement_years": 13,
  "hotspot_risk": false,
  "annual_loss_kwh": 1.3,
  "confidence": 0.91
}
```

### GET `/api/solar/`

List solar panels.

---

## Route Optimizer Endpoints

### POST `/api/route/optimize`

Run VRP optimisation.

**Request:**
```json
{
  "point_ids": null,
  "num_vehicles": 3,
  "vehicle_capacity": 100
}
```

**Response:**
```json
{
  "routes": [
    {
      "vehicle_id": 1,
      "stops": ["Delhi North Hub", "Gurgaon Center", "Jaipur Recycler"],
      "total_distance_km": 320.5,
      "estimated_time_hours": 6.2
    }
  ],
  "total_fuel_saved_litres": 340.0,
  "total_cost_saved_inr": 28900.0,
  "co2_reduced_kg": 890.0,
  "distance_saved_km": 1240.0
}
```

### GET `/api/route/points`

List all collection points.

---

## Material Recovery Endpoints

### POST `/api/material-recovery/estimate`

Estimate recoverable materials.

**Request:**
```json
{
  "source_type": "battery",
  "capacity": 75.0,
  "quantity": 50
}
```

**Response:**
```json
{
  "source_type": "battery",
  "total_units": 50,
  "materials": {
    "lithium":   { "raw_kg": 600.0,  "recoverable_kg": 552.0,  "value_usd": 12420.0 },
    "nickel":    { "raw_kg": 1800.0, "recoverable_kg": 1710.0, "value_usd": 24282.0 },
    "cobalt":    { "raw_kg": 412.5,  "recoverable_kg": 383.6,  "value_usd": 12698.2 },
    "manganese": { "raw_kg": 825.0,  "recoverable_kg": 742.5,  "value_usd": 1559.3  },
    "copper":    { "raw_kg": 937.5,  "recoverable_kg": 900.0,  "value_usd": 8010.0  }
  },
  "total_value_usd": 58969.5,
  "co2_saved_kg": 46500.0,
  "esg_carbon_credits": 884.5
}
```

---

## Marketplace Endpoints

### GET `/api/marketplace/`

List all listings. Optional query param: `?type=battery`

### POST `/api/marketplace/`

Create new listing.

### POST `/api/marketplace/book`

Book a pickup.

**Request:**
```json
{
  "listing_id": 1,
  "buyer_name": "Rajesh Kumar",
  "contact": "rajesh@email.com",
  "pickup_date": "2024-03-15",
  "address": "123 Green Street, Mumbai 400001"
}
```

**Response:**
```json
{
  "confirmation_id": "PB-XK9Y2Z",
  "message": "Pickup booked! Confirmation PB-XK9Y2Z. You will receive an email within 2 hours.",
  "listing_id": 1
}
```

---

## Dashboard Endpoints

### GET `/api/dashboard/metrics`

Platform-wide KPIs.

### GET `/api/dashboard/waste-forecast`

Monthly waste forecast data.

### GET `/api/dashboard/material-breakdown`

YTD material recovery breakdown.

### GET `/api/dashboard/activity-feed`

Recent activity feed (last 5 events).

---

## Government Dashboard Endpoints

### GET `/api/gov/heatmap`

National waste concentration points.

### GET `/api/gov/alerts`

Illegal dumping alerts.

### GET `/api/gov/forecast`

5-year waste forecast.

### GET `/api/gov/recycler-capacity`

Recycler capacity utilisation.

### GET `/api/gov/esg-metrics`

ESG impact metrics.

---

## Health Check

### GET `/api/health`

**Response:**
```json
{
  "status": "healthy",
  "service": "smart-recycling-network-api",
  "version": "1.0.0"
}
```
