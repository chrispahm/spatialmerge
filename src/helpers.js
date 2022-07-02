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

function mergeWith(object1, object2, lsuffix = 'left', rsuffix = 'right') {
  const keys1 = Object.keys(object1)
  const keys2 = Object.keys(object2)
  const allKeys = [...keys1, ...keys2]
  const duplicates = findAllDuplicates(allKeys)
  const feature = {}
  if (duplicates.length === 0) {
    keys1.forEach(key => (feature[key] = object1[key]))
    keys2.forEach(key => (feature[key] = object2[key]))
    return feature
  } else {
    keys1.forEach(key => {
      if (duplicates.indexOf(key) > -1) {
        feature[key + '_' + lsuffix] = object1[key]
      } else {
        feature[key] = object1[key]
      }
    })
    keys2.forEach(key => {
      if (duplicates.indexOf(key) > -1) {
        feature[key + '_' + rsuffix] = object2[key]
      } else {
        feature[key] = object2[key]
      }
    })
    return feature
  }
}

export {
  findAllDuplicates,  // exported just for testing
  mergeWith
}
