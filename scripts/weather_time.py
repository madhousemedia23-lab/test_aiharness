#!/usr/bin/env python3
"""Fetches current weather + local time and prints one quirky sentence."""

import json
import random
import sys
import urllib.request
from datetime import datetime

DEMO_DATA = {"city": "London", "latitude": 51.5074, "longitude": -0.1278, "temp_c": 14.2, "condition": "partly cloudy"}

WMO_CODES = {
    0: "sunny", 1: "mostly clear", 2: "partly cloudy", 3: "overcast",
    45: "foggy", 51: "drizzly", 53: "drizzly", 61: "rainy", 63: "rainy",
    65: "heavily rainy", 71: "snowy", 73: "snowy", 80: "showery",
    95: "thundery", 96: "stormy",
}

TEMPLATES = [
    "It's {time} in {city} and {temp_c}°C outside — {condition} skies judging your life choices.",
    "At {time} in {city}, the air is {temp_c}°C and {condition}. Your plants are definitely judging you.",
    "{city} clocks read {time}. Outside: {temp_c}°C, {condition}. Inside: you, staring at a terminal.",
    "Good {part_of_day}, {city}! It's {temp_c}°C and {condition} — perfect weather for questioning everything.",
    "The universe reports {temp_c}°C and {condition} in {city} at {time}. The universe did not ask for your opinion.",
    "{temp_c}°C and {condition} in {city} at {time} — even the weather seems undecided about today.",
]


def fetch_json(url: str) -> dict:
    with urllib.request.urlopen(url, timeout=8) as resp:
        return json.loads(resp.read().decode())


def get_location() -> dict:
    data = fetch_json("http://ip-api.com/json/?fields=city,lat,lon,status")
    if data.get("status") != "success":
        raise RuntimeError("Location lookup failed")
    return {"city": data["city"], "latitude": data["lat"], "longitude": data["lon"]}


def get_weather(lat: float, lon: float) -> dict:
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,weathercode&temperature_unit=celsius"
    )
    data = fetch_json(url)
    current = data["current"]
    code = current.get("weathercode", 0)
    return {"temp_c": round(current["temperature_2m"], 1), "condition": WMO_CODES.get(code, "mysterious")}


def part_of_day(hour: int) -> str:
    if hour < 12: return "morning"
    if hour < 17: return "afternoon"
    if hour < 21: return "evening"
    return "night"


def build_sentence(city: str, temp_c: float, condition: str) -> str:
    now = datetime.now()
    return random.choice(TEMPLATES).format(
        city=city, temp_c=temp_c, condition=condition,
        time=now.strftime("%H:%M"), part_of_day=part_of_day(now.hour),
    )


def main() -> None:
    use_demo = "--demo" in sys.argv
    as_json = "--json" in sys.argv
    seed_arg = next((a for a in sys.argv if a.startswith("--seed=")), None)
    if seed_arg:
        random.seed(int(seed_arg.split("=")[1]))

    if use_demo:
        d = DEMO_DATA
        city, temp_c, condition = d["city"], d["temp_c"], d["condition"]
    else:
        try:
            loc = get_location()
            weather = get_weather(loc["latitude"], loc["longitude"])
            city, temp_c, condition = loc["city"], weather["temp_c"], weather["condition"]
        except Exception as exc:
            print(f"Could not fetch live data ({exc}). Try --demo.", file=sys.stderr)
            sys.exit(1)

    sentence = build_sentence(city, temp_c, condition)
    if as_json:
        print(json.dumps({"city": city, "temp_c": temp_c, "condition": condition, "sentence": sentence}))
    else:
        print(sentence)


if __name__ == "__main__":
    main()
