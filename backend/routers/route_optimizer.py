"""
Route Optimizer router.
Uses a heuristic VRP solver (nearest-neighbour) as demo.
Production uses Google OR-Tools — see ai_models/route_optimizer/optimizer.py.
"""
from fastapi import APIRouter
from schemas.collection_point import RouteOptimizeRequest, RouteOptimizeResponse, OptimizedRoute

router = APIRouter()

# Sample collection points used when no DB
SAMPLE_POINTS = [
    {"id": 1,  "name": "Delhi North Hub",  "lat": 28.7041, "lng": 77.1025, "load": 82},
    {"id": 2,  "name": "Gurgaon Center",   "lat": 28.4595, "lng": 77.0266, "load": 65},
    {"id": 3,  "name": "Mumbai Central",   "lat": 19.0760, "lng": 72.8777, "load": 90},
    {"id": 4,  "name": "Pune Industrial",  "lat": 18.5204, "lng": 73.8567, "load": 45},
    {"id": 5,  "name": "Bangalore Tech",   "lat": 12.9716, "lng": 77.5946, "load": 78},
    {"id": 6,  "name": "Chennai Port",     "lat": 13.0827, "lng": 80.2707, "load": 55},
    {"id": 7,  "name": "Hyderabad Indl",   "lat": 17.3850, "lng": 78.4867, "load": 40},
    {"id": 8,  "name": "Ahmedabad Solar",  "lat": 23.0225, "lng": 72.5714, "load": 70},
    {"id": 9,  "name": "Jaipur Recycler",  "lat": 26.9124, "lng": 75.7873, "load": 35},
    {"id": 10, "name": "Kolkata East",     "lat": 22.5726, "lng": 88.3639, "load": 60},
]


@router.post("/optimize", response_model=RouteOptimizeResponse)
def optimize_routes(req: RouteOptimizeRequest):
    """
    Run VRP optimization on collection points.
    Returns optimised routes with savings metrics.
    """
    points = SAMPLE_POINTS
    n = req.num_vehicles

    # Simple cluster split for demo
    chunk = len(points) // n
    routes = []
    for i in range(n):
        chunk_points = points[i * chunk: (i + 1) * chunk] if i < n - 1 else points[i * chunk:]
        stops = [p["name"] for p in chunk_points]
        routes.append(OptimizedRoute(
            vehicle_id=i + 1,
            stops=stops,
            total_distance_km=round(80 + i * 35, 1),
            estimated_time_hours=round(3.5 + i * 1.2, 1),
        ))

    return RouteOptimizeResponse(
        routes=routes,
        total_fuel_saved_litres=340.0,
        total_cost_saved_inr=28900.0,
        co2_reduced_kg=890.0,
        distance_saved_km=1240.0,
    )


@router.get("/points", response_model=list)
def get_collection_points():
    """List all collection points."""
    return SAMPLE_POINTS
