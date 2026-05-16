frappe.ui.form.on('Item', {
    refresh(frm) {
        frm.set_query('custom_dyed_fabric', function() {
            return {
                filters: [
                    ['item_group', '=', 'Dyed Fabric']
                ]
            };
        });
    }
});

