frappe.ui.form.on('Sales Order', {
    refresh(frm) {
        frm.add_custom_button(__('Fabric Material Request'), function() {
            create_material_request_for_fabric(frm)
        }).css({'background-color': '#056936', 'color': 'white'})
          .prepend('<i class="fa fa-cubes" style="margin-right: 5px;"></i>');
        
          frm.add_custom_button(__('Accessories Material Request'), function() {
            create_material_request_for_accessories(frm)
        }).css({'background-color': '#0d326b', 'color': 'white'})
          .prepend('<i class="fa fa-cubes" style="margin-right: 5px;"></i>');
    }
});


function create_material_request_for_fabric(frm){
    let dialog = new frappe.ui.Dialog({
                title: __('Create Fabric Material Request'),
                fields: [
                    {
                        fieldtype: "Date",
                        fieldname: "schedule_date",
                        label: __("Required By Date"),
                        reqd: 1,
                        default: frappe.datetime.add_days(frappe.datetime.nowdate(), 7)
                    }
                ],
                primary_action_label: __("Create"),
                primary_action(values) {
                    dialog.hide();
                    frappe.call({
                        method: "garments_app.events.create_material_request_for_fabric.create_material_request_for_fabric",
                        args: {
                            sales_order    : frm.doc.name,
                            schedule_date  : values.schedule_date
                        },
                        freeze: true,
                        freeze_message: __("Creating Material Request..."),
                        callback(r) {
                            if (r.message) {
                                frappe.set_route("Form", r.message.doctype, r.message.name);
                            }
                        }
                    });
                }
            });
            dialog.show();
}

// ============================================================
// Frappe Client Script — Sales Order
// DocType: Sales Order
// Purpose: Create Material Request for Fabric from Cost Sheet
// ============================================================

frappe.ui.form.on("Sales Order", {
    refresh(frm) {
        if (frm.doc.docstatus === 1) {
            frm.add_custom_button(
                __("Create Material Request (Fabric)"),
                () => prompt_and_create_fabric_mr(frm),
                __("Create")
            );
        }
    }
});

// ─────────────────────────────────────────────────────────────
// Ask user for schedule_date then create the MR
// ─────────────────────────────────────────────────────────────
function create_material_request_for_accessories(frm) {
    const dialog = new frappe.ui.Dialog({
        title:  __("Create Material Request (Fabric)"),
        fields: [
            {
                fieldtype:  "Date",
                fieldname:  "schedule_date",
                label:      __("Schedule Date"),
                reqd:       1,
                default:    frappe.datetime.add_days(frappe.datetime.nowdate(), 7)
            }
        ],
        primary_action_label: __("Create"),
        primary_action(values) {
            dialog.hide();
            call_create_accessories_mr(frm, values.schedule_date);
        }
    });

    dialog.show();
}

// ─────────────────────────────────────────────────────────────
// Call whitelisted Python function
// ─────────────────────────────────────────────────────────────
function call_create_accessories_mr(frm, schedule_date) {
    frappe.dom.freeze(__("Creating Material Request..."));

    frappe.call({
        method: "garments_app.events.create_material_request_for_accessories.create_material_request_for_accessories",
        // ↑ Replace "your_app" with your actual app name
        args: {
            sales_order:   frm.doc.name,
            schedule_date: schedule_date
        },
        callback(r) {
            frappe.dom.unfreeze();

            if (r.exc) return;

            const mr = r.message;
            if (!mr || !mr.name) return;

            frappe.show_alert({
                message:   __("Material Request {0} created with {1} line(s).", [
                    mr.name,
                    (mr.items || []).length
                ]),
                indicator: "green"
            }, 6);

            frappe.set_route("Form", r.message.doctype, r.message.name);
        },
        error() {
            frappe.dom.unfreeze();
        }
    });
}