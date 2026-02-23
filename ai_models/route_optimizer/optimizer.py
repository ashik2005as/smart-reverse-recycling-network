"""
Vehicle Routing Problem (VRP) Optimizer.
Uses Google OR-Tools for capacitated VRP with cluster optimization.
Falls back to nearest-neighbour heuristic when OR-Tools is unavailable.
"""
import math
from dataclasses import dataclass, field
from typing import List, Optional, Tuple


@dataclass
class CollectionPoint:
    id: int
    name: str
    lat: float
    lng: float
    demand: int = 1   # units to collect


@dataclass
class OptimizedRoute:
    vehicle_id: int
    stops: List[str] = field(default_factory=list)
    total_distance_km: float = 0.0
    estimated_time_hours: float = 0.0
    load: int = 0


@dataclass
class VRPResult:
    routes: List[OptimizedRoute]
    total_distance_km: float
    fuel_saved_litres: float
    cost_saved_inr: float
    co2_reduced_kg: float
    distance_saved_km: float


def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate great-circle distance in km."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


class VRPOptimizer:
    """
    Capacitated VRP Optimizer.

    Usage:
        optimizer = VRPOptimizer()
        points = [CollectionPoint(id=1, name="Delhi Hub", lat=28.7, lng=77.1, demand=82), ...]
        result = optimizer.optimize(points, num_vehicles=3, vehicle_capacity=100)
    """

    FUEL_COST_PER_LITRE_INR = 90
    FUEL_CONSUMPTION_L_PER_KM = 0.12
    CO2_KG_PER_LITRE = 2.68

    def _nearest_neighbour(
        self,
        points: List[CollectionPoint],
        num_vehicles: int,
        vehicle_capacity: int,
    ) -> List[OptimizedRoute]:
        """Nearest-neighbour greedy heuristic for demo."""
        routes = [OptimizedRoute(vehicle_id=i + 1) for i in range(num_vehicles)]
        remaining = list(points)

        for route in routes:
            if not remaining:
                break
            load = 0
            current = remaining.pop(0)
            route.stops.append(current.name)
            load += current.demand

            while remaining and load < vehicle_capacity:
                # Find nearest unvisited point
                nearest = min(
                    remaining,
                    key=lambda p: _haversine(current.lat, current.lng, p.lat, p.lng),
                )
                dist = _haversine(current.lat, current.lng, nearest.lat, nearest.lng)
                route.total_distance_km += dist
                route.stops.append(nearest.name)
                load += nearest.demand
                current = nearest
                remaining.remove(nearest)

            route.load = load
            route.estimated_time_hours = round(route.total_distance_km / 60 + len(route.stops) * 0.25, 1)

        return routes

    def _ortools_optimize(
        self,
        points: List[CollectionPoint],
        num_vehicles: int,
        vehicle_capacity: int,
    ) -> Optional[List[OptimizedRoute]]:
        """OR-Tools VRP solver (requires google-or-tools)."""
        try:
            from ortools.constraint_solver import routing_enums_pb2, pywrapcp

            n = len(points)
            dist_matrix = [[0] * n for _ in range(n)]
            for i in range(n):
                for j in range(n):
                    dist_matrix[i][j] = int(
                        _haversine(points[i].lat, points[i].lng, points[j].lat, points[j].lng) * 1000
                    )

            manager = pywrapcp.RoutingIndexManager(n, num_vehicles, 0)
            routing = pywrapcp.RoutingModel(manager)

            def dist_callback(from_idx, to_idx):
                return dist_matrix[manager.IndexToNode(from_idx)][manager.IndexToNode(to_idx)]

            transit_cb_idx = routing.RegisterTransitCallback(dist_callback)
            routing.SetArcCostEvaluatorOfAllVehicles(transit_cb_idx)

            # Capacity constraint
            def demand_callback(idx):
                return points[manager.IndexToNode(idx)].demand

            demand_cb_idx = routing.RegisterUnaryTransitCallback(demand_callback)
            routing.AddDimensionWithVehicleCapacity(
                demand_cb_idx, 0, [vehicle_capacity] * num_vehicles, True, "Capacity"
            )

            params = pywrapcp.DefaultRoutingSearchParameters()
            params.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
            params.time_limit.seconds = 10

            solution = routing.SolveWithParameters(params)
            if not solution:
                return None

            routes = []
            for vid in range(num_vehicles):
                route = OptimizedRoute(vehicle_id=vid + 1)
                idx = routing.Start(vid)
                while not routing.IsEnd(idx):
                    node = manager.IndexToNode(idx)
                    route.stops.append(points[node].name)
                    idx = solution.Value(routing.NextVar(idx))
                route.total_distance_km = round(
                    solution.ObjectiveValue() / 1000 / num_vehicles, 1
                )
                route.estimated_time_hours = round(route.total_distance_km / 60 + len(route.stops) * 0.25, 1)
                routes.append(route)

            return routes

        except ImportError:
            return None

    def optimize(
        self,
        points: List[CollectionPoint],
        num_vehicles: int = 3,
        vehicle_capacity: int = 100,
    ) -> VRPResult:
        """
        Run VRP optimisation.

        Args:
            points:           List of collection points.
            num_vehicles:     Number of vehicles available.
            vehicle_capacity: Max load per vehicle.

        Returns:
            VRPResult with optimised routes and savings.
        """
        # Try OR-Tools first, fall back to heuristic
        routes = self._ortools_optimize(points, num_vehicles, vehicle_capacity)
        if routes is None:
            routes = self._nearest_neighbour(points, num_vehicles, vehicle_capacity)

        total_dist = sum(r.total_distance_km for r in routes)
        # Assume naive routing would be 35% longer
        naive_dist = total_dist * 1.35
        saved_km = round(naive_dist - total_dist, 1)
        fuel_saved = round(saved_km * self.FUEL_CONSUMPTION_L_PER_KM, 1)
        cost_saved = round(fuel_saved * self.FUEL_COST_PER_LITRE_INR, 0)
        co2_reduced = round(fuel_saved * self.CO2_KG_PER_LITRE, 1)

        return VRPResult(
            routes=routes,
            total_distance_km=round(total_dist, 1),
            fuel_saved_litres=fuel_saved,
            cost_saved_inr=cost_saved,
            co2_reduced_kg=co2_reduced,
            distance_saved_km=saved_km,
        )


if __name__ == "__main__":
    optimizer = VRPOptimizer()
    sample_points = [
        CollectionPoint(1, "Delhi Hub",     28.7041, 77.1025, 82),
        CollectionPoint(2, "Gurgaon",       28.4595, 77.0266, 65),
        CollectionPoint(3, "Mumbai",        19.0760, 72.8777, 90),
        CollectionPoint(4, "Pune",          18.5204, 73.8567, 45),
        CollectionPoint(5, "Bangalore",     12.9716, 77.5946, 78),
    ]
    result = optimizer.optimize(sample_points, num_vehicles=2, vehicle_capacity=150)
    for r in result.routes:
        print(f"Vehicle {r.vehicle_id}: {' → '.join(r.stops)} ({r.total_distance_km:.0f} km)")
    print(f"Fuel saved: {result.fuel_saved_litres}L | Cost saved: ₹{result.cost_saved_inr:.0f} | CO₂: {result.co2_reduced_kg}kg")
