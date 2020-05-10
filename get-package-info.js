'use strict'

const querystring = require('querystring')
const { getJsonFromS3, getAvailableVersions, objFromListWith } = require('./lib')
const { NPM_REGISTRY_S3_NAME } = process.env

const R = require('ramda')

module.exports.handle = async (event) => {
  try {
    console.log('get-package-info: starting')
    console.log(`NPM_REGISTRY_S3_NAME: ${NPM_REGISTRY_S3_NAME}`)
    // Log raw API Gateway Event
    console.log(JSON.stringify(event))

    // Extract information from the event
    const { pathParameters, requestContext } = event
    // Extract information from Request Context, will be used later to form dist url
    const { stage, domainName, apiId } = requestContext
    const { path } = pathParameters

    // Log only extracted data
    console.log(JSON.stringify({
      path,
      pathParameters,
      requestContext
    }, null, 2))

    // Decode path from HTTP URI
    // https://nodejs.org/api/querystring.html#querystring_querystring_unescape_str
    const scope = pathParameters.scope
    const moduleName = pathParameters.module

    const pathUnescaped = querystring.unescape(`${scope}/${moduleName}`)

    // Get NPM scope and module name
    // const scope = pathUnescaped.split('/')[0]
    // const moduleName = pathUnescaped.split('/')[1]

    console.log(JSON.stringify({
      scope,
      moduleName
    }, null, 2))

    // Get root package-info value from S3
    const package_info_root = await getJsonFromS3(`${pathUnescaped}/package-info.json`)
    // const package_info_root = await getJsonFromS3(`${scope}/${moduleName}/package-info.json`)

    // Try to understand if we have valid package-info from S3
    if (package_info_root && package_info_root.name){
      console.debug(`Using package-info from S3: ${JSON.stringify(package_info_root)}`)
    } else {
      console.debug('Looks like we need to generate package-info')
      package_info_root['name']=pathUnescaped
    }

    // Get all available versions, based on AWS S3 objects
    const available_versions = await getAvailableVersions(`${pathUnescaped}`)
    console.log(`available_versions: ${available_versions}`)

    const forEachVersion = (version) => {
      const tarball = `https://${domainName}/${stage}/${scope}/${moduleName}/versions/${version}/${moduleName}-${version}.tgz`
    console.log(tarball)
      // return versionPackageInfo
      return new Promise(function (resolve, reject) {
        getJsonFromS3(`${pathUnescaped}/versions/${version}/package-info.json`)
          .then((versionPackageInfo) => {

            if (versionPackageInfo && versionPackageInfo.name && versionPackageInfo.version){
              console.debug(`Using package-info from S3: ${JSON.stringify(versionPackageInfo)}`)
            } else {
              console.debug('Looks like we need to generate package-info')
              versionPackageInfo['name']=pathUnescaped
              versionPackageInfo['version']=version
            }

            // Adding `dist` information for npm client to download tgz file
            versionPackageInfo['dist'] = {
              // TODO integrity
              // TODO shasum
              tarball
            }

            resolve(versionPackageInfo)
          }).catch((err) => {
            console.error(err)
            reject(err)
          })
      })
    }

    const versionsPromises = R.map(forEachVersion)(available_versions)
    const allVersionsAsArray = await Promise.all(versionsPromises)

    // Forming final package info
    package_info_root['versions'] = objFromListWith(
      R.prop('version'),
      allVersionsAsArray
    )

    return {
      statusCode: 200,
      body: JSON.stringify(package_info_root, null, 2)
    }
  } catch (e) {
    console.error(e)
    return {
      statusCode: 501,
      body: JSON.stringify({
        error: 'We had a problem getting package info'
      })
    }
  }

  // return {
  //   statusCode: 200,
  //   body: JSON.stringify({
  //     message: 'Go Serverless v1.0! Your function executed successfully!',
  //     input: event,
  //   }, null, 2),
  // };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
}
