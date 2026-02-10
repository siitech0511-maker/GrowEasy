import random
from typing import Dict

def predict_lead_conversion(lead: any) -> Dict:
    """
    Simulates AI prediction based on lead source and score.
    """
    # Simple logic for mock: Website leads are hotter
    base_prob = 0.3
    if lead.lead_source == "Website": base_prob += 0.2
    if lead.lead_source == "Referral": base_prob += 0.4
    
    # Random variance
    prob = min(0.95, base_prob + random.uniform(-0.1, 0.1))
    
    # Best time to call logic
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    times = ["10 AM", "11 AM", "2 PM", "4 PM", "5 PM"]
    best_time = f"{random.choice(days)} {random.choice(times)}"
    
    return {
        "probability": round(prob, 2),
        "best_time": best_time,
        "suggestion": "Follow up with a personalized case study." if prob > 0.6 else "Send a warm introductory email."
    }
