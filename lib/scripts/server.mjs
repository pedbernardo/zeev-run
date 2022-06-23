import liveServer from 'live-server'
import livereload from 'livereload'

/**
 * Initialize the static server for `outDir` files and
 * livereload when enabled
 *
 * @param {ZeevConfig} config - project config options
 */
export function serve ({ config }) {
  liveServer.start({
    port: config.server.port,
    root: config.outDir,
    open: false,
    ignore: '.',
    logLevel: 0
  })

  if (config.server.livereload) {
    console.log('livereload online')
    livereload
      .createServer()
      .watch(config.outDir)
  }
}
