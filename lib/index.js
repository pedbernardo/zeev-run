import { resolveConfig } from './config.js'
import { watch } from './scripts/watch.js'
import { serve } from './scripts/server.js'

export { defineConfig } from './config.js'

export async function startDevCommand (configFile) {
  const config = await resolveConfig(configFile)

  watch(config)

  if (config.server) serve({ config })
}

export function startBuildCommand (configFile) {
  console.log('start build')
}
