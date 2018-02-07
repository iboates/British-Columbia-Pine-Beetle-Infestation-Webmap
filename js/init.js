/**
 * Created by isaac on 02/01/18.
 */

var leftData = [
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

var rightData = [
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

var centreData = [
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

var leftPyramidPolys = [];
var rightPyramidPolys = [];

$(document).ready(function() {

    autoplay = true;
    ticks = [1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014];

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


    // Add a scale bar to the map.
    L.control.scale({
        imperial: false
    }).addTo(map);

    // =================================================================================================================
    // LAYERS
    // =================================================================================================================

    // Style to be applied to the Selector Layer Every time there is a change.
    selectorLayerStyle = function (feature) {

        var featureId = feature.properties.Id;
        if (leftPyramidPolys.indexOf(featureId) !== -1) {
            return {
                color: '#663399',
                opacity: 1,
                stroke: true,
                dashArray: "30 10",
                weight: 3,
                fillOpacity: 0
            };
        } else if (rightPyramidPolys.indexOf(featureId) !== -1) {
            return {
                color: '#e38d13',
                opacity: 1,
                stroke: true,
                dashArray: "30 10",
                weight: 3,
                fillOpacity: 0
            };
        } else {
            return {
                color: '#eeeeee',
                opacity: 0,
                stroke: true,
                weight: 3,
                fillOpacity: 0
            };
        }
    };

    // Called whenever the user clicks on a polygon or a marker.
    layerClickHandler = function (feature, layer) {

        layer.bindTooltip(feature.properties.name, {
            sticky: true
        });

        layer.on('click', function (e) {

            // stop the animation
            $('#stop-button').trigger('click');

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
            //update(leftData, rightData);
            updatePyramids();

            // colour the polygons
            selectorLayer.setStyle(selectorLayerStyle);

        });

    };

    // Basemap for under markers.
    markerPolygonLayer = L.geoJSON(britishColumbiaPolys, {

        fillColor: '#eeeeee',
        stroke: true,
        color: "#000000",
        weight: 1,
        fillOpacity: 1,
        riseOnHover: true

    });

    // Selector Layer.
    selectorLayer = L.geoJSON(britishColumbiaSelectors, {

        style: selectorLayerStyle,
        onEachFeature: layerClickHandler

    });

    // Marker Layer.
    markerLayer = L.geoJSON(britishColumbiaPoints, {

        onEachFeature: layerClickHandler,

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

    // Threshold Layer.
    thresholdLayer = L.geoJSON(britishColumbiaPolys, {

        fillColor: "#eeeeee",
        fillOpacity: 1,
        stroke: true,
        color: "#000000",
        weight: 1,
        opacity: 1

    });

    // Packing the layers into arrays to toggle them en masse
    markerLayerArray = [markerPolygonLayer, selectorLayer, markerLayer];
    for (var i = 0; i < markerLayerArray.length; i++) {
        map.addLayer(markerLayerArray[i]);
    }
    thresholdLayerArray = [thresholdLayer, selectorLayer];

    // =================================================================================================================
    // PYRAMIDS
    // =================================================================================================================

    // updatePyramids();
    // d3.select(window).on("resize", updatePyramids);

});