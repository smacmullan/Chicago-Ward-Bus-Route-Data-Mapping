const turf = require("@turf/turf");
const fs = require("fs");

// load geojson data
require.extensions[".geojson"] = require.extensions[".json"];
let wardGeoJson = require("./data/chicagoWards2023.geojson");
let busGeoJson = require("./data/busData.json");

let wards = wardGeoJson["features"];
let busRoutes = busGeoJson["features"];

// get bus route data by ward
wardBusRouteData = [];
for (const ward of wards) {
  let wardName = ward["properties"]["ward"];

  // get bus routes in ward
  let busRoutesInWard = busRoutes.filter((route) => {
    return IsBus(route) && turf.booleanIntersects(ward, route);
  });

  // separate out route names
  let routeNames = busRoutesInWard.map(
    (route) => route["properties"]["route_id"]
  );
  routeNames = removeDuplicates(routeNames);
  routeNames.sort();

  // calculate trip totals
  let trip_count_rt = 0;
  let trip_count_sched = 0;
  for (const route of busRoutesInWard) {
    trip_count_rt += route["properties"]["trip_count_rt"];
    trip_count_sched += route["properties"]["trip_count_sched"];
  }
  let ratio = trip_count_rt / trip_count_sched;

  wardBusRouteData.push({
    ward: wardName,
    trip_count_rt,
    trip_count_sched,
    ratio,
    routes: routeNames,
  });
}


// save data
fs.writeFile(
  "./data/wardBusRouteMappings.json",
  JSON.stringify(wardBusRouteData),
  (err) => {
    if (err) console.log(err);
    else console.log("Data saved to file.");
  }
);


// helper functions
function IsBus(route) {
  return route["properties"]["route_type"] == 3;
}

function removeDuplicates(arr) {
  return [...new Set(arr)];
}
