import requests
from bs4 import BeautifulSoup

def scrape_linkedin(industry: str, location: str, max_results: int = 5):
    query = f"site:linkedin.com/company {industry} {location}"
    url = "https://lite.duckduckgo.com/50x.html"  # Lite version works better
    resp = requests.post(url, data={"q": query}, headers={"User-Agent": "Mozilla/5.0"})
    soup = BeautifulSoup(resp.text, "html.parser")

    results = []
    for res in soup.select("a.result-link")[:max_results]:
        results.append({
            "name": res.get_text(strip=True),
            "url": res.get("href"),
            "location": location,
            "industry": industry,
            "source": "linkedin",
            "email": None,
            "phone": None
        })

    return results
