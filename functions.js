let drawCams
let createPoint
let createPolyline
let getPolylines
let drawPolylines
let createPolygon
let getPolygons
let drawPolygons
let drawButton

require([
    "esri/layers/CSVLayer",
    "esri/Graphic"
], (CSVLayer, Graphic) => {

    drawCams = () => {
        const url =
            "http://gisvkr6y.beget.tech/cams.csv";

        const template = {
            title: "{name}",
            content: [
                {
                    type: "media",
                    mediaInfos: [
                        {
                            title: "latitude: {latitude}, longitude:{longitude}",
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
        map.add(csvLayer);
    }

    createPoint = (longitude, latitude) => {
        const point = {
            type: "point",
            longitude: longitude,
            latitude: latitude
        };

        currentPoint = new Graphic({
            geometry: point,
            attributes: point,
            popupTemplate: {
                title: "Coordinates of a point",
                content: [
                    {
                        type: "fields",
                        fieldInfos: [
                            {
                                fieldName: "latitude"
                            },
                            {
                                fieldName: "longitude"
                            }
                        ]
                    }
                ]
            },
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
        });
    }

    createPolyline = (paths) => {

        const polyline = {
            type: "polyline",
            paths: paths
        };

        const lineSymbol = {
            type: "simple-line",
            color: [0, Math.random()*255, Math.random()*255],
            width: 3
        };

        const lineAtt = {
            Name: "Keystone Pipeline",
            Owner: "TransCanada",
            Length: "3,456 km"
        };

        const polylineGraphic = new Graphic({
            geometry: polyline,
            symbol: lineSymbol,
            attributes: lineAtt,
            popupTemplate: {
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
        return polylineGraphic
    }

    getPolylines = async () => {
        let url = 'http://gisvkr6y.beget.tech/polylines.csv';
        let response = await fetch(url);

        let polylines = await response.json(); // читаем ответ в формате JSON
        return polylines
    }

    drawPolylines = async () => {
        const polylines = await getPolylines()
        const polylinesToRender = []
        for (let index = 0; index < polylines.length; index++) {
            const polyline = polylines[index];
            const newPolyline = createPolyline(polyline)
            polylinesToRender.push(newPolyline)
        }
        view.graphics.addMany(polylinesToRender)
    }

    createPolygon = ({id, rings}, highlight) => {
        const polygon = {
            type: "polygon",
            rings
        };

        const fillSymbol = {
            type: "simple-fill",
            color: highlight?[255, 0, 0, 0.5]:[0, Math.random()*255, Math.random()*255, 0.5],
            outline: {
                color: [255, 255, 255],
                width: 1
            }
        };

        const polygonGraphic = new Graphic({
            geometry: polygon,
            symbol: fillSymbol,
            attributes: {id}
        });
        return polygonGraphic
    }

    getPolygons = async () => {
        let url = 'http://gisvkr6y.beget.tech/polygons.csv';
        let response = await fetch(url);

        let polygons = await response.json(); // читаем ответ в формате JSON
        return polygons.map((polygon, index) => {
            return {
                id: index,
                rings: polygon
            }
        })
    }

    drawPolygons = async () => {
        const polygons = await getPolygons()
        const polygonsToRender = []
        for (let index = 0; index < polygons.length; index++) {
            const polygon = polygons[index];
            const newPolygon = createPolygon(polygon, index % 2 == 0)
            polygonsToRender.push(newPolygon)
        }
        view.graphics.addMany(polygonsToRender)
        return polygonsToRender
    }

    drawButton = (cfg) => {
        const { textContent, className, width, position, id } = cfg
        const newButton = document.createElement("button")
        newButton.textContent = textContent
        newButton.className = className
        newButton.style.width = width
        newButton.style.border = "none"
        newButton.setAttribute("id", id)
        view.ui.add(newButton, position)
        return newButton
    }
})