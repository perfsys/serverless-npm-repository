const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const R = require('ramda')

const { NPM_REGISTRY_S3_NAME } = process.env

const getJsonFromS3 = async (path) => {
try {
  const { Body } = await s3.getObject({
    Bucket: NPM_REGISTRY_S3_NAME,
    Key: path
  }).promise()
  return JSON.parse(Body.toString())
}catch (e) {
  console.debug(`We were not able to find ${path}`)
  return {}
}

}

const getAvailableVersions = async (path) => {
  const { Contents } = await s3.listObjects({
    Bucket: NPM_REGISTRY_S3_NAME,
    Prefix: `${path}/versions`
  }).promise()

  const getKey = R.prop('Key')
  const removePath = (i) => i.replace(`${path}/versions/`, '')
  const getVersion = (i) => i.split('/')[0]
  return R.pipe(
    // Get Key
    R.map(getKey),
    R.map(removePath),
    R.map(getVersion),
    R.uniq

  )(Contents)
}



const arr2obj = R.curry((fn, arr) =>
  R.pipe(
    (list) => list.map(k => [k.toString(), fn(k)]),
    R.fromPairs
  )(arr)
)

const objFromListWith = R.curry((fn, list) => R.chain(R.zipObj, R.map(fn))(list))

exports.getJsonFromS3 = getJsonFromS3
exports.getAvailableVersions = getAvailableVersions
exports.arr2obj = arr2obj
exports.objFromListWith = objFromListWith
