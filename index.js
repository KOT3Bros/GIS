let map
let view
let currentPointGraphic

require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/widgets/Search"
], (Map, SceneView, Search) => {

  map = new Map({
    basemap: "hybrid",
    ground: "world-elevation"
  });

  view = new SceneView({
    container: "viewDiv",
    map,
    environment: {
      lighting: {
        type: "virtual"
      }
    },
    camera: {
      position: {
        x: 0, //Longitude-Долгота
        y: 90, //Latitude-Широта
        z: 13000000 //Meters
      },
      tilt: 0
    }
  });

  let initialCamera = view.camera.clone()

  const search = new Search({
    view
  })
  view.ui.add(search, "top-right")

  let points
  drawPoints().then((result) => {
    points = result
  })
  let polylines
  drawPolylines().then((result) => {
    polylines = result
  })
  let polygons
  drawPolygons().then((result) => {
    polygons = result
  })

  const findButton = drawButton({
    id: "findButton",
    textContent: "Find the nearest object",
    className: "esri-widget--button esri-widget esri-interactive",
    width: "240px",
    position: "top-right"
  })

  const deleteButton = drawButton({
    id: "deleteButton",
    textContent: "Delete current point",
    className: "esri-widget--button esri-widget esri-interactive",
    width: "240px",
    position: "top-right"
  })

  const resetZoomButton = drawButton({
    id: "resetZoomButton",
    textContent: "Reset Zoom",
    className: "esri-widget--button esri-widget esri-interactive",
    width: "240px",
    position: "top-right"
  })

  findButton.addEventListener("click", function () {
    findMinDistanceToCurrentPoint(points, polylines, polygons)
  });

  deleteButton.addEventListener("click", function () {
    view.graphics.remove(currentPointGraphic)
  });

  resetZoomButton.addEventListener("click", function () {
    view.goTo(initialCamera)
  });

  view.on("double-click", function (event) {
    view.graphics.remove(currentPointGraphic)
    createCurrentPoint(event.mapPoint.longitude, event.mapPoint.latitude)
    view.graphics.add(currentPointGraphic)
    event.stopPropagation()
  });
})
