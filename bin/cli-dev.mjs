#!/usr/bin/env node
import { startDevCommand } from '../lib/index.mjs'
import { Command } from 'commander'

const ZeevDev = new Command()
  .parse(process.argv)

const configFile = ZeevDev.args[0]

startDevCommand(configFile)
