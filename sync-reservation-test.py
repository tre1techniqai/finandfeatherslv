from pathlib import Path

folder = Path("supabase/migrations")

migration = folder / "20261016000200_ingest_reservation_request.sql"
test_file = folder / "reservation_ingest_rollback_test.sql"

source = migration.read_text()
test = test_file.read_text()

start_marker = "CREATE OR REPLACE FUNCTION public.ingest_reservation_request("
end_marker = "$function$;"

assert source.count(start_marker) == 1
assert test.count(start_marker) == 1

def find_function(text):
    start = text.index(start_marker)
    end = text.index(end_marker, start) + len(end_marker)
    return start, end

source_start, source_end = find_function(source)
test_start, test_end = find_function(test)

updated = (
    test[:test_start]
    + source[source_start:source_end]
    + test[test_end:]
)

assert "BEGIN;" in updated
assert updated.rstrip().endswith("ROLLBACK;")
assert "TEST 14: Verify late validation notification classification." in updated

test_file.write_text(updated)

print("PASS: Function synchronized")
print("PASS: Behavioral tests preserved")
print("PASS: Transaction rollback preserved")