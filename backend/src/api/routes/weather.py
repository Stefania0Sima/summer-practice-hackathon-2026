import httpx
from fastapi import APIRouter, Query

router = APIRouter(prefix="/api/weather", tags=["weather"])

WEATHER_CODES = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Foggy", 48: "Rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
    55: "Dense drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow", 80: "Slight showers",
    81: "Moderate showers", 82: "Violent showers", 95: "Thunderstorm",
}

OUTDOOR_SPORTS = {"football", "basketball", "tennis", "volleyball", "running", "cycling", "badminton"}


@router.get("")
async def get_weather(
    lat: float = Query(default=46.77),
    lng: float = Query(default=23.59),
    days: int = Query(default=3, le=7),
):
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lng}"
        f"&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode"
        f"&timezone=auto&forecast_days={days}"
    )
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=10)
        if resp.status_code != 200:
            return {"days": [], "recommendation": "Weather data unavailable"}
        data = resp.json()

    daily = data.get("daily", {})
    dates = daily.get("time", [])
    result = []
    for i, d in enumerate(dates):
        code = daily["weathercode"][i]
        precip = daily["precipitation_probability_max"][i]
        temp_max = daily["temperature_2m_max"][i]
        temp_min = daily["temperature_2m_min"][i]
        is_good = code < 61 and precip < 50

        result.append({
            "date": d,
            "temp_max": temp_max,
            "temp_min": temp_min,
            "precipitation_chance": precip,
            "weather_code": code,
            "description": WEATHER_CODES.get(code, "Unknown"),
            "good_for_outdoor": is_good,
        })

    best_day = None
    for day in result:
        if day["good_for_outdoor"]:
            best_day = day["date"]
            break

    rec = f"Best day for outdoor sports: {best_day}" if best_day else "Consider indoor venues this week"
    return {"days": result, "recommendation": rec}


@router.get("/recommend")
async def recommend_for_sport(
    sport_key: str = Query(...),
    date: str = Query(...),
    lat: float = Query(default=46.77),
    lng: float = Query(default=23.59),
):
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lng}"
        f"&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode"
        f"&timezone=auto&forecast_days=7"
    )
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=10)
        if resp.status_code != 200:
            return {"suitable": True, "reason": "Weather data unavailable, proceed with caution"}
        data = resp.json()

    daily = data.get("daily", {})
    dates = daily.get("time", [])
    is_outdoor = sport_key in OUTDOOR_SPORTS

    if date in dates:
        idx = dates.index(date)
        code = daily["weathercode"][idx]
        precip = daily["precipitation_probability_max"][idx]
        temp_max = daily["temperature_2m_max"][idx]

        if is_outdoor and (code >= 61 or precip >= 60):
            return {
                "suitable": False,
                "reason": f"Rain expected ({precip}% chance). Consider an indoor venue or reschedule.",
                "temp_max": temp_max,
                "description": WEATHER_CODES.get(code, "Unknown"),
            }
        if temp_max < 5 and is_outdoor:
            return {
                "suitable": False,
                "reason": f"Very cold ({temp_max}°C). Bundle up or pick an indoor option.",
                "temp_max": temp_max,
                "description": WEATHER_CODES.get(code, "Unknown"),
            }
        return {
            "suitable": True,
            "reason": f"Good conditions: {WEATHER_CODES.get(code, 'OK')}, {temp_max}°C",
            "temp_max": temp_max,
            "description": WEATHER_CODES.get(code, "Unknown"),
        }

    return {"suitable": True, "reason": "Date is beyond forecast range"}
