function calculationDistFromPointToLine(x, y, x1, y1, x2, y2) {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;
  
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq != 0) //in case of 0 length line
        param = dot / len_sq;
  
    let xx, yy;
  
    if (param < 0) {
      xx = x1;
      yy = y1;
    }
    else if (param > 1) {
      xx = x2;
      yy = y2;
    }
    else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
  
    const r = 6371 // радиус Земли в [км]

    // Перевод координат в радианы
    const latitude1 = y * Math.PI / 180
    const latitude2 = yy * Math.PI / 180
    const longitude1 = x * Math.PI / 180
    const longitude2 = xx * Math.PI / 180

    // Вычисление синусов и косинусов широт и разницы долгот
    const sin_latitude1 = Math.sin(latitude1)
    const sin_latitude2 = Math.sin(latitude2)
    const cos_latitude1 = Math.cos(latitude1)
    const cos_latitude2 = Math.cos(latitude2)
    const delta = longitude2 - longitude1
    const sin_delta = Math.sin(delta)
    const cos_delta = Math.cos(delta)

    // Вычисление длины большого круга
    const numerator = Math.sqrt(Math.pow(cos_latitude2 * sin_delta, 2) + Math.pow(cos_latitude1 * sin_latitude2 - sin_latitude1 * cos_latitude2 * cos_delta, 2))
    const denumerator = sin_latitude1 * sin_latitude2 + cos_latitude1 * cos_latitude2 * cos_delta
    const distance = Math.atan2(numerator, denumerator) * r
    return distance
  }

  const findDistanceFromCurrentPointToPolygon = (polygon, point) => {
    const polygonPaths = polygon.geometry.rings[0]
    const pointX = point.geometry.x
    const pointY = point.geometry.y
    const distances = []
    for (let i = 0; i < polygonPaths.length - 1; i++) {
      const pathStart = polygonPaths[i]
      const pathEnd = polygonPaths[i + 1]
      distances.push(calculationDistFromPointToLine(pointX, pointY, pathStart[0], pathStart[1], pathEnd[0], pathEnd[1]))
    }
    const length = Math.min(...distances)
    return {
        id: polygon.attributes.id,
        length,
      }
  }

  const findDistanceFromCurrentPointToPolyline = (polyline, point) => {
    const polylinePaths = polyline.geometry.paths[0]
    const pointX = point.geometry.x
    const pointY = point.geometry.y
    const distances = []
    for (let i = 0; i < polylinePaths.length - 1; i++) {
      const pathStart = polylinePaths[i]
      const pathEnd = polylinePaths[i + 1]
      distances.push(calculationDistFromPointToLine(pointX, pointY, pathStart[0], pathStart[1], pathEnd[0], pathEnd[1]))
    }
    const length = Math.min(...distances)
    return {
        id: polyline.attributes.id,
        length
      }
  }
