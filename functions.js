let drawCams
let createPoint
let createPolyline
let getPolylines
let drawPolylines
let createPolygon
let getPolygons
let drawPolygons
let drawButton
let findMinDistanceToCurrentPoint

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

    createPolyline = ({ id, paths }, highlight) => {

        const polyline = {
            type: "polyline",
            paths
        };

        const lineSymbol = {
            type: "simple-line",
            color: highlight ? [255, 0, 0] : [0, 0, 0],
            width: 2
        };

        const lineAtt = {
            Name: "Keystone Pipeline",
            Owner: "TransCanada",
            Length: "3,456 km"
        };

        const polylineGraphic = new Graphic({
            geometry: polyline,
            symbol: lineSymbol,
            attributes: { id }, lineAtt,
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
        return polylines.map((polyline, index) => {
            return {
                id: index,
                paths: polyline
            }
        })
    }

    drawPolylines = async (polylinesToHighlight = []) => {
        const polylines = await getPolylines()
        polylinesToRender = []
        for (let index = 0; index < polylines.length; index++) {
            const polyline = polylines[index];
            const needHighlight = polylinesToHighlight.includes(index)
            const newPolyline = createPolyline(polyline, needHighlight)
            polylinesToRender.push(newPolyline)
        }
        view.graphics.addMany(polylinesToRender)
        return polylinesToRender
    }

    createPolygon = ({ id, rings }, highlight) => {

        const polygon = {
            type: "polygon",
            rings
        };

        const fillSymbol = {
            type: "simple-fill",
            color: highlight ? [255, 0, 0, 0.5] : [0, 255, 255, 0.3],
            outline: {
                color: [255, 255, 255],
                width: 1
            }
        };

        const polygonGraphic = new Graphic({
            geometry: polygon,
            symbol: fillSymbol,
            attributes: { id },
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

    drawPolygons = async (polygonsToHighlight = []) => {
        const polygons = await getPolygons()
        polygonsToRender = []
        for (let index = 0; index < polygons.length; index++) {
            const polygon = polygons[index];
            const needHighlight = polygonsToHighlight.includes(index)
            const newPolygon = createPolygon(polygon, needHighlight)
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

    findMinDistanceToCurrentPoint = (polylines, polygons) => {
        const distancesToPolylines = []
        const distancesToPolygons = []
        for (let i = 0; i < polylines.length; i++) {
            distancesToPolylines.push(findDistanceFromCurrentPointToPolyline(polylines[i], currentPoint));
        }
        for (let ii = 0; ii < polygons.length; ii++) {
            distancesToPolygons.push(findDistanceFromCurrentPointToPolygon(polygons[ii], currentPoint));
        }
        let minDistToPolyline = Number.MAX_SAFE_INTEGER
        let minDistToPolygon = Number.MAX_SAFE_INTEGER
        let minDistToPolylineArray = []
        let minDistToPolygonArray = []
        for (let j = 0; j < distancesToPolylines.length; j++) {
            const distance = distancesToPolylines[j]
            if (distance.length < minDistToPolyline) {
                minDistToPolyline = distance.length
                minDistToPolylineArray = [distance.id]
            } else if (distance.length === minDistToPolyline) {
                minDistToPolylineArray.push(distance.id)
            }
        }
        for (let jj = 0; jj < distancesToPolygons.length; jj++) {
            const distance = distancesToPolygons[jj]
            if (distance.length < minDistToPolygon) {
                minDistToPolygon = distance.length
                minDistToPolygonArray = [distance.id]
            } else if (distance.length === minDistToPolygon) {
                minDistToPolygonArray.push(distance.id)
            }
        }
        if (minDistToPolyline < minDistToPolygon) {
            drawPolylines(minDistToPolylineArray)
            for (let index = 0; index < polygonsToRender.length; index++) {
                view.graphics.remove(polygonsToRender[index])
            }
            drawPolygons()
        }
        else {
            for (let index = 0; index < polygonsToRender.length; index++) {
                view.graphics.remove(polygonsToRender[index])
            }
            drawPolylines()
            drawPolygons(minDistToPolygonArray)
        }
        return {
            minDistToPolylineArray,
            minDistToPolygonArray
        }
    }
})
