/**
 * Created by isaac on 02/01/18.
 */

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

    L.control.scale({
        imperial: false
    }).addTo(map);

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

            layer.on('click', function (e) {

                rightData[0].pine_vol = e.target.feature.properties._yr1999;
                rightData[1].pine_vol = e.target.feature.properties._yr2000;
                rightData[2].pine_vol = e.target.feature.properties._yr2001;
                rightData[3].pine_vol = e.target.feature.properties._yr2002;
                rightData[4].pine_vol = e.target.feature.properties._yr2003;
                rightData[5].pine_vol = e.target.feature.properties._yr2004;
                rightData[6].pine_vol = e.target.feature.properties._yr2005;
                rightData[7].pine_vol = e.target.feature.properties._yr2006;
                rightData[8].pine_vol = e.target.feature.properties._yr2007;
                rightData[9].pine_vol = e.target.feature.properties._yr2008;
                rightData[10].pine_vol = e.target.feature.properties._yr2009;
                rightData[11].pine_vol = e.target.feature.properties._yr2010;
                rightData[12].pine_vol = e.target.feature.properties._yr2011;
                rightData[13].pine_vol = e.target.feature.properties._yr2012;
                rightData[14].pine_vol = e.target.feature.properties._yr2013;
                rightData[15].pine_vol = e.target.feature.properties._yr2014;
                update(rightData);

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

    // =================================================================================================================
    // PYRAMIDS
    // =================================================================================================================

    var rightData = [
        {"year": "_yr1999", "pine_vol": 77616752},
        {"year": "_yr2000", "pine_vol": 77038912},
        {"year": "_yr2001", "pine_vol": 76370816},
        {"year": "_yr2002", "pine_vol": 73590976},
        {"year": "_yr2003", "pine_vol": 67868816},
        {"year": "_yr2004", "pine_vol": 60651584},
        {"year": "_yr2005", "pine_vol": 47836464},
        {"year": "_yr2006", "pine_vol": 39659504},
        {"year": "_yr2007", "pine_vol": 31413136},
        {"year": "_yr2008", "pine_vol": 29010976},
        {"year": "_yr2009", "pine_vol": 28837344},
        {"year": "_yr2010", "pine_vol": 28734912},
        {"year": "_yr2011", "pine_vol": 28718880},
        {"year": "_yr2012", "pine_vol": 28705984},
        {"year": "_yr2013", "pine_vol": 28705936},
        {"year": "_yr2014", "pine_vol": 28703296}
    ];

    // right graph

    var containerWidth = $("#right-pyramid-container").width();
    var containerHeight = $("#right-pyramid-container").height();

    // set the dimensions and margins of the graph
    var margin = {top: 5, right: 10, bottom: 18, left: 12},
        width = containerWidth - margin.left - margin.right,
        height = containerHeight - margin.top - margin.bottom;

    // set the ranges
    var y = d3.scaleBand()
        .range([height, 0])
        .padding(0.1);

    var x = d3.scaleLinear()
        .range([0, width]);

    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#right-pyramid-container").append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0, 0 " + containerWidth + ", " + containerHeight)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the rightData in the domains
    x.domain([0, d3.max(rightData, function(d){ return d.pine_vol; })]);
    y.domain(rightData.map(function(d) { return d.year; }));

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(rightData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("width", function(d) { return x(d.pine_vol); } )
        .attr("y", function(d) { return y(d.year); })
        .attr("height", y.bandwidth());

    // add the x Axis
    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
            .tickFormat(d3.formatPrefix(".2", 1e6)));

    // add the y Axis
    var yAxis = svg.append("g")
        .attr("transform", "translate( " + 0 + ", 0 )");





    function update(data) {

        console.log("attempting update");

        x.domain([0, d3.max(data, function(d){ return (d.pine_vol); })]);
        y.domain(data.map(function(d) { return d.year; }));

        console.log("domains defined, attempting to remove bars");

        var bars = svg.selectAll(".bar")
            .remove()
            .exit()
            .data(data);

        console.log("bars removed, attempting to add new bars");

        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("width", function(d) {console.log(d); return x(d.pine_vol); })
            .attr("y", function(d) {console.log(d); return y(d.year); })
            .attr("height", y.bandwidth());

        console.log("new bars added, redrawing axes");

        xAxis.remove();
        xAxis = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
                .tickFormat(d3.formatPrefix(".2", 1e6)));

    }

});