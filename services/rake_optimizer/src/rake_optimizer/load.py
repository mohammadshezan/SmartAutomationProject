from __future__ import annotations

import sys
from pathlib import Path
from datetime import datetime
from .loader import ShipmentDataLoader


def main(argv: list[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    if not argv:
        print("Usage: python -m rake_optimizer.load <path/to/shipments.csv>")
        return 2
    path = Path(argv[0])
    loader = ShipmentDataLoader()
    try:
        shipments = loader.preprocess(str(path))
    except Exception as e:
        print(f"Error: {e}")
        return 1

    # Summary stats
    total = len(shipments)
    wagons = sum(s.wagon_count for s in shipments)
    cost = sum(s.current_cost for s in shipments)
    destinations = {}
    for s in shipments:
        destinations[s.destination] = destinations.get(s.destination, 0) + s.wagon_count

    print(f"Rows: {total}")
    print(f"Wagons: {wagons}")
    print(f"Total Cost: {cost:,.0f}")
    print("By Destination (wagons):")
    for dest, w in sorted(destinations.items()):
        print(f"  - {dest}: {w}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
