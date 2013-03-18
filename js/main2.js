/* Author: Arunesh Joshi */

var itemData, ratings;

function toArray (map)
{
	var array = [];

	for (var name in map)
	{
		map[name].name = name;
		array.push (map[name]);
	}

	return array;
};

function sortFunction (a, b)
{
	return a.order - b.order;
};

function setRelatedItem (item, data)
{
	item.children("img").attr("src", data.image);
	item.children("a").text(data.name.substr(0, 1+data.name.indexOf("\""))).attr("href", data.url);

	var j = data.name.substr(2+data.name.indexOf("\""));
	if (j.length > 28) j = j.substr(0, 28) + "...";
	item.children("span").text(j);

	item.children("em").html(""+parseInt(data.listPrice)+"<span>"+ (data.listPrice - parseInt(data.listPrice)).toFixed(2).substr(1) +"</span>")
	item.children("i").children("i").css("width", 25*parseInt((100*data.rating/5)/25) +"%");
};

function loadItemData (item_id)
{
	var i, j, inf;

	$(".qty .value").text("Qty");

	$.ajax ({ type: "get", async: false, url: "res/data/"+item_id+".json", dataType: "json", success: function(result) { itemData = result; } });

	$(".review_title").html(itemData.genericContent.itemName);
	$(".review_short").html(itemData.genericContent.shortDescription);
	$(".review_long").html(itemData.genericContent.longDescription);
	$(".review_warranty").html(itemData.genericContent.supplierWarranty);
	$(".review_subtitle .score > div").css("width", parseInt((itemData.genericContent.rank*100)/25)*25+"%");
	$(".review_subtitle .price").text("$" + itemData.sellers[0].currentItemPrice)

	/* Carousel #1 */
	var base, item, images = itemData.alternateImageData;
	$(".review_carousel:first").html("");

	if (!images || !images.length) images = [itemData.productImageUrl];

	var carousel = $("#carousel_tpl").clone().attr("id", "carousel").addClass("carousel").removeClass("hidden");
	var carousel_indicators = carousel.find(".carousel-indicators:first").html("");
	var carousel_inner = carousel.find(".carousel-inner:first").html("");

	for (i = 0; i < images.length; i++)
	{
		carousel_indicators.append("<li data-target='#carousel' data-slide-to='"+i+"'></li>");
		if(images.length === 1)
		carousel_inner.append("<div class='item'><img src='"+images[i]+"'/></div>");
	    else
		carousel_inner.append("<div class='item'><img src='"+images[i].lgImageSrc+"'/></div>");
	}

	carousel_inner.children("div:first").addClass("active");
	carousel.appendTo($(".review_carousel:first")).carousel({ interval:false });

	/* Carousel #2 */
	$(".review_carousel.b").html("");

	carousel = $("#carousel2_tpl").clone().attr("id", "carousel2").addClass("carousel").removeClass("hidden");
	carousel_indicators = carousel.find(".carousel-indicators:first").html("");
	carousel_inner = carousel.find(".carousel-inner:first").html("");

	base = $("#carousel_tpl2_item");

	for (i = 0; i < 5; i++)
	{
		item = base.clone().removeAttr("id").removeClass("hidden");

		inf = ratings[parseInt(Math.random()*ratings.length)%ratings.length];

		item.find(".rtitle").text(inf.title);
		item.find(".by").text(inf.customer);
		item.find(".date").text(inf.date);
		item.find(".verified").text(inf.isVerified=="false"?"Non-Verified Customer":"Verified Customer");
		item.find(".rating").css("width", parseInt((100*parseFloat(inf.rating)/5)/25)*25+"%");
		item.find(".descr").html(inf.review)

		item.find(".value").css("width", parseInt((100*parseFloat(inf.value)/5)/25)*25+"%");
		item.find(".fit").css("width", parseInt((100*parseFloat(inf.meetsexpectations)/5)/25)*25+"%");
		item.find(".quality").css("width", parseInt((100*parseFloat(inf.picturequality)/5)/25)*25+"%");
		item.find(".satisfaction").css("width", parseInt((100*parseFloat(inf.features)/5)/25)*25+"%");
		item.find(".styling").css("width", parseInt((100*parseFloat(inf.soundquality)/5)/25)*25+"%");
		
		item.find(".age").text(inf.age);
		item.find(".gender").text(inf.gender);
		item.find(".ownership").text(inf.ownership);
		item.find(".usage").text(inf.usage);
		item.find(".city").text(inf.city);

		carousel_indicators.append("<li data-target='#carousel2' data-slide-to='"+i+"'></li>");
		carousel_inner.append(item);
	}

	carousel_inner.children("div:first").addClass("active");
	carousel.appendTo($(".review_carousel.b")).carousel({ interval:false });

	/* Specs */
	var attributes = itemData.itemAttributes;
	var groups = { };

	for (i = 0; i < attributes.length; i++)
	{
		var attr = attributes[i];
		var groupName = attr.groupName;

		if (!groups[groupName])
			groups[groupName] = { order:attr.groupDisplayOrder, items:[] };

		groups[groupName].items.push({ order:attr.attributeDisplayOrder, value:attr.attributeValue, name:attr.attrDisplayName,  });
	}

	groups = toArray(groups).sort(sortFunction);

	var specs = $(".review_specs").html("");

	for (i = 0; i < groups.length; i++)
	{
		var group = groups[i];

		specs.append("<h1 class='def'>"+group.name+"</h1>");

		group.items.sort(sortFunction);

		for (j = 0; j < group.items.length; j++)
		{
			var item = group.items[j];

			specs.append("<div><b>"+item.name+": </b>"+item.value+"</div>");
		}
	}

	/* Related */
	setRelatedItem ($(".review_related .item.a"), dataset[parseInt(Math.random()*dataset.length)]);
	setRelatedItem ($(".review_related .item.b"), dataset[parseInt(Math.random()*dataset.length)]);
	setRelatedItem ($(".review_related .item.c"), dataset[parseInt(Math.random()*dataset.length)]);

	$(".truncate")
	.each(function()
	{
		var text = $(this).html();
		if (text.length < 500) return;

		$(this).html(text.substr(0, 500) + " ");
		$(this).append($("<a>").attr("href", "#").text("Read more").click(function() {
			$(this).parent().html(text);
		}));
	})
};

$(function()
{
	$(".review_close").click(function() { $(".review_layer").fadeOut("fast"); });
	$(".review_layer").click(function(evt) { if ($(evt.target).hasClass("review_layer")) $(".review_layer").fadeOut("fast"); });

	$.ajax ({ type: "get", async: false, url: "res/ratingsReviews.json", dataType: "json", success: function(result) { ratings = result; } });

	//loadItemData (17013297);

	$(".qty .dropdown-menu a").click(function()
	{
		$(this).parents(".qty:first").data("value", $(this).text()).find(".value").text($(this).text());
	});

	$(".add-to-cart").click(function()
	{
		
        var checkForNaN = isNaN(parseInt($(".qty").data("value")));
        if (checkForNaN == true)        
        {
            alert("Item added to cart.");
            $(".cart-items:visible").text (parseInt($(".cart-items:visible").text()) + 1);
            $(".qty .value").text("Qty");
        }
        else
        {
            alert("Item added to cart.");
            $(".cart-items:visible").text (parseInt($(".cart-items:visible").text()) + parseInt($(".qty").data("value")));
            $(".qty .value").text("Qty");
	    }
		return false;
	});

});
