import { resolveConfig } from './config.mjs'
import { watch } from './scripts/watch.mjs'
import { serve } from './scripts/server.mjs'
import { mock } from './scripts/mock.mjs'

export { defineConfig } from './config.mjs'

export async function startDevCommand (configFile) {
  const config = await resolveConfig(configFile)

  watch(config)

  if (config.server) serve({ config })
  if (config.mocks) mock({ config })
}

export function startBuildCommand (configFile) {
  console.log(`start build ${process.env.NODE_ENV}`)
}
