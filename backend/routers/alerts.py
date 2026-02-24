"""
Alerts router — system alerts and notifications for the recycling network.
"""
from fastapi import APIRouter

router = APIRouter()

_ALERTS = [
    {
        "id": 1, "type": "end_of_life", "severity": "high",
        "title": "Battery #BT-4521 SOH below 30%",
        "message": "Battery has reached end-of-life. Schedule recycling pickup immediately.",
        "asset_id": "DP-A8B2C3D4", "location": "Mumbai",
        "created_at": "2026-02-23T14:00:00", "status": "active",
        "action_required": "Schedule pickup",
    },
    {
        "id": 2, "type": "collection_due", "severity": "medium",
        "title": "Collection route CR-15 overdue",
        "message": "Scheduled collection in Delhi North Hub is 2 days overdue.",
        "asset_id": None, "location": "Delhi",
        "created_at": "2026-02-22T10:30:00", "status": "active",
        "action_required": "Reassign vehicle",
    },
    {
        "id": 3, "type": "degradation", "severity": "medium",
        "title": "Solar Panel SP-789 efficiency drop",
        "message": "Panel efficiency dropped 5% in the last month. Hotspot risk detected.",
        "asset_id": "SP-D4E5F6G7", "location": "Rajasthan",
        "created_at": "2026-02-21T09:15:00", "status": "active",
        "action_required": "Schedule inspection",
    },
    {
        "id": 4, "type": "compliance", "severity": "low",
        "title": "EPR certificate renewal due",
        "message": "EPR registration for GreenRecycle Ltd expires in 30 days.",
        "asset_id": None, "location": "Bangalore",
        "created_at": "2026-02-20T16:45:00", "status": "acknowledged",
        "action_required": "Renew certificate",
    },
    {
        "id": 5, "type": "illegal_dump", "severity": "critical",
        "title": "Illegal e-waste dump detected",
        "message": "Satellite imagery detected potential illegal dump near Gurgaon Industrial Area.",
        "asset_id": None, "location": "Gurgaon",
        "lat": 28.4595, "lng": 77.0266,
        "created_at": "2026-02-23T11:00:00", "status": "active",
        "action_required": "Report to CPCB",
    },
    {
        "id": 6, "type": "end_of_life", "severity": "high",
        "title": "Battery batch BT-7700–7720 approaching EOL",
        "message": "20 batteries from Ola Electric fleet have SOH below 35%. Bulk recycling recommended.",
        "asset_id": None, "location": "Pune",
        "created_at": "2026-02-22T08:00:00", "status": "active",
        "action_required": "Schedule bulk pickup",
    },
    {
        "id": 7, "type": "compliance", "severity": "medium",
        "title": "E-Waste Rules 2023 audit due",
        "message": "Annual compliance audit for Chennai facility is due in 15 days.",
        "asset_id": None, "location": "Chennai",
        "created_at": "2026-02-19T14:30:00", "status": "active",
        "action_required": "Prepare audit documents",
    },
    {
        "id": 8, "type": "degradation", "severity": "low",
        "title": "Solar farm SF-44 output below forecast",
        "message": "Monthly output is 8% below forecast — possible soiling or shading issue.",
        "asset_id": None, "location": "Gujarat",
        "created_at": "2026-02-18T10:00:00", "status": "resolved",
        "action_required": "Clean panels",
    },
    {
        "id": 9, "type": "collection_due", "severity": "low",
        "title": "Collection CR-28 scheduled tomorrow",
        "message": "Routine collection from Hyderabad depot scheduled for 2026-02-24.",
        "asset_id": None, "location": "Hyderabad",
        "created_at": "2026-02-23T07:00:00", "status": "acknowledged",
        "action_required": "Confirm vehicle availability",
    },
]


@router.get("/")
def list_alerts(status: str = None, severity: str = None):
    """Return list of system alerts, optionally filtered by status or severity."""
    result = _ALERTS
    if status:
        result = [a for a in result if a["status"] == status]
    if severity:
        result = [a for a in result if a["severity"] == severity]
    return result


@router.get("/summary")
def get_alerts_summary() -> dict:
    """Return aggregated alert counts by severity and status."""
    total       = len(_ALERTS)
    critical    = sum(1 for a in _ALERTS if a["severity"] == "critical")
    high        = sum(1 for a in _ALERTS if a["severity"] == "high")
    medium      = sum(1 for a in _ALERTS if a["severity"] == "medium")
    low         = sum(1 for a in _ALERTS if a["severity"] == "low")
    active       = sum(1 for a in _ALERTS if a["status"] == "active")
    acknowledged = sum(1 for a in _ALERTS if a["status"] == "acknowledged")
    resolved     = sum(1 for a in _ALERTS if a["status"] == "resolved")
    return {
        "total": total, "critical": critical, "high": high,
        "medium": medium, "low": low,
        "active": active, "acknowledged": acknowledged, "resolved": resolved,
    }
