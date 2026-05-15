import frappe
from frappe.utils import flt
from frappe import _

@frappe.whitelist()
def create_fabric_bom(docname):
    doc = frappe.get_doc("Inquiry Cost Sheet Garment", docname)

    # Fetch wastage percentage
    settings = frappe.get_cached_doc("Garments App Settings")
    wastage_pct = flt(settings.knitting_wastage_percentage)

    # Step 1: Build dictionary — item_code as key, collect all yarn rows
    items_map = {}
    for row in doc.job_costing_fabric:
        key = row.item_code  # finish item
        if key not in items_map:
            items_map[key] = {"raw_materials": []}
        items_map[key]["raw_materials"].append({
            "yarn_item": row.yarn_item,
            "qty": flt(row.qty)
        })

    if not items_map:
        frappe.throw(_("No rows found in Job Costing Fabric table."))

    created = []
    skipped = []

    for item_code, data in items_map.items():

        # Step 2: Calculate total_qty AFTER structure is built
        total_qty = sum(rm["qty"] for rm in data["raw_materials"])

        # Step 3: Calculate finish_qty
        finish_qty = total_qty - (total_qty * wastage_pct / 100)

        # Step 4: Check if BOM already exists
        existing_bom = frappe.db.exists("BOM", {
            "item": item_code,
            "is_active": 1
        })
        if existing_bom:
            skipped.append(item_code)
            continue

        # Step 5: Build BOM items
        bom_items = []
        for rm in data["raw_materials"]:
            bom_items.append({
                "item_code": rm["yarn_item"],
                "qty": rm["qty"]
            })

        # Step 6: Create and submit BOM
        bom = frappe.get_doc({
            "doctype": "BOM",
            "item": item_code,
            "quantity": finish_qty,
            "items": bom_items,
            "is_active": 1,
            "is_default": 1,
            "custom_inquiry_cost_sheet_garment": docname
        })
        bom.insert(ignore_permissions=True)
        bom.submit()
        created.append(item_code)

    # Step 7: Summary message
    msg_parts = []
    if created:
        msg_parts.append(
            _("BOMs created successfully for: <b>{0}</b>").format(", ".join(created))
        )
    if skipped:
        msg_parts.append(
            _("Skipped (active BOM already exists) for: <b>{0}</b>").format(", ".join(skipped))
        )

    frappe.msgprint("<br>".join(msg_parts), title=_("BOM Creation Summary"))