/**
 * Created by isaac on 18/07/17.
 */

$(document).ready(function() {

    badgeInteraction = function (e) {

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
        update(leftData, rightData);

        // colour the polygons
        selectorLayer.setStyle(selectorLayerStyle);

    };

    $(document).on('click', '.badge', badgeInteraction);

    // =================================================================================================================
    // LAYER TOGGLING
    // =================================================================================================================

    $("input[name=display]").on("click", function() {

        // forest proportions radio button
        if ($("input[name=display]:checked").val() === "marker") {


            for (var i=0; i<thresholdLayerArray.length; i++) {
                map.removeLayer(thresholdLayerArray[i]);
            }

            for (var i=0; i<markerLayerArray.length; i++) {
                map.addLayer(markerLayerArray[i]);
            }

        // Otherwise, remove marker layers & add threshold layer.
        } else {

            for (var i=0;i <markerLayerArray.length; i++) {
                map.removeLayer(markerLayerArray[i]);
            }

            for (var i=0;i <thresholdLayerArray.length; i++) {
                map.addLayer(thresholdLayerArray[i]);
            }

        }
    });

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
                                    layer.setStyle({fillColor: "#ffffff"});

        });

    });

    // this one is necessary for the programmatic changes from the autoplay button.
    $( "#time-slider-bar" ).on("slide", function() {

        var zoomLevel = map.getZoom();
        var iconScaleFactor = zoomScales[3] / zoomScales[zoomLevel];
        var currentYear = $("#time-slider-bar").slider("option", "value");
        console.log(currentYear);

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
                                    layer.setStyle({fillColor: "#ffffff"});

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
                        console.log(j + ": " + otherData[j].pine_vol + " - " + polygonData[i].properties["_yr" + (1999 + j)]);
                        otherData[j].pine_vol = otherData[j].pine_vol - polygonData[i].properties["_yr" + (1999 + j)];
                    }

                }

                break;

            }

        }
        // colour the polygons
        selectorLayer.setStyle(selectorLayerStyle);

    };

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
                        console.log(j + ": " + otherData[j].pine_vol + " - " + polygonData[i].properties["_yr" + (1999 + j)]);
                        otherData[j].pine_vol = otherData[j].pine_vol - polygonData[i].properties["_yr" + (1999 + j)];
                    }

                }

                break;

            }

        }

    };

    mapInteraction = function (feature, layer) {

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
                    addPyramidData(polygonId, leftData, rightData, leftPyramidPolys, rightPyramidPolys);

                    // add badge to left pyramid tracker container & remove from right tracker
                    $("#left-pyramid-tracker-container").append('<span class="badge badge-default badge-left" id="badge-left-' + polygonId + '">' + polygonName + '</span>');
                    $('#badge-right-' + polygonId).remove();

                    // otherwise...
                } else {

                    // remove the pyramid data
                    removePyramidData(polygonId, leftData, leftPyramidPolys);

                    // remove the badge from the left pyramid tracker container
                    $('#badge-left-' + polygonId).remove();

                }

                // if the user has selected a polygon to add to the right pyramid...
            } else if (pyramidActionCode === "add-right-pyramid") {

                // if the polygon is not already in the right tracker array...
                if (rightPyramidPolys.indexOf(polygonId) === -1) {

                    // add the pyramid data
                    addPyramidData(polygonId, rightData, leftData, rightPyramidPolys, leftPyramidPolys);

                    // add badge to right pyramid tracker container & remove from left tracker
                    $("#right-pyramid-tracker-container").append('<span class="badge badge-default badge-right" id="badge-right-' + polygonId + '">' + polygonName + '</span>');
                    $('#badge-left-' + polygonId).remove();

                    // otherwise...
                } else {

                    //remove the pyramid data
                    removePyramidData(polygonId, rightData, rightPyramidPolys);

                    // remove the badge from the right pyramid tracker container
                    $('#badge-right-' + polygonId).remove();

                }

                // if the user has selected a polygon to replace the left pyramid...
            } else if (pyramidActionCode === "replace-left-pyramid") {

                // replace the left data with the new data
                replacePyramidData(polygonId, leftData, rightData, rightPyramidPolys);

                // remove all badges from the left pyramid tracker container, add the new one & remove it from the right tracker
                $('.badge-left').remove();
                $("#left-pyramid-tracker-container").append('<span class="badge badge-default badge-left" id="badge-left-' + polygonId + '">' + polygonName + '</span>');
                $('#badge-right-' + polygonId).remove();

            } else if (pyramidActionCode === "replace-right-pyramid") {

                // replace the right data with the new data
                replacePyramidData(polygonId, rightData, leftData, leftPyramidPolys);

                // remove all badges from the right pyramid tracker container, add the new one & remove it from the left tracker
                $('.badge-right').remove();
                $("#right-pyramid-tracker-container").append('<span class="badge badge-default badge-right" id="badge-right-' + polygonId + '">' + polygonName + '</span>');
                $('#badge-left-' + polygonId).remove();

            }

            // update the bar charts accordingly
            update(leftData, rightData);

            // colour the polygons
            selectorLayer.setStyle(selectorLayerStyle);

        });

    };

    badgeInteraction = function (e) {

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
        update(leftData, rightData);

        // colour the polygons
        selectorLayer.setStyle(selectorLayerStyle);

    };

});