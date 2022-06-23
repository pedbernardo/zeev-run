import chokidar from 'chokidar'
import { WATCH_GLOBS } from '../constants.mjs'
import { onJavascriptChange } from './javascript.mjs'
import { onStyleChange } from './css.mjs'

/**
 * Initialize all common watchers, used locally or remotely
 * @param {ZeevConfig} config - project config options
 */
function commonWatchers (config) {
  chokidar.watch(WATCH_GLOBS.js, config.watch)
    .on('all', (event, filepath) => onJavascriptChange({ filepath, config }))

  chokidar.watch(WATCH_GLOBS.styles, config.watch)
    .on('all', (event, filepath) => onStyleChange({ filepath, config }))
}

/**
 * Initialize `src` project watchers
 * @param {ZeevConfig} config - project config options
 */
export function watch (config) {
  commonWatchers(config)
}
