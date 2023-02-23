#!/usr/bin/env node
import { Command } from 'commander'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pkg = require('../package.json')

const ZeevCli = new Command()

ZeevCli
  .version(pkg.version)
  .description('Zeev Run, your Zeev CLI for faster projects')
  .option('-c, --config', 'specify the config file, defaults to zeev-config.js')
  .command('create', 'start a new project')
  .command('dev', 'starts a development server and watchers', { isDefault: true })
  .alias('serve')
  .command('build', 'create build files for production')
  .parse(process.argv)
