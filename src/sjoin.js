import { isObject } from '@turf/helpers'
import Flatbush from 'flatbush'
import { mergeWith } from './helpers.js'
import booleanIntersects from '@turf/boolean-intersects'
import booleanContains from '@turf/boolean-contains'
import booleanWithin from '@turf/boolean-within'
import booleanCrosses from '@turf/boolean-crosses'
import booleanOverlap from '@turf/boolean-overlap'
import bbox from '@turf/bbox'

function sjoin (geojson1, geojson2, options) {
  // Optional parameters
  options = options || {}
  if (!isObject(options)) throw new TypeError('options are invalid')
  const how = options.how || 'inner'
  const op = options.opt || 'intersects'
  const matches = options.matches || 'all'
  const lsuffix = options.lsuffix || 'left'
  const rsuffix = options.rsuffix || 'right'
  const inclLeftIndex = options.inclLeftIndex || false

  // validation
  if (!geojson1) throw new Error('<geojson1> is required')
  if (!geojson2) throw new Error('<geojson2> is required')
  if (geojson1.type !== 'FeatureCollection') throw new Error('<geojson1> must be a GeoJSON FeatureCollection')
  if (geojson2.type !== 'FeatureCollection') throw new Error('<geojson1> must be a GeoJSON FeatureCollection')
  if (typeof how !== 'string') throw new TypeError('<how> must be a string ("left","right","inner","first")')
  const supportedHows = ['inner', 'left', 'right', 'first']
  if (supportedHows.indexOf(how) === -1) throw new Error(how, ' is not supported as a <how> operation. Must be any of "left","right","inner","first"')
  if (typeof op !== 'string') { throw new TypeError('<op> must be a string ("intersects","contains","within","crosses","overlaps")') }
  const supportedOps = ['intersects', 'contains', 'within', 'crosses', 'overlaps']
  if (supportedOps.indexOf(op) === -1) throw new Error(op, ' is not supported as a <op> operation. Must be any of "intersects","contains","within","crosses","overlaps"')
  if (typeof matches !== 'string') { throw new TypeError('<matches> must be a string ("all" or "first")') }
  const supportedMatches = ['first', 'all']
  if (supportedMatches.indexOf(matches) === -1) throw new Error(matches, ' is not supported as a <matches> operation. Must be any of "first" or "all"')
  if (typeof lsuffix !== 'string') throw new TypeError('<lsuffix> must be a string')
  if (typeof rsuffix !== 'string') throw new TypeError('<rsuffix> must be a string')
  if (typeof inclLeftIndex !== 'boolean') { throw new TypeError('<inclLeftIndex> must be a boolean') }

  let operation
  switch (op) {
    case 'intersects':
      operation = booleanIntersects
      break
    case 'contains':
      operation = booleanContains
      break
    case 'within':
      operation = booleanWithin
      break
    case 'crosses':
      operation = booleanCrosses
      break
    case 'overlaps':
      operation = booleanOverlap
      break
  }

  // assign left and right GeoJSON dataframes according to the type of join
  // default (inner and left): first GeoJSON is considered as the left DF
  let leftGeojson = geojson1
  let rightGeojson = geojson2
  if (how === 'right') {
    leftGeojson = geojson2
    rightGeojson = geojson1
  }

  // build spatial index of the right GeoJSON in order to minimize the number of
  // polys/points to check for intersections
  const spatialIndex = new Flatbush(rightGeojson.features.length)
  for (const feature of rightGeojson.features) {
    const featureBBOX = bbox(feature)
    spatialIndex.add(featureBBOX[0], featureBBOX[1], featureBBOX[2], featureBBOX[3])
  }
  spatialIndex.finish()

  const results = []
  const noFeatures = leftGeojson.features.length

  for (let leftIndex = 0; leftIndex < noFeatures; leftIndex++) {
    if (!leftGeojson.features[leftIndex].geometry) continue
    const leftFeature = leftGeojson.features[leftIndex]
    const featureBBOX = bbox(leftFeature)
    const bboxResults = spatialIndex.search(
      featureBBOX[0],
      featureBBOX[1],
      featureBBOX[2],
      featureBBOX[3]
    )

    let matchingRightIndeces = []
    if (matches === 'first') {
      // in order to speed up the process, we only search for the very first
      // match using Array.find (instead of Array.filter used below)
      const firstMatch = bboxResults
        .find(rightIndex => operation(
          rightGeojson.features[rightIndex],
          leftFeature)
        )
      if (firstMatch) matchingRightIndeces = [firstMatch]
    } else {
      matchingRightIndeces = bboxResults
        .filter(rightIndex => operation(
          rightGeojson.features[rightIndex],
          leftFeature)
        )
    }

    const noMatchingRightIndeces = matchingRightIndeces.length
    if (noMatchingRightIndeces) {
      for (let i = 0; i < noMatchingRightIndeces; i++) {
        const matchingRightIndex = matchingRightIndeces[i]
        const feature = {
          type: 'Feature',
          geometry: leftFeature.geometry,
          properties: mergeWith(leftFeature.properties, {
            ...(how === 'right' && { index_left: matchingRightIndex }),
            ...(how !== 'right' && { index_right: matchingRightIndex }),
            ...(how === 'right' && inclLeftIndex && { index_right: leftIndex }),
            ...(how !== 'right' && inclLeftIndex && { index_left: leftIndex }),
            ...rightGeojson.features[matchingRightIndex].properties
          })
        }
        results.push(feature)
      }
    } else if (how === 'left' || how === 'right') {
      results.push(leftFeature)
    }
  }

  const fc = {
    type: 'FeatureCollection',
    features: results
  }

  return fc
}

export default sjoin
