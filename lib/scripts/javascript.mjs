import { build } from 'esbuild'
import { resolveSourceConfig } from '../config.mjs'

const isProduction = process.env.NODE_ENV === 'production'

/**
 * Handles javascript files changes from watch
 * @param {String} filepath - path of the changed file
 * @param {ZeevConfig} config - project config options
 */
export function onJavascriptChange ({ filepath, config }) {
  const targets = resolveSourceConfig('js', { filepath, config })

  console.log('js change')

  if (!targets) return

  bundle({
    targets,
    outDir: config.outDir,
    variables: config.env.bundleVariables,
  }, output => console.log(`js bundled to ${output}`))
}

export function buildJavascript () {
  console.log('build all!')
}

function bundle ({ targets, outDir, variables }, onFileBuild) {
  targets = Array.isArray(targets) ? targets : [targets]

  targets.forEach(({ entry, output }) => {
    build({
      bundle: true,
      sourcemap: true,
      ignoreAnnotations: !isProduction,
      minify: isProduction,
      define: variables,
      entryPoints: [entry],
      outfile: `${outDir}/${output}`
    })
    .then(() => onFileBuild && onFileBuild(output))
    .catch(console.error)
  })
}
