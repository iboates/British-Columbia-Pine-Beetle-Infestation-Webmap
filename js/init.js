/**
 * Created by isaac on 02/01/18.
 */

$(document).ready(function() {

    var crs = new L.Proj.CRS('EPSG:3005',
        '+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs ',
        {
            resolutions: [
                8192, 4096, 2048, 1024, 512, 256, 128
            ],
            origin: [0, 0]
        });

    // initialize the map
    map = L.map('map', {
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

    // =================================================================================================================
    // MARKERS
    // =================================================================================================================

    // Poylgon Layer
    markerPolygonLayer = L.geoJSON(britishColumbiaPolys, {

        fillColor: "#ffffff",
        stroke: true,
        color: "#000000",
        weight: 1,
        fillOpacity: 1,
        riseOnHover: true,

        onEachFeature: function (feature, layer) {

            layer.on('click', function () {
                console.log(feature.properties.name);
            });

            layer.on('mouseover', function (e) {
                e.target.bringToFront(); // lifts the current moused over feature so its edges aren't blocked
                this.setStyle({
                    fillColor: '#dd8888',
                    color: '#ff0000',
                    weight: 2
                });
            });

            layer.on('mouseout', function () {
                this.setStyle({
                    fillColor: '#ffffff',
                    color: '#000000',
                    weight: 1
                })
            })
        }

    });

    // add marker layer to map
    markerLayer = L.geoJSON(britishColumbiaPoints, {

        pointToLayer: function (feature, latlng) {
            var iconScaleFactor = zoomScales[3] / zoomScales[map.getZoom()];
            featureName = feature.properties.name;
            var marker = L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'svg/1999/' + feature.properties.name + '.svg',
                    iconSize: [iconScaleFactor * iconDimensions[featureName], iconScaleFactor * iconDimensions[featureName]],
                    iconAnchor: [iconScaleFactor * iconDimensions[featureName] / 2, iconScaleFactor * iconDimensions[featureName] / 2]
                })
            });
            return marker
        }

    });

    // Pack the marker layers into one array to toggle them en masse
    markerLayerArray = [markerPolygonLayer, markerLayer];
    for (var i = 0; i < markerLayerArray.length; i++) {
        map.addLayer(markerLayerArray[i]);
    }

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

});