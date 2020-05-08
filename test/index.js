
const packageInfoRequest = require('./mocks/request-for-package-info')
const get = require('../get-package-info')

get.handle(packageInfoRequest)
  .then((data) => {
    console.log('OK')
    console.log(data)
  })
