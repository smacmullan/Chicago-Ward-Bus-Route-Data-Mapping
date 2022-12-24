const turf = require("@turf/turf");
const fs = require("fs");

//load geojson data
require.extensions[".geojson"] = require.extensions[".json"];
let wardGeoJson = require("./data/chicagoWards2023.geojson");
let busGeoJson = require("./data/busData.json");

let wards = wardGeoJson["features"];
let busRoutes = busGeoJson["features"];

//filter
ward35 = wards.filter((ward) => {
  return ward["properties"]["ward"] == 35;
})[0];

bus77 = busRoutes.filter((route) => {
  return (
    route["properties"]["route_id"] == 77 &&
    route["properties"]["direction"] == "West"
  );
})[0];

busesInWard35 = busRoutes.filter((route) => {
  return IsBus(route) && turf.booleanIntersects(ward35, route);
});

routeNames35 = busesInWard35.map((route) => route["properties"]["route_id"]);
routeNames35.sort();
// console.log(routeNames35);

// "trip_count_rt": 32361.0,
// "trip_count_sched": 42847.0,

function IsBus(route) {
  return route["properties"]["route_type"] == 3;
}

function removeDuplicates(arr) {
   return [...new Set(arr)];
 }

wardBusRouteData = [];
for (const ward of wards) {
  let wardName = ward["properties"]["ward"];
  
  let busRoutesInWard = busRoutes.filter((route) => {
    return IsBus(route) && turf.booleanIntersects(ward, route);
  });
  let routeNames = busRoutesInWard.map((route) => route["properties"]["route_id"]);
  routeNames = removeDuplicates(routeNames);
  routeNames.sort();


  wardBusRouteData.push({ward: wardName, routes: routeNames});
}

console.log(wardBusRouteData)
fs.writeFile("datawardBusMappings.json", wardBusRouteData);