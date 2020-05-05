const serverless = require('serverless-http')
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(bodyParser.json({strict: false}))

app.get('/echo', function (req, res) {
  res.send(req.params)
})

app.get('/', function (req, res) {
  console.log('start')
  res.send('HEALTHY')
})

module.exports.handler = serverless(app, {
  request: function (request, event, context) {
    // Transfer context from Lambda Event to HTTP request object
    request.context = event.requestContext
  },
  response: function (response, event, context) {

  }
})
