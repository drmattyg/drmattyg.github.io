/// <reference path='typings/leaflet/leaflet.d.ts' />
var entryData = window["entryData"];
var map = new L.Map("wh-map");
var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, { minZoom: 1, maxZoom: 12, attribution: osmAttrib });
map.setView(new L.LatLng(47, -34), 3);
map.addLayer(osm);
Object.keys(entryData).forEach(function (key) {
    var entries = entryData[key];
    var latLon = [entries[0].geolocation.latitude, entries[0].geolocation.longitude];
    var popupHtml = entries.map(function (e) { return '<font size="1"><b>' + e.header + '</b><p>' + e.html + '</p></font>'; }).join("<hr>");
    var marker = L.marker(latLon);
    marker.bindPopup(popupHtml, { maxHeight: 300 });
    marker.addTo(map);
});
//# sourceMappingURL=embedMap.js.map