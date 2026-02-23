"""
Marketplace CRUD router.
"""
import random
import string
from typing import List

from fastapi import APIRouter
from schemas.marketplace import (
    MarketplaceListingCreate,
    MarketplaceListingResponse,
    BookingRequest,
    BookingResponse,
)

router = APIRouter()

# In-memory store for demo; replace with DB in production
_listings: List[dict] = [
    {"id": 1, "type": "battery", "title": "50× Second-life EV Batteries (LFP, 60kWh)",
     "seller": "GreenPower Solutions, Mumbai", "price": 85000,
     "condition": "Good (SOH 78%)", "location": "Mumbai, MH", "status": "available",
     "description": "Refurbished LFP batteries for stationary storage.", "quantity": 50},
    {"id": 2, "type": "solar",   "title": "200× Used Solar Panels (300W Mono)",
     "seller": "SolarRecycle India, Ahmedabad", "price": 3200,
     "condition": "Fair (Eff 15.2%)", "location": "Ahmedabad, GJ", "status": "available",
     "description": "Monocrystalline panels with minor frame damage.", "quantity": 200},
    {"id": 3, "type": "battery", "title": "20× Tesla 2170 Cell Modules (NMC)",
     "seller": "EV Parts Hub, Bangalore", "price": 42000,
     "condition": "Excellent (SOH 88%)", "location": "Bangalore, KA", "status": "available",
     "description": "Disassembled Tesla battery modules.", "quantity": 20},
]


@router.get("/", response_model=List[dict])
def list_listings(type: str = None):
    """List marketplace listings, optionally filtered by type."""
    if type:
        return [l for l in _listings if l["type"] == type]
    return _listings


@router.post("/", response_model=dict, status_code=201)
def create_listing(listing: MarketplaceListingCreate):
    """Create a new marketplace listing."""
    new_id = max((l["id"] for l in _listings), default=0) + 1
    item = {**listing.model_dump(), "id": new_id}
    _listings.append(item)
    return item


@router.post("/book", response_model=BookingResponse)
def book_pickup(req: BookingRequest):
    """Book a pickup for a marketplace listing."""
    conf_id = "PB-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return BookingResponse(
        confirmation_id=conf_id,
        message=f"Pickup booked! Confirmation {conf_id}. You will receive an email within 2 hours.",
        listing_id=req.listing_id,
    )
