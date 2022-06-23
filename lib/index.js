import { resolveConfig } from './config.js'
import { watch } from './scripts/watch.js'
import { serve } from './scripts/server.js'
import { mock } from './scripts/mock.js'

export { defineConfig } from './config.js'

export async function startDevCommand (configFile) {
  const config = await resolveConfig(configFile)

  watch(config)

  if (config.server) serve({ config })
  if (config.mocks) mock({ config })
}

export function startBuildCommand (configFile) {
  console.log(`start build ${process.env.NODE_ENV}`)
}
