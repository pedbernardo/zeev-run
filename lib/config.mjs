import path from 'node:path'
import fs from 'node:fs'
import dotenv from 'dotenv-flow'
import cloneDeep from 'lodash/cloneDeep.js'
import merge from 'lodash/merge.js'
import { CONFIG_FILENAME, ROOT_PROJECT_PATHS, ROOT_FILENAMES } from './constants.mjs'
import { logger } from './logger.mjs'

/**
 * ConnectionConfig powered by mssql node package, using tedious driver
 * @see [node-mssql]{@link https://www.npmjs.com/package/mssql}
 *
 * @typedef {Object} ConnectionConfig
 * @property {Number} port - port used to connect into the database
 * @property {Object} pool - connection pool configuration
 * @property {Number} pool.max - connection pool maximum connections (default: 10)
 * @property {Number} pool.min - connection pool minimum connections (default: 0)
 * @property {Number} pool.idleTimeoutMillis - connection pool idle timeout in milliseconds (default: 30000)
 * @property {Object} options - connection options configuration
 * @property {Boolean} options.encrypt - indicates whether the connection will be encrypted (default: true)
 * @property {Boolean} options.trustServerCertificate - indicates whether to trust the server certificates (default: true)
 */

/**
 * WatchConfig powered by chokidar node package
 * @see [chokidar]{@link https://github.com/paulmillr/chokidar}
 *
 * @typedef {Object} WatchConfig
 * @property {Boolean} ignoreInitial - indicates whether is to ignore calling the events during the initialization (default: true)
 * @property {Object} awaitWriteFinish - configuration when waiting to finish writing the files
 * @property {Number} awaitWriteFinish.stabilityThreshold - amount of time in milliseconds before emitting its event (default: 150)
 */

/**
 * EnvConfig powered by dotenv-flow node package
 * @see [dotenv-flow]{@link https://github.com/kerimdzhanov/dotenv-flow}
 *
 * @typedef {Object} EnvConfig
 * @property {String} path - path to the .env* files directory (default: ./config)
 * @property {String} envPrefix - exposed env variables prefix to esbuild (default: ZEEV_)
 */

/**
 * ServerConfig powered by live-server and livereload node packages
 * @see [live-server]{@link https://github.com/tapio/live-server}
 * @see [livereload]{@link https://github.com/napcs/node-livereload}
 *
 * @typedef {Object} ServerConfig
 * @property {Number} port - defines the server port (default: 8181)
 * @property {Boolean} livereload - indicates whether to support livereload from `outDir` files (default: true)
 */

/**
 * MockConfig powered by json-server node package
 * @see [json-server]{@link https://github.com/typicode/json-server}
 *
 * @typedef {Object} MockConfig
 * @property {Number} port - defines the mock server port (default: 8282)
 * @property {Number} delayInMs - add delay to server responses (default: 1000)
 * @property {String} route - initial path for routes (default: /mocks/api)
 * @property {String} file - routes and data config for json-serve (default: ./db.json)
 */

/**
 * ZeevConfig the configuration file
 *
 * @typedef {Object} ZeevConfig
 * @property {String} outDir - specify the output directory of source files on `src` propertie
 * @property {ConnectionConfig} connection - extends mssql connection configuration
 * @property {WatchConfig} watch - extends chokidar configuration used on watchers
 * @property {EnvConfig} env - extends dotenv-flow configuration
 * @property {ServerConfig} server - enables static server hosting and livereload
 * @property {MockConfig} mocks - enables mock server by json-server
 */

/**
 * @type {ConnectionConfig}
 */
const defaultConnectionConfig = {
  port: 1433,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
}

/**
 * @type {WatchConfig}
 */
const defaultWatchConfig = {
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 150
  }
}

/**
 * @type {EnvConfig}
 */
 const defaultEnvConfig = {
  path: './config',
  envPrefix: 'ZEEV_'
}

/**
 * @type {ServerConfig}
 */
 const defaultServerConfig = {
  port: 8181,
  livereload: true
}

/**
 * @type {MockConfig}
 */
 const defaultMockConfig = {
  port: 8282,
  delayInMs: 1000,
  route: '/mocks/api',
  file: './mocks/db.json'
}

/**
 * @type {ZeevConfig}
 */
export const DEFAULT_CONFIG = {
  outDir: './dist',
  explicitMocks: false,
  connection: defaultConnectionConfig,
  watch: defaultWatchConfig,
  env: defaultEnvConfig,
  server: defaultServerConfig,
  mocks: defaultMockConfig
}

/**
 * Parses all prefixed environment variables from `.env` files
 * @param {String} envPrefix - prefix of env variables injected on javascript build step
 * @returns {Object} bundle variables
 */
function parseBundleVariables (envPrefix) {
  return Object.entries(process.env)
    .reduce((variables, [key, value]) => {
      if (!key.includes(envPrefix)) return variables
      return {
        ...variables,
        [`process.env.${key}`]: JSON.stringify(value)
      }
    }, {})
}

/**
 * Loads the projects local configuration options
 * @param {String} localConfigPath - config file path on the project directory
 * @returns {ZeevConfig}
 */
async function loadConfigFile (localConfigPath) {
  const configFile = localConfigPath || CONFIG_FILENAME
  const configFilePath = path.resolve(process.cwd(), configFile)
  const configExists = fs.existsSync(configFilePath)

  if (localConfigPath && !configExists) {
    const warn = `Can't start Zeev Run. The config file at [output] wasn't found.`
    const help = '💁 You can try zero-config without --config parameter and any file or create the specified file.'
    const docs = `For more info visit the docs: [link]`

    logger(`${warn}\n\n   ${help}\n   ${docs}\n`, {
      output: configFile,
      level: 'warn',
      script: 'config',
      link: 'https://github.com/pedbernardo/zeev-run'
    })
    process.exit()
  }

  if (!configExists) return

  const config = await import(`file://${configFilePath}`)

  return config?.default
}

/**
 * Inject `process.env` variables to global scope
 * @param {String} defaultPath - default path for env files
 * @param {String} configPath - project config path for env files
 */
function loadEnvVariables (defaultPath, configPath) {
  dotenv.config({ path: configPath ?? defaultPath })
}

/**
 * Creates the final configuration object
 * @param {ZeevConfig} localConfig - project config options
 * @returns {ZeevConfig}
 */
 export function createConfig (localConfig) {
  const config = merge(
    cloneDeep(DEFAULT_CONFIG),
    (localConfig ?? {})
  )

  const hasRootSrc = config?.src?.form || config?.src?.js || config?.src?.css

  if (hasRootSrc) {
    config.src.__root__ = {}
    config?.src?.js && (config.src.__root__.js = config.src.js) && (delete config.src.js)
    config?.src?.css && (config.src.__root__.css = config.src.css) && (delete config.src.css)
    config?.src?.form && (config.src.__root__.form = config.src.form) && (delete config.src.form)
  }

  if (localConfig?.mocks) {
    config.explicitMocks = true
  }

  config.connection.database = process.env.DATABASE_NAME
  config.connection.user = process.env.DATABASE_USERNAME
  config.connection.password = process.env.DATABASE_PASSWORD
  config.connection.server = process.env.DATABASE_SERVER

  config.env.bundleVariables = parseBundleVariables(config.env.envPrefix)

  return config
}

/**
 * Returns the final configuration object, setting env references
 * and merging default and local configurations
 * @param {String} localConfigPath - locals project config file path
 * @returns {ZeevConfig} full configuration object
 */
export async function resolveConfig (localConfigPath) {
  const localConfig = await loadConfigFile(localConfigPath)

  loadEnvVariables(
    DEFAULT_CONFIG.env.path,
    localConfig?.env?.path
  )

  return createConfig(localConfig)
}

/**
 * Finds the artifact configuration from the changed file
 * @param {String} artifact - config artifact (enum: js|css|form)
 * @param {String} filepath - path of the changed file
 * @param {ZeevConfig} config - project config options
 * @returns {Object[]|Object} - artifact config options
 */
export function resolveSourceConfig (artifact, { filepath, config }) {
  const paths = filepath.split('\\')
  const pathsDeepness = paths.length
  const projectFolder = paths[1]
  const { name, ext } = path.parse(filepath)

  const filenamePatterns = [
    ...ROOT_FILENAMES.common,
    ...ROOT_FILENAMES[ext]
  ]

  // src/{path-pattern}/{file}
  // src/{file}
  const isRootPath = Object.values(ROOT_PROJECT_PATHS)
    .includes(projectFolder) || pathsDeepness === 2

  // src/{name-pattern}
  // src/{js|styles|form}/{name-pattern}
  const isRootFile =
    filenamePatterns.includes(name) &&
    pathsDeepness <= 3 &&
    (pathsDeepness > 2 ? ROOT_PROJECT_PATHS[ext] === projectFolder : true)

  // when no config.src wasn't provided and the modified file
  // doesn't comply with zero-config filename patterns
  if ((!isRootFile || !isRootPath) && !config.src) return

  const currentConfigKey = isRootPath ? '__root__' : projectFolder
  const currentConfig = (config.src ?? {})[currentConfigKey]

  // zero-config support, when no configuration is declared
  // in `config.src` for the modified file or even no
  // `config.src` is provided at all
  if (isRootFile && !(currentConfig ?? {})[artifact]) {
    return {
      entry: filepath,
      output: `${name}${pathsDeepness > 2 ? '--' : '-'}bundle${ext === '.scss' ? '.css' : ext}`
    }
  }

  // when the modified file doesn't match any project nor root
  // falls back to rebuild every current artifact type entry
  if (!currentConfig && config.src) {
    return Object.values(config.src)
      .filter(resources => !!resources[artifact])
      .map(resources => resources[artifact])
      .flat()
  }

  return currentConfig[artifact]
}

/**
 * Enables intellisense when declaring a configuration file
 * @param {ZeevConfig} config - local configuration object
 * @returns {ZeevConfig}
 */
export function defineConfig (config) {
  return config
}
