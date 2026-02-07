from datetime import datetime, date
from zoneinfo import ZoneInfo

PST_TIMEZONE = ZoneInfo("America/Los_Angeles")


def pst_today() -> date:
    """Return the current date in Pacific time."""
    return datetime.now(PST_TIMEZONE).date()
