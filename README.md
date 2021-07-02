# spatialmerge

A (relatively) fast library for spatial joining and merging data in JavaScript.

![spatialmerge](https://user-images.githubusercontent.com/20703207/124135500-25399100-da84-11eb-9c06-92db61b107e8.png)

The library is largely influenced by the [geopandas](https://geopandas.org/docs/user_guide/mergingdata.html) [merge](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.merge.html) and [sjoin](https://geopandas.org/docs/reference/api/geopandas.sjoin.html) methods. Just as geopandas, `spatialmerge` utilizes a static spatial index provided by [Flatbush](https://github.com/mourner/flatbush) (R-tree) to narrow down the number of features to test for intersection.

```js
import { merge, sjoin } from 'spatialmerge'
// join the properties of a spatial dataset (GeoJSON FeatureCollection) with a
// non-spatial dataset (e.g. contents of a CSV file parsed using d3-dsv) 
// based on a common variable
const resultsMerge = merge(countryShapes, countryNames, { on: 'iso_a3' })

// join the properties of two spatial datasets (GeoJSON FeatureCollections)
const mergeSjoin = sjoin(citiesPoints, countryShapes)
```

Working examples, and an in-depth explanation of the two functions can be found in the [user guide notebook](https://observablehq.com/@chrispahm/hello-spatialmerge).

## Installing
```shell
npm install spatialmerge
# or
yarn add spatialmerge
```

For vanilla HTML in modern browsers, import `spatialmerge` from Skypack:

```html
<script type="module">

import { merge, sjoin } from 'https://cdn.skypack.dev/spatialmerge'
// ...

</script>
```

For legacy environments, you can load `spatialmerge`’s UMD bundle from an npm-based CDN such as jsDelivr; a `spatialmerge` global is exported:

```html
<script src="https://cdn.jsdelivr.net/npm/spatialmerge"></script>
```

## User Guide

The User Guide is hosted as an interactive ObservableHQ notebook  
https://observablehq.com/@chrispahm/hello-spatialmerge

## API reference

##### spatialmerge.merge(*leftFC, rightFC_or_arrayOfObjects, options = { on: \<property\>, mutate: false }]*)

Join the attributes of a GeoJSON FeatureCollection with an array of objects or another GeoJSON FeatureCollection based on a common variable (object key).

Parameters: 
- **leftFC**: *[\<GeoJSON FeatureCollection\>](https://macwright.com/2015/03/23/geojson-second-bite.html#featurecollection), required*
- **rightFC_or_arrayOfObjects**: *[\<GeoJSON FeatureCollection\>](https://macwright.com/2015/03/23/geojson-second-bite.html#featurecollection) OR [\<array of objects\>](https://eloquentjavascript.net/04_data.html#p_d1H6/6O79A), required*
- **options**: *\<object\>, required*
  - **on**: *\<string\>, required*  
  The key to join the two collections on.
  - **mutate**: *\<boolean\>, default: false*  
  Allows GeoJSON input to be mutated (significant performance increase if true) 


##### spatialmerge.sjoin(*leftFC, rightFC[, options = { how: 'inner', op: 'intersects', matches: 'all', lsuffix: 'left', rsuffix: 'right' }]*)

Spatial join of two GeoJSON FeatureCollections.  
See the [User Guide](https://observablehq.com/@chrispahm/hello-spatialmerge) for details.

Parameters:
- **leftFC, rightFC**: *[\<GeoJSON FeatureCollection\>](https://macwright.com/2015/03/23/geojson-second-bite.html#featurecollection), required*
- **options**: *\<object\>, optional*
  - **how**: *\<string\>, default: 'inner'*  
  The type of join:
    - ‘left’: use keys from left_df; retain only left_df geometry column
    - ‘right’: use keys from right_df; retain only right_df geometry column
    - ‘inner’: use intersection of keys from both dfs; retain only left_df geometry column
  - **op**: *\<string\>, default: 'intersects'*  
  Binary predicate. Internally uses the corresponding [turf.js](http://turfjs.org/) modules.
    - 'intersects'
    - 'contains'
    - 'within'
    - 'crosses'
    - 'overlaps'
  - **matches**: *\<string\>, default: 'all'* 
  Whether to output all results of the join operation, or only the first.
    - 'all'
    - 'first'
  - **lsuffix**: *\<string\>, default: 'left'*  
  Suffix to apply to overlapping column names (left GeoJSON).
  - **rsuffix**: *\<string\>, default: 'right'*  
  Suffix to apply to overlapping column names (right GeoJSON).
  - **inclLeftIndex**: *\<boolean\>, default: false*  
  Whether to include the left index as a property value in the resulting GeoJSON FeatureCollection.

## Performance

Spatially merging datasets is (almost) always a computationally intensive task. If you plan to use `spatialmerge` on the client side or in a Node.js / Deno server, be sure to wrap it in a [WebWorker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) or [worker_thread](https://nodejs.org/api/worker_threads.html) to avoid blocking the Rendering / Event Loop. 

Resources:
- https://www.smashingmagazine.com/2021/06/web-workers-2021/
- https://github.com/GoogleChromeLabs/comlink
- https://github.com/josdejong/workerpool


## TODOs

- Fix tests for sjoin including large files, potentially using git-lfs
- Example using WebWorker  
- Performance comparison with @turf/tag and geopandas

## Contribution

Contribution is highly appreciated 👍  
Please open an issue in case of questions / bug reports or a pull request if you implemented a new feature / bug fix.
In the latter case, please make sure to run npm test (and adapt test/test.js to your changes) and / or update the README 🙂

## License

MIT @Christoph Pahmeyer