require([
    "esri/Map",
    "esri/layers/CSVLayer",
    "esri/views/SceneView",
    "esri/layers/GraphicsLayer",
    "esri/Graphic"
], (Map, CSVLayer, SceneView, GraphicsLayer, Graphic) => {

const createPoint = () => {
    // First create a point geometry (this is the location of the Titanic)
    const point = {
        type: "point", // autocasts as new Point()
        longitude: -49.97,
        latitude: 41.73
      };

      // Create a symbol for drawing the point
      const markerSymbol = {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        color: [226, 119, 100],
        outline: {
          // autocasts as new SimpleLineSymbol()
          color: [255, 255, 255],
          width: 2
        }
      };

      // Create a graphic and add the geometry and symbol to it
      const pointGraphic = new Graphic({
        geometry: point,
        symbol: markerSymbol
      });
      return pointGraphic
}

const createPolygon = (rings) => {
    /***************************
         * Create a polygon graphic
         ***************************/

    // Create a polygon geometry
    const polygon = {
        type: "polygon", // autocasts as new Polygon()
        rings
    };

    // Create a symbol for rendering the graphic
    const fillSymbol = {
    type: "simple-fill", // autocasts as new SimpleFillSymbol()
    color: [227, 139, 79, 0.8],
    outline: {
        // autocasts as new SimpleLineSymbol()
        color: [255, 255, 255],
        width: 1
    }
    };

    // Add the geometry and symbol to a new graphic
    const polygonGraphic = new Graphic({
    geometry: polygon,
    symbol: fillSymbol
    });
    return polygonGraphic
}

const url =
  "http://gisvkr6y.beget.tech/cams.csv";
  
const template = {
  title: "{name}",
  content: [
    {
        type: "media",
        mediaInfos: [
          {
              title: "широта: {latitude}, долгота:{longitude}",
              type: "image",
              value: {
                  sourceURL:
                    "{url}"
              }
          }
        ]
    }
  ]
};

const csvLayer = new CSVLayer({
  url: url,
  popupTemplate: template
});

csvLayer.renderer = {
  type: "simple",
  symbol: {
    type: "point-3d",
    symbolLayers: [
      {
        type: "icon",
        resource: { href: "https://cdn-icons-png.flaticon.com/512/2776/2776067.png" },
        material: { color: "red" },
        size: 25	
      },
    ]
  }
};

//Создаем карту
const map = new Map({
basemap: "hybrid",
ground: "world-elevation"
});

map.add(csvLayer);

//Создаем сцену
const view = new SceneView({
  container: "viewDiv",
  map: map,
  environment: {
    lighting: {
      type: "virtual"
    }
  },		  

//Настраиваем камеру  
  camera: {
    position: {
      x: 0, //Longitude-Долгота
      y: 90, //Latitude-Широта
      z: 13000000 //Meters
    },
    tilt: 0
  }	
});



// Create a simple object containing useful information relating to the feature
// First create a line geometry (this is the Keystone pipeline)
const polyline = {
type: "polyline", // autocasts as new Polyline()
paths: [[-111.3, 52.68], [-98, 49.5], [-93.94, 29.89]]
};

// Create a symbol for drawing the line
const lineSymbol = {
type: "simple-line", // autocasts as SimpleLineSymbol()
color: [226, 119, 40],
width: 4
};

// Create an object for storing attributes related to the line
const lineAtt = {
Name: "Keystone Pipeline",
Owner: "TransCanada",
Length: "3,456 km"
};

/*******************************************
* Create a new graphic and add the geometry,
* symbol, and attributes to it. You may also
* add a simple PopupTemplate to the graphic.
* This allows users to view the graphic's
* attributes when it is clicked.
******************************************/
const polylineGraphic = new Graphic({
geometry: polyline,
symbol: lineSymbol,
attributes: lineAtt,
popupTemplate: {
// autocasts as new PopupTemplate()
title: "{Name}",
content: [
{
  type: "fields",
  fieldInfos: [
    {
      fieldName: "Name"
    },
    {
      fieldName: "Owner"
    },
    {
      fieldName: "Length"
    }
  ]
}
]
}
});

const newPoint = createPoint()
const newPolygon1 = createPolygon([[-64.78, 32.3], [-66.07, 18.45], [-80.21, 25.78], [-64.78, 32.3]])
const newPolygon2 = createPolygon([[-64.78, 40], [-64.07, 18.45], [-75.21, 25.78], [-64.78, 40]])


view.graphics.addMany([newPoint, newPolygon1, newPolygon2, polylineGraphic])

const findDistanceFromPointToPolygon = (polygon, point) => {
    const polygonPaths = polygon.geometry.rings[0]
    const pointX = point.geometry.x
    const pointY = point.geometry.y
    const distances = []
    console.log(polygonPaths)
    for (let i = 0; i < polygonPaths.length - 1; i++) {
        const pathStart = polygonPaths[i]
        const pathEnd = polygonPaths[i + 1]
        distances.push(pDistance(pointX, pointY, pathStart[0], pathStart[1], pathEnd[0], pathEnd[1]))
    }
    return Math.min(...distances)
}

const dist1 = findDistanceFromPointToPolygon(newPolygon1, newPoint)
const dist2 = findDistanceFromPointToPolygon(newPolygon2, newPoint)

console.log(view.graphics)

console.log('Ближайший полигон: ' + Math.min(dist1, dist2))
console.log(view.graphics.items)
})