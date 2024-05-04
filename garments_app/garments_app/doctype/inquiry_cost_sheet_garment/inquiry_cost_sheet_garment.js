// Copyright (c) 2021, Unilink Enterprise and contributors
// For license information, please see license.txt

frappe.ui.form.on('Inquiry Cost Sheet Garment', {
    refresh(frm) {
        frm.set_query('item_code', 'accessories', function (doc, cdt, cdn) {
            var d = locals[cdt][cdn];
            return {
                filters: [
                    ["Item", "item_group", "=", "Trims"]
                ]
            };
        }),
            /*frm.add_custom_button("Create PO", function(){
                frappe.prompt([
                    {'fieldname': 'supplier', 'fieldtype': 'Link', 'options':'Supplier', 'label': 'Suppler', 'reqd': 1}
                ],
                function(values){
                    frappe.call({
                        method:"create_po",
                        doc:frm.doc,
                        args:{supplier:values.supplier},
                        callback:function(r){
                            frappe.set_route("Form", "Purchase Order", r.message)
                        }
                    })
                },
                'Supplier for PO',
                'Create PO'
                )
                Confirm



            })*/
            frm.add_custom_button("Create SO", function () {
                frappe.call({
                    method: "create_so",
                    doc: frm.doc,
                    callback: function (r) {
                        frappe.set_route("Form", "Sales Order", r.message)
                    }
                })
            })
    },
    other_expenses_section(frm) {
        frm.trigger("set_total");
    },
    other_expenses(frm) {
        frm.trigger("set_total");
    },
    financial_charges(frm) {
        frm.trigger("set_total");
    },
    testing(frm) {
        frm.trigger("set_total");
    },
    fob_shipment_handling_charges(frm) {
        frm.trigger("set_total");
    },
    self_courier(frm) {
        frm.trigger("set_total");
    },
    third_party_inspection_charges(frm) {
        frm.trigger("set_total");
    },
    metal_trims_import_cost(frm) {
        frm.trigger("set_total");
    },
    paper_trims_import_cost(frm) {
        frm.trigger("set_total");
    },
    misc_charges(frm) {
        frm.trigger("set_total");
    },
    set_total(frm) {
        var f = frm.doc;
        frm.set_value("total", f.other_expenses + f.financial_charges + f.testing + f.fob_shipment_handling_charges + f.self_courier + f.third_party_inspection_charges + f.metal_trims_import_cost + f.paper_trims_import_cost + f.misc_charges)
    },
    special_process(frm) {
        frm.set_value("cm_cost", frm.doc.special_process + frm.doc.cutting + frm.doc.stitching_charges + frm.doc.finishing + frm.doc.add)
    },
    cutting(frm) {
        frm.trigger("special_process")
    },
    stitching_charges(frm) {
        frm.trigger("special_process")
    },
    finishing(frm) {
        frm.trigger("special_process")
    },
    add(frm) {
        frm.trigger("special_process")
    },
    total(frm) {
        frm.set_value("net_making_cost", frm.doc.total + frm.doc.fabrics_total + frm.doc.accessories_total + frm.doc.washing_cost + frm.doc.cm_cost)
    },
    cm_cost(frm) {
        frm.trigger("total")
    },
    washing_cost(frm) {
        frm.trigger("total")
    },
    fabrics_total(frm) {
        frm.set_value("raw_material_cost", frm.doc.accessories_total + frm.doc.fabrics_total)
        frm.trigger("total")
    },
    accessories_total(frm) {
        frm.trigger("fabrics_total")
    },
    raw_material_cost(frm) {
        frm.set_value("total_raw_material_required", frm.doc.raw_material_cost * frm.doc.order_qty)
    },
    total_raw_material_required(frm) {
        frm.set_value("grand_total_raw_material", frm.doc.total_raw_material_required + (frm.doc.total_raw_material_required * 0.03))
    },

    net_making_cost(frm) {
        frm.trigger("wastage")
    },
    wastage(frm) {
        frm.set_value("wastage_amount", frm.doc.net_making_cost * (frm.doc.wastage / 100))
    },
    net_making_cost(frm) {
        frm.trigger("wastage_amount")
    },
    wastage_amount(frm) {
        frm.set_value("total_net_making_cost", frm.doc.net_making_cost + frm.doc.wastage_amount)
    },
    total_net_making_cost(frm) {
        frm.trigger("commission")
        frm.trigger("profit")
    },
    commission(frm) {
        frm.set_value("commission_amount", frm.doc.total_net_making_cost * (frm.doc.commission / 100))
    },
    profit(frm) {
        frm.set_value("profit_amount", frm.doc.total_net_making_cost * (frm.doc.profit / 100))
    },
    order_qty(frm) {
        frm.set_value("total_qty", frm.doc.order_qty)
        frm.trigger("total_raw_material_required")
    },
    profit_amount(frm) {
        frm.set_value("total_gross_making_per_piece_cost_pkr", frm.doc.total_net_making_cost + frm.doc.commission_amount + frm.doc.profit_amount)
        frm.set_value("total_gross_making_cost", frm.doc.total_gross_making_per_piece_cost_pkr * frm.doc.total_qty)
    },
    commission_amount(frm) {
        frm.trigger("profit_amount")
    },
    total_net_making_cost(frm) {
        frm.trigger("profit_amount")
    },
    total_gross_making_cost(frm) {
        if (frm.doc.exchange_rate > 0) {
            frm.set_value("total_gross_making_per_piece_cost_in_usd", frm.doc.total_gross_making_per_piece_cost_pkr / frm.doc.exchange_rate)
        } else {
            frm.set_value("total_gross_making_per_piece_cost_in_usd", 0)
        }
        frm.set_value("total_gross_making_cost_in_usd", frm.doc.total_gross_making_per_piece_cost_in_usd * frm.doc.total_qty)
        frm.trigger("total_invoice_amount_in_pkr")
    },
    total_invoice_amount_in_pkr(frm) {
        frm.set_value("total_profit_in_pkr", frm.doc.total_invoice_amount_in_pkr - frm.doc.total_gross_making_cost)
    },
    total_gross_making_cost_in_usd(frm) {
        frm.set_value("total_profit", frm.doc.total_invoice_amount - frm.doc.total_gross_making_cost_in_usd)
    },
    total_invoice_amount(frm) {
        frm.trigger("total_invoice_amount")
    },
    total_gross_making_per_piece_cost_in_usd(frm) {
        frm.set_value("quoted", frm.doc.total_gross_making_per_piece_cost_in_usd)
    },
    exchange_rate(frm) {
        frm.trigger("total_gross_making_cost")
        frm.trigger("total_invoice_amount")
        frm.trigger("profit_amount")
    },
    quoted(frm) {
        frm.set_value("difference", frm.doc.target - frm.doc.quoted)
    },
    target(frm) {
        frm.trigger("quoted")
        frm.set_value("confirmed_price", frm.doc.target)
    },
    confirmed_price(frm) {
        frm.set_value("total_invoice_amount", frm.doc.total_qty * frm.doc.confirmed_price)
    },
    total_qty(frm) {
        frm.trigger("confirmed_price")
        frm.trigger("profit_amount")
    },
    total_invoice_amount(frm) {
        frm.set_value("total_invoice_amount_in_pkr", frm.doc.total_invoice_amount * frm.doc.exchange_rate)

    },
    before_save(frm) {
        frm.trigger("net_making_cost")
    }

});


frappe.ui.form.on('Inquiry Cost Sheet Garment Fabric', {
    qty(frm, cdt, cdn) {
        var d = locals[cdt][cdn];
        frappe.model.set_value(d.doctype, d.name, "amount", d.qty * d.rate)
        set_fabrics_total(frm)
    },
    rate(frm, cdt, cdn) {
        var d = locals[cdt][cdn];
        frappe.model.set_value(d.doctype, d.name, "amount", d.qty * d.rate)
        set_fabrics_total(frm)
    },
    fabrics_remove(frm) {
        set_fabrics_total(frm)
    }
});


frappe.ui.form.on('Inquiry Cost Sheet Garment Accessory', {
    qty(frm, cdt, cdn) {
        var d = locals[cdt][cdn];
        frappe.model.set_value(d.doctype, d.name, "amount", d.qty * d.rate)
        set_accessories_total(frm)
    },
    rate(frm, cdt, cdn) {
        var d = locals[cdt][cdn];
        frappe.model.set_value(d.doctype, d.name, "amount", d.qty * d.rate)
        set_accessories_total(frm)

    }
});


function set_fabrics_total(frm) {
    var fabrics = frm.doc.fabrics;
    var fabrics_total = 0;
    for (var i in fabrics) {
        fabrics_total += fabrics[i].amount
    }
    frm.set_value("fabrics_total", fabrics_total)
    frm.set_value("fabric_cost", fabrics_total)
}

function set_accessories_total(frm) {
    var accessories = frm.doc.accessories;
    var accessories_total = 0;
    for (var i in accessories) {
        accessories_total += accessories[i].amount
    }
    frm.set_value("accessories_total", accessories_total)
    frm.set_value("trims_and_accessories_cost", accessories_total)
}


frappe.ui.form.on('Fabric Calculations', {
    gsm(frm, cdt, cdn) {
        var d = locals[cdt][cdn];
        frappe.model.set_value(d.doctype, d.name, "body_gross", ((d.gsm || 1) * (d.body_length || 1) * (d.chestbust || 1)) / (d.constant || 1));
        frappe.model.set_value(d.doctype, d.name, "sleeve_gross", ((d.sleeve_length || 1) * (d.sleeve_width || 1) * (d.gsm || 1) * 2) / (d.constant || 1));
        rib_total(frm)
        jercy_total(frm)
        fleese_total(frm)
    },
    body_length(frm, cdt, cdn) {
        var d = locals[cdt][cdn];
        frappe.model.set_value(d.doctype, d.name, "body_gross", ((d.gsm || 1) * (d.body_length || 1) * (d.chestbust || 1)) / (d.constant || 1));
        rib_total(frm)
        jercy_total(frm)
        fleese_total(frm)
    },
    chestbust(frm, cdt, cdn) {
        var d = locals[cdt][cdn];
        frappe.model.set_value(d.doctype, d.name, "body_gross", ((d.gsm || 1) * (d.body_length || 1) * (d.chestbust || 1)) / (d.constant || 1));
        rib_total(frm)
        jercy_total(frm)
        fleese_total(frm)
    },
    constant(frm, cdt, cdn) {
        var d = locals[cdt][cdn];
        frappe.model.set_value(d.doctype, d.name, "body_gross", ((d.gsm || 1) * (d.body_length || 1) * (d.chestbust || 1)) / (d.constant || 1));
        frappe.model.set_value(d.doctype, d.name, "sleeve_gross", ((d.sleeve_length || 1) * (d.sleeve_width || 1) * (d.gsm || 1) * 2) / (d.constant || 1));
        rib_total(frm)
        jercy_total(frm)
        fleese_total(frm)
    },
    sleeve_length(frm, cdt, cdn) {
        var d = locals[cdt][cdn];
        frappe.model.set_value(d.doctype, d.name, "sleeve_gross", ((d.sleeve_length || 1) * (d.sleeve_width || 1) * (d.gsm || 1) * 2) / (d.constant || 1));
        rib_total(frm)
        jercy_total(frm)
        fleese_total(frm)
    },
    sleeve_width(frm, cdt, cdn) {
        var d = locals[cdt][cdn];
        frappe.model.set_value(d.doctype, d.name, "sleeve_gross", ((d.sleeve_length || 1) * (d.sleeve_width || 1) * (d.gsm || 1) * 2) / (d.constant || 1));
        rib_total(frm)
        jercy_total(frm)
        fleese_total(frm)
    },
    component(frm) {
        rib_total(frm)
        jercy_total(frm)
        fleese_total(frm)
    }

});

frappe.ui.form.on('Job Costing Fabric', {
    refresh(frm) {
    },
    component: function (frm, cdt, cdn) {
        calculate_ratio(frm, cdt, cdn);
        calculate_amount(frm, cdt, cdn);
        calculate_fabric_total(frm);
    },
    ratio: function (frm, cdt, cdn) {
        calculate_ratio(frm, cdt, cdn);
        calculate_amount(frm, cdt, cdn);
        calculate_fabric_total(frm);
    },
    rate: function (frm, cdt, cdn) {
        calculate_amount(frm, cdt, cdn);
        calculate_fabric_total(frm);
    }
});
frappe.ui.form.on('Job Costing Accessory', {
    refresh(frm) {


    },
    qty: function (frm, cdt, cdn) {
        calculate_amount(frm, cdt, cdn);
        calculate_accessories_total(frm);
    },
    rate: function (frm, cdt, cdn) {
        calculate_amount(frm, cdt, cdn);
        calculate_accessories_total(frm);
    }
});
frappe.ui.form.on('Process Items', {
    refresh(frm) {

    },
    process_name: function (frm) {
        calculate_process_amount_total(frm);
    }
});
function calculate_ratio(frm, cdt, cdn) {
    var d = locals[cdt][cdn];
    if (d && d.component == "RIB" && frm.doc.total_rib > 0) {
        var qty_rib = (d.ratio / 100) * frm.doc.total_rib;
        frappe.model.set_value(d.doctype, d.name, "qty", qty_rib);
    } else if (d && d.component == "Jercy" && frm.doc.total_jercy > 0) {
        var qty_jercy = (d.ratio / 100) * frm.doc.total_jercy;
        frappe.model.set_value(d.doctype, d.name, "qty", qty_jercy);
    } else if (d && d.component == "Fleese" && frm.doc.total_fleese > 0) {
        var qty_fleese = (d.ratio / 100) * frm.doc.total_fleese;
        frappe.model.set_value(d.doctype, d.name, "qty", qty_fleese);
    } else {
        frappe.model.set_value(d.doctype, d.name, "qty", 0);
    }
}

function calculate_amount(frm, cdt, cdn) {
    var d = locals[cdt][cdn];
    if (d && d.qty > 0 && d.rate > 0) {
        frappe.model.set_value(d.doctype, d.name, "amount", d.qty * d.rate);
    } else {
        frappe.model.set_value(d.doctype, d.name, "amount", 0);
    }
}

function calculate_fabric_total(frm) {
    var jcf = frm.doc.job_costing_fabric;
    var total_ratio_rib = 0;
    var total_ratio_fleese = 0;
    var total_ratio_jercy = 0;

    // Initialize fabrics_total if not already initialized
    frm.doc.fabrics_total = frm.doc.fabrics_total || 0;

    // Calculate total ratios for RIB, Fleese, and Jercy
    for (var i in jcf) {
        var ratio = parseFloat(jcf[i].ratio); // Convert ratio to numeric type
        if (!isNaN(ratio)) {
            if (jcf[i].component == "RIB") {
                total_ratio_rib += ratio;
            } else if (jcf[i].component == "Fleese") {
                total_ratio_fleese += ratio;
            } else if (jcf[i].component == "Jercy") {
                total_ratio_jercy += ratio;
            }
            frm.doc.fabrics_total += jcf[i].amount;
        }
    }

    // Check if total ratio for any component exceeds 100
    if (total_ratio_rib > 100 || total_ratio_fleese > 100 || total_ratio_jercy > 100) {
        var component;
        var adjust_ratio;
        if (total_ratio_rib > 100) {
            component = "RIB";
            adjust_ratio = total_ratio_rib - 100;
        } else if (total_ratio_fleese > 100) {
            component = "Fleese";
            adjust_ratio = total_ratio_fleese - 100;
        } else if (total_ratio_jercy > 100) {
            component = "Jercy";
            adjust_ratio = total_ratio_jercy - 100;
        }

        // Find the last entry for the component and adjust its ratio
        for (var i = jcf.length - 1; i >= 0; i--) {
            if (jcf[i].component == component) {
                var ratio = parseFloat(jcf[i].ratio);
                if (!isNaN(ratio)) {
                    var new_ratio = ratio - adjust_ratio;
                    if (new_ratio >= 0) {
                        frappe.model.set_value(jcf[i].doctype, jcf[i].name, "ratio", new_ratio);
                        frappe.msgprint("Total ratio for " + component + " exceeds 100. The last ratio has been adjusted.");
                        break;
                    }
                }
            }
        }
    }

    // Refresh the field
    frm.refresh_field("fabrics_total");
}



function rib_total(frm) {
    var fc = frm.doc.fabric_calculations;
    frm.doc.total_rib = 0;
    for (var i in fc) {
        if (fc[i].component == "RIB") {
            frm.doc.total_rib += fc[i].body_gross
        }
    }
    frm.refresh_field("total_rib")
}

function jercy_total(frm) {
    var fc = frm.doc.fabric_calculations;
    frm.doc.total_jercy = 0;
    for (var i in fc) {
        if (fc[i].component == "Jercy") {
            frm.doc.total_jercy += fc[i].body_gross
        }
    }
    frm.refresh_field("total_jercy")
}

function fleese_total(frm) {
    var fc = frm.doc.fabric_calculations;
    frm.doc.total_fleese = 0;
    for (var i in fc) {
        if (fc[i].component == "Fleese") {
            frm.doc.total_fleese += fc[i].body_gross
        }
    }
    frm.refresh_field("total_fleese")
}

function calculate_accessories_total(frm) {
    var accessories = frm.doc.accessories;
    frm.doc.accessories_total = 0;
    for (var i in accessories) {
        frm.doc.accessories_total += accessories[i].amount
    }
    frm.refresh_field("accessories_total")
}

function calculate_process_amount_total(frm) {
    var process_items = frm.doc.process_items;
    frm.doc.total_process_amount = 0;
    for (var i in process_items) {
        frm.doc.total_process_amount += process_items[i].amount
    }
    frm.refresh_field("total_process_amount")
}
