# ============================================================
# Frappe Whitelisted Python Function
# File: your_app/your_app/utils/fabric_material_request_utils.py
# ============================================================

import frappe
from frappe import _
from frappe.utils import flt, today


@frappe.whitelist()
def create_material_request_for_accessories(sales_order, schedule_date):
    """
    Create Material Request of type Purchase from Job Costing Accessory
    child rows in Inquiry Cost Sheet Garment.
    - size_sensitive = 1 : no grouping (keep individual rows)
    - size_sensitive = 0 : group by item_code
    schedule_date is set by the user before calling this function.
    """

    # ── 1. Validate input ────────────────────────────────────────────────────
    if not sales_order:
        frappe.throw(_("Sales Order is required."))

    if not schedule_date:
        frappe.throw(_("Schedule Date is required."))

    # ── 2. Load Sales Order ──────────────────────────────────────────────────
    so = frappe.get_doc("Sales Order", sales_order)

    if not so.customer:
        frappe.throw(_("Sales Order {0} has no Customer set.").format(sales_order))

    if not so.items:
        frappe.throw(_("No items found in Sales Order {0}.").format(sales_order))

    customer             = so.customer
    grouped_items        = {}   # { item_code: total_qty }  — non-size-sensitive
    size_sensitive_items = []   # flat list                 — size-sensitive

    # ── 3. Loop through SO items ─────────────────────────────────────────────
    for item in so.items:
        article_no = item.item_code
        so_qty     = flt(item.qty)

        if not article_no or so_qty <= 0:
            continue

        # ── 4. Fetch matching Inquiry Cost Sheet Garment ─────────────────────
        master = frappe.db.get_value(
            "Inquiry Cost Sheet Garment",
            {
                "is_active":  1,
                "docstatus":  1,
                "buyer_name": customer,
                "article_no": article_no
            },
            "name"
        )

        if not master:
            frappe.throw(
                _(
                    "No active & submitted <b>Inquiry Cost Sheet Garment</b> found "
                    "for Article: <b>{0}</b> and Buyer: <b>{1}</b>."
                ).format(article_no, customer),
                title=_("Missing Cost Sheet")
            )

        # ── 5. Fetch Job Costing Accessory child rows ────────────────────────
        accessory_items = frappe.get_all(
            "Job Costing Accessory",
            filters={"parent": master},
            fields=["item_code", "qty", "size_sensitive"]
        )

        if not accessory_items:
            frappe.msgprint(
                _("No accessory items found in Cost Sheet <b>{0}</b>. Skipping.").format(master),
                indicator="orange"
            )
            continue

        # ── 6. Multiply qty and apply grouping logic ─────────────────────────
        for acc in accessory_items:
            total_qty = flt(acc.qty) * so_qty

            if total_qty <= 0:
                continue

            if flt(acc.size_sensitive) == 1:
                # size_sensitive checked — NO grouping, keep as individual row
                size_sensitive_items.append({
                    "item_code": acc.item_code,
                    "qty":       total_qty
                })
            else:
                # size_sensitive unchecked — GROUP by item_code
                if acc.item_code in grouped_items:
                    grouped_items[acc.item_code] += total_qty
                else:
                    grouped_items[acc.item_code]  = total_qty

    # ── 7. Validate we have something to request ─────────────────────────────
    if not grouped_items and not size_sensitive_items:
        frappe.throw(_("No accessory items found across all Cost Sheets for this Sales Order."))

    # ── 8. Fetch defaults once ───────────────────────────────────────────────
    default_warehouse = frappe.db.get_single_value("Stock Settings", "default_warehouse")

    # ── 9. Create Material Request ───────────────────────────────────────────
    mr = frappe.new_doc("Material Request")
    mr.material_request_type = "Purchase"
    mr.company               = so.company
    mr.transaction_date      = today()
    mr.schedule_date         = schedule_date
    mr.custom_sales_order    = sales_order   # remove if field does not exist

    # Grouped rows (size_sensitive = 0)
    for item_code, qty in grouped_items.items():
        mr.append("items", {
            "item_code":     item_code,
            "qty":           qty,
            "schedule_date": schedule_date,
            "uom":           frappe.db.get_value("Item", item_code, "stock_uom"),
            "warehouse":     default_warehouse,
        })

    # Individual rows (size_sensitive = 1)
    for acc in size_sensitive_items:
        mr.append("items", {
            "item_code":     acc["item_code"],
            "qty":           acc["qty"],
            "schedule_date": schedule_date,
            "uom":           frappe.db.get_value("Item", acc["item_code"], "stock_uom"),
            "warehouse":     default_warehouse,
        })

    mr.insert(ignore_permissions=False)

    return mr