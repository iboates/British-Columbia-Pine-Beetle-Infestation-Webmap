/**
 * Created by isaac on 02/01/18.
 */

$(document).ready(function() {

    autoplay = true;
    ticks = [1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014];

    leftPyramidPolys = [];
    rightPyramidPolys = [];

    // =================================================================================================================
    // MAP
    // =================================================================================================================

    // Check the marker radio button by default.
    $("#legend-marker-checkbox").prop('checked', true);

    // Set CRS
    var crs = new L.Proj.CRS('EPSG:3005',
        '+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs ',
        {
            resolutions: [
                8192, 4096, 2048, 1024, 512, 256, 128
            ],
            origin: [0, 0]
        });

    // Initialize the map.
    map = L.map('map', {
        crs: crs,
        zoom: 3,
        minZoom: 2,
        maxZoom: 4,
        maxBounds: L.latLngBounds(L.latLng(42.197765, -150.514677), L.latLng(61.746849, -100.952647)),
        maxBoundsViscosity: 1.0
    }).fitBounds([[47.197765, -139.514677], [61.746849, -114.952647]]).setView([55.033333, -124.966667], 2);

    L.control.scale({
        imperial: false
    }).addTo(map);

    // =================================================================================================================
    // MARKERS
    // =================================================================================================================

    function addPyramidData(e, layer, targetData, otherData, targetPolygonTracker, otherPolygonTracker) {

        // get the name of the selected polygon
        var polygonId = e.target.feature.properties.Id;

        // colour the polygon
        if (targetData === leftData) {
            e.target.bringToFront();
            layer.setStyle({
                //fillColor: '#9999dd',
                color: '#663399',
                weight: 10
            });
        } else {
            e.target.bringToFront();
            layer.setStyle({
                //fillColor: '#dd9999',
                color: '#e38d13',
                weight: 10
            });
        }

        // add the polygon to the target tracker array
        targetPolygonTracker.push(polygonId);

        // add the data to the target pyramid
        for (var i = 0; i < targetData.length; i++) {
            targetData[i].pine_vol = targetData[i].pine_vol + e.target.feature.properties["_yr" + (1999 + i)];
        }

        // check if the name is already in the other tracker array
        if (otherPolygonTracker.indexOf(polygonId) !== -1) {

            // remove the data from the other tracker array
            otherPolygonTracker.splice(otherPolygonTracker.indexOf(polygonId), 1);

            // remove the data from the other pyramid
            for (var i = 0; i < otherData.length; i++) {
                otherData[i].pine_vol = otherData[i].pine_vol - e.target.feature.properties["_yr" + (1999 + i)];
            }

        }
    }

    function removePyramidData(e, layer, targetData, targetPolygonTracker) {

        // get the name of the selected polygon
        var polygonId= e.target.feature.properties.Id;

        // reset the polygon back to white
        layer.setStyle({
            stroke: true,
            weight: 0.5,
            color: '#ffffff',
            fillOpacity: 0
        });

        // remove the polygon from the right tracker array
        targetPolygonTracker.splice(targetPolygonTracker.indexOf(polygonId), 1);

        for (var i=0; i<rightData.length; i++) {

            // remove the data from the pyramid
            targetData[i].pine_vol = targetData[i].pine_vol - e.target.feature.properties["_yr"+(1999+i)];

        }

    }

    function replacePyramidData(e, layer, targetData, otherData, targetPolygonTracker, otherPolygonTracker) {

        // get the name of the selected polygon
        var polygonId = e.target.feature.properties.Id;

        // add the polygon to the target tracker array
        if ($("input[name=pyramid]:checked").val() === "replace-left-pyramid") {
            leftPyramidPolys = [polygonId];
        } else if ($("input[name=pyramid]:checked").val() === "replace-right-pyramid") {
            rightPyramidPolys = [polygonId];
        }


        // add the data to the target pyramid
        for (var i = 0; i < targetData.length; i++) {
            targetData[i].pine_vol = e.target.feature.properties["_yr" + (1999 + i)];
        }

        // check if the name is already in the other tracker array
        if (otherPolygonTracker.indexOf(polygonId) !== -1) {

            // remove the data from the other tracker array
            otherPolygonTracker.splice(otherPolygonTracker.indexOf(polygonId), 1);

            // remove the data from the other pyramid
            for (var i = 0; i < otherData.length; i++) {
                otherData[i].pine_vol = otherData[i].pine_vol - e.target.feature.properties["_yr" + (1999 + i)];
            }

        }

        // colour the polygons
        selectorLayer.setStyle(selectorLayerStyle);

    }

    function removePyramidDataFromBadge(badgeId, layer, targetData, targetPolygonTracker) {

        // reset the polygon back to white
        layer.setStyle({
            stroke: true,
            weight: 0.5,
            color: '#ffffff',
            fillOpacity: 0
        });

        // remove the polygon from the target tracker array
        targetPolygonTracker.splice(targetPolygonTracker.indexOf(badgeId), 1);

        // look up the data that the badge is referencing
        var featureId = badgeId.split("-")[2];
        var badgeData = britishColumbiaPolys.features;
        for (var i = 0; i<badgeData.length; i++) {

            if (badgeData[i].properties.Id == featureId) { // LEAVE THIS WITH '==' - one is a string and the other an int

                // remove the data from the pyramid
                for (var j = 0; j < rightData.length; j++) {
                    targetData[j].pine_vol = targetData[j].pine_vol - badgeData[i].properties["_yr" + (1999 + j)];
                }
                break;

            }

        }

        selectorLayer.setStyle(selectorLayerStyle);

    }

    $(document).on('click', '.badge', function(e) {

        var badgeId = $(e.target).attr('id');
        var badgeSide = $(e.target).attr('class').split(' ')[2];

        if (badgeSide === 'badge-left') {
            removePyramidDataFromBadge(badgeId, selectorLayer, leftData, leftPyramidPolys);
        } else {
            removePyramidDataFromBadge(badgeId, selectorLayer, rightData, rightPyramidPolys);
        }

        this.remove();
        update(leftData, rightData);

    });

    // Poylgon Layer
    markerPolygonLayer = L.geoJSON(britishColumbiaPolys, {

        fillColor: "#ffffff",
        stroke: true,
        color: "#000000",
        weight: 1,
        fillOpacity: 1,
        riseOnHover: true,

        onEachFeature: function (feature, layer) {}

    });

    // selector layer
    function selectorLayerStyle(feature, layer) {
        var featureId = feature.properties.Id;
        if (leftPyramidPolys.indexOf(featureId) !== -1) {
            return {
                color: '#663399',
                stroke: true,
                weight: 10,
                fillOpacity: 0
            };
        } else if (rightPyramidPolys.indexOf(featureId) !== -1) {
            return {
                color: '#e38d13',
                stroke: true,
                weight: 10,
                fillOpacity: 0
            };
        } else {
            return {
                color: '#ffffff',
                stroke: true,
                weight: 0.1,
                fillOpacity: 0
            };
        }
    }

    selectorLayer = L.geoJSON(britishColumbiaSelectors, {

        style: selectorLayerStyle,

        onEachFeature: function (feature, layer) {

            layer.bindTooltip(feature.properties.name, {
                sticky: true
            });

            layer.on('click', function (e) {

                // get the currently selected radio button from the pyramid control panel
                var pyramidActionCode = $("input[name=pyramid]:checked").val();

                // get the name & id of the selected polygon
                var polygonName = e.target.feature.properties.name;
                var polygonId = e.target.feature.properties.Id;

                // grab the data to replace or add to the selected bar chart

                // if the user has selected a polygon to add to the left pyramid...
                if (pyramidActionCode === "add-left-pyramid") {

                    // if the polygon is not already in the left tracker array...
                    if (leftPyramidPolys.indexOf(polygonId) === -1) {

                        // add the pyramid data
                        addPyramidData(e, layer, leftData, rightData, leftPyramidPolys, rightPyramidPolys);

                        // add badge to left pyramid tracker container & remove from right tracker
                        $("#left-pyramid-tracker-container").append('<span class="badge badge-default badge-left" id="badge-left-' + polygonId + '">' + polygonName + '</span>');
                        $('#badge-right-' + polygonId).remove();

                        // otherwise...
                    } else {

                        // remove the pyramid data
                        removePyramidData(e, layer, leftData, leftPyramidPolys);

                        // remove the badge from the left pyramid tracker container
                        $('#badge-left-' + polygonId).remove();

                    }

                // if the user has selected a polygon to add to the right pyramid...
                } else if (pyramidActionCode === "add-right-pyramid") {

                    // if the polygon is not already in the right tracker array...
                    if (rightPyramidPolys.indexOf(polygonId) === -1) {

                        // add the pyramid data
                        addPyramidData(e, layer, rightData, leftData, rightPyramidPolys, leftPyramidPolys);

                        // add badge to right pyramid tracker container & remove from left tracker
                        $("#right-pyramid-tracker-container").append('<span class="badge badge-default badge-right" id="badge-right-' + polygonId + '">' + polygonName + '</span>');
                        $('#badge-left-' + polygonId).remove();

                        // otherwise...
                    } else {

                        //remove the pyramid data
                        removePyramidData(e, layer, rightData, rightPyramidPolys);

                        // remove the badge from the right pyramid tracker container
                        $('#badge-right-' + polygonId).remove();

                    }

                // if the user has selected a polygon to replace the left pyramid...
                } else if (pyramidActionCode === "replace-left-pyramid") {

                    // replace the left data with the new data
                    replacePyramidData(e, layer, leftData, rightData, leftPyramidPolys, rightPyramidPolys);

                    // remove all badges from the left pyramid tracker container, add the new one & remove it from the right tracker
                    $('.badge-left').remove();
                    $("#left-pyramid-tracker-container").append('<span class="badge badge-default badge-left" id="badge-left-' + polygonId + '">' + polygonName + '</span>');
                    $('#badge-right-' + polygonId).remove();

                } else if (pyramidActionCode === "replace-right-pyramid") {

                    // replace the right data with the new data
                    replacePyramidData(e, layer, rightData, leftData, rightPyramidPolys, leftPyramidPolys);

                    // remove all badges from the right pyramid tracker container, add the new one & remove it from the left tracker
                    $('.badge-right').remove();
                    $("#right-pyramid-tracker-container").append('<span class="badge badge-default badge-right" id="badge-right-' + polygonId + '">' + polygonName + '</span>');
                    $('#badge-left-' + polygonId).remove();

                }


                // update the bar charts accordingly
                update(leftData, rightData);

            });

        }

    });

    // add marker layer to map
    markerLayer = L.geoJSON(britishColumbiaPoints, {

        onEachFeature: function (feature, layer) {

            layer.bindTooltip(feature.properties.name, {
                sticky: true
            });

        },

        pointToLayer: function (feature, latlng) {
            iconScaleFactor = zoomScales[3] / zoomScales[map.getZoom()];
            featureName = feature.properties.name;
            var marker = L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'svg/1998/' + feature.properties.name + '.svg',
                    iconSize: [iconScaleFactor * iconDimensions[featureName], iconScaleFactor * iconDimensions[featureName]],
                    iconAnchor: [iconScaleFactor * iconDimensions[featureName] / 2, iconScaleFactor * iconDimensions[featureName] / 2]
                })
            });
            return marker
        }

    });

    // =================================================================================================================
    // THRESHOLDS
    // =================================================================================================================

    thresholdLayer = L.geoJSON(britishColumbiaPolys, {

        fillColor: "#ffffff",
        fillOpacity: 1,
        stroke: true,
        color: "#000000",
        weight: 1,
        opacity: 1

    });

    // Pack the layers into arrays to toggle them en masse
    markerLayerArray = [markerPolygonLayer, selectorLayer, markerLayer];
    for (var i = 0; i < markerLayerArray.length; i++) {
        map.addLayer(markerLayerArray[i]);
    }

    thresholdLayerArray = [thresholdLayer, selectorLayer];

    // =================================================================================================================
    // PYRAMIDS
    // =================================================================================================================

    // irrelevant if these are from the left or right container since they are the same.
    var containerWidth = $("#right-pyramid-container").width();
    var containerHeight = $("#right-pyramid-container").height();
    var centreContainerWidth =$("#centre-pyramid-container").width();

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
    
    centreData = [
        {"year": "1999", "pine_vol": 1},
        {"year": "2000", "pine_vol": 1},
        {"year": "2001", "pine_vol": 1},
        {"year": "2002", "pine_vol": 1},
        {"year": "2003", "pine_vol": 1},
        {"year": "2004", "pine_vol": 1},
        {"year": "2005", "pine_vol": 1},
        {"year": "2006", "pine_vol": 1},
        {"year": "2007", "pine_vol": 1},
        {"year": "2008", "pine_vol": 1},
        {"year": "2009", "pine_vol": 1},
        {"year": "2010", "pine_vol": 1},
        {"year": "2011", "pine_vol": 1},
        {"year": "2012", "pine_vol": 1},
        {"year": "2013", "pine_vol": 1},
        {"year": "2014", "pine_vol": 1}
    ];

    // y axis

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
        .attr("fill", "#ffffff")
        .attr("width", function(d) { return centreWidth - centreXScale(d.pine_vol) })
        .attr("y", function(d) { return centreYScale(d.year) })
        .attr("height", centreYScale.bandwidth());

    // add the y Axis
    var centreYAxis = centreSvg.append("g")
        .attr("transform", "translate( " + 0 + ", 0 )");

    centreSvg.selectAll("text")
        .data(centreData)
        .enter().append("text")
        .text(function (d) { return d.year; })
        .attr("text-anchor", "center")
        .style("font-size", "1.3vh")
        // .attr("x", function(d) { return centreXScale(d.year)/2 })
        // .attr("width", function(d) { return centreXScale(d.year) })
        .attr("x", 0)
        .attr("y", function(d) { return centreYScale(d.year)+centreYScale.bandwidth() }) // 12 seems to be the magic number to make the labels appear in the right place... i really need to learn more about d3 because this is definitely an absurd solution...
        .attr("height", centreYScale.bandwidth());

    // left graph

    // set the dimensions and margins of the graph
    var leftMargin = {top: 5, right: 12, bottom: 35, left: 10},
        leftWidth = containerWidth - leftMargin.left - leftMargin.right,
        leftHeight = containerHeight - leftMargin.top - leftMargin.bottom;

    // set the ranges
    var leftYScale = d3.scaleBand()
        .range([leftHeight, 0])
        .padding(0.1);

    var leftXScale = d3.scaleLinear()
        .range([leftWidth, 0]);

    // TODO: COMMENT
    var leftSvg = d3.select("#left-pyramid-container").append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0, 0 " + containerWidth + ", " + containerHeight)
        .append("g")
        .attr("transform",
            "translate(" + leftMargin.left + "," + leftMargin.top + ")");

    // Scale the range of the leftData in the domains
    leftXScale.domain([0, d3.max(leftData, function(d){ return d.pine_vol; })]);
    leftYScale.domain(leftData.map(function(d) { return d.year; }));

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
    var leftXAxis = leftSvg.append("g")
        .attr("transform", "translate(0," + leftHeight + ")")
        .call(d3.axisBottom(leftXScale)
            .tickFormat(d3.formatPrefix(".0", 1e6))
            .ticks(5));

    // add the y Axis
    var leftYAxis = leftSvg.append("g")
        .attr("transform", "translate( " + 0 + ", 0 )");

    // add x axis label
    leftSvg.append("text")
        .attr("transform",
            "translate(" + (leftWidth/2) + " ," +
            (leftHeight + leftMargin.top + 25) + ")")
        .style("text-anchor", "middle")
        .text("Productive Pine Forest (cubic meters)");

    // right graph

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
    rightXScale.domain([0, d3.max(rightData, function(d){ return d.pine_vol; })]);
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
    var rightXAxis = rightSvg.append("g")
        .attr("transform", "translate(0," + rightHeight + ")")
        .call(d3.axisBottom(rightXScale)
            .tickFormat(d3.formatPrefix(".0", 1e6))
            .ticks(5));

    // add the y Axis
    var rightYAxis = rightSvg.append("g")
        .attr("transform", "translate( " + 0 + ", 0 )");

    // add x axis label
    rightSvg.append("text")
        .attr("transform",
            "translate(" + (rightWidth/2) + " ," +
            (rightHeight + rightMargin.top + 25) + ")")
        .style("text-anchor", "middle")
        .text("Productive Pine Forest (cubic meters)");

    // updating pyramids

    function update(newLeftData, newRightData) {

        // get the maximum of both sets of data to standardize both x-axes
        var absoluteMax = Math.max(d3.max(newLeftData, function(d){ return d.pine_vol; }),
                              d3.max(newRightData, function(d){ return (d.pine_vol); }));

        leftXScale.domain([0, absoluteMax]);
        leftYScale.domain(newLeftData.map(function(d) { return d.year; }));

        rightXScale.domain([0, absoluteMax]);
        rightYScale.domain(newRightData.map(function(d) { return d.year; }));

        //console.log("domains defined, attempting to remove bars");

        var leftBars = leftSvg.selectAll(".bar")
            .remove()
            .exit()
            .data(newLeftData);
        
        var rightBars = rightSvg.selectAll(".bar")
            .remove()
            .exit()
            .data(newRightData);

        //console.log("bars removed, attempting to add new bars");

        leftBars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("fill", "#4B9B4B")
            .attr("x", function(d) { return leftXScale(d.pine_vol) } )
            .attr("width", function(d) { return leftWidth - leftXScale(d.pine_vol) })
            .attr("y", function(d) { return leftYScale(d.year); })
            .attr("height", leftYScale.bandwidth());
        
        rightBars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("fill", "#4B9B4B")
            .attr("width", function(d) { return rightXScale(d.pine_vol); })
            .attr("y", function(d) { return rightYScale(d.year); })
            .attr("height", rightYScale.bandwidth());

        //console.log("new bars added, redrawing axes");

        leftXAxis.remove();
        leftXAxis = leftSvg.append("g")
            .attr("transform", "translate(0," + leftHeight + ")")
            .call(d3.axisBottom(leftXScale)
                .tickFormat(d3.formatPrefix(".0", 1e6))
                .ticks(5));
        
        rightXAxis.remove();
        rightXAxis = rightSvg.append("g")
            .attr("transform", "translate(0," + rightHeight + ")")
            .call(d3.axisBottom(rightXScale)
                .tickFormat(d3.formatPrefix(".0", 1e6))
                .ticks(5));

    }

    // clearing pyramids

    $('#clear-left-pyramid').click(function() {

        // reset left pyramid data
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

        // reset styling except for currently selected red features
        selectorLayer.setStyle(function(feature) {
            if (rightPyramidPolys.indexOf(feature.properties.Id) === -1) {
                return {
                    stroke: true,
                    weight: 0.5,
                    color: '#ffffff',
                    fillOpacity: 0
                }
            } else {
                return {
                    color: '#e38d13',
                    weight: 10
                }
            }
        });

        // clear left tracking array
        leftPyramidPolys = [];

        // update data
        update(leftData, rightData);

    });

    $('#clear-right-pyramid').click(function() {
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
        selectorLayer.setStyle(function(feature) {
            if (leftPyramidPolys.indexOf(feature.properties.Id) === -1) {
                return {
                    stroke: true,
                    weight: 0.5,
                    color: '#ffffff',
                    fillOpacity: 0,
                }
            } else {
                return {
                    color: '#663399',
                    weight: 10
                }
            }
        });

        // clear left tracking array
        rightPyramidPolys = [];

        update(leftData, rightData);
    });

});