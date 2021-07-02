import fs from 'fs'
import util from 'util'
import { csvParse } from 'd3-dsv'
import sm from '../src/index.js'
import { createRequire } from 'module'
import { strictEqual, deepStrictEqual } from 'assert'
import reader from './utilities/reader.js'
const require = createRequire(import.meta.url)
const readFile = util.promisify(fs.readFile)
// const writeFile = util.promisify(fs.writeFile)

;(async () => {
  console.log('Reading test data...')
  // load test data for merge function
  const countriesDataCSV = await readFile('./test/datasets/countries.csv', 'utf8')
  const countriesData = csvParse(countriesDataCSV)

  const cities = require('./geometries/cities.json')
  const countriesGeometries = require('./geometries/countries.json')
  const countriesGeometriesFull = require('./geometries/countries_full.json')

  // filter cities/countries with missing geometries
  cities.features = cities.features.filter(c => c.geometry)
  countriesGeometries.features = countriesGeometries.features.filter(c => c.geometry)
  countriesGeometriesFull.features = countriesGeometriesFull.features.filter(c => c.geometry)

  // TODO: These test are currently disabled due to the max. file size limit
  // imposed by GitHub -> Use git-lfs
  // const sqrs = require('./geometries/sqrs_bbox.json')
  // const plots = require('./geometries/single_plot_population_bbox.json')

  // expected output data
  const mergeExpected = require('./output/merged.json')
  const citiesExpected = require('./output/merged_cities.json')
  const plotsExpected = await reader('./test/output/merged_plots.json')

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
    deepStrictEqual(merged, mergeExpected)
  } catch (e) {
    console.error('Unexpected output in merge function', e)
    process.exit()
  }
  // check if input got mutated
  if (countriesGeometries.features[0].properties.ISO_A2) {
    console.error('Merge function input got mutated unexpectedly!')
    process.exit()
  }
  // assert merge function, geojson <-> geojson, without mutating input
  const mergedGeometries = sm.merge(countriesGeometries, countriesGeometriesFull, { on: 'ISO_A3' })

  try {
    deepStrictEqual(mergedGeometries, mergeExpected)
  } catch (e) {
    console.error('Unexpected output in merge function (mergin two geometries)', e)
    process.exit()
  }

  // check if input got mutated
  if (countriesGeometries.features[0].properties.ISO_A2) {
    console.error('Merge function input got mutated unexpectedly!')
    process.exit()
  }
  // check mutation option
  const mergedMutate = sm.merge(countriesGeometries, countriesData, { on: 'ISO_A3', mutate: true })
  try {
    deepStrictEqual(mergedMutate, mergeExpected)
  } catch (e) {
    console.error('Unexpected output in merge function', e)
    process.exit()
  }
  // check if input got mutated
  if (!countriesGeometries.features[0].properties.ISO_A2) {
    console.error('Merge function did not get mutated!')
    process.exit()
  }

  console.log('Passed all merge function tests!')

  // Assert sjoin function
  // TODO: Add tests for function inputs and error handling
  /* // TODO: fix using git-lfs
  const joinedPlots = sm.sjoin(plots, sqrs)
  try {
    deepStrictEqual(joinedPlots, plotsExpected)
  } catch (e) {
    console.error('Unexpected output in sjoin function', e)
    process.exit()
  }
  */
  const joinedCities = sm.sjoin(cities, countriesGeometries)
  try {
    deepStrictEqual(joinedCities, citiesExpected)
  } catch (e) {
    console.error('Unexpected output in sjoin function', e)
    process.exit()
  }

  console.log('Passed all spatial join (sjoin) tests!')
})()
