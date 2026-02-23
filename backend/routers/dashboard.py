"""
Dashboard aggregation endpoint — returns platform-wide KPIs and chart data.
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/metrics")
def get_dashboard_metrics():
    """Return key platform metrics."""
    return {
        "total_batteries_tracked": 14826,
        "solar_panels_monitored": 9342,
        "active_collections": 87,
        "material_recovered_mt": 11.4,
        "carbon_credits_issued": 12400,
        "trees_equivalent": 87300,
    }


@router.get("/waste-forecast")
def get_waste_forecast():
    """Monthly waste forecast data for the current year."""
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return {
        "labels": months,
        "ev_batteries_mt": [120, 135, 150, 168, 185, 210, 230, 255, 280, 305, 335, 370],
        "solar_panels_mt": [80, 88, 95, 105, 118, 130, 145, 160, 178, 195, 215, 238],
    }


@router.get("/material-breakdown")
def get_material_breakdown():
    """YTD material recovery breakdown."""
    return {
        "labels": ["Lithium", "Nickel", "Cobalt", "Silver", "Silicon", "Copper"],
        "recovered_kg": [3400, 2100, 890, 560, 1780, 2250],
    }


@router.get("/activity-feed")
def get_activity_feed():
    """Recent activity feed."""
    return [
        {"time": "2 min ago",  "event": "Battery batch B-2041 flagged for recycling in Chennai"},
        {"time": "15 min ago", "event": "Solar panel array SP-0887 shows 18% degradation — Rajasthan"},
        {"time": "1 hr ago",   "event": "Collection route CR-14 optimised, saving ₹12,400 in fuel"},
        {"time": "3 hr ago",   "event": "340 kg Lithium recovered from Bangalore recycling centre"},
        {"time": "5 hr ago",   "event": "New marketplace listing: 50× second-life batteries (Mumbai)"},
    ]
