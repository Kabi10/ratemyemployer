import requests
import datetime
import os

github_token = os.getenv('GITHUB_TOKEN')
repo = "Kabi10/ratemyemployer"
headers = {
    "Authorization": f"Bearer {github_token}",
    "Accept": "application/vnd.github+json"
}

one_year_ago = (datetime.datetime.now() - datetime.timedelta(days=365)).isoformat()

# Dependabot alerts
alerts_url = f"https://api.github.com/repos/{repo}/dependabot/alerts?state=open&per_page=100"
alerts = requests.get(alerts_url, headers=headers).json()

print("Dependabot Alerts (last year):")
for alert in alerts:
    created = alert.get('created_at', '')
    if created >= one_year_ago:
        print(f"- {alert['dependency']['package']['name']} | Severity: {alert['security_advisory']['severity']} | {alert['security_advisory']['summary']} | Status: {alert['state']}")

# Security advisories
advisories_url = f"https://api.github.com/repos/{repo}/security-advisories?per_page=100"
advisories = requests.get(advisories_url, headers=headers).json()

print("\nSecurity Advisories (last year):")
for advisory in advisories:
    published = advisory.get('published_at', '')
    if published >= one_year_ago:
        print(f"- {advisory['summary']} | Severity: {advisory['severity']} | Status: {advisory['state']}")
