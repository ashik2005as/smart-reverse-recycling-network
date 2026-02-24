"""
Smart Reverse Recycling Network — FastAPI Backend Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import (
    battery,
    solar_panel,
    route_optimizer,
    material_recovery,
    marketplace,
    dashboard,
    gov_dashboard,
    decision_engine,
    digital_passport,
    facility_locator,
    impact_calculator,
    alerts,
)

app = FastAPI(
    title="Smart Reverse Recycling Network API",
    description="AI-Driven platform for recycling Solar Panels & EV Batteries — SIH 2024",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Allow frontend dev server and production origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(battery.router,          prefix="/api/battery",          tags=["Battery"])
app.include_router(solar_panel.router,      prefix="/api/solar",            tags=["Solar Panel"])
app.include_router(route_optimizer.router,  prefix="/api/route",            tags=["Route Optimizer"])
app.include_router(material_recovery.router,prefix="/api/material-recovery",tags=["Material Recovery"])
app.include_router(marketplace.router,      prefix="/api/marketplace",      tags=["Marketplace"])
app.include_router(dashboard.router,        prefix="/api/dashboard",        tags=["Dashboard"])
app.include_router(gov_dashboard.router,    prefix="/api/gov",              tags=["Government Dashboard"])
app.include_router(decision_engine.router,  prefix="/api/decision",         tags=["Decision Engine"])
app.include_router(digital_passport.router, prefix="/api/passport",         tags=["Digital Passport"])
app.include_router(facility_locator.router, prefix="/api/facilities",       tags=["Facility Locator"])
app.include_router(impact_calculator.router,prefix="/api/impact",           tags=["Impact Calculator"])
app.include_router(alerts.router,           prefix="/api/alerts",           tags=["Alerts"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Smart Reverse Recycling Network API is running"}


@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "healthy", "service": "smart-recycling-network-api", "version": "1.0.0"}
