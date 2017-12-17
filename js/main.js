/**
 * Created by isaac on 18/07/17.
 */

$(document).ready(function() {

    var crs = new L.Proj.CRS('EPSG:3005',
        '+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs ',
        {
            resolutions: [
                8192, 4096, 2048, 1024, 512, 256, 128
            ],
            origin: [0, 0]
        })

    // initialize the map
    var map = L.map('map', {
        crs: crs,
        zoom: 3,
        minZoom: 2,
        maxZoom: 4,
        maxBounds: L.latLngBounds(L.latLng(42.197765, -150.514677), L.latLng(61.746849, -100.952647)),
        maxBoundsViscosity: 1.0
    }).fitBounds([[47.197765, -139.514677], [61.746849, -114.952647]]);

    map.setView([55.033333, -124.966667], 2);

    $( "#time-slider-bar" ).slider({
        value: 1999,
        min: 1999,
        max: 2014,
        step: 1
    });

    // add polygons to map
    L.geoJSON(britishColumbiaPolys, {

        fillColor: "#ffffff",
        stroke: true,
        color: "#000000",
        weight: 1,
        fillOpacity: 1,
        riseOnHover: true,

        onEachFeature: function(feature, layer) {

            layer.on('click', function() {
                console.log(feature.properties.name);
            });

            layer.on('mouseover', function(e) {
                e.target.bringToFront(); // lifts the current moused over feature so its edges aren't blocked
                this.setStyle({
                    fillColor: '#dd8888',
                    color: '#ff0000',
                    weight: 2
                });
            });

            layer.on('mouseout', function() {
                this.setStyle({
                    fillColor: '#ffffff',
                    color: '#000000',
                    weight: 1
                })
            })
        }

    }).addTo(map);

    // add threshold layer to map
    var thresholdLayer = L.geoJSON(britishColumbiaPolys, {

        fillColor: "#ffffff",
        fillOpacity: 1,
        opacity: 0

    });

    // add marker layer to map
    var markerLayer = L.geoJSON(britishColumbiaPoints, {

        pointToLayer: function (feature, latlng) {
            var iconScaleFactor = zoomScales[3]/zoomScales[map.getZoom()];
            featureName = feature.properties.name;
            var marker = L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'svg/1999/' + feature.properties.name + '.svg',
                    iconSize: [iconScaleFactor * iconDimensions[featureName], iconScaleFactor * iconDimensions[featureName]],
                    iconAnchor: [iconScaleFactor * iconDimensions[featureName]/2, iconScaleFactor * iconDimensions[featureName]/2]
                })
            });
            return marker
        }

    }).addTo(map);

    $("#legend-marker-checkbox").prop('checked', true);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // EVENT HANDLING
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Toggle markers
    $("#legend-marker-checkbox").change(function() {
        if (this.checked) {
            markerLayer.addTo(map)
        } else {
            map.removeLayer(markerLayer);
        }
    });

    // Toggle threshold
    $("#legend-threshold-checkbox").change(function() {
        if (this.checked) {
            thresholdLayer.addTo(map)
        } else {
            map.removeLayer(thresholdLayer);
        }
    });

    // Resize markers when zooming
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
    // This one is necessary to see the change if the user does not let go of the mouse button.
    $( "#time-slider-bar" ).on("slidechange", function() {

        // Change markers
        markerLayer.eachLayer(function (layer) {
            return layer.setIcon(L.icon({
                iconUrl: 'svg/' + $("#time-slider-bar").slider("option", "value") + '/' + layer.feature.properties.name + '.svg'
            }))
        });

        // Change threshold
        thresholdLayer.eachLayer(function(layer) {

            var yearProperty = "_yr" + $("#time-slider-bar").slider("option", "value");
            var percentPineRemaining = layer.feature.properties[yearProperty]/layer.feature.properties._pine_vol;

            percentPineRemaining < 0.2 ? layer.setStyle({fillColor: "#aa0000"}) :
                percentPineRemaining < 0.4 ? layer.setStyle({fillColor: "#dd0000"}) :
                    percentPineRemaining < 0.6 ? layer.setStyle({fillColor: "#ff5555"}) :
                        percentPineRemaining < 0.8 ? layer.setStyle({fillColor: "#ff9999"}) :
                            percentPineRemaining < 0.9 ? layer.setStyle({fillColor: "#ffdddd"}) :
                                layer.setStyle({fillColor: "#ffffff"});

        });

    });

    // this one is necessary for the programmatic changes from the autoplay button.
    $( "#time-slider-bar" ).on("slide", function() {

        // Change markers
        markerLayer.eachLayer(function (layer) {
            return layer.setIcon(L.icon({
                iconUrl: 'svg/' + $("#time-slider-bar").slider("option", "value") + '/' + layer.feature.properties.name + '.svg'
            }))
        });

        // Change threshold
        thresholdLayer.eachLayer(function(layer) {

            var yearProperty = "_yr" + $("#time-slider-bar").slider("option", "value");
            var percentPineRemaining = layer.feature.properties[yearProperty]/layer.feature.properties._pine_vol;

            percentPineRemaining < 0.2 ? layer.setStyle({fillColor: "#aa0000"}) :
                percentPineRemaining < 0.4 ? layer.setStyle({fillColor: "#dd0000"}) :
                    percentPineRemaining < 0.6 ? layer.setStyle({fillColor: "#ff5555"}) :
                        percentPineRemaining < 0.8 ? layer.setStyle({fillColor: "#ff9999"}) :
                            percentPineRemaining < 0.9 ? layer.setStyle({fillColor: "#ffdddd"}) :
                                layer.setStyle({fillColor: "#ffffff"});

        });

    });



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // SLIDER BAR
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function scrollSlider() {
        var slideValue;
        slideValue = $("#time-slider-bar").slider("value");
        if (slideValue >= 0) {
            if (slideValue == 2013) {
                slideValue = -1;
            }
            $("#time-slider-bar").slider("value", slideValue + 1);
            console.log($("#time-slider-bar").slider("value"));
            setTimeout(scrollSlider, 500);
        }
    }

    // Make slider auto-seek when the user clicks on the autoplay button.
    $('#autoplay-button').click(function() {
        scrollSlider();
    });

});