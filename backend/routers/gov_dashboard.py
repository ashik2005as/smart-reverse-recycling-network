"""
Government Dashboard router — national-level waste analytics, alerts, ESG metrics.
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/heatmap")
def get_waste_heatmap():
    """Return waste concentration points across India."""
    return [
        {"city": "Delhi NCR",    "lat": 28.7041, "lng": 77.1025, "battery_mt": 2840, "solar_mt": 1200, "severity": "critical"},
        {"city": "Mumbai Metro", "lat": 19.0760, "lng": 72.8777, "battery_mt": 2100, "solar_mt": 1800, "severity": "critical"},
        {"city": "Bangalore",    "lat": 12.9716, "lng": 77.5946, "battery_mt": 1850, "solar_mt": 900,  "severity": "high"},
        {"city": "Kolkata",      "lat": 22.5726, "lng": 88.3639, "battery_mt": 1200, "solar_mt": 450,  "severity": "high"},
        {"city": "Chennai",      "lat": 13.0827, "lng": 80.2707, "battery_mt": 980,  "solar_mt": 680,  "severity": "medium"},
        {"city": "Hyderabad",    "lat": 17.3850, "lng": 78.4867, "battery_mt": 890,  "solar_mt": 520,  "severity": "medium"},
        {"city": "Ahmedabad",    "lat": 23.0225, "lng": 72.5714, "battery_mt": 760,  "solar_mt": 1400, "severity": "medium"},
        {"city": "Jaipur",       "lat": 26.9124, "lng": 75.7873, "battery_mt": 620,  "solar_mt": 2100, "severity": "low"},
    ]


@router.get("/alerts")
def get_dumping_alerts():
    """Return active and resolved illegal dumping alerts."""
    return [
        {"id": 1, "location": "Gurgaon Industrial Area", "lat": 28.4595, "lng": 77.0266,
         "type": "EV Battery Dump", "severity": "high", "status": "active"},
        {"id": 2, "location": "Dharavi, Mumbai", "lat": 19.0407, "lng": 72.8490,
         "type": "Solar Panel Waste", "severity": "medium", "status": "resolved"},
        {"id": 3, "location": "Mundka, Delhi", "lat": 28.6804, "lng": 76.9984,
         "type": "Mixed e-Waste", "severity": "high", "status": "active"},
        {"id": 4, "location": "Howrah, Kolkata", "lat": 22.5958, "lng": 88.2636,
         "type": "Battery Cells", "severity": "low", "status": "resolved"},
        {"id": 5, "location": "Ambattur, Chennai", "lat": 13.1143, "lng": 80.1548,
         "type": "Solar Panels", "severity": "medium", "status": "active"},
    ]


@router.get("/forecast")
def get_waste_forecast():
    """5-year national waste forecast."""
    return {
        "years": [2024, 2025, 2026, 2027, 2028],
        "battery_waste_kt": [45.2, 68.4, 98.1, 138.5, 192.0],
        "solar_waste_kt":   [12.1, 18.7, 28.4, 41.2,  58.9],
    }


@router.get("/recycler-capacity")
def get_recycler_capacity():
    """Recycler capacity utilisation."""
    return [
        {"name": "GreenRecycle Ltd",   "capacity_mt": 500, "utilisation_pct": 87},
        {"name": "EcoMetal India",     "capacity_mt": 350, "utilisation_pct": 72},
        {"name": "SolarWaste Co",      "capacity_mt": 200, "utilisation_pct": 45},
        {"name": "NationalBattery",    "capacity_mt": 800, "utilisation_pct": 91},
        {"name": "CleanCycle",         "capacity_mt": 300, "utilisation_pct": 63},
    ]


@router.get("/esg-metrics")
def get_esg_metrics():
    """ESG impact metrics."""
    return {
        "carbon_credits_issued": 12400,
        "trees_equivalent": 87300,
        "water_saved_kl": 4200,
        "informal_jobs_formalised": 3840,
        "compliance_score": 94,
        "waste_diverted_mt": 11.4,
        "esg_rating": "A+",
    }
