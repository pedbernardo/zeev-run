import { readFile, writeFile } from 'node:fs/promises'
import { existsSync, mkdirSync } from 'node:fs'
import htmlnano from 'htmlnano'
import posthtml from 'posthtml'
import include from 'posthtml-include'
import expressions from 'posthtml-expressions'
import { resolveSourceConfig } from '../config.mjs'
import { logger } from '../logger.mjs'

const POST_HTML_PLUGINS = [
  htmlnano({
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeOptionalTags: true,
    minifyCss: false,
    minifyJs: false,
    minifySvg: false
  }),
  include({
    root: './src'
  }),
  expressions({
    locals: {
      env: process.env.NODE_ENV ?? 'local'
    }
  })
]

/**
 * Handles javascript files changes from watch
 * @param {String} filepath - path of the changed file
 * @param {ZeevConfig} config - project config options
 */
 export function onFormChange ({ filepath, config }) {
  const target = resolveSourceConfig('form', { filepath, config })

  if (!target) return

  bundle({
    target,
    outDir: config.outDir
  }, output => logger(`✨ [artifact] bundled to [output]`, {
    output,
    artifact: 'form'
  }))
 }

 export function buildForm () {
  console.log('build all!')
}

function bundle ({ target, outDir }, onFileBuild) {
  const { entry, output } = target
  let html

  readFile(entry)
    .then(compile)
    .then(content => {
      html = content.html
      return saveToDisk({ html, output, outDir })
    })
    .then(() => onFileBuild(`${outDir}/${output}`))
    .catch(error => logger(error.message, {
      level: 'error',
      error,
      entry,
      script: 'lib\\scripts\\form.mjs'
    }))
    /**
     * @todo update on server
     */
}

function compile (filebuffer) {
  return posthtml(POST_HTML_PLUGINS)
    .process(filebuffer.toString(), {
      lowerCaseTags: true,
      quoteAllAttributes: false
    })
}

function saveToDisk ({ html, output, outDir }) {
  if (!existsSync(outDir)) mkdirSync(outDir)

  return writeFile(`${outDir}/${output}`, html)
}
