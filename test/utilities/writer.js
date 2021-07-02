import { createWriteStream } from 'fs'

function write (filename, data) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(filename)
    file.on('error', (err) => reject(err))

    // write features
    data.features.forEach((f, i) => {
      if (i === 0) {
        file.write(`{
      "type": "FeatureCollection",
      "features": [
        ${JSON.stringify(f)},
        `)
      } else if (i < data.features.length - 1) {
        file.write(JSON.stringify(f) + ',\n')
      } else {
        file.write(`${JSON.stringify(f)}]
      }`)
      }
    })

    file.on('finish', () => resolve())
    file.end()
  })
}

export default write
