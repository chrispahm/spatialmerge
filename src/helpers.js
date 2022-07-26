function findAllDuplicates(array) {
  const uniq = new Set(array);
  if (uniq.size === array.length) {
    return [];
  }
  const duplicates = new Set()
  for (const element of array) {
    if (uniq.has(element)) {
      uniq.delete(element);
    } else {
      duplicates.add(element);
    }
  }
  return [...duplicates];
}

function mergeWith(leftFeatureProps, rightFeatureProps, lsuffix = 'left', rsuffix = 'right') {  
  const keys1 = Object.keys(leftFeatureProps)
  const keys2 = Object.keys(rightFeatureProps)
  const allKeys = [...keys1, ...keys2]
  const duplicates = findAllDuplicates(allKeys)
  const feature = {}
  if (duplicates.length === 0) {
    keys1.forEach(key => (feature[key] = leftFeatureProps[key]))
    keys2.forEach(key => (feature[key] = rightFeatureProps[key]))
    return feature
  } else {
    keys1.forEach(key => {
      if (duplicates.indexOf(key) > -1) {
        feature[key + '_' + lsuffix] = leftFeatureProps[key]
      } else {
        feature[key] = leftFeatureProps[key]
      }
    })
    keys2.forEach(key => {
      if (duplicates.indexOf(key) > -1) {
        feature[key + '_' + rsuffix] = rightFeatureProps[key]
      } else {
        feature[key] = rightFeatureProps[key]
      }
    })
    return feature
  }
}

export {
  findAllDuplicates,  // exported just for testing
  mergeWith
}
