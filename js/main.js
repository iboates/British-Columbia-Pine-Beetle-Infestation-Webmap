/**
 * Created by isaac on 18/07/17.
 */

$(document).ready(function() {

    // =================================================================================================================
    // LAYER TOGGLING
    // =================================================================================================================

    // https://stackoverflow.com/questions/20705905/bootstrap-3-jquery-event-for-active-tab-change
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {

        var target = $(e.target).attr("href");

        // User clicked on proportions tab, add marker layer & remove threshold layer
        if (target === "#legend-forest-proportions-tab") {

            for (var i=0; i<thresholdLayerArray.length; i++) {
                map.removeLayer(thresholdLayerArray[i]);
            }

            for (var i=0; i<markerLayerArray.length; i++) {
                map.addLayer(markerLayerArray[i]);
            }

        // Otherwise, remove marker layers & add threshold layer.
        } else if (target === "#legend-percent-loss-tab") {

            for (var i=0;i <markerLayerArray.length; i++) {
                map.removeLayer(markerLayerArray[i]);
            }

            for (var i=0;i <thresholdLayerArray.length; i++) {
                map.addLayer(thresholdLayerArray[i]);
            }

        }

    });

    // =================================================================================================================
    // LAYER INTERACTIONS
    // =================================================================================================================

    // Handles adding data to a pyramid.
    addPyramidData = function (featureId, targetData, otherData, targetPolygonTracker, otherPolygonTracker) {

        // add the polygon to the target tracker array
        targetPolygonTracker.push(featureId);

        // look up the data that the marker is referencing
        var polygonData = britishColumbiaPolys.features;
        for (var i = 0; i<polygonData.length; i++) {

            if (polygonData[i].properties.Id == featureId) { // LEAVE THIS WITH '==' - one is a string and the other an int

                // add the data to the pyramid
                for (var j = 0; j < rightData.length; j++) {
                    targetData[j].pine_vol = targetData[j].pine_vol + polygonData[i].properties["_yr" + (1999 + j)];
                }

                // check if the id is already in the other tracker array
                if (otherPolygonTracker.indexOf(featureId) !== -1) {

                    // remove the data from the other tracker array
                    otherPolygonTracker.splice(otherPolygonTracker.indexOf(featureId), 1);

                    // remove the data from the other pyramid
                    for (var j = 0; j < otherData.length; j++) {
                        otherData[j].pine_vol = otherData[j].pine_vol - polygonData[i].properties["_yr" + (1999 + j)];
                    }

                }

                break;

            }

        }
        // colour the polygons
        selectorLayer.setStyle(selectorLayerStyle);

    };

    // Handles removing data from a pyramid.
    removePyramidData = function (featureId, targetData, targetPolygonTracker) {

        // remove the polygon from the right tracker array
        targetPolygonTracker.splice(targetPolygonTracker.indexOf(featureId), 1);

        // look up the data that the marker is referencing
        var polygonData = britishColumbiaPolys.features;
        for (var i = 0; i<polygonData.length; i++) {

            if (polygonData[i].properties.Id == featureId) { // LEAVE THIS WITH '==' - one is a string and the other an int

                // remove the data from the pyramid
                for (var j = 0; j < rightData.length; j++) {
                    targetData[j].pine_vol = targetData[j].pine_vol - polygonData[i].properties["_yr" + (1999 + j)];
                }

            }
        }

    };

    // Handles replacing a pyramid with new source data.
    replacePyramidData = function (featureId, targetData, otherData, otherPolygonTracker) {

        // add the polygon to the target tracker array
        if ($("input[name=pyramid]:checked").val() === "replace-left-pyramid") {
            leftPyramidPolys = [featureId];
        } else if ($("input[name=pyramid]:checked").val() === "replace-right-pyramid") {
            rightPyramidPolys = [featureId];
        }

        // look up the data that the marker is referencing
        var polygonData = britishColumbiaPolys.features;
        for (var i = 0; i<polygonData.length; i++) {

            if (polygonData[i].properties.Id == featureId) { // LEAVE THIS WITH '==' - one is a string and the other an int

                // replace pyramid data
                for (var j = 0; j < targetData.length; j++) {
                    targetData[j].pine_vol = polygonData[i].properties["_yr" + (1999 + j)];
                }

                // check if the id is already in the other tracker array
                if (otherPolygonTracker.indexOf(featureId) !== -1) {

                    // remove the data from the other tracker array
                    otherPolygonTracker.splice(otherPolygonTracker.indexOf(featureId), 1);

                    // remove the data from the other pyramid
                    for (var j = 0; j < otherData.length; j++) {
                        otherData[j].pine_vol = otherData[j].pine_vol - polygonData[i].properties["_yr" + (1999 + j)];
                    }

                }

                break;

            }

        }

    };

    // =================================================================================================================
    // ZOOM CONTROL
    // =================================================================================================================

    map.on("zoomend", function() {

        var zoomLevel = map.getZoom();
        var iconScaleFactor = zoomScales[3]/zoomScales[zoomLevel];
        markerLayer.eachLayer(function (layer) {
            featureName = layer.feature.properties.name;
            return layer.setIcon(L.icon({
                iconUrl: 'svg/' + $( "#time-slider-bar" ).slider("option", "value") + '/' + layer.feature.properties.name + '.svg',
                iconSize: [iconScaleFactor * iconDimensions[featureName], iconScaleFactor * iconDimensions[featureName]],
                iconAnchor: [iconScaleFactor * iconDimensions[featureName]/2, iconScaleFactor * iconDimensions[featureName]/2]
            }));
        });
        $("#legend-marker-img").attr("src", "svg/meta/sizerbox_" + zoomLevel + ".svg");
    });

    // Change svg to appropriate year/TSA when slider changes
    // Also change threshold layer symbolization when slider changes
    // This one is necessary to see the change if the user does not let go of the mouse button.
    $("#time-slider-bar").on("slidechange", function() {

        var zoomLevel = map.getZoom();
        var iconScaleFactor = zoomScales[3]/zoomScales[zoomLevel];

        // Change markers
        markerLayer.eachLayer(function (layer) {
            featureName = layer.feature.properties.name;
            return layer.setIcon(L.icon({
                iconUrl: 'svg/' + $("#time-slider-bar").slider("option", "value") + '/' + layer.feature.properties.name + '.svg',
                iconSize: [iconScaleFactor * iconDimensions[featureName], iconScaleFactor * iconDimensions[featureName]],
                iconAnchor: [iconScaleFactor * iconDimensions[featureName]/2, iconScaleFactor * iconDimensions[featureName]/2]
            }))
        });

        // Change threshold
        thresholdLayer.eachLayer(function(layer) {

            var yearProperty = "_yr" + $("#time-slider-bar").slider("option", "value");
            var percentPineRemaining = layer.feature.properties[yearProperty]/layer.feature.properties._pine_vol;

            percentPineRemaining <= 0.21 ? layer.setStyle({fillColor: "#770000"}) :
                percentPineRemaining <= 0.50 ? layer.setStyle({fillColor: "#aa0000"}) :
                    percentPineRemaining <= 0.75 ? layer.setStyle({fillColor: "#dd0000"}) :
                        percentPineRemaining <= 0.90 ? layer.setStyle({fillColor: "#ff5555"}) :
                            percentPineRemaining <= 0.95 ? layer.setStyle({fillColor: "#ff9999"}) :
                                percentPineRemaining <= 0.99 ? layer.setStyle({fillColor: "#ffdddd"}) :
                                    layer.setStyle({fillColor: "#eeeeee"});

        });

    });

    // this one is necessary for the programmatic changes from the autoplay button.
    $( "#time-slider-bar" ).on("slide", function() {

        var zoomLevel = map.getZoom();
        var iconScaleFactor = zoomScales[3] / zoomScales[zoomLevel];
        var currentYear = $("#time-slider-bar").slider("option", "value");

        // Change markers
        markerLayer.eachLayer(function (layer) {
            featureName = layer.feature.properties.name;
            return layer.setIcon(L.icon({
                iconUrl: 'svg/' + $("#time-slider-bar").slider("option", "value") + '/' + layer.feature.properties.name + '.svg',
                iconSize: [iconScaleFactor * iconDimensions[featureName], iconScaleFactor * iconDimensions[featureName]],
                iconAnchor: [iconScaleFactor * iconDimensions[featureName] / 2, iconScaleFactor * iconDimensions[featureName] / 2]
            }))
        });

        // Change threshold
        thresholdLayer.eachLayer(function(layer) {

            var yearProperty = "_yr" + $("#time-slider-bar").slider("option", "value");
            var percentPineRemaining = layer.feature.properties[yearProperty]/layer.feature.properties._pine_vol;

            percentPineRemaining <= 0.21 ? layer.setStyle({fillColor: "#770000"}) :
                percentPineRemaining <= 0.50 ? layer.setStyle({fillColor: "#aa0000"}) :
                    percentPineRemaining <= 0.75 ? layer.setStyle({fillColor: "#dd0000"}) :
                        percentPineRemaining <= 0.90 ? layer.setStyle({fillColor: "#ff5555"}) :
                            percentPineRemaining <= 0.95 ? layer.setStyle({fillColor: "#ff9999"}) :
                                percentPineRemaining <= 0.99 ? layer.setStyle({fillColor: "#ffdddd"}) :
                                    layer.setStyle({fillColor: "#eeeeee"});

        });

    });

    // =================================================================================================================
    // SLIDER BAR
    // =================================================================================================================

    var slideValue = $("#time-slider-bar").slider({
        min: 1998,
        max: 2014,
        value: 1998,
        start: function(event, ui) {
            event.originalEvent.type == "mousedown" && $(this).addClass("ui-slider-mousesliding");
        },
    });


    $(ticks).each(function(i) {
        var tick = $('<div class="tick ui-widget-content">' + this + '</div>').appendTo(slideValue);
        tick.css({
            left: (100 / ticks.length * i) + '%',
            width: (100 / ticks.length) + '%'
        });
    });

    slideValue.find(".tick:first").css("border-left", "none");

    function scrollSlider() {

        var slideValue;
        slideValue = $("#time-slider-bar").slider("value");

        if (autoplay) {
            if (slideValue >= 0) {
                if (slideValue == 2014) {
                    slideValue = -1;
                }
                $("#time-slider-bar").slider("value", slideValue + 1);
                autoplay = setTimeout(scrollSlider, 500);
            }
        }
    }

    // Make slider auto-seek when the user clicks on the autoplay button.
    $('#autoplay-button').click(function() {
        autoplay = true;
        scrollSlider();
    });

    // Make slider stop when user clicks on the stop button.
    $('#stop-button').click(function() {
        autoplay = false;
    });

    // =================================================================================================================
    // PYRAMID INTERACTIONS
    // =================================================================================================================

    updatePyramids = function() {

        // get the maximum of both sets of data to standardize both x-axes
        var absoluteMax = Math.max(d3.max(leftData, function(d){ return d.pine_vol; }),
            d3.max(rightData, function(d){ return (d.pine_vol); }));

        // get the current container sizes (important for responsivity)
        var containerWidth = $("#right-pyramid-container").width();
        var containerHeight = $("#right-pyramid-container").height();

        // get rid of what is already in the containers.
        d3.select("#left-pyramid-container > svg").remove();
        d3.select("#centre-pyramid-container > svg").remove();
        d3.select("#right-pyramid-container > svg").remove();

        // LEFT GRAPH RESIZE

        //set the dimensions and margins of the graph
        var leftMargin = {top: 5, right: 12, bottom: 35, left: 10},
            leftWidth = containerWidth - leftMargin.left - leftMargin.right,
            leftHeight = containerHeight - leftMargin.top - leftMargin.bottom;

        // Scale the range of the leftData in the domains
        var leftXScale = d3.scaleLinear()
             .range([leftWidth, 0]);
        leftXScale.domain([0, absoluteMax]);

        var leftYScale = d3.scaleBand()
            .range([leftHeight, 0])
            .padding(0.1);
        leftYScale.domain(leftData.map(function(d) { return d.year; }));

        // make left svg
        var leftSvg = d3.select("#left-pyramid-container").append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0, 0 " + containerWidth + ", " + containerHeight)
            .append("g")
            .attr("transform",
                "translate(" + leftMargin.left + "," + leftMargin.top + ")");

        // append the rectangles for the bar chart
        leftSvg.selectAll(".bar")
            .data(leftData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("fill", "#4B9B4B")
            .attr("x", function(d) { return leftXScale(d.pine_vol) } )
            .attr("width", function(d) { return leftWidth - leftXScale(d.pine_vol) })
            .attr("y", function(d) { return leftYScale(d.year) })
            .attr("height", leftYScale.bandwidth());

        // add the x Axis
        leftSvg.append("g")
            .attr("transform", "translate(0," + leftHeight + ")")
            .call(d3.axisBottom(leftXScale)
                .tickFormat(function(d){return d/1000000 + " M"})
                .ticks(5));

        // add the y Axis
        leftSvg.append("g")
            .attr("transform", "translate( " + 0 + ", 0 )");

        // add x axis label
        leftSvg.append("text")
            .attr("transform",
                "translate(" + (leftWidth/2) + " ," +
                (leftHeight + leftMargin.top + 25) + ")")
            .style("text-anchor", "middle")
            .text("Productive Pine Forest (cubic meters)");

        // CENTRE GRAPH RESIZE

        var centreContainerWidth =$("#centre-pyramid-container").width();

        // set the dimensions and margins of the graph
        var centreMargin = {top: 5, right: 0, bottom: 35, left: 0},
            centreWidth = containerWidth - centreMargin.left - centreMargin.right,
            centreHeight = containerHeight - centreMargin.top - centreMargin.bottom;

        // set the ranges
        var centreYScale = d3.scaleBand()
            .range([centreHeight, 0])
            .padding(0.1);

        var centreXScale = d3.scaleLinear()
            .range([centreWidth, 0]);

        var centreSvg = d3.select("#centre-pyramid-container").append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0, 0 " + centreContainerWidth + ", " + containerHeight)
            .append("g")
            .attr("transform",
                "translate(" + centreMargin.left + "," + centreMargin.top + ")");

        centreYScale.domain(centreData.map(function(d) { return d.year; }));

        // append the rectangles for the bar chart
        centreSvg.selectAll(".bar")
            .data(centreData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("fill", "#d9f1ff")
            .attr("width", function(d) { return centreWidth - centreXScale(d.pine_vol) })
            .attr("y", function(d) { return centreYScale(d.year) })
            .attr("height", centreYScale.bandwidth());

        // add the y Axis
        centreYAxis = centreSvg.append("g")
            .attr("transform", "translate( " + 0 + ", 0 )");

        centreSvg.selectAll("text")
            .data(centreData)
            .enter().append("text")
            .text(function (d) { return d.year; })
            .attr("text-anchor", "center")
            .style("font-size", "1.3vh")
            .attr("x", 0)
            .attr("y", function(d) { return centreYScale(d.year)+centreYScale.bandwidth() }) // 12 seems to be the magic number to make the labels appear in the right place... i really need to learn more about d3 because this is definitely an absurd solution...
            .attr("height", centreYScale.bandwidth());

        // RIGHT GRAPH RESIZE

        // set the dimensions and margins of the graph
        var rightMargin = {top: 5, right: 10, bottom: 35, left: 12},
            rightWidth = containerWidth - rightMargin.left - rightMargin.right,
            rightHeight = containerHeight - rightMargin.top - rightMargin.bottom;

        // set the ranges
        var rightYScale = d3.scaleBand()
            .range([rightHeight, 0])
            .padding(0.1);

        var rightXScale = d3.scaleLinear()
            .range([0, rightWidth]);

        // TODO: COMMENT
        var rightSvg = d3.select("#right-pyramid-container").append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0, 0 " + containerWidth + ", " + containerHeight)
            .append("g")
            .attr("transform",
                "translate(" + rightMargin.left + "," + rightMargin.top + ")");

        // Scale the range of the rightData in the domains
        rightXScale.domain([0, absoluteMax]);
        rightYScale.domain(rightData.map(function(d) { return d.year; }));

        // append the rectangles for the bar chart
        rightSvg.selectAll(".bar")
            .data(rightData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("fill", "#4B9B4B")
            .attr("width", function(d) { return rightXScale(d.pine_vol); } )
            .attr("y", function(d) { return rightYScale(d.year); })
            .attr("height", rightYScale.bandwidth());

        // add the x Axis
        rightSvg.append("g")
            .attr("transform", "translate(0," + rightHeight + ")")
            .call(d3.axisBottom(rightXScale)
                .tickFormat(function(d){return d/1000000 + " M"})
                .ticks(5));

        // add the y Axis
        rightSvg.append("g")
            .attr("transform", "translate( " + 0 + ", 0 )");

        // add x axis label
        rightSvg.append("text")
            .attr("transform",
                "translate(" + (rightWidth/2) + " ," +
                (rightHeight + rightMargin.top + 25) + ")")
            .style("text-anchor", "middle")
            .text("Productive Pine Forest (cubic meters)");

    };

    // Initialize the pyramids on load, and then make it also update every time the window size changes.
    updatePyramids();
    d3.select(window).on("resize", updatePyramids);

    // clearing pyramids

    $("#clear-left-pyramid").on("click", function() {

        // reset pyramid data
        leftData = [
            {"year": "_yr1999", "pine_vol": 0},
            {"year": "_yr2000", "pine_vol": 0},
            {"year": "_yr2001", "pine_vol": 0},
            {"year": "_yr2002", "pine_vol": 0},
            {"year": "_yr2003", "pine_vol": 0},
            {"year": "_yr2004", "pine_vol": 0},
            {"year": "_yr2005", "pine_vol": 0},
            {"year": "_yr2006", "pine_vol": 0},
            {"year": "_yr2007", "pine_vol": 0},
            {"year": "_yr2008", "pine_vol": 0},
            {"year": "_yr2009", "pine_vol": 0},
            {"year": "_yr2010", "pine_vol": 0},
            {"year": "_yr2011", "pine_vol": 0},
            {"year": "_yr2012", "pine_vol": 0},
            {"year": "_yr2013", "pine_vol": 0},
            {"year": "_yr2014", "pine_vol": 0}
        ];

        // clear tracking array
        leftPyramidPolys = [];

        // clear badges
        $(".badge-left").remove();

        // update data
        updatePyramids();

        // colour the polygons
        selectorLayer.setStyle(selectorLayerStyle);

    });

    $("#clear-right-pyramid").on("click", function() {

        // reset pyramid data
        rightData = [
            {"year": "_yr1999", "pine_vol": 0},
            {"year": "_yr2000", "pine_vol": 0},
            {"year": "_yr2001", "pine_vol": 0},
            {"year": "_yr2002", "pine_vol": 0},
            {"year": "_yr2003", "pine_vol": 0},
            {"year": "_yr2004", "pine_vol": 0},
            {"year": "_yr2005", "pine_vol": 0},
            {"year": "_yr2006", "pine_vol": 0},
            {"year": "_yr2007", "pine_vol": 0},
            {"year": "_yr2008", "pine_vol": 0},
            {"year": "_yr2009", "pine_vol": 0},
            {"year": "_yr2010", "pine_vol": 0},
            {"year": "_yr2011", "pine_vol": 0},
            {"year": "_yr2012", "pine_vol": 0},
            {"year": "_yr2013", "pine_vol": 0},
            {"year": "_yr2014", "pine_vol": 0}
        ];

        // clear tracking array
        rightPyramidPolys = [];

        // clear badges
        $(".badge-right").remove();

        // update data
        updatePyramids();

        // colour the polygons
        selectorLayer.setStyle(selectorLayerStyle);

    });

    // =================================================================================================================
    // BADGES (PYRAMID TRACKERS)
    // =================================================================================================================

    badgeClickHandler = function (e) {

        // get the id of the feature from the badge id and which side it is on
        var featureId = $(e.target).attr('id').split("-")[2];
        var badgeSide = $(e.target).attr('class').split(' ')[2];

        // remove data from the appropriate pyramid
        if (badgeSide === 'badge-left') {
            removePyramidData(featureId, leftData, leftPyramidPolys);
        } else {
            removePyramidData(featureId, rightData, rightPyramidPolys);
        }

        // remove this badge
        this.remove();

        // update data
        updatePyramids();

        // colour the polygons
        selectorLayer.setStyle(selectorLayerStyle);

    };

    $(document).on('click', '.badge', badgeClickHandler);

});