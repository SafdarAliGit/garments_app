frappe.ui.form.on('Sales Order', {
    refresh(frm) {
        frm.add_custom_button(__('Raw Material Request'), function() {
            let dialog = new frappe.ui.Dialog({
                title: __('Create Raw Material Request'),
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
        }).css({'background-color': '#056936', 'color': 'white'})
          .prepend('<i class="fa fa-cubes" style="margin-right: 5px;"></i>');
    }
});