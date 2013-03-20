/* Author: Arunesh Joshi */

var dataset = null;
var range = [0, 0];
var range_min, range_max, range_mid;
var slider;

function last (array)
{
	return array[array.length-1];
}

function calculateRange ()
{
    var i;

    range_min = null;
    range_max = null;

    for (i = 0; i < dataset.length; i++) {
        range_min = range_min === null ? dataset[i].size : Math.min (dataset[i].size, range_min);
        range_max = range_max === null ? dataset[i].size : Math.max (dataset[i].size, range_max);
    }
	
	range_mid = parseInt((range_max + range_min) / 2);
}

var dummyFunction = function()
{
};

function filterTypes ()
{
	var data, set, i, s, p, type_ui;

    data = [];
	for (i = 0; i < dataset.length; i++)
	{
		if (!(range[0] <= parseInt(dataset[i].size) && parseInt(dataset[i].size) <= range[1]))
			continue;

		data.push(dataset[i]);
	}

	set = { };
	for (i = 0; i < data.length; i++) set[data[i].type] = true;
	type_ui = $("#typeDropDownElement");
	p = type_ui.val();
	s = type_ui.html(""); s.append($("<option>").val("All").text("All Types"));
	for (i in set) s.append($("<option>").val(i).text(i));
	type_ui.val(p); if (type_ui.val() != p) type_ui.val("All"); type_ui.change();
}

function filterBrands ()
{
	var data, set, i, selected_type, p, brand_element;

	selected_type = $("#typeDropDownElement").val();

    data = [];
	for (i = 0; i < dataset.length; i++)
	{
		if (!(range[0] <= parseInt(dataset[i].size) && parseInt(dataset[i].size) <= range[1]))
			continue;

		if (selected_type != "All" && dataset[i].type != selected_type)
			continue;

		data.push(dataset[i]);
	}

    set = { };
    for (i = 0; i < data.length; i++) set[data[i].brand] = true;
	brand_element = $("#brandDropDownElement");
	p = brand_element.val();
	s = brand_element.html(""); s.append($("<option>").val("All").text("All Brands"));
	for (i in set) s.append($("<option>").val(i).text(i));
	brand_element.val(p); if (brand_element.val() != p) brand_element.val("All"); brand_element.change();
}

var listProducts = function()
{
    var selected_type = $("#typeDropDownElement").val();
    var selected_brand = $("#brandDropDownElement").val();
    var selected_sort = $("#sortDropDownElement").val();

    var ui = $("#product-list").html("");
    var i, sfunc, n = 0;

    switch (selected_sort)
    {
        case "price_asc":
            sfunc = function(a,b) { return parseFloat(a.listPrice) - parseFloat(b.listPrice); };
            break;

        case "price_desc":
            sfunc = function(a,b) { return parseFloat(b.listPrice) - parseFloat(a.listPrice); };
            break;

        case "ranking":
            sfunc = function(a,b) { return parseFloat(b.rating) - parseFloat(a.rating); };
            break;

        case "size":
            sfunc = function(a,b) { return parseFloat(b.size) - parseFloat(a.size); };
            break;
    }

    dataset.sort(sfunc);

    for (i = 0; i < dataset.length; i++)
    {
        var k = dataset[i];

        if (selected_type != "All" && k.type != selected_type) continue;
        if (selected_brand != "All" && k.brand != selected_brand) continue;

        if (!(range[0] <= parseInt(k.size) && parseInt(k.size) <= range[1]))
            continue;

        var div = $("#resultTemplate").clone().removeAttr("id");

		div.children("img").attr("src", "images/blank.png").attr("data-original", k.image).attr("onclick", "showItem("+last(k.url.split("/"))+");")
		.attr("data-placement", "right").attr("title", $("<span>").html(k.description).text()).tooltip()
		;
		div.children("b").text(k.name.substr(0, 1+k.name.indexOf("\""))).attr("onclick", "showItem("+last(k.url.split("/"))+");");

		var j = k.name.substr(2+k.name.indexOf("\""));
        if (j.length > 28) j = j.substr(0, 28) + "...";
        div.children("span").text(j);

        div.children("em").html(""+parseInt(k.listPrice)+"<span>"+ (k.listPrice - parseInt(k.listPrice)).toFixed(2).substr(1) +"</span>");
        div.find("i > i").css("width", 25*parseInt(((k.rating/5)*100)/25) + "%");

        ui.append(div.css("display", "inline-block"));
        n++;
    }

    ui.find("img").lazyload({ effect:"fadeIn", threshold:200 });
    $(window).trigger("scroll");

    $("#matches-label").text (n + " Matches");
}

function clearFilters ()
{
    var f = listProducts;
    listProducts = dummyFunction;

    $("#typeDropDownElement").val("All").change();
    $("#brandDropDownElement").val("All").change();
    $("#sortDropDownElement").val("price_asc").change();
    slider.trigger("setvals", { values: [range_mid-10, range_mid+10] } );

    listProducts = f;
    listProducts();
}

function popitup(url) {
    newwindow=window.open(url,'name','height=550,width=550');
    if (window.focus) {newwindow.focus()}
    return false;
}

function signUpMail (email)
{
    if (/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(email.val()))
        popitup("http://www.walmart.com/email_collect/thankyou_popup.gsp?conf_email="+encodeURI(email.val())+"&email_source_id=1178");
    else
        alert("Please specify a correct email address.");
}

function FocusOnInput()
{
    document.getElementById("searchbox").focus();
}

function search (term)
{
    if (/^[^&<>{}]*$/.test(term.val()))
        window.location = "http://www.walmart.com/search/search-ng.do?search_query="+encodeURI(term.val());
    else
        alert("Please remove incorrect characters from your search term.");
}

function showItem(id)
{
	$(".review_layer").show();
	loadItemData(id);
}

$(function()
{
	$("#searchbox").on("keyup", function(event) { if(event.keyCode==13) search($(this)); });

    $.ajax ({ type: "get", async: false, url: "res/data.json", dataType: "json", success: function(result) { dataset = result; } });

    calculateRange();

	$(".selectpicker").selectpicker();

    slider = $("#size-slider").slider({ animate: false, range: true, min: range_min, max: range_max, values: [0, 0],
        slide: function (event, ui) {

            if (ui.values[0] > ui.values[1])
                return false;

            $(this).find(".ui-slider-handle:eq(0)").attr("data-value", ui.values[0]);
            $(this).find(".ui-slider-handle:eq(1)").attr("data-value", ui.values[1]);

            range[0] = ui.values[0];
            range[1] = ui.values[1];

			filterTypes();
        } });

    slider.on("setvals", function (e, p) {
        $(this).slider("option", "values", p.values);
        $(this).slider("option", "slide").call($(this), null, p);
    });

	slider.trigger("setvals", { values: [range_mid-10, range_mid+10] } );
});
