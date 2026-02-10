import requests
import json

key = "88620f1d64b64dd8b4bb33aa34c2859e"

providers = [
    {
        "name": "LocationIQ",
        "url": f"https://us1.locationiq.com/v1/search.php?key={key}&q=Chennai&format=json"
    },
    {
        "name": "OpenCage",
        "url": f"https://api.opencagedata.com/geocode/v1/json?q=Chennai&key={key}"
    },
    {
        "name": "MapQuest",
        "url": f"http://open.mapquestapi.com/nominatim/v1/search.php?key={key}&format=json&q=Chennai"
    },
    {
        "name": "Geoapify",
        "url": f"https://api.geoapify.com/v1/geocode/search?text=Chennai&apiKey={key}"
    }
]

print(f"Testing key: {key}")

for p in providers:
    try:
        print(f"Trying {p['name']}...", end=" ")
        resp = requests.get(p['url'], timeout=5)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            print(f"SUCCESS! It is a {p['name']} key.")
            try:
                data = resp.json()
                # print(json.dumps(data, indent=2)[:200])
            except:
                pass
            break
    except Exception as e:
        print(f"Error: {e}")
