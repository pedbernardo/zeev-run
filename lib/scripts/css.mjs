import shell from 'shelljs'
import { resolveSourceConfig } from '../config.mjs'
import { logger } from '../logger.mjs'

/**
 * Handles sass files changes from watch
 * @param {String} filepath - path of the changed file
 * @param {ZeevConfig} config - project config options
 */
export function onStyleChange ({ filepath, config }) {
  const target = resolveSourceConfig('css', { filepath, config })

  if (!target) return

  bundle({
    target,
    outDir: config.outDir
  }, output => logger('✨ [artifact] bundled to [output]', {
    output,
    artifact: 'css'
  }))
}

export function buildStyle () {
  console.log('build all!')
}

function bundle ({ target, outDir }, onFileBuild) {
  /**
   * Using shell to avoid saving css output and source maps
   * manually when using sass JS API `compile` method
   */
  shell.exec(
    `sass ${target.entry} ${outDir}/${target.output} --style=compressed`,
    (code, stdout, stderr) => {
      if (code !== 0) {
        const [errorMessage] = stderr.toString().split('\n')
        logger(errorMessage, {
          level: 'error',
          entry: target.entry,
          script: 'lib\\scripts\\css.mjs',
          printStackError: false
          // sass already has great error infos on logging stdout
        })
        return
      }
      onFileBuild && onFileBuild(`${outDir}/${target.output}`)
    })
}
