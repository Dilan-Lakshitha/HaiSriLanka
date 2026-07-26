import json
from pathlib import Path

updates = {
    "3-nights-4-days": {
        "title": "4-Day Ceylon Escape - 4-Star & Private Driver",
        "seoTitle": "4-Day Ceylon Escape with 4-Star Hotels & Private Transport | Hai Sri Lanka",
        "shortDescription": "Kandy, Ella, Yala, and the south coast in four days - 4-star stays and a private driver throughout.",
    },
    "4-nights-5-days": {
        "title": "5-Day Triangle to Coast - 4-Star & Private Driver",
        "seoTitle": "5-Day Sigiriya to Coast Tour with 4-Star Hotels & Private Transport | Hai Sri Lanka",
        "shortDescription": "Sigiriya to Mirissa in five days - culture, tea hills, safari, and coast with 4-star hotels and private transport.",
    },
    "7-days-sri-lanka-highlights": {
        "title": "7-Day Sri Lanka Highlights - 4-Star & Private Driver",
        "seoTitle": "7-Day Sri Lanka Highlights with 4-Star Hotels & Private Transport | Hai Sri Lanka",
        "shortDescription": "The essential Sri Lanka circuit - culture, wildlife, tea country, and coast with 4-star hotels and a private driver.",
    },
    "8-days-wilpattu-to-coast": {
        "title": "8-Day Wilpattu to Coast - 4-Star & Private Driver",
        "seoTitle": "8-Day Wilpattu to Coast Tour with 4-Star Hotels & Private Transport | Hai Sri Lanka",
        "shortDescription": "Wilpattu to the south coast in eight days - wildlife, culture, and beach with 4-star stays and private transport.",
    },
    "10-days-classic-ceylon": {
        "title": "10-Day Classic Ceylon - 4-Star & Private Driver",
        "seoTitle": "10-Day Classic Ceylon Tour with 4-Star Hotels & Private Transport | Hai Sri Lanka",
        "shortDescription": "Sigiriya to the south coast in ten days - tea hills, safari, and beach with 4-star hotels and a private driver.",
    },
    "12-days-sri-lanka-explorer": {
        "title": "12-Day Island Explorer - 4-Star & Private Driver",
        "seoTitle": "12-Day Sri Lanka Explorer with 4-Star Hotels & Private Transport | Hai Sri Lanka",
        "shortDescription": "Wilpattu, east coast, highlands, and south in twelve days - 4-star hotels and private transport throughout.",
    },
}


def upgrade_includes(items: list) -> list:
    out = []
    seen_hotel = False
    seen_vehicle = False
    half_board = any("half" in str(i).lower() and "board" in str(i).lower() for i in items)
    hotel_label = "4-star hotels (half board)" if half_board else "4-star hotels"
    for item in items:
        low = str(item).lower()
        if "hotel" in low or "half-board" in low or "half board" in low or "accommodation" in low:
            if not seen_hotel:
                out.append(hotel_label)
                seen_hotel = True
            continue
        if "vehicle" in low or "chauffeur" in low or "private transport" in low or "driver" in low:
            if not seen_vehicle:
                out.append("Private transport / private driver")
                seen_vehicle = True
            continue
        out.append(item)
    if not seen_vehicle:
        out.insert(0, "Private transport / private driver")
    if not seen_hotel:
        out.insert(1 if seen_vehicle else 0, hotel_label)
    return out


items = Path(r"d:\Website\HaiSriLanka\src\assets\json\tours\items")
for slug, fields in updates.items():
    path = items / f"{slug}.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    data["title"] = fields["title"]
    data["seoTitle"] = fields["seoTitle"]
    data["shortDescription"] = fields["shortDescription"]
    if isinstance(data.get("seo"), dict):
        data["seo"]["metaTitle"] = fields["seoTitle"]
    for key in ("included", "includes"):
        if isinstance(data.get(key), list):
            data[key] = upgrade_includes(data[key])
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("OK", slug)
