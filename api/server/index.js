const Koa = require('koa')
const cors = require('kcors')
const api = require('./api')

// Setup Koa app
const app = new Koa()
const port = process.env.PORT || 5000

// Apply CORS config
const origin = process.env.CORS_ORIGIN | '*'
app.use(cors({ origin }))

// Log all requests
app.use(async (ctx, next) => {
  const start = Date.now()
  await next() // This will pause this function until the endpoint handler has resolved
  const responseTime = Date.now() - start
})

// Error Handler - All uncaught exceptions will percolate up to here
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = err.message
  }
})

// Mount routes
app.use(api.routes(), api.allowedMethods())

// Start the app
app.listen(port, () => { console.log('test') })
