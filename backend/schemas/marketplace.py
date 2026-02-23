from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MarketplaceListingBase(BaseModel):
    title: str
    type: str                          # battery / solar / pickup
    description: Optional[str] = None
    price: Optional[float] = None
    condition: Optional[str] = None
    seller: Optional[str] = None
    location: Optional[str] = None
    quantity: Optional[int] = 1
    status: Optional[str] = "available"


class MarketplaceListingCreate(MarketplaceListingBase):
    pass


class MarketplaceListingResponse(MarketplaceListingBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BookingRequest(BaseModel):
    listing_id: int
    buyer_name: str
    contact: str
    pickup_date: str
    address: str


class BookingResponse(BaseModel):
    confirmation_id: str
    message: str
    listing_id: int
