// var assert = require('assert');
var should = require('chai').should()
const get = require('../get-package-info')
const packageInfoRequest = require('./mocks/request-for-package-info')

describe('get', function () {
  describe('#handle()', function () {
    it('should return package-info', async function () {
      this.timeout(20000)
      const { statusCode, body } = await get.handle(packageInfoRequest)

      statusCode.should.be.a('number')
      statusCode.should.equal(200)

      const parsed = JSON.parse(body)
      const test = 'https://h56qz950tc.execute-api.us-east-1.amazonaws.com/dev/dist/@perfsys-test%2fnpm-test-module-a/versions/1.0.0/npm-test-module-a-1.0.0.tgz'
      parsed.versions['1.0.1'].dist.tarball.should.equal(test)
    })

    // TODO in general, should return 404
    it('should return 401', async function () {
      const { statusCode } = await get.handle({
        'path': '/abc'
      })

      statusCode.should.be.a('number')
      statusCode.should.equal(501) // Server error
    })
  })
})
