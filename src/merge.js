import clone from '@turf/clone'
import { isObject } from '@turf/helpers'
import { featureEach } from '@turf/meta'

function merge (geojson1, geojsonOrDataFrame, options = {}) {
  // Parameters
  if (!isObject(options)) throw new TypeError('options are invalid')
  const mutate = options.mutate || false
  const onProperty = options.on

  // validation
  if (!geojson1) throw new Error('<geojson1> is required')
  if (!geojsonOrDataFrame) throw new Error('<geojsonOrDataFrame> is required')
  if (!onProperty) throw new Error('options <on> property is required')
  if (typeof onProperty !== 'string') { throw new TypeError('<onProperty> must be a string (object key)') }
  if (typeof mutate !== 'boolean') { throw new TypeError('<mutate> must be a boolean') }

  // prevent input mutation
  if (mutate === false) {
    try {
      geojson1 = clone(geojson1)
    } catch (e) {
      throw new Error('Cloning input GeoJSON failed. Check for missing/empty geometries in the feature collection. Original @turf/clone error message:', e)
    }
  }

  // create an array of all properties of the second GeoJSON input
  // that will be merged into the first
  let propsGeojsonOrDataFrame = []
  // lazy check if second argument is a geojson object, otherwise just use it straight away
  if (geojsonOrDataFrame.type) {
    featureEach(geojsonOrDataFrame, (currentFeature, featureIndex) => {
      propsGeojsonOrDataFrame.push(currentFeature.properties)
    })
  } else {
    propsGeojsonOrDataFrame = geojsonOrDataFrame
  }

  // find all features in the second GeoJSON that have the same "onProperty" value
  // as the current feature from the first GeoJSON -> merge these properties into
  // the first GeoJSONs property object
  featureEach(geojson1, currentFeature => {
    const propsToMerge = propsGeojsonOrDataFrame.filter(featureProps => featureProps[onProperty] === currentFeature.properties[onProperty])

    if (propsToMerge && propsToMerge.length) {
      currentFeature.properties = {
        ...Object.assign(...propsToMerge),
        ...geojson1.properties
      }
    }
  })

  return geojson1
}

export default merge
