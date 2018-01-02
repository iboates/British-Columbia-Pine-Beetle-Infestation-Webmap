/**
 * Created by isaac on 18/07/17.
 */

$(document).ready(function() {

    // =================================================================================================================
    // LAYER TOGGLING
    // =================================================================================================================

    $("input[name=display]").on("click", function() {

        // If the marker radio button is selected, add the marker layers & remove threshold layer.
        if ($("input[name=display]:checked").val() === "marker") {

            for (var i=0; i<markerLayerArray.length; i++) {
                map.addLayer(markerLayerArray[i]);
            }
            map.removeLayer(thresholdLayer);

        // Otherwise, remove marker layers & add threshold layer.
        } else {

            map.addLayer(thresholdLayer);
            for (var i=0;i <markerLayerArray.length; i++) {
                map.removeLayer(markerLayerArray[i]);
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

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // SLIDER BAR
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

});