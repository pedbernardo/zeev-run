#!/usr/bin/env node
import { startBuildCommand } from '../lib/index.js'
import { Command } from 'commander'

const ZeevBuild = new Command()
  .parse(process.argv)

const configFile = ZeevBuild.args[0]

startBuildCommand(configFile)
