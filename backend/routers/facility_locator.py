"""
Facility Locator router — certified recycling & collection facilities across India.
"""
import math
from typing import List, Optional

from fastapi import APIRouter, Query

router = APIRouter()

_FACILITIES = [
    {"id": 1,  "name": "GreenRecycle Ltd",          "type": "battery_recycler", "city": "Mumbai",     "state": "Maharashtra", "lat": 19.076,  "lng": 72.877,  "capacity_mt": 500, "utilisation_pct": 87, "certifications": ["CPCB", "ISO 14001", "EPR"], "contact": "+91 22 1234 5678", "accepts": ["li-ion", "nimh", "lead-acid"],   "rating": 4.5},
    {"id": 2,  "name": "SolarWaste Co",              "type": "solar_recycler",   "city": "Ahmedabad",  "state": "Gujarat",     "lat": 23.022,  "lng": 72.571,  "capacity_mt": 200, "utilisation_pct": 45, "certifications": ["CPCB", "ISO 14001"],        "contact": "+91 79 9876 5432", "accepts": ["mono-si", "poly-si", "thin-film"], "rating": 4.2},
    {"id": 3,  "name": "BattRecycle Pvt Ltd",        "type": "battery_recycler", "city": "Chennai",    "state": "Tamil Nadu",  "lat": 13.082,  "lng": 80.270,  "capacity_mt": 350, "utilisation_pct": 72, "certifications": ["CPCB", "EPR", "ISO 9001"],  "contact": "+91 44 5678 1234", "accepts": ["li-ion", "lead-acid"],            "rating": 4.3},
    {"id": 4,  "name": "EcoSolar Recyclers",         "type": "solar_recycler",   "city": "Jaipur",     "state": "Rajasthan",   "lat": 26.912,  "lng": 75.787,  "capacity_mt": 150, "utilisation_pct": 60, "certifications": ["CPCB", "ISO 14001"],        "contact": "+91 141 234 5678", "accepts": ["mono-si", "poly-si"],             "rating": 3.9},
    {"id": 5,  "name": "Delhi E-Waste Hub",          "type": "battery_recycler", "city": "Delhi",      "state": "Delhi",       "lat": 28.704,  "lng": 77.102,  "capacity_mt": 600, "utilisation_pct": 91, "certifications": ["CPCB", "EPR", "ISO 14001", "ISO 9001"], "contact": "+91 11 8765 4321", "accepts": ["li-ion", "nimh", "lead-acid", "nimcad"], "rating": 4.7},
    {"id": 6,  "name": "Bangalore Green Tech",       "type": "battery_recycler", "city": "Bangalore",  "state": "Karnataka",   "lat": 12.971,  "lng": 77.594,  "capacity_mt": 280, "utilisation_pct": 65, "certifications": ["CPCB", "ISO 14001"],        "contact": "+91 80 2345 6789", "accepts": ["li-ion", "nimh"],                 "rating": 4.1},
    {"id": 7,  "name": "Kolkata Reclaim Centre",     "type": "battery_recycler", "city": "Kolkata",    "state": "West Bengal", "lat": 22.572,  "lng": 88.363,  "capacity_mt": 180, "utilisation_pct": 55, "certifications": ["CPCB", "EPR"],             "contact": "+91 33 6543 2109", "accepts": ["lead-acid", "li-ion"],            "rating": 3.8},
    {"id": 8,  "name": "SolarReuse India",           "type": "solar_recycler",   "city": "Ahmedabad",  "state": "Gujarat",     "lat": 23.033,  "lng": 72.585,  "capacity_mt": 120, "utilisation_pct": 38, "certifications": ["CPCB", "ISO 14001", "EPR"], "contact": "+91 79 1122 3344", "accepts": ["mono-si", "poly-si", "thin-film", "perc"], "rating": 4.4},
    {"id": 9,  "name": "Hyderabad Battery Works",   "type": "battery_recycler", "city": "Hyderabad",  "state": "Telangana",   "lat": 17.385,  "lng": 78.486,  "capacity_mt": 240, "utilisation_pct": 78, "certifications": ["CPCB", "ISO 9001"],         "contact": "+91 40 9988 7766", "accepts": ["li-ion", "nimh", "lead-acid"],   "rating": 4.0},
    {"id": 10, "name": "Pune Solar Recovery",        "type": "solar_recycler",   "city": "Pune",       "state": "Maharashtra", "lat": 18.520,  "lng": 73.856,  "capacity_mt": 100, "utilisation_pct": 50, "certifications": ["CPCB"],                    "contact": "+91 20 5544 3322", "accepts": ["mono-si", "poly-si"],             "rating": 3.7},
    {"id": 11, "name": "Chennai Solar Hub",          "type": "solar_recycler",   "city": "Chennai",    "state": "Tamil Nadu",  "lat": 13.067,  "lng": 80.237,  "capacity_mt": 170, "utilisation_pct": 43, "certifications": ["CPCB", "ISO 14001"],        "contact": "+91 44 7788 9900", "accepts": ["mono-si", "poly-si", "thin-film"], "rating": 4.1},
    {"id": 12, "name": "Jamshedpur E-Cycle",         "type": "battery_recycler", "city": "Jamshedpur", "state": "Jharkhand",   "lat": 22.802,  "lng": 86.202,  "capacity_mt": 200, "utilisation_pct": 62, "certifications": ["CPCB", "EPR"],             "contact": "+91 657 234 5678", "accepts": ["li-ion", "lead-acid"],            "rating": 3.9},
]


def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate great-circle distance in km between two lat/lng points."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


@router.get("/")
def list_facilities(type: Optional[str] = None, state: Optional[str] = None) -> List[dict]:
    """Return list of certified recycling facilities, optionally filtered."""
    result = _FACILITIES
    if type:
        result = [f for f in result if f["type"] == type]
    if state:
        result = [f for f in result if f["state"].lower() == state.lower()]
    return result


@router.get("/nearest")
def nearest_facilities(
    lat: float = Query(..., description="Latitude of origin"),
    lng: float = Query(..., description="Longitude of origin"),
    type: Optional[str] = Query(None, description="battery_recycler | solar_recycler"),
) -> List[dict]:
    """Return facilities sorted by distance from given lat/lng."""
    result = _FACILITIES
    if type:
        result = [f for f in result if f["type"] == type]
    for f in result:
        f = dict(f)
    result = sorted(result, key=lambda f: _haversine(lat, lng, f["lat"], f["lng"]))
    for f in result:
        f["distance_km"] = round(_haversine(lat, lng, f["lat"], f["lng"]), 1)
    return result
