#!/usr/bin/env node
import { Command } from "commander";
import { generateCommand } from "./commands/generate.js";
import { coverageCommand } from "./commands/coverage.js";
import { doctestCommand } from "./commands/doctest.js";

const program = new Command()
  .name("oxdoc")
  .description("Native-speed TypeScript/JavaScript API documentation generator")
  .version("0.1.0");

program.addCommand(generateCommand);
program.addCommand(coverageCommand);
program.addCommand(doctestCommand);

program.parse();
