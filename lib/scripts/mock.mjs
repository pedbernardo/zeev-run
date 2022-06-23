import fs from 'node:fs'
import jsonServer from 'json-server'

export function mock ({ config }) {
  const dbExists = fs.existsSync(config.mocks.file)

  if (!dbExists) {
    console.log(`Can't find the mock JSON config at ${config.mocks.file}`)
    return
  }

  const server = jsonServer.create()
  const router = jsonServer.router(config.mocks.file)
  const middlewares = jsonServer.defaults()

  server.use((req, res, next) => setTimeout(next, config.mocks.delayInMs))
  server.use(middlewares)
  server.use(config.mocks.route, router)

  server.listen(config.mocks.port, () => {
    console.log('JSON Server is running')
  })
}
