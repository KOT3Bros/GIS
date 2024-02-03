let map
let view
let currentPoint
let polylinesToRender
let polygonsToRender

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
    map: map,
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

  const search = new Search({
    view: view
  })
  view.ui.add(search, "top-right")
})

require([
  "esri/Map",
  "esri/layers/CSVLayer",
  "esri/views/SceneView",
  "esri/layers/GraphicsLayer",
  "esri/Graphic",
  "esri/widgets/Search"
], (Map, CSVLayer, SceneView, GraphicsLayer, Graphic, Search) => {

  const cams = drawCams()
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

  findButton.addEventListener("click", function () {
    findMinDistanceToCurrentPoint(polylines, polygons)
  });

  deleteButton.addEventListener("click", function () {
    view.graphics.remove(currentPoint)   
  });

  view.on("double-click", function (event) {
    view.graphics.remove(currentPoint)
    createPoint(event.mapPoint.longitude, event.mapPoint.latitude)
    view.graphics.add(currentPoint)
    event.stopPropagation()
  });
})