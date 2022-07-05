import chokidar from 'chokidar'
import { WATCH_GLOBS } from '../constants.mjs'
import { onJavascriptChange } from './javascript.mjs'
import { onStyleChange } from './css.mjs'
import { onFormChange } from './form.mjs'

/**
 * Initialize all common watchers, used locally or remotely
 * @param {ZeevConfig} config - project config options
 */
function commonWatchers (config) {
  chokidar.watch(WATCH_GLOBS.js, config.watch)
    .on('all', (event, filepath) => onJavascriptChange({ filepath, config }))

  chokidar.watch(WATCH_GLOBS.styles, config.watch)
    .on('all', (event, filepath) => onStyleChange({ filepath, config }))

  chokidar.watch(WATCH_GLOBS.form, {
    ...config.watch,
    ignored: WATCH_GLOBS.headers
  })
    .on('all', (event, filepath) => onFormChange({ filepath, config }))
}

/**
 * Initialize `src` project watchers
 * @param {ZeevConfig} config - project config options
 */
export function watch ({ config }) {
  commonWatchers(config)
}
