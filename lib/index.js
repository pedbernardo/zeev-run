import { resolveConfig } from './config.js'
import { watch } from './scripts/watch.js'

export { defineConfig } from './config.js'

export async function startDevCommand (configFile) {
  const config = await resolveConfig(configFile)

  watch(config)
}

export function startBuildCommand (configFile) {
  console.log('start build')
}
