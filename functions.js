let createPoints
let getPoints
let drawPoints
let createCurrentPoint
let createPolyline
let getPolylines
let drawPolylines
let createPolygon
let getPolygons
let drawPolygons
let drawButton
let findMinDistanceToCurrentPoint

require([
    "esri/Graphic"
], (Graphic) => {

    createPoints = ({ id, name, latitude, longitude, url }, highlight) => {
        const point = {
            type: "point",
            latitude,
            longitude
        };

        const markerSymbol = {
            type: "simple-marker",
            color: highlight ? [255, 0, 0] : [0, 255, 255, 0.3],
            outline: {
                color: [255, 255, 255],
                width: 1
            }
        };

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

        const pointGraphic = new Graphic({
            geometry: point,
            symbol: markerSymbol,
            attributes: { id, name, latitude, longitude, url },
            popupTemplate: template
        });
        return pointGraphic
    };

    getPoints = async () => {
        let url = "http://gisvkr6y.beget.tech/points.json"
        let response = await fetch(url)

        let points = await response.json()
        return points.map((points, index) => {
            return {
                id: index,
                name: points.name,
                latitude: points.latitude,
                longitude: points.longitude,
                url: points.url
            }
        })
    }

    drawPoints = async (pointsToHighlight = []) => {
        const points = await getPoints()
        pointsToRender = []
        for (let index = 0; index < points.length; index++) {
            const point = points[index]
            const needHighlight = pointsToHighlight.includes(index)
            const newPoint = createPoints(point, needHighlight)
            pointsToRender.push(newPoint)
        }
        view.graphics.addMany(pointsToRender);;
        return pointsToRender
    }

    createCurrentPoint = (longitude, latitude) => {
        const currentPoint = {
            type: "point",
            longitude: longitude,
            latitude: latitude
        };

        currentPointGraphic = new Graphic({
            geometry: currentPoint,
            attributes: currentPoint,
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
                type: "simple-marker",
                color: [0, 255, 255, 0.3],
                outline: {
                    color: [255, 255, 255],
                    width: 1
                }
            }
        });
        return currentPointGraphic
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

    findMinDistanceToCurrentPoint = (points, polylines, polygons) => {
        const distancesToPoints = []
        const distancesToPolylines = []
        const distancesToPolygons = []
        for (let i = 0; i < points.length; i++) {
            distancesToPoints.push(findDistanceFromCurrentPointToPoints(points[i], currentPointGraphic))
        }
        for (let j = 0; j < polylines.length; j++) {
            distancesToPolylines.push(findDistanceFromCurrentPointToPolyline(polylines[j], currentPointGraphic));
        }
        for (let k = 0; k < polygons.length; k++) {
            distancesToPolygons.push(findDistanceFromCurrentPointToPolygon(polygons[k], currentPointGraphic));
        }
        let minDistToPoint = Number.MAX_SAFE_INTEGER
        let minDistToPolyline = Number.MAX_SAFE_INTEGER
        let minDistToPolygon = Number.MAX_SAFE_INTEGER
        let minDistToPointArray = []
        let minDistToPolylineArray = []
        let minDistToPolygonArray = []
        for (let ii = 0; ii < distancesToPoints.length; ii++) {
            if (distancesToPoints[ii] < minDistToPoint) {
                minDistToPoint = distancesToPoints[ii]
                minDistToPointArray = [ii]
            }
            else if (distancesToPoints[ii] === minDistToPoint) {
                minDistToPointArray.push(ii)
            }
        }
        for (let jj = 0; jj < distancesToPolylines.length; jj++) {
            const distance = distancesToPolylines[jj]
            if (distance.length < minDistToPolyline) {
                minDistToPolyline = distance.length
                minDistToPolylineArray = [distance.id]
            } else if (distance.length === minDistToPolyline) {
                minDistToPolylineArray.push(distance.id)
            }
        }
        for (let kk = 0; kk < distancesToPolygons.length; kk++) {
            const distance = distancesToPolygons[kk]
            if (distance.length < minDistToPolygon) {
                minDistToPolygon = distance.length
                minDistToPolygonArray = [distance.id]
            } else if (distance.length === minDistToPolygon) {
                minDistToPolygonArray.push(distance.id)
            }
        }

        if (minDistToPoint < minDistToPolyline && minDistToPoint < minDistToPolygon) {
            view.graphics.removeAll()
            view.graphics.add(currentPointGraphic)
            drawPoints(minDistToPointArray)
            drawPolylines()
            drawPolygons()
        }
        else if (minDistToPolyline < minDistToPoint && minDistToPolyline < minDistToPolygon) {
            view.graphics.removeAll()
            view.graphics.add(currentPointGraphic)
            drawPoints()
            drawPolylines(minDistToPolylineArray)
            drawPolygons()
        }
        else {
            view.graphics.removeAll()
            view.graphics.add(currentPointGraphic)
            drawPoints()
            drawPolylines()
            drawPolygons(minDistToPolygonArray)
        }
        return {
            minDistToPointArray,
            minDistToPolylineArray,
            minDistToPolygonArray
        }
    }
})
