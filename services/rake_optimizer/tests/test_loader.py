from rake_optimizer import ShipmentDataLoader
from pathlib import Path


def test_preprocess_loads_sample_csv(tmp_path: Path):
    # Use the committed sample CSV
    data_path = Path(__file__).resolve().parents[1] / "data" / "shipments.csv"
    loader = ShipmentDataLoader()
    shipments = loader.preprocess(str(data_path))

    assert len(shipments) == 4
    assert shipments[0].rake_id == "RAKE-1"
    assert shipments[0].wagon_count == 5
    # ensure eta parsed
    assert shipments[0].eta.year >= 2025


def test_clean_validation_and_duplicates(tmp_path: Path):
    # Create a temporary CSV with duplicates and bad rows
    p = tmp_path / "dup.csv"
    p.write_text(
        """rake_id,cargo,loading_point,destination,wagon_count,eta,current_cost
RAKE-1,Wire Rods,Bokaro,Mumbai,5,2025-10-13T05:42:59Z,225000
RAKE-1,Wire Rods,Bokaro,Mumbai,5,2025-10-13T05:42:59Z,225000
RAKE-2,,Bokaro,Mumbai,3,2025-10-13T07:42:59Z,100000
RAKE-3,TMT,Bokaro,,2,2025-10-13T08:42:59Z,50000
RAKE-4,TMT,Bokaro,Mumbai,-1,2025-10-13T09:42:59Z,50000
RAKE-5,TMT,Bokaro,Mumbai,2,INVALID,50000
"""
    )

    loader = ShipmentDataLoader()
    rows = loader.load_csv(str(p))
    rows = loader.clean_data(rows)
    # after clean: duplicates dropped, missing destination row dropped
    assert len(rows) == 4  # one duplicate and one missing destination removed

    # validation should fail due to negative wagon and invalid eta later
    try:
        valid = loader.validate(rows)
    except ValueError as e:
        msg = str(e)
        assert "wagon_count" in msg or "current_cost" in msg
    else:
        # if validation passed, eta conversion should fail
        try:
            loader.convert_eta(valid)
            assert False, "Should have failed on invalid eta"
        except ValueError:
            pass
