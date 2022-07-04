import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG, createConfig, resolveSourceConfig, resolveCodformConfig, defineConfig } from '../config.mjs'

describe('defineConfig', () => {
  /**
   * It's only used for exposes intellisense autocompletion
   */
  it('should return config without any changes', () => {
    const rawConfig = { anyKey: 'anyValue' }
    const config = defineConfig(rawConfig)

    expect(config).toStrictEqual(rawConfig)
  })
})

describe('createConfig', () => {
  it('should add default properties and private fields when empty object', () => {
    const config = createConfig({})

    const privateConnectionConfig = {
      database: undefined,
      user: undefined,
      password: undefined,
      server: undefined
    }

    const privateEnvConfig = {
      bundleVariables: {}
    }

    DEFAULT_CONFIG.connection = {
      ...DEFAULT_CONFIG.connection,
      ...privateConnectionConfig
    }

    DEFAULT_CONFIG.env = {
      ...DEFAULT_CONFIG.env,
      ...privateEnvConfig
    }

    expect(config).toStrictEqual(DEFAULT_CONFIG)
  })

  it('should add __root__ propertie when using artifacts config directly inside src propertie', () => {
    const rawConfig = {
      src: {
        css: {
          input: 'src/style.css',
          output: 'style-bundle.css'
        }
      }
    }
    const config = createConfig(rawConfig)

    expect(config.src.__root__).toStrictEqual(rawConfig.src)
  })

  it('should override default configs', () => {
    const outDir = 'public'
    const config = createConfig({ outDir })

    expect(config.outDir).toBe(outDir)
  })

  it('should override deep default configs', () => {
    const serverConfig = {
      port: 7171,
      livereload: false
    }
    const config = createConfig({ server: serverConfig })

    expect(config.server).toStrictEqual(serverConfig)
  })
})

describe('resolveSourceConfig', () => {
  it('should return undefined when `config.src` is not provided and is not a root file pattern', () => {
    const config = createConfig()
    const filepath = 'src\\non-pattern-name.js'
    const srcConfig = resolveSourceConfig('js', { filepath, config })

    expect(srcConfig).toBeUndefined()
  })

  it('should return undefined when `config.src` is not provided and is not a two level deep from src', () => {
    const config = createConfig()
    const filepath = 'src\\js\\unallowed-folder\\index.js'
    const srcConfig = resolveSourceConfig('js', { filepath, config })

    expect(srcConfig).toBeUndefined()
  })

  it('should return undefined when `config.src` is not provided and is not from nor respect zero-config folder pattern (/js, /styles, /form)', () => {
    const config = createConfig()
    const filepath = 'src\\non-pattern-folder\\index.js'
    const srcConfig = resolveSourceConfig('js', { filepath, config })

    expect(srcConfig).toBeUndefined()
  })

  it('should return undefined when `config.src` is not provided and project folder does not comply with file extension', () => {
    const config = createConfig()

    /**
     * javascript files with non config.src should be at root or in `js` folder
     * @see {@link ROOT_PROJECT_PATHS} for supported folder name patterns by file extensions
     */
    const filepath = 'src\\styles\\app.js'
    const srcConfig = resolveSourceConfig('js', { filepath, config })

    expect(srcConfig).toBeUndefined()
  })

  /**
   * Zero Config Support
   * When no zeev-config.js is included or no `src` propertie is provided,
   * file name patterns and folder patterns can be used to get automatically
   * configuration for entry/output `src` artifact (js|scss|html) bundles
   *
   * @see {@link ROOT_FILENAMES} for supported filename patterns
   * @see {@link ROOT_PROJECT_PATHS} for supported folder name patterns by file extensions
   */
  it('should return auto-config when `config.src` is not provided and filename pattern is respected', () => {
    const config = createConfig()
    const filename = 'index'
    const filepath = 'src\\index.js'
    const srcConfig = resolveSourceConfig('js', { filepath, config })

    expect(srcConfig).toStrictEqual({
      entry: filepath,
      output: `${filename}-bundle.js`
    })
  })

  it('[js] should return auto-config when `config.src` is not provided and folder and filename pattern is respected', () => {
    const config = createConfig()
    const filename = 'app'
    const filepath = 'src\\js\\app.js'
    const srcConfig = resolveSourceConfig('js', { filepath, config })

    expect(srcConfig).toStrictEqual({
      entry: filepath,
      output: `${filename}--bundle.js`
    })
  })

  it('[css] should return auto-config when `config.src` is not provided and folder and filename pattern is respected', () => {
    const config = createConfig()
    const filename = 'app'
    const filepath = 'src\\styles\\app.scss'
    const srcConfig = resolveSourceConfig('css', { filepath, config })

    expect(srcConfig).toStrictEqual({
      entry: filepath,
      output: `${filename}--bundle.css`
    })
  })

  it('[html] should return auto-config when `config.src` is not provided and folder and filename pattern is respected', () => {
    const config = createConfig()
    const filename = 'app'
    const filepath = 'src\\form\\app.html'
    const srcConfig = resolveSourceConfig('form', { filepath, config })

    expect(srcConfig).toStrictEqual({
      entry: filepath,
      output: `${filename}--bundle.html`
    })
  })

  /**
   * Root Config Support
   * `src` propertie can be used directly, without a project folder name propertie,
   * especially useful for standalone process projects or smaller projects
   */
  it('should return root config when `config.src` is used directly to project artifacts folders', () => {
    const config = createConfig({
      src: {
        js: {
          entry: 'src/js/main.js',
          output: 'bundle.js'
        }
      }
    })

    const filepath = 'src\\js\\main.js'
    const srcConfig = resolveSourceConfig('js', { filepath, config })

    expect(srcConfig).toStrictEqual(config.src.__root__.js)
  })

  it('should return root config when `config.src` is used directly to project artifacts files', () => {
    const config = createConfig({
      src: {
        js: {
          entry: 'src/whatever.js',
          output: 'whatever-bundled.js'
        }
      }
    })

    const filepath = 'src\\whatever.js'
    const srcConfig = resolveSourceConfig('js', { filepath, config })

    expect(srcConfig).toStrictEqual(config.src.__root__.js)
  })

  /**
   * Fall back to bundle all files
   * When the modified file does not match any project, root or pattern, bundle
   * falls back to run in all related entry files by the modified file extension
   *
   * Used to trigger bundles when modifying files outside root and projects folder,
   * useful for common shared files between projects
   */
  it('should return root config when `config.src` is used directly to project artifacts files', () => {
    const config = createConfig({
      src: {
        js: [{
          entry: 'src/js/app.js',
          output: 'app-bundle.js'
        }, {
          entry: 'src/js/report.js',
          output: 'report-bundle.js'
        }],
        'any-project': {
          js: {
            entry: 'src/project-any/js/app.js',
            output: 'app-bundle.js'
          }
        }
      }
    })

    const filepath = 'src\\common\\js\\my-shared-file.js'
    const srcConfig = resolveSourceConfig('js', { filepath, config })

    expect(srcConfig).toStrictEqual([
      config.src['any-project'].js,
      config.src.__root__.js
    ].flat())
  })

  /**
   * Project Config
   * Useful for multi process projects or more granular bundles divisions
   */
  it('should return project config even when `config.src` has root config too', () => {
    const config = createConfig({
      src: {
        js: [{
          entry: 'src/js/app.js',
          output: 'app-bundle.js'
        }, {
          entry: 'src/js/report.js',
          output: 'report-bundle.js'
        }],
        'any-project': {
          js: {
            entry: 'src/project-any/js/app.js',
            output: 'app-bundle.js'
          }
        }
      }
    })

    const filepath = 'src\\any-project\\js\\app.js'
    const srcConfig = resolveSourceConfig('js', { filepath, config })

    expect(srcConfig).toStrictEqual(config.src['any-project'].js)
  })
})

describe('resolveCodformConfig', () => {
  it('should return undefined when `codform` is not provided', () => {
    const codform = resolveCodformConfig()

    expect(codform).toBeUndefined()
  })

  it('should return undefined when `codform` is a string', () => {
    const codform = resolveCodformConfig('100')

    expect(codform).toBeUndefined()
  })

  it('should return the actual `codform` when is a number', () => {
    const rawCodform = 100
    const codform = resolveCodformConfig(rawCodform)

    expect(codform).toBe(rawCodform)
  })

  it('should return the correct environment codform when it is an object with complete environment names on keys', () => {
    const rawCodform = {
      production: 100,
      test: 101,
      development: 102
    }

    const env = 'production'
    const codform = resolveCodformConfig(rawCodform, env)

    expect(codform).toBe(rawCodform[env])
  })

  it('should return the correct environment codform when it is an object with environment initials on keys', () => {
    const rawCodform = {
      prd: 100,
      qa: 101,
      dev: 102
    }

    const env = 'qa'
    const codform = resolveCodformConfig(rawCodform, env)

    expect(codform).toBe(rawCodform[env])
  })
})
