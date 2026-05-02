import frappe
from frappe.utils import flt

@frappe.whitelist()
def create_material_request_for_fabric(sales_order,schedule_date):
    """
    Create Material Request for Purchase from Inquiry Cost Sheet Garment
    based on Sales Order Items
    """
    if not sales_order:
        frappe.throw("Sales Order is required.")

    # Get Sales Order details
    so = frappe.get_doc("Sales Order", sales_order)
    customer = so.customer

    if not so.items:
        frappe.throw("No items found in Sales Order.")

    grouped_items = {}  # { yarn_item: total_qty }

    for item in so.items:
        article_no = item.item_code
        so_qty     = flt(item.qty)

        # Fetch master Inquiry Cost Sheet Garment
        master = frappe.db.get_value(
            "Inquiry Cost Sheet Garment",
            {
                "is_active"  : 1,
                "docstatus"  : 1,
                "buyer_name" : customer,
                "article_no" : article_no
            },
            "name"
        )

        if not master:
            frappe.throw(
                f"No active Inquiry Cost Sheet Garment found for Article: <b>{article_no}</b> "
                f"and Buyer: <b>{customer}</b>."
            )

        # Fetch Job Costing Fabric child table
        fabric_items = frappe.get_all(
            "Job Costing Fabric",
            filters={"parent": master},
            fields=["yarn_item", "qty"]
        )

        if not fabric_items:
            frappe.msgprint(
                f"No fabric items found in Cost Sheet: <b>{master}</b>. Skipping.",
                indicator="orange"
            )
            continue

        # Multiply qty and group by yarn_item
        for fabric in fabric_items:
            yarn_item  = fabric.yarn_item
            total_qty  = flt(fabric.qty) * so_qty

            if yarn_item in grouped_items:
                grouped_items[yarn_item] += total_qty
            else:
                grouped_items[yarn_item]  = total_qty

    if not grouped_items:
        frappe.throw("No fabric items found to create Material Request.")

    # Create Material Request
    mr = frappe.new_doc("Material Request")
    mr.material_request_type = "Purchase"
    mr.company               = so.company
    mr.transaction_date      = frappe.utils.today()
    mr.custom_sales_order    = sales_order  # optional link field if exists
    mr.schedule_date = schedule_date or frappe.utils.today()

    for yarn_item, qty in grouped_items.items():
        mr.append("items", {
            "item_code"  : yarn_item,
            "qty"        : qty,
            "schedule_date" : schedule_date or frappe.utils.today(),
            "uom"        : frappe.db.get_value("Item", yarn_item, "stock_uom"),
            "warehouse"  : frappe.db.get_single_value("Stock Settings", "default_warehouse"),
        })

    mr.insert()

    return mr