import re
import subprocess
import time

import httpx

_ip_cache: dict = {"at": 0.0, "value": {}}
_IP_TTL = 300


def get_ssid() -> str:
    try:
        out = subprocess.run(
            ["netsh", "wlan", "show", "interfaces"],
            capture_output=True, text=True, timeout=5,
        ).stdout
    except (OSError, subprocess.SubprocessError):
        return "Unknown"
    match = re.search(r"^\s*SSID\s*:\s*(.+)$", out, re.MULTILINE)
    if match:
        return match.group(1).strip()
    if re.search(r"^\s*State\s*:\s*connected", out, re.MULTILINE | re.IGNORECASE):
        return "Unknown"
    return "Wired / Ethernet"


def get_ip_info() -> dict:
    if time.time() - _ip_cache["at"] < _IP_TTL and _ip_cache["value"]:
        return _ip_cache["value"]
    try:
        data = httpx.get("https://ipinfo.io/json", timeout=4).json()
        value = {"ip": data.get("ip", ""), "isp": data.get("org", "")}
    except (httpx.HTTPError, ValueError):
        value = _ip_cache["value"] or {"ip": "", "isp": ""}
    _ip_cache.update(at=time.time(), value=value)
    return value
