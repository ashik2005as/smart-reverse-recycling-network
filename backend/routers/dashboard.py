"""
Dashboard aggregation endpoint — returns platform-wide KPIs and chart data.
All data reflects 2026 figures for the SIH demo with slight random variations
to simulate live data.
"""
import random
from datetime import datetime, timedelta

from fastapi import APIRouter

router = APIRouter()

# ── Base values (2026 figures) ────────────────────────────────────────────────
_BASE_BATTERIES = 12500
_BASE_SOLAR = 8200
_BASE_COLLECTIONS = 340
_BASE_MATERIAL = 2850.0
_BASE_CREDITS = 15600
_BASE_REVENUE = 4.20


def _demo_ts(delta_minutes: int = 0) -> str:
    """Return a demo 2026-style ISO timestamp string."""
    now = datetime.now()
    demo = datetime(2026, 2, 23, now.hour, now.minute, now.second)
    if delta_minutes:
        demo = demo - timedelta(minutes=delta_minutes)
    return demo.isoformat(timespec="seconds")


# ── Existing endpoints (updated to 2026 data) ─────────────────────────────────

@router.get("/metrics")
def get_dashboard_metrics():
    """Return key platform metrics (2026, slight random variation per call)."""
    return {
        "total_batteries_tracked": _BASE_BATTERIES + random.randint(0, 150),
        "solar_panels_monitored": _BASE_SOLAR + random.randint(0, 80),
        "active_collections": _BASE_COLLECTIONS + random.randint(-10, 15),
        "material_recovered_mt": round(_BASE_MATERIAL + random.uniform(0, 10), 1),
        "carbon_credits_issued": _BASE_CREDITS + random.randint(0, 100),
        "trees_equivalent": 87300 + random.randint(0, 500),
    }


@router.get("/waste-forecast")
def get_waste_forecast():
    """Monthly waste forecast data for 2026."""
    labels = [
        "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026",
        "May 2026", "Jun 2026", "Jul 2026", "Aug 2026",
        "Sep 2026", "Oct 2026", "Nov 2026", "Dec 2026",
    ]
    battery_base = [120, 135, 142, 158, 165, 178, 190, 205, 218, 230, 245, 260]
    solar_base   = [80,  85,  92,  98, 105, 112, 118, 125, 132, 140, 148, 155]
    return {
        "labels": labels,
        "battery_waste_tonnes": [v + random.randint(-3, 3) for v in battery_base],
        "solar_waste_tonnes":   [v + random.randint(-2, 2) for v in solar_base],
        # Legacy field names kept for backward compatibility
        "ev_batteries_mt": battery_base,
        "solar_panels_mt": solar_base,
    }


@router.get("/material-breakdown")
def get_material_breakdown():
    """YTD material recovery breakdown."""
    return {
        "labels": ["Lithium", "Nickel", "Cobalt", "Silver", "Silicon", "Copper"],
        "recovered_kg": [4520, 3670, 2890, 890, 8900, 5670],
    }


@router.get("/activity-feed")
def get_activity_feed():
    """Recent activity feed (legacy endpoint)."""
    return [
        {"time": "2 min ago",  "event": "Battery batch B-4521 flagged for recycling in Chennai"},
        {"time": "15 min ago", "event": "Solar panel array SP-0887 shows 18% degradation — Rajasthan"},
        {"time": "1 hr ago",   "event": "Collection route CR-14 optimised, saving ₹12,400 in fuel"},
        {"time": "3 hr ago",   "event": "340 kg Lithium recovered from Bangalore recycling centre"},
        {"time": "5 hr ago",   "event": "New marketplace listing: 50× second-life batteries (Mumbai)"},
    ]


# ── New 2026 live-data endpoints ──────────────────────────────────────────────

@router.get("/stats")
def get_dashboard_stats():
    """Real-time KPI metrics with slight random variations to simulate live data."""
    return {
        "timestamp": _demo_ts(),
        "batteries_tracked": _BASE_BATTERIES + random.randint(0, 150),
        "solar_panels_monitored": _BASE_SOLAR + random.randint(0, 80),
        "active_collections": _BASE_COLLECTIONS + random.randint(-10, 15),
        "material_recovered_tonnes": round(_BASE_MATERIAL + random.uniform(0, 10), 1),
        "carbon_credits_earned": _BASE_CREDITS + random.randint(0, 100),
        "revenue_inr_crores": round(_BASE_REVENUE + random.uniform(0, 0.05), 2),
        "batteries_change_pct": 12.5,
        "solar_change_pct": 8.3,
        "collections_change_pct": -2.1,
        "material_change_pct": 15.7,
    }


@router.get("/recent-activity")
def get_recent_activity():
    """Latest 10 activities with 2026 timestamps."""
    _activities = [
        {"id": 1,  "type": "collection",  "message": "Battery pickup completed in Mumbai",           "status": "completed", "minutes_ago": 15},
        {"id": 2,  "type": "prediction",  "message": "SOH alert: Battery #BT-4521 below 30%",        "status": "warning",   "minutes_ago": 30},
        {"id": 3,  "type": "collection",  "message": "Solar panel collection done in Pune",           "status": "completed", "minutes_ago": 45},
        {"id": 4,  "type": "alert",       "message": "Illegal dumping detected in Gurgaon",           "status": "alert",     "minutes_ago": 60},
        {"id": 5,  "type": "recovery",    "message": "450 kg Lithium recovered — Bangalore centre",   "status": "completed", "minutes_ago": 90},
        {"id": 6,  "type": "prediction",  "message": "Panel degradation >20% detected — Rajasthan",  "status": "warning",   "minutes_ago": 120},
        {"id": 7,  "type": "collection",  "message": "Route CR-22 completed — Chennai",               "status": "completed", "minutes_ago": 150},
        {"id": 8,  "type": "marketplace", "message": "50× second-life batteries listed in Mumbai",    "status": "completed", "minutes_ago": 180},
        {"id": 9,  "type": "recovery",    "message": "Silver extraction batch completed — Delhi",     "status": "completed", "minutes_ago": 240},
        {"id": 10, "type": "alert",       "message": "High SOH battery batch ready for resale",       "status": "completed", "minutes_ago": 300},
    ]
    return {
        "activities": [
            {
                "id": a["id"],
                "type": a["type"],
                "message": a["message"],
                "timestamp": _demo_ts(a["minutes_ago"]),
                "status": a["status"],
            }
            for a in _activities
        ]
    }


@router.get("/live-metrics")
def get_live_metrics():
    """Data that changes every call — used by frontend auto-refresh."""
    return {
        "timestamp": _demo_ts(),
        "collections_today": 47 + random.randint(-3, 5),
        "batteries_processed_today": 128 + random.randint(-5, 10),
        "panels_processed_today": 85 + random.randint(-3, 8),
        "alerts_active": random.randint(2, 5),
        "recyclers_online": 24 + random.randint(-2, 3),
        "efficiency_score": round(94.7 + random.uniform(-1.5, 1.5), 1),
    }


@router.get("/regional-data")
def get_regional_data():
    """State-wise data for the India collection map."""
    _regions = [
        {"state": "Maharashtra",   "lat": 19.7515, "lng": 75.7139, "batteries": 2340, "panels": 1560, "collections": 45},
        {"state": "Karnataka",     "lat": 15.3173, "lng": 75.7139, "batteries": 1890, "panels": 1230, "collections": 38},
        {"state": "Tamil Nadu",    "lat": 11.1271, "lng": 78.6569, "batteries": 2100, "panels": 1890, "collections": 52},
        {"state": "Gujarat",       "lat": 22.2587, "lng": 71.1924, "batteries": 1650, "panels": 2100, "collections": 41},
        {"state": "Delhi",         "lat": 28.7041, "lng": 77.1025, "batteries": 1780, "panels": 890,  "collections": 35},
        {"state": "Rajasthan",     "lat": 27.0238, "lng": 74.2179, "batteries": 980,  "panels": 2450, "collections": 30},
        {"state": "Uttar Pradesh", "lat": 26.8467, "lng": 80.9462, "batteries": 1450, "panels": 1120, "collections": 28},
        {"state": "West Bengal",   "lat": 22.9868, "lng": 87.8550, "batteries": 1120, "panels": 780,  "collections": 22},
        {"state": "Telangana",     "lat": 18.1124, "lng": 79.0193, "batteries": 1560, "panels": 1340, "collections": 33},
        {"state": "Kerala",        "lat": 10.8505, "lng": 76.2711, "batteries": 890,  "panels": 670,  "collections": 18},
    ]
    for r in _regions:
        r["batteries"] += random.randint(-20, 20)
        r["panels"] += random.randint(-15, 15)
    return {"regions": _regions}


@router.get("/material-recovery-summary")
def get_material_recovery_summary():
    """Material recovery summary with values and chart colours."""
    _materials = [
        {"name": "Lithium",  "recovered_kg": 4520, "value_usd": 312000, "color": "#4CAF50"},
        {"name": "Cobalt",   "recovered_kg": 2890, "value_usd": 245000, "color": "#2196F3"},
        {"name": "Nickel",   "recovered_kg": 3670, "value_usd": 198000, "color": "#FF9800"},
        {"name": "Silver",   "recovered_kg": 890,  "value_usd": 425000, "color": "#9C27B0"},
        {"name": "Silicon",  "recovered_kg": 8900, "value_usd": 156000, "color": "#607D8B"},
        {"name": "Copper",   "recovered_kg": 5670, "value_usd": 178000, "color": "#F44336"},
    ]
    for m in _materials:
        m["recovered_kg"] += random.randint(-50, 50)
    return {
        "materials": _materials,
        "total_value_usd": sum(m["value_usd"] for m in _materials),
        "total_recovered_kg": sum(m["recovered_kg"] for m in _materials),
    }
