import glob from 'glob'
import path from 'node:path'
import { ROOT_PROJECT_PATHS, ROOT_FILENAMES } from './constants.mjs'

const getFileNamesByExt = ext => [
  ...ROOT_FILENAMES.common,
  ...ROOT_FILENAMES[ext]
]

/**
 * Checks if filepath matches zero config defaults for root paths
 * @see ROOT_PROJECT_PATHS {./constants.mjs}
 * @example
 * src/{path-pattern[js,styles,form]}/...
 * src/{rootfile[.js,.scss,.html]}
 *
 * @param {String} filepath
 * @returns {Boolean} whether is root path or not
 */
export const isRootPath = filepath => {
  const paths = filepath.split('\\')
  const deepness = paths.length
  const firstLevelFolder = paths[1]

  return Object.values(ROOT_PROJECT_PATHS)
    .includes(firstLevelFolder) || deepness === 2
}

export const isRootFile = filepath => {
  const paths = filepath.split('\\')
  const deepness = paths.length
  const firstLevelFolder = paths[1]
  const { name, ext } = path.parse(filepath)

  return getFileNamesByExt(ext).includes(name) &&
    deepness <= 3 &&
    (deepness > 2 ? ROOT_PROJECT_PATHS[ext] === firstLevelFolder : true)
}

/**
 * Resolves the output filename according the filepath
 * @example `src\\app.js` => `app-bundle.js`
 * @example `src\\js\\main.js` => `main--bundle.js`
 * @param {String} filepath
 * @returns {String} output filename
 */
export const outputFileByFilepath = filepath => {
  const paths = filepath.split('\\')
  const deepness = paths.length
  const { name, ext } = path.parse(filepath)
  const outputExt = ext === '.scss' ? '.css' : ext
  const outputNameSeparator = deepness > 2 ? '--' : '-'

  return `${name}${outputNameSeparator}bundle${outputExt}`
}

export const getAllRootFilesByFilepath = filepath => {
  const { ext } = path.parse(filepath)
  const filenamePatterns = getFileNamesByExt(ext)
  const namePattern = `{${filenamePatterns.join(',')}}${ext}`
  const artifactPath = ROOT_PROJECT_PATHS[ext]

  return [
    ...glob.sync(`./src/${namePattern}`),
    ...glob.sync(`./src/${artifactPath}/${namePattern}`)
  ].map(filepath =>
    filepath
      .replace('./', '')
      .replaceAll('/', '\\')
  )
}
