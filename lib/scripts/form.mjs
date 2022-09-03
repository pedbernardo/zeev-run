import { readFile, writeFile } from 'node:fs/promises'
import { existsSync, mkdirSync } from 'node:fs'
import htmlnano from 'htmlnano'
import posthtml from 'posthtml'
import include from 'posthtml-include'
import expressions from 'posthtml-expressions'
import { resolveCodformConfig, resolveSourceConfig } from '../config.mjs'
import { logger } from '../logger.mjs'
import { connect } from '../services/zeev-db.mjs'
import { updateForm } from '../services/zeev-actions.mjs'

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
    },
    delimiters: ['{{{', '}}}'],
    unescapeDelimiters: ['{{{{', '}}}}']
  })
]

/**
 * Handles javascript files changes from watch
 * @param {String} filepath - path of the changed file
 * @param {ZeevConfig} config - project config options
 */
export function onFormChange ({ filepath, config }) {
  const targets = resolveSourceConfig('form', { filepath, config })

  if (!targets || !targets.length) return

  targets.forEach(target => bundle({
    target,
    outDir: config.outDir,
    connection: config.connection
  }, output => logger('✨ [artifact] bundled to [output]', {
    output,
    artifact: 'form'
  })))
}

export function buildForm () {
  console.log('build all!')
}

function bundle ({ target, outDir, connection }, onFileBuild) {
  const { entry, output, codform } = target
  let html

  readFile(entry)
    .then(compile)
    .then(content => {
      html = content.html
    })
    .then(async () => await saveOnDatabase({ html, codform, connection }))
    .then(() => saveOnDisk({ html, output, outDir }))
    .then(() => onFileBuild(`${outDir}/${output}`))
    .catch(error => logger(error.message, {
      level: 'error',
      error,
      entry,
      script: 'lib\\scripts\\form.mjs'
    }))
}

function compile (filebuffer) {
  return posthtml(POST_HTML_PLUGINS)
    .process(filebuffer.toString(), {
      lowerCaseTags: true,
      quoteAllAttributes: false
    })
}

function saveOnDisk ({ html, output, outDir }) {
  if (!existsSync(outDir)) mkdirSync(outDir)

  return writeFile(`${outDir}/${output}`, html)
}

async function saveOnDatabase ({ html, codform, connection }) {
  if (!codform) return

  const env = process.env.NODE_ENV
  const envCodform = resolveCodformConfig(codform, env)

  if (!envCodform) {
    throw new Error('The codform propertie must be a number (read as local env) or an object with env (production | test | development) as keys with number values')
  }

  return connect(connection)
    .then(pool =>
      updateForm({
        pool,
        html,
        codform: envCodform
      })
    )
    .then(() => logger('💿 [artifact] updated on database [output] at codform [key]', {
      output: connection.database,
      key: envCodform.toString(),
      artifact: 'form'
    }))
}
