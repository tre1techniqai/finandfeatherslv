
import csv
from pathlib import Path

source = Path("Fin-and-Feathers-LV-Menu-Menu-Items.csv")
destination = Path("menu_items_import.csv")

if not source.exists():
    raise SystemExit(f"Source CSV not found: {source.resolve()}")

with source.open("r", encoding="utf-8-sig", newline="") as file:
    reader = csv.DictReader(file)
    rows = list(reader)
    headers = reader.fieldnames or []

required = [
    "Item Name",
    "Description",
    "Price",
    "Price / Options Notes",
    "Menu Type",
    "Subcategory",
    "$5 Special?",
    "Tags (comma-separated)",
    "Image URL (food only)",
    "Active?",
]

missing = [column for column in required if column not in headers]
if missing:
    raise SystemExit(f"Missing CSV columns: {missing}")

columns = [
    "item_name",
    "description",
    "price",
    "price_options_notes",
    "menu_type",
    "subcategory",
    "is_five_dollar_special",
    "tags",
    "image_url",
    "is_active",
    "display_order",
]

with destination.open("w", encoding="utf-8", newline="") as file:
    writer = csv.DictWriter(file, fieldnames=columns)
    writer.writeheader()

    for order, row in enumerate(rows, start=1):
        special = (row["$5 Special?"] or "").strip().lower()
        active = (row["Active?"] or "").strip().lower()

        if special not in ("yes", "no"):
            raise SystemExit(
                f"Unexpected $5 Special? value on CSV row {order + 1}: {special!r}"
            )

        if active not in ("yes", "no"):
            raise SystemExit(
                f"Unexpected Active? value on CSV row {order + 1}: {active!r}"
            )

        writer.writerow({
            "item_name": row["Item Name"] or "",
            "description": row["Description"] or "",
            "price": row["Price"] or "",
            "price_options_notes": row["Price / Options Notes"] or "",
            "menu_type": (row["Menu Type"] or "").strip(),
            "subcategory": (row["Subcategory"] or "").strip(),
            "is_five_dollar_special": str(special == "yes").lower(),
            "tags": row["Tags (comma-separated)"] or "",
            "image_url": (row["Image URL (food only)"] or "").strip(),
            "is_active": str(active == "yes").lower(),
            "display_order": order,
        })

print(f"Source rows: {len(rows)}")
print(f"Import rows: {len(rows)}")
print(f"Output file: {destination.resolve()}")
print("Internal owner notes: excluded")
print(f"Display order: 1 through {len(rows)}")
print("Import file created successfully.")
