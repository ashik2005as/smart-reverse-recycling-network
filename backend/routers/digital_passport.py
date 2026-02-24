"""
Digital Passport router — lifecycle tracking for batteries and solar panels.
"""
from datetime import datetime, timedelta

from fastapi import APIRouter
from typing import List

router = APIRouter()


def _demo_ts(delta_days: int = 0, year: int = 2026) -> str:
    base = datetime(year, 2, 23, 10, 0, 0)
    if delta_days:
        base = base - timedelta(days=delta_days)
    return base.strftime("%Y-%m-%d")


_MOCK_PASSPORTS = {
    "DP-A8B2C3D4": {
        "passport_id": "DP-A8B2C3D4",
        "asset_type": "battery",
        "manufacturer": "Tata Motors",
        "manufacture_date": "2021-06-15",
        "current_status": "Second-Life Deployment",
        "current_location": "Mumbai Grid Storage, Maharashtra",
        "soh_history": [
            {"date": "2021-06-15", "soh": 100.0},
            {"date": "2022-06-10", "soh": 93.5},
            {"date": "2023-05-20", "soh": 87.2},
            {"date": "2024-04-15", "soh": 79.8},
            {"date": "2025-03-01", "soh": 71.4},
            {"date": "2026-02-23", "soh": 63.1},
        ],
        "lifecycle_events": [
            {"date": "2021-06-15", "event": "Manufactured & Certified", "location": "Pune Plant", "details": "Battery pack assembled and QA certified"},
            {"date": "2021-07-01", "event": "First Deployment", "location": "Delhi EV Fleet", "details": "Deployed in Tata Nexon EV fleet"},
            {"date": "2023-11-10", "event": "SOH Check", "location": "Service Centre, Delhi", "details": "SOH at 83% — within acceptable range"},
            {"date": "2025-02-20", "event": "End-of-Vehicle Life", "location": "Collection Hub, Delhi", "details": "Vehicle decommissioned; battery removed"},
            {"date": "2025-03-15", "event": "Second-Life Assessment", "location": "GreenRecycle Ltd, Mumbai", "details": "Assessed for grid storage use"},
            {"date": "2025-04-01", "event": "Second-Life Deployment", "location": "Mumbai Grid Storage", "details": "Deployed as stationary energy storage"},
        ],
        "compliance": {"e_waste_rules_2023": True, "epr_registered": True, "certified_recycler": True},
        "carbon_credits_earned": 47.3,
        "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DP-A8B2C3D4",
    },
    "SP-D4E5F6G7": {
        "passport_id": "SP-D4E5F6G7",
        "asset_type": "solar",
        "manufacturer": "Waaree Energies",
        "manufacture_date": "2018-03-20",
        "current_status": "Recycling Scheduled",
        "current_location": "SolarWaste Co, Ahmedabad",
        "soh_history": [
            {"date": "2018-03-20", "soh": 100.0},
            {"date": "2019-03-15", "soh": 97.8},
            {"date": "2020-04-10", "soh": 95.1},
            {"date": "2021-05-05", "soh": 91.3},
            {"date": "2022-06-20", "soh": 86.7},
            {"date": "2023-07-14", "soh": 80.4},
            {"date": "2024-08-01", "soh": 73.2},
            {"date": "2026-02-23", "soh": 64.5},
        ],
        "lifecycle_events": [
            {"date": "2018-03-20", "event": "Manufactured & Certified", "location": "Waaree Factory, Surat", "details": "Mono-Si panel, 400W rated output"},
            {"date": "2018-05-01", "event": "First Installation", "location": "Rooftop, Jaipur", "details": "Installed in commercial rooftop solar plant"},
            {"date": "2021-09-10", "event": "Maintenance Check", "location": "Jaipur Installation", "details": "Minor soiling detected; cleaned and inspected"},
            {"date": "2024-11-20", "event": "Degradation Alert", "location": "Remote Monitor", "details": "Efficiency dropped below 14%; hotspot detected"},
            {"date": "2025-01-15", "event": "Decommissioned", "location": "Collection Hub, Jaipur", "details": "Removed from rooftop; sent for assessment"},
            {"date": "2025-02-10", "event": "Recycling Scheduled", "location": "SolarWaste Co, Ahmedabad", "details": "Silicon and silver recovery planned"},
        ],
        "compliance": {"e_waste_rules_2023": True, "epr_registered": True, "certified_recycler": False},
        "carbon_credits_earned": 28.6,
        "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SP-D4E5F6G7",
    },
}

_MOCK_SEARCH_RESULTS = [
    {"passport_id": "DP-A8B2C3D4", "asset_type": "battery", "manufacturer": "Tata Motors",     "current_status": "Second-Life Deployment",  "location": "Mumbai"},
    {"passport_id": "SP-D4E5F6G7", "asset_type": "solar",   "manufacturer": "Waaree Energies",  "current_status": "Recycling Scheduled",      "location": "Ahmedabad"},
    {"passport_id": "DP-F1A2B3C4", "asset_type": "battery", "manufacturer": "Ola Electric",     "current_status": "Active",                   "location": "Bangalore"},
    {"passport_id": "SP-G5H6I7J8", "asset_type": "solar",   "manufacturer": "Adani Solar",      "current_status": "Repair In Progress",       "location": "Rajasthan"},
    {"passport_id": "DP-K9L0M1N2", "asset_type": "battery", "manufacturer": "Mahindra",         "current_status": "Disposed",                 "location": "Chennai"},
    {"passport_id": "SP-O3P4Q5R6", "asset_type": "solar",   "manufacturer": "Tata Power Solar", "current_status": "Active",                   "location": "Pune"},
]


@router.get("/track/{passport_id}")
def track_passport(passport_id: str) -> dict:
    """Return lifecycle data for a given passport ID."""
    passport = _MOCK_PASSPORTS.get(passport_id.upper())
    if passport:
        return passport
    # Generate a generic mock for unknown IDs
    return {
        "passport_id": passport_id.upper(),
        "asset_type": "battery",
        "manufacturer": "Demo Manufacturer",
        "manufacture_date": "2022-01-01",
        "current_status": "Active",
        "current_location": "Delhi, India",
        "soh_history": [
            {"date": "2022-01-01", "soh": 100.0},
            {"date": "2023-01-01", "soh": 92.0},
            {"date": "2024-01-01", "soh": 84.0},
            {"date": "2026-02-23", "soh": 76.0},
        ],
        "lifecycle_events": [
            {"date": "2022-01-01", "event": "Manufactured",    "location": "Factory",         "details": "New asset registered"},
            {"date": "2022-03-01", "event": "First Deployment","location": "Delhi",            "details": "Asset deployed"},
            {"date": "2026-02-23", "event": "Health Check",    "location": "Service Centre",  "details": "Routine inspection"},
        ],
        "compliance": {"e_waste_rules_2023": True, "epr_registered": True, "certified_recycler": True},
        "carbon_credits_earned": round(76 * 0.023 * 12, 1),
        "qr_code_url": f"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={passport_id.upper()}",
    }


@router.get("/search")
def search_passports(q: str = "") -> List[dict]:
    """Search passports by ID, manufacturer, or location."""
    if not q:
        return _MOCK_SEARCH_RESULTS
    q_lower = q.lower()
    return [
        p for p in _MOCK_SEARCH_RESULTS
        if q_lower in p["passport_id"].lower()
        or q_lower in p["manufacturer"].lower()
        or q_lower in p["location"].lower()
        or q_lower in p["asset_type"].lower()
    ]
