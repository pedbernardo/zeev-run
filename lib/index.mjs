import { resolveConfig } from './config.mjs'
import { watch } from './scripts/watch.mjs'
import { serve } from './scripts/server.mjs'
import { mock } from './scripts/mock.mjs'
import { printDevWelcome, printEnvironment } from './logger.mjs'

export { defineConfig } from './config.mjs'

export async function startDevCommand (configFile) {
  const config = await resolveConfig(configFile)

  printDevWelcome()
  printEnvironment()
  watch(config)

  if (config.server) serve({ config })
  if (config.mocks) mock({ config })

  /** add an empty line before watch logs */
  console.log()
}

export function startBuildCommand (configFile) {
  console.log('🚧 coming soon...')
}
