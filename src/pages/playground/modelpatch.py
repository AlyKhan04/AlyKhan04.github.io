import json, pathlib
p = pathlib.Path("public/models/hcr/model.json")  # adjust path if needed
j = json.loads(p.read_text())
for group in j["weightsManifest"]:
    for w in group["weights"]:
        if w["name"].startswith("sequential/"):
            w["name"] = w["name"][len("sequential/"):]
p.write_text(json.dumps(j, indent=2))
print("Patched names.")