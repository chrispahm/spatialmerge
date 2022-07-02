function mergeWith (object1, object2, lsuffix, rsuffix) {
  const keys1 = Object.keys(object1)
  const keys2 = Object.keys(object2)
  const allKeys = [...keys1, ...keys2]
  const uniq = [...new Set(allKeys)]
  const feature = {}
  if (allKeys.length === uniq.length) {
    keys1.forEach(key => (feature[key] = object1[key]))
    keys2.forEach(key => (feature[key] = object2[key]))
    return feature
  } else {
    const duplicates = allKeys.filter(key => uniq.indexOf(key) === -1)
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
  mergeWith
}
