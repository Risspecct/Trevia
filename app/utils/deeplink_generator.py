"""
Deep link generator for ride-hailing apps (Uber, Ola).
Generates official redirect URLs — no price scraping.
"""

from urllib.parse import quote


def generate_uber_link(origin: str, destination: str) -> str:
    """
    Generate Uber deep link using their universal link format.
    """
    return (
        f"https://m.uber.com/ul/?action=setPickup"
        f"&pickup[formatted_address]={quote(origin)}"
        f"&dropoff[formatted_address]={quote(destination)}"
    )


def generate_ola_link(origin: str, destination: str) -> str:
    """
    Generate Ola deep link for booking.
    """
    return (
        f"https://book.olacabs.com/?pickup={quote(origin)}"
        f"&drop={quote(destination)}"
    )


def generate_ride_links(origin: str, destination: str) -> dict[str, str]:
    """
    Generate deep links for all supported ride-hailing apps.

    Returns:
        Dict mapping app name to deep link URL.
    """
    return {
        "uber": generate_uber_link(origin, destination),
        "ola": generate_ola_link(origin, destination),
    }
