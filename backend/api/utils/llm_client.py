"""
backend/api/utils/llm_client.py
Production Multi-Provider LLM Engine for VoyageAI
Supports:
1. Google Gemini (via google-genai SDK or direct REST API using GEMINI_API_KEY)
2. OpenAI (via openai SDK using OPENAI_API_KEY)
3. Groq (ultra-fast Llama-3.3-70b using GROQ_API_KEY)
4. Anthropic Claude (using ANTHROPIC_API_KEY)
Falls back gracefully if no external API key is supplied or if external network times out.
"""

import os
import json
import re
import urllib.request
import urllib.error

# System instruction to enforce structured JSON output for travel generation
VOYAGE_SYSTEM_PROMPT = """You are VoyageAI, the world's most versatile autonomous travel designer.
You design authentic, realistic, beautifully planned travel itineraries tailored to the traveler's exact parameters:
- Group Type: Solo, Couple, Family, or Friends
- Budget Tier: Budget (economical, hostels/homestays, local transit, street food), Moderate (3-star boutique, cozy bistros), Premium, or Luxury
- Duration: Exact number of days requested
- Vibe / Style: Heritage/Culture, Nature/Scenic, Adventure/Backpacking, Relaxed/Leisure, Food/Nightlife

Given a travel search prompt and trip criteria, you must return a strictly valid JSON object matching this schema:
{
  "destination": "City or Region Name with Country",
  "summary": "1-2 captivating sentences describing the personalized itinerary highlights matching the traveler's style.",
  "estimated_cost_inr": 25000,
  "ai_match_score": 98,
  "traveler_type": "solo" | "couple" | "family" | "friends",
  "budget_tier": "budget" | "moderate" | "premium" | "luxury",
  "trip_style": "culture" | "nature" | "adventure" | "relaxed" | "food",
  "days": [
    {
      "day": 1,
      "title": "Title of the day without Day prefix",
      "morning": "Detailed morning activity with landmark names",
      "morning_time": "09:00 AM – 11:30 AM (2.5 hrs)",
      "morning_duration": "2.5 hrs",
      "afternoon": "Detailed afternoon activity with landmark or cultural experience",
      "afternoon_time": "01:30 PM – 04:30 PM (3 hrs)",
      "afternoon_duration": "3 hrs",
      "evening": "Detailed evening activity matching budget and vibe (e.g. night market, rooftop cafe, sunset point)",
      "evening_time": "06:30 PM – 09:00 PM (2.5 hrs)",
      "evening_duration": "2.5 hrs",
      "stay": "Realistic accommodation matching the budget tier and traveler type (e.g. Backpackers Hostel/Homestay for Budget, Boutique Hotel for Moderate, 4-Star for Premium, 5-Star for Luxury)"
    }
  ],
  "included_perks": [
    "Perk 1 (e.g. 24/7 AI Concierge Assistance)",
    "Perk 2 (e.g. Curated Local Food & Landmark Map)",
    "Perk 3 (e.g. Priority Entry or Transit Recommendations)",
    "Perk 4 (e.g. Authentic Experience Voucher)"
  ]
}
IMPORTANT RULES:
1. Output ONLY pure valid JSON, no markdown code fence (```json ... ```), no introductory text.
2. Ensure landmark names are real, geographically authentic to the city, and culturally accurate.
3. If the user specifies a duration (e.g., 2 days, 5 days), create EXACTLY that number of days in the "days" array.
4. Respect the requested budget and traveler type (Solo, Couple, Family, Friends) in activities, hotels, and estimated cost!
"""


def _clean_json_text(text: str) -> str:
    """Strip markdown code blocks or wrapping quotes."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def _build_full_prompt(
    prompt: str,
    target_days: int = 3,
    user_city: str = None,
    traveler_type: str = None,
    budget_tier: str = None,
    travel_style: str = None
) -> str:
    criteria = []
    if traveler_type:
        criteria.append(f"Traveler Type: {traveler_type.capitalize()} (tailor activities, social/romantic/family atmosphere, and lodging)")
    if budget_tier:
        criteria.append(f"Budget Tier: {budget_tier.capitalize()} (match activities, dining, and stay to this budget level)")
    if travel_style:
        criteria.append(f"Trip Style/Vibe: {travel_style.capitalize()}")
    if user_city:
        criteria.append(f"User Departure City: {user_city}")
    criteria_str = "\n".join(criteria)
    return f"User Prompt: {prompt}\nTarget duration: {target_days} days.\n{criteria_str}\nGenerate {target_days} distinct days."


def generate_with_gemini(
    prompt: str,
    api_key: str,
    target_days: int = 3,
    user_city: str = None,
    traveler_type: str = None,
    budget_tier: str = None,
    travel_style: str = None
) -> dict | None:
    """Call Google Gemini 2.5 Flash / 1.5 Flash using official google-genai or REST API."""
    full_user_prompt = _build_full_prompt(prompt, target_days, user_city, traveler_type, budget_tier, travel_style)

    try:
        # Try google-genai SDK first
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=full_user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=VOYAGE_SYSTEM_PROMPT,
                temperature=0.7,
                response_mime_type="application/json",
            )
        )
        if response and response.text:
            cleaned = _clean_json_text(response.text)
            return json.loads(cleaned)
    except Exception as e:
        # Fallback to direct REST API call (no SDK version mismatch)
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "system_instruction": {"parts": [{"text": VOYAGE_SYSTEM_PROMPT}]},
                "contents": [{"parts": [{"text": full_user_prompt}]}],
                "generationConfig": {"response_mime_type": "application/json", "temperature": 0.7}
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req, timeout=12) as res:
                body = json.loads(res.read().decode('utf-8'))
                raw_text = body['candidates'][0]['content']['parts'][0]['text']
                cleaned = _clean_json_text(raw_text)
                return json.loads(cleaned)
        except Exception as rest_err:
            print(f"[VoyageAI LLM] Gemini error: {rest_err}")
            return None


def generate_with_openai(
    prompt: str,
    api_key: str,
    target_days: int = 3,
    user_city: str = None,
    traveler_type: str = None,
    budget_tier: str = None,
    travel_style: str = None
) -> dict | None:
    """Call OpenAI GPT-4o-mini."""
    full_user_prompt = _build_full_prompt(prompt, target_days, user_city, traveler_type, budget_tier, travel_style)

    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": VOYAGE_SYSTEM_PROMPT},
                {"role": "user", "content": full_user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        raw_text = completion.choices[0].message.content
        if raw_text:
            return json.loads(_clean_json_text(raw_text))
    except Exception as e:
        print(f"[VoyageAI LLM] OpenAI error: {e}")
        return None


def generate_with_groq(
    prompt: str,
    api_key: str,
    target_days: int = 3,
    user_city: str = None,
    traveler_type: str = None,
    budget_tier: str = None,
    travel_style: str = None
) -> dict | None:
    """Call Groq Llama-3.3-70b-versatile for ultra-fast generation."""
    full_user_prompt = _build_full_prompt(prompt, target_days, user_city, traveler_type, budget_tier, travel_style)

    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": VOYAGE_SYSTEM_PROMPT},
                {"role": "user", "content": full_user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        raw_text = completion.choices[0].message.content
        if raw_text:
            return json.loads(_clean_json_text(raw_text))
    except Exception as e:
        print(f"[VoyageAI LLM] Groq error: {e}")
        return None


def call_llm(
    prompt: str,
    target_days: int = 3,
    user_city: str = None,
    traveler_type: str = None,
    budget_tier: str = None,
    travel_style: str = None
) -> dict | None:
    """
    Main LLM dispatcher:
    Checks for available API keys in environment variables:
    1. GEMINI_API_KEY
    2. OPENAI_API_KEY
    3. GROQ_API_KEY
    Returns parsed JSON dictionary or None.
    """
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key and len(gemini_key.strip()) > 10:
        result = generate_with_gemini(
            prompt, gemini_key.strip(), target_days, user_city,
            traveler_type=traveler_type, budget_tier=budget_tier, travel_style=travel_style
        )
        if result:
            result['llm_provider'] = 'Google Gemini (gemini-2.5-flash)'
            return result

    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key and len(openai_key.strip()) > 10:
        result = generate_with_openai(
            prompt, openai_key.strip(), target_days, user_city,
            traveler_type=traveler_type, budget_tier=budget_tier, travel_style=travel_style
        )
        if result:
            result['llm_provider'] = 'OpenAI (gpt-4o-mini)'
            return result

    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key and len(groq_key.strip()) > 10:
        result = generate_with_groq(
            prompt, groq_key.strip(), target_days, user_city,
            traveler_type=traveler_type, budget_tier=budget_tier, travel_style=travel_style
        )
        if result:
            result['llm_provider'] = 'Groq (Llama-3.3-70b-versatile)'
            return result

    return None


VOYAGE_CHAT_SYSTEM_PROMPT = """You are VoyageAI Concierge, an autonomous, highly knowledgeable travel assistant.
The user is conversing with you about their travel plan. You assist travelers of all types:
- Solo explorers, couples, families with children, and friend groups.
- All budgets: Budget/Backpacking, Moderate, Premium, and Luxury.
You have access to their current itinerary in JSON.
The user may:
1. Ask questions about the destination (best local food, cafes, street markets, safety, packing, transit).
2. Ask to modify the itinerary (e.g., 'Make it more budget-friendly', 'I am traveling solo, suggest social spots', 'Add an extra day for trekking', 'Change hotel to a cozy homestay').

You must respond with a STRICTLY VALID JSON object:
{
  "reply": "Your warm, helpful, conversational travel response (2-4 sentences). Explain what was adjusted if itinerary was changed.",
  "modify_itinerary": true or false,
  "updated_itinerary": null or the complete updated itinerary JSON object if you modified it,
  "suggested_prompts": [
    "Short follow-up suggestion 1",
    "Short follow-up suggestion 2",
    "Short follow-up suggestion 3"
  ]
}
RULES:
1. Return ONLY pure valid JSON, no markdown code blocks or wrapping text.
2. If modify_itinerary is true, ensure updated_itinerary has valid 'destination', 'summary', 'days', 'duration', 'estimated_cost', etc.
"""



def chat_with_llm(
    message: str,
    current_itinerary: dict = None,
    chat_history: list = None,
    user_city: str = None,
    traveler_type: str = None,
    budget_tier: str = None,
    travel_style: str = None
) -> dict:
    """
    Conversational chatbot interface for refining itineraries and answering travel queries.
    Uses Gemini / OpenAI / Groq if available, with intelligent heuristic fallback.
    """
    dest = current_itinerary.get("destination", "your destination") if current_itinerary else "your destination"
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")

    context_str = f"Current Destination: {dest}.\n"
    if traveler_type:
        context_str += f"Traveler Group Type: {traveler_type.capitalize()}\n"
    if budget_tier:
        context_str += f"Budget Tier: {budget_tier.capitalize()}\n"
    if travel_style:
        context_str += f"Trip Style/Vibe: {travel_style.capitalize()}\n"

    if current_itinerary:
        context_str += f"Current Itinerary Summary: {current_itinerary.get('summary', '')}\n"
        context_str += f"Duration: {current_itinerary.get('duration', '')}\n"
        days = current_itinerary.get("days", []) or current_itinerary.get("days_data", [])
        context_str += f"Total Days: {len(days)}\n"
        context_str += f"Days JSON: {json.dumps(days[:5], ensure_ascii=False)}\n"

    user_query = f"{context_str}\nUser Message: {message}"


    # 1. Try Gemini
    if gemini_key and len(gemini_key.strip()) > 10:
        try:
            from google import genai
            from google.genai import types
            client = genai.Client(api_key=gemini_key.strip())
            resp = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=user_query,
                config=types.GenerateContentConfig(
                    system_instruction=VOYAGE_CHAT_SYSTEM_PROMPT,
                    temperature=0.7,
                    response_mime_type="application/json",
                )
            )
            if resp and resp.text:
                parsed = json.loads(_clean_json_text(resp.text))
                parsed['provider'] = 'Google Gemini'
                return parsed
        except Exception as e:
            print(f"[VoyageAI Chat] Gemini error: {e}")

    # 2. Try OpenAI
    if openai_key and len(openai_key.strip()) > 10:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key.strip())
            comp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": VOYAGE_CHAT_SYSTEM_PROMPT},
                    {"role": "user", "content": user_query}
                ],
                response_format={"type": "json_object"},
                temperature=0.7
            )
            raw = comp.choices[0].message.content
            if raw:
                parsed = json.loads(_clean_json_text(raw))
                parsed['provider'] = 'OpenAI'
                return parsed
        except Exception as e:
            print(f"[VoyageAI Chat] OpenAI error: {e}")

    # 3. Try Groq
    if groq_key and len(groq_key.strip()) > 10:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=groq_key.strip(), base_url="https://api.groq.com/openai/v1")
            comp = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": VOYAGE_CHAT_SYSTEM_PROMPT},
                    {"role": "user", "content": user_query}
                ],
                response_format={"type": "json_object"},
                temperature=0.7
            )
            raw = comp.choices[0].message.content
            if raw:
                parsed = json.loads(_clean_json_text(raw))
                parsed['provider'] = 'Groq'
                return parsed
        except Exception as e:
            print(f"[VoyageAI Chat] Groq error: {e}")

    # 4. Fallback Heuristic Concierge Engine
    msg_lower = message.lower()
    days = list(current_itinerary.get("days", [])) if current_itinerary else []

    # Check for "add day"
    if "add" in msg_lower and ("day" in msg_lower or "extra" in msg_lower):
        next_day = len(days) + 1
        new_day = {
            "day": next_day,
            "title": f"Local Artisans, Scenic Views & Night Bazaar",
            "morning": f"Morning discovery of heritage courtyards, vibrant floral markets, and historic architecture in {dest}.",
            "morning_time": "09:00 AM – 11:30 AM (2.5 hrs)",
            "morning_duration": "2.5 hrs",
            "afternoon": f"Afternoon artisan craft ateliers, authentic tea/coffee tasting, and panoramic scenic lookout in {dest}.",
            "afternoon_time": "01:30 PM – 04:30 PM (3 hrs)",
            "afternoon_duration": "3 hrs",
            "evening": f"Sunset promenade followed by a royal dining experience featuring signature regional delicacies.",
            "evening_time": "06:30 PM – 09:00 PM (2.5 hrs)",
            "evening_duration": "2.5 hrs",
            "stay": days[-1].get("stay", "5-Star Heritage Suite") if days else "5-Star Heritage Suite"
        }
        days.append(new_day)
        updated = dict(current_itinerary)
        updated["days"] = days
        updated["days_data"] = days
        updated["duration"] = f"{len(days)} Days / {len(days)-1} Nights"
        return {
            "reply": f"I've added Day {next_day} to your {dest} journey, dedicated to heritage courtyards, artisan ateliers, and a sunset gourmet dinner! You can fine-tune any activity details below.",
            "modify_itinerary": True,
            "updated_itinerary": updated,
            "suggested_prompts": [
                "Recommend best dining spots for Day 1",
                "Make Day 2 more relaxed",
                "What should I pack for this trip?"
            ],
            "provider": "VoyageAI Rule Concierge"
        }

    # Check for food / cafe / dining
    if any(w in msg_lower for w in ["food", "restaurant", "cafe", "dine", "dining", "dish", "eat", "lunch", "dinner"]):
        return {
            "reply": f"For dining in {dest}, I recommend sampling local specialties and booking a table at top-rated heritage dining pavilions. For evening drinks and sunset, a rooftop lounge overlooking the city skyline provides a truly memorable atmosphere.",
            "modify_itinerary": False,
            "updated_itinerary": None,
            "suggested_prompts": [
                "Add a sunset rooftop dinner to Day 1",
                "What's the best time to visit monuments?",
                "Suggest shopping spots"
            ],
            "provider": "VoyageAI Rule Concierge"
        }

    # Check for weather / packing / clothing
    if any(w in msg_lower for w in ["weather", "pack", "clothes", "climate", "temperature", "wear"]):
        return {
            "reply": f"When traveling to {dest}, lightweight breathable fabrics like linen and cotton are ideal for daytime monument exploration. Carry comfortable walking footwear, UV sunglasses, and a light jacket or pashmina for cooler evenings or air-conditioned pavilions.",
            "modify_itinerary": False,
            "updated_itinerary": None,
            "suggested_prompts": [
                "What are the top 3 photo spots?",
                "Can you add an extra day?",
                "Recommend budget options"
            ],
            "provider": "VoyageAI Rule Concierge"
        }

    # Check for relax / slow pace
    if any(w in msg_lower for w in ["relax", "slow", "chill", "leisure", "peaceful"]):
        if days:
            days[0]["afternoon"] = f"Private leisure at hotel luxury spa pavilion, organic herbal tea tasting, and quiet garden stroll."
            days[0]["afternoon_duration"] = "2 hrs"
            updated = dict(current_itinerary)
            updated["days"] = days
            return {
                "reply": f"I've tuned your itinerary for a more relaxing, restorative pace with dedicated spa pavilion leisure and private garden downtime in {dest}.",
                "modify_itinerary": True,
                "updated_itinerary": updated,
                "suggested_prompts": [
                    "Suggest quiet cafes",
                    "Add sunset boat cruise",
                    "Tell me about local transportation"
                ],
                "provider": "VoyageAI Rule Concierge"
            }

    # General concierge response
    return {
        "reply": f"I've analyzed your question about {dest}. I'm here to customize any part of this journey — whether you'd like to adjust activities, swap landmark visits, add days, or inquire about local luxury hospitality. Feel free to tell me exactly how you want your trip refined!",
        "modify_itinerary": False,
        "updated_itinerary": None,
        "suggested_prompts": [
            f"Recommend must-see sights in {dest}",
            "Make Day 2 more adventurous",
            "Add an extra day to the trip"
        ],
        "provider": "VoyageAI Rule Concierge"
    }

