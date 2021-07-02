import geojsonStream from 'geojson-stream'
import fs from 'fs'

function reader (file) {
  return new Promise((resolve, reject) => {
    const fc = {
      type: 'FeatureCollection',
      features: []
    }
    const stream = fs
      .createReadStream(file)
      .pipe(geojsonStream.parse((feature, index) => {
        if (!feature.geometry || feature.geometry.coordinates === null) {
          return null
        }
        fc.features.push(feature)
      }))
    stream.on('close', () => resolve(fc))
    stream.on('error', (e) => reject(e))
  })
}

export default reader
