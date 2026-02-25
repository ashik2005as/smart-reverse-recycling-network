"""
Chatbot API router — AI Recycling Assistant with keyword-matching responses.
"""
from typing import List

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ChatMessage(BaseModel):
    message: str
    context: str = ""


class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str]
    category: str
    confidence: float


# ---------------------------------------------------------------------------
# Response knowledge base
# ---------------------------------------------------------------------------

_RESPONSES = [
    {
        "keywords": ["recycle battery", "battery recycling", "how to recycle", "ev battery", "recycle ev"],
        "category": "recycling_guide",
        "confidence": 0.95,
        "reply": (
            "To recycle your EV battery, follow these steps:\n"
            "1. Check battery health on our Battery Health page\n"
            "2. If SOH < 60%, it's ready for recycling\n"
            "3. Use our Facility Locator to find the nearest CPCB-certified recycler\n"
            "4. Book a pickup through the Marketplace\n"
            "5. Track your battery's lifecycle via Digital Passport"
        ),
        "suggestions": ["Check battery health", "Find nearest recycler", "Book a pickup"],
    },
    {
        "keywords": ["recycle solar", "solar panel recycling", "panel disposal", "solar disposal"],
        "category": "recycling_guide",
        "confidence": 0.95,
        "reply": (
            "To recycle solar panels under India's E-Waste Rules 2023:\n"
            "1. Assess panel efficiency on our Solar Degradation page\n"
            "2. If degradation > 20%, panels are eligible for recycling\n"
            "3. Locate a certified facility via the Facility Locator\n"
            "4. Schedule a collection through Route Optimizer\n"
            "5. Recover silicon, silver, and aluminium — earn carbon credits"
        ),
        "suggestions": ["Check solar health", "Find recycling facility", "Learn about material recovery"],
    },
    {
        "keywords": ["battery health", "soh", "state of health", "battery condition", "battery status"],
        "category": "battery_health",
        "confidence": 0.93,
        "reply": (
            "State of Health (SOH) measures your battery's current capacity relative to its original design capacity. "
            "Our AI model calculates SOH from cycle count, temperature, and voltage data.\n"
            "• SOH ≥ 80%: Excellent — suitable for second-life reuse\n"
            "• SOH 60–80%: Good — consider repair or stationary storage\n"
            "• SOH < 60%: End-of-life — recycle to recover Lithium, Cobalt, Nickel"
        ),
        "suggestions": ["Predict battery health", "Understand SOH scores", "View Decision Engine"],
    },
    {
        "keywords": ["solar degradation", "panel efficiency", "solar health", "panel condition"],
        "category": "solar_health",
        "confidence": 0.93,
        "reply": (
            "Solar panel degradation is the gradual loss of power output over time — typically 0.5–0.8% per year. "
            "Our platform analyses I-V curves and environmental data to estimate panel efficiency.\n"
            "• < 10% degradation: High performance\n"
            "• 10–20% degradation: Moderate — monitor closely\n"
            "• > 20% degradation: Consider recycling; recover silicon and silver"
        ),
        "suggestions": ["Check solar degradation", "Find recycling facility", "Calculate environmental impact"],
    },
    {
        "keywords": ["nearest recycler", "facility", "where to recycle", "recycling center", "recycling centre", "find recycler"],
        "category": "facility_info",
        "confidence": 0.92,
        "reply": (
            "Our Facility Locator lists CPCB-certified e-waste and battery recyclers across India, including partners in "
            "Mumbai, Delhi, Bengaluru, Chennai, Hyderabad, and Pune. "
            "Each facility profile shows accepted materials, capacity, and EPR registration details. "
            "Use filters to find the closest certified facility and get directions."
        ),
        "suggestions": ["Open Facility Locator", "Filter by battery recycling", "Filter by solar panel recycling"],
    },
    {
        "keywords": ["marketplace", "buy", "sell", "second life", "reuse", "second-life"],
        "category": "marketplace_info",
        "confidence": 0.91,
        "reply": (
            "The SmartRecycle Marketplace connects sellers of end-of-life batteries and solar panels with certified "
            "refurbishers, second-life energy storage buyers, and recyclers. "
            "List your assets, receive AI-generated valuations, and complete transactions with EPR-compliant documentation. "
            "Second-life batteries from EVs are repurposed for solar storage, telecom towers, and grid backup in India."
        ),
        "suggestions": ["Browse marketplace listings", "List an asset for sale", "Learn about second-life batteries"],
    },
    {
        "keywords": ["pickup", "collection", "book pickup", "schedule", "route"],
        "category": "collection_info",
        "confidence": 0.90,
        "reply": (
            "Book a pickup in three steps:\n"
            "1. Go to the Marketplace and select your asset\n"
            "2. Choose 'Schedule Pickup' and enter your location\n"
            "3. Our Route Optimizer assigns the most efficient collection route\n"
            "The Route Optimizer uses AI to cluster pickups, reducing transport emissions and costs across Indian cities."
        ),
        "suggestions": ["Book a pickup", "View Route Optimizer", "Track collection status"],
    },
    {
        "keywords": ["material recovery", "lithium", "cobalt", "nickel", "what materials", "recover materials"],
        "category": "material_info",
        "confidence": 0.94,
        "reply": (
            "EV batteries contain valuable critical minerals recovered through hydrometallurgical processes:\n"
            "• Lithium — ₹6,000–8,000/kg; used in new battery cells\n"
            "• Cobalt — ₹3,500–5,000/kg; cathode material\n"
            "• Nickel — ₹1,200–1,800/kg; stainless steel and batteries\n"
            "Solar panels yield silicon, silver (~₹80,000/kg), and aluminium. "
            "Our Material Recovery dashboard tracks recovered quantities and market values in real time."
        ),
        "suggestions": ["View Material Recovery dashboard", "Check recovery rates", "See market prices"],
    },
    {
        "keywords": ["carbon credits", "esg", "environmental impact", "sustainability", "green"],
        "category": "environmental_info",
        "confidence": 0.91,
        "reply": (
            "Recycling through our platform generates verified carbon credits under India's Carbon Credit Trading Scheme (CCTS). "
            "Each kg of Lithium recovered avoids approximately 7 kg CO₂ equivalent. "
            "ESG metrics are tracked in real time on the Impact Calculator — helping Indian OEMs and corporates meet their "
            "Extended Producer Responsibility (EPR) targets under E-Waste Rules 2023."
        ),
        "suggestions": ["Calculate carbon credits", "View ESG metrics", "Understand EPR obligations"],
    },
    {
        "keywords": ["digital passport", "track", "lifecycle", "traceability", "passport"],
        "category": "passport_info",
        "confidence": 0.92,
        "reply": (
            "The Digital Passport is a blockchain-anchored record for every battery or solar panel on the platform. "
            "It logs manufacturing details, usage history, health assessments, repair events, and recycling outcomes. "
            "Regulators, OEMs, and recyclers can scan the unique Passport ID (DP-XXXXXX) to verify compliance with "
            "CPCB guidelines and E-Waste Rules 2023 at any lifecycle stage."
        ),
        "suggestions": ["View Digital Passport", "Search by Passport ID", "Understand traceability"],
    },
    {
        "keywords": ["decision engine", "reuse or recycle", "what should i do", "should i recycle", "decision"],
        "category": "decision_info",
        "confidence": 0.93,
        "reply": (
            "The AI Decision Engine analyses SOH, remaining useful life, market demand, and repair cost to recommend "
            "the optimal action for each asset:\n"
            "• Reuse — high SOH, strong second-life market\n"
            "• Repair — moderate SOH, cost-effective cell replacement\n"
            "• Recycle — low SOH, material recovery value exceeds reuse value\n"
            "• Dispose — severely degraded, safety risk\n"
            "Decisions are updated automatically as new health data arrives."
        ),
        "suggestions": ["Run Decision Engine", "Check battery eligibility", "Explore second-life options"],
    },
    {
        "keywords": ["compliance", "epr", "e-waste rules", "regulation", "cpcb", "extended producer"],
        "category": "compliance_info",
        "confidence": 0.94,
        "reply": (
            "India's E-Waste (Management) Rules 2023 mandate that producers, importers, and brand owners meet annual "
            "EPR (Extended Producer Responsibility) collection targets. "
            "CPCB issues EPR certificates upon verified recycling. "
            "Our platform automates EPR documentation, generates CPCB-format reports, and tracks your compliance "
            "ratio in the Government Dashboard — ensuring zero penalties."
        ),
        "suggestions": ["View compliance dashboard", "Generate EPR report", "Understand E-Waste Rules 2023"],
    },
    {
        "keywords": ["hello", "hi", "hey", "help", "start", "what can you do"],
        "category": "greeting",
        "confidence": 0.99,
        "reply": (
            "👋 Hi! I'm your SmartRecycle AI Assistant. I can help you with:\n"
            "• Battery & solar panel recycling guidance\n"
            "• Finding CPCB-certified facilities near you\n"
            "• Understanding SOH, degradation, and decision outcomes\n"
            "• Booking pickups and tracking assets\n"
            "• EPR compliance and carbon credit information\n"
            "What would you like to know?"
        ),
        "suggestions": ["How do I recycle my battery?", "Find nearest recycler", "What are carbon credits?"],
    },
]

_FALLBACK = {
    "reply": (
        "I can help with battery recycling, solar panel disposal, finding certified recyclers, "
        "marketplace listings, EPR compliance, and more. "
        "Try asking about any of these topics!"
    ),
    "suggestions": ["Recycle my battery", "Find nearest recycler", "What is EPR?"],
    "category": "fallback",
    "confidence": 0.40,
}


def _match_response(message: str) -> dict:
    """Return the best matching response dict for the given message."""
    text = message.lower()
    for entry in _RESPONSES:
        if any(kw in text for kw in entry["keywords"]):
            return entry
    return _FALLBACK


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/message", response_model=ChatResponse)
def chat_message(req: ChatMessage) -> ChatResponse:
    """Return an AI-generated recycling guidance reply for the user's message."""
    match = _match_response(req.message)
    return ChatResponse(
        reply=match["reply"],
        suggestions=match["suggestions"],
        category=match["category"],
        confidence=match["confidence"],
    )


@router.get("/suggestions", response_model=dict)
def get_suggestions() -> dict:
    """Return starter suggestion prompts for the chatbot widget."""
    return {
        "suggestions": [
            "How do I recycle my EV battery?",
            "Where's the nearest recycler?",
            "What materials can be recovered?",
            "Is my battery eligible for reuse?",
            "How does the decision engine work?",
            "What are carbon credits?",
            "How to book a pickup?",
            "Explain digital passport",
        ]
    }
