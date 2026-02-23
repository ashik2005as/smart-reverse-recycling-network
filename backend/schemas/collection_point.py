from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CollectionPointBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    capacity: int
    current_load: int = 0
    type: Optional[str] = "mixed"
    address: Optional[str] = None
    contact: Optional[str] = None


class CollectionPointCreate(CollectionPointBase):
    pass


class CollectionPointResponse(CollectionPointBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RouteOptimizeRequest(BaseModel):
    point_ids: Optional[List[int]] = None          # If None, use all points
    num_vehicles: int = 3
    vehicle_capacity: int = 100


class OptimizedRoute(BaseModel):
    vehicle_id: int
    stops: List[str]                               # ordered point names
    total_distance_km: float
    estimated_time_hours: float


class RouteOptimizeResponse(BaseModel):
    routes: List[OptimizedRoute]
    total_fuel_saved_litres: float
    total_cost_saved_inr: float
    co2_reduced_kg: float
    distance_saved_km: float
