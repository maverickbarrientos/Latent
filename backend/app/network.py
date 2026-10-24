import ipaddress
import re
import subprocess
import time

import httpx
from fastapi import Request

_IP_TTL = 300
# ip ("" means the server's own public address) -> (fetched_at, {"ip", "isp"})
_ip_cache: dict[str, tuple[float, dict]] = {}


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


def client_ip(request: Request) -> str | None:
    """The caller's address. Behind a proxy (Render, etc.) that is the first X-Forwarded-For entry."""
    forwarded = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
    for candidate in (forwarded, request.client.host if request.client else ""):
        try:
            return str(ipaddress.ip_address(candidate))
        except ValueError:
            continue
    return None


def _is_local(ip: str) -> bool:
    addr = ipaddress.ip_address(ip)
    return addr.is_loopback or addr.is_private


def get_ip_info(ip: str | None = None) -> dict:
    """Public IP and ISP for `ip`, or for the server's own address when `ip` is None."""
    key = ip or ""
    cached = _ip_cache.get(key)
    if cached and time.time() - cached[0] < _IP_TTL:
        return cached[1]
    try:
        data = httpx.get(f"https://ipinfo.io/{ip}/json" if ip else "https://ipinfo.io/json", timeout=4).json()
        value = {"ip": data.get("ip") or ip or "", "isp": data.get("org", "")}
    except (httpx.HTTPError, ValueError):
        value = cached[1] if cached else {"ip": ip or "", "isp": ""}
    _ip_cache[key] = (time.time(), value)
    return value


def _isp_name(isp: str) -> str:
    """'AS17639 Converge ICT Solutions Inc.' -> 'Converge ICT Solutions Inc.'"""
    return re.sub(r"^AS\d+\s+", "", isp).strip()


def describe(client: str | None) -> dict:
    """The network the caller is on.

    A browser cannot reveal a Wi-Fi name, so the SSID is only read when the caller is on the
    server's own machine or LAN. For anyone else the network is named after their ISP.
    """
    local = client is None or _is_local(client)
    info = get_ip_info(None if local else client)
    ssid = get_ssid() if local else "Unknown"
    if ssid != "Unknown":
        return {"ssid": ssid, "kind": "ssid", **info}
    return {"ssid": _isp_name(info["isp"]) or "Unknown network", "kind": "isp", **info}
