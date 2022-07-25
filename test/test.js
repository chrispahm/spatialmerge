import fs from 'fs'
import util from 'util'
import { csvParse } from 'd3-dsv'
import sm from '../src/index.js'
import { findAllDuplicates } from '../src/helpers.js'
import { createRequire } from 'module'
import { strictEqual, deepStrictEqual } from 'assert'
import reader from './utilities/reader.js'
const require = createRequire(import.meta.url)
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const sortBy = (fn) => {
  return (a, b) => (fn(a) > fn(b)) ? 1 : ((fn(b) > fn(a)) ? -1 : 0);
}

;(async () => {
  console.log('Reading test data...')
  // load test data for merge function
  const countriesDataCSV = await readFile('./test/datasets/countries.csv', 'utf8')
  const countriesData = csvParse(countriesDataCSV)

  const cities = require('./geometries/cities.json')
  const countriesGeometries = require('./geometries/countries.json')
      
  // expected output data - created using GeoPandas
  const mergeExpected = require('./output/merged_countries_geopandas.json')
  const citiesExpected = require('./output/merged_cities_geopandas.json')
  
  console.log('Start merge function tests...')
  // test attribute merge function
  // assert input errors
  try {
    sm.merge()
  } catch (e) {
    strictEqual(e.message, '<geojson1> is required')
  }

  try {
    sm.merge(countriesGeometries)
  } catch (e) {
    strictEqual(e.message, '<geojsonOrDataFrame> is required')
  }

  try {
    sm.merge(countriesGeometries, countriesData)
  } catch (e) {
    strictEqual(e.message, 'options <on> property is required')
  }

  try {
    sm.merge(countriesGeometries, countriesData, { on: 123 })
  } catch (e) {
    strictEqual(e.message, '<onProperty> must be a string (object key)')
  }

  try {
    sm.merge(countriesGeometries, countriesData, 'should fail')
  } catch (e) {
    strictEqual(e.message, 'options are invalid')
  }

  try {
    sm.merge(countriesGeometries, countriesData, { on: 'ISO_A3', mutate: 123 })
  } catch (e) {
    strictEqual(e.message, '<mutate> must be a boolean')
  }
  
  // assert merge function, geojson <-> dataframe, without mutating input
  const merged = sm.merge(countriesGeometries, countriesData, { on: 'ISO_A3' })

  try {
    deepStrictEqual(merged.features, mergeExpected.features)
  } catch (e) {
    console.error('Unexpected output in merge function', e)
    process.exit()
  }
  // check if input got mutated
  if (countriesGeometries.features[0].properties.ISO_A2) {
    console.error('Merge function input got mutated unexpectedly!')
    process.exit()
  }

  // check if input got mutated
  if (countriesGeometries.features[0].properties.ISO_A2) {
    console.error('Merge function input got mutated unexpectedly!')
    process.exit()
  }
  // check mutation option
  // create a deep clone of the countriesGeometries object 
  const clonedCountriesGeometries = JSON.parse(JSON.stringify(countriesGeometries))
  const mergedMutate = sm.merge(clonedCountriesGeometries, countriesData, { on: 'ISO_A3', mutate: true })
  try {
    deepStrictEqual(mergedMutate.features, mergeExpected.features)
  } catch (e) {
    console.error('Unexpected output in merge function', e)
    process.exit()
  }
  
  // check if input got mutated
  if (!clonedCountriesGeometries.features[0].properties.ISO_A2) {
    console.error('Merge function did not get mutated!')
    process.exit()
  }
  

  console.log('Passed all merge function tests!')

  // Unit tests for findAllDuplicates
  const allDistinct = [1, 2, 3, 4, 5, 6]
  try {
    deepStrictEqual(findAllDuplicates(allDistinct), [])
  } catch (e) {
    console.error('Unexpected output in findAllDuplicates function (allDistinct case)', e)
    process.exit()
  }
  const withDuplicates = [1, 2, 1, 3, 4, 5, 6, 3]
  try {
    deepStrictEqual(findAllDuplicates(withDuplicates),[1, 3])
  } catch (e) {
    console.error('Unexpected output in findAllDuplicates function (withDuplicates case)', e)
    process.exit()
  }

  console.log('Passed all findAllDuplicates tests!')
  
  // sjoin tests
  const joinedCities = sm.sjoin(cities, countriesGeometries)
  // sort by city id to simplify comparison to GeoPandas
  joinedCities.features.sort(sortBy(f => f.properties.id))
  await writeFile('./sjoin_test.json', JSON.stringify(joinedCities),'utf8')
  
  try {
    deepStrictEqual(joinedCities.features, citiesExpected.features)
  } catch (e) {
    console.error('Unexpected output in sjoin function', e)
    process.exit()
  }
  
  // Issue #3 - neighborhoods <-> public restrooms
  const neighborhoods = require('./geometries/neighborhoods.json');
  const restrooms = require('./geometries/Parks_Public_Restrooms.json');
  const joinedNeighborhoods = sm.sjoin(restrooms, neighborhoods, { how: "inner", op: "intersects" });
  // sort by OBJECTID_left to simplify comparison to GeoPandas
  joinedNeighborhoods.features.sort(sortBy(f => f.properties.OBJECTID_left))

  const joinedNeighborhoodsExpected = require('./output/merged_neighborhoods_geopandas.json');
  
  try {
    deepStrictEqual(joinedNeighborhoods.features, joinedNeighborhoodsExpected.features)
  } catch (e) {
    console.error('Unexpected output in sjoin function', e)
    process.exit()
  }
  
  console.log('Passed all spatial join (sjoin) tests!')
})()
