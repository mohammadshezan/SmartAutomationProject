from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import List, Dict, Iterable, Tuple
import csv
import os


@dataclass
class Shipment:
    rake_id: str
    cargo: str
    loading_point: str
    destination: str
    wagon_count: int
    eta: datetime
    current_cost: float


class ShipmentDataLoader:
    """
    Load and preprocess shipment data from CSV.

    Contract:
    - Input CSV columns (header, case-sensitive):
      rake_id, cargo, loading_point, destination, wagon_count, eta, current_cost
    - Output: List[Shipment] with validated types and parsed ETA (datetime)
    - Error handling: raises ValueError with a concise message when validation fails

    Methods:
    - load_csv(path): read rows from CSV as dicts
    - clean_data(rows): trim strings, drop missing requireds, remove duplicates
    - validate(rows): coerce and validate data types and constraints
    - convert_eta(rows): parse eta strings into datetime objects
    - preprocess(path): convenience method running all steps
    """

    expected_columns: Tuple[str, ...] = (
        "rake_id", "cargo", "loading_point", "destination", "wagon_count", "eta", "current_cost"
    )

    required_columns: Tuple[str, ...] = (
        "rake_id", "loading_point", "destination", "wagon_count", "eta"
    )

    def load_csv(self, path: str, encoding: str = "utf-8-sig") -> List[Dict[str, str]]:
        if not os.path.isfile(path):
            raise FileNotFoundError(f"CSV file not found: {path}")
        with open(path, "r", encoding=encoding, newline="") as f:
            reader = csv.DictReader(f)
            header = tuple(reader.fieldnames or [])
            missing = [c for c in self.expected_columns if c not in header]
            if missing:
                raise ValueError(f"CSV missing columns: {', '.join(missing)}")
            rows = [dict(row) for row in reader]
        return rows

    def clean_data(self, rows: Iterable[Dict[str, str]]) -> List[Dict[str, str]]:
        cleaned: List[Dict[str, str]] = []
        seen: set = set()
        for idx, row in enumerate(rows, start=1):
            # Normalize keys and trim whitespace
            normalized = {k: (row.get(k, "").strip() if isinstance(row.get(k, ""), str) else row.get(k)) for k in self.expected_columns}

            # Required checks
            if any(not str(normalized.get(col, "")).strip() for col in self.required_columns):
                # skip rows with missing requireds
                continue

            # Deduplicate on the full normalized tuple of expected columns
            key = tuple(normalized.get(k, "") for k in self.expected_columns)
            if key in seen:
                continue
            seen.add(key)
            cleaned.append(normalized)
        return cleaned

    def validate(self, rows: Iterable[Dict[str, str]]) -> List[Dict[str, object]]:
        errors: List[str] = []
        validated: List[Dict[str, object]] = []
        for i, row in enumerate(rows, start=1):
            record: Dict[str, object] = dict(row)
            # wagon_count
            try:
                wc = int(str(row.get("wagon_count", "")).replace(",", "").strip())
            except Exception:
                errors.append(f"row {i}: wagon_count is not an integer -> {row.get('wagon_count')!r}")
                continue
            if wc < 0:
                errors.append(f"row {i}: wagon_count must be >= 0")
                continue
            record["wagon_count"] = wc

            # current_cost (optional; default 0 if missing/empty)
            cc_raw = str(row.get("current_cost", "")).strip()
            if cc_raw == "":
                cc = 0.0
            else:
                try:
                    cc = float(cc_raw.replace(",", ""))
                except Exception:
                    errors.append(f"row {i}: current_cost is not a number -> {row.get('current_cost')!r}")
                    continue
            if cc < 0:
                errors.append(f"row {i}: current_cost must be >= 0")
                continue
            record["current_cost"] = cc

            # Strings non-empty for key fields already ensured in clean_data
            for col in ("rake_id", "loading_point", "destination"):
                if not str(row.get(col, "")).strip():
                    errors.append(f"row {i}: {col} is required")
                    break
            else:
                validated.append(record)

        if errors:
            raise ValueError("Validation failed:\n" + "\n".join(errors[:10]) + ("\n..." if len(errors) > 10 else ""))
        return validated

    def convert_eta(self, rows: Iterable[Dict[str, object]]) -> List[Shipment]:
        shipments: List[Shipment] = []
        errors: List[str] = []
        for i, row in enumerate(rows, start=1):
            eta_raw = str(row.get("eta", "")).strip()
            dt = self._parse_eta(eta_raw)
            if dt is None:
                errors.append(f"row {i}: could not parse eta -> {eta_raw!r}")
                continue
            try:
                shipments.append(
                    Shipment(
                        rake_id=str(row.get("rake_id", "")).strip(),
                        cargo=str(row.get("cargo", "")).strip(),
                        loading_point=str(row.get("loading_point", "")).strip(),
                        destination=str(row.get("destination", "")).strip(),
                        wagon_count=int(row.get("wagon_count")),
                        eta=dt,
                        current_cost=float(row.get("current_cost", 0.0)),
                    )
                )
            except Exception as e:
                errors.append(f"row {i}: error constructing Shipment -> {e}")

        if errors:
            raise ValueError("ETA conversion failed:\n" + "\n".join(errors[:10]) + ("\n..." if len(errors) > 10 else ""))
        return shipments

    def preprocess(self, path: str) -> List[Shipment]:
        rows = self.load_csv(path)
        rows = self.clean_data(rows)
        rows = self.validate(rows)
        shipments = self.convert_eta(rows)
        return shipments

    @staticmethod
    def _parse_eta(value: str) -> datetime | None:
        if not value:
            return None
        # Try ISO 8601 (tolerate trailing Z)
        v = value.replace("Z", "+00:00")
        try:
            return datetime.fromisoformat(v)
        except Exception:
            pass
        # Common patterns
        patterns = [
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d %H:%M",
            "%d-%m-%Y %H:%M:%S",
            "%d-%m-%Y %H:%M",
            "%d/%m/%Y %H:%M:%S",
            "%d/%m/%Y %H:%M",
            "%m/%d/%Y %I:%M:%S %p",
            "%m/%d/%Y %I:%M %p",
        ]
        for p in patterns:
            try:
                return datetime.strptime(value, p)
            except Exception:
                continue
        return None
