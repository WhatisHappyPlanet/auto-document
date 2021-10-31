import { readFile } from "fs/promises";
import path from "path";
import chalk from "chalk";
import {
  ConfigObjectType,
  isDevelopment,
  currentExecPath,
  DEV_CONFIG_FILE,
} from "@autodocument/shared";

console.log("[isDevelopment]", isDevelopment);

const getConfigFile = async () => {
  const configFilePath = path.resolve(
    currentExecPath,
    isDevelopment ? DEV_CONFIG_FILE : "./autoDoc.config.json"
  );
  const configObjectJson = await readFile(configFilePath, "utf8").catch((e) => {
    console.log(chalk.red("error"), e); //TODO: error message
  });
  if (!configObjectJson) {
    return;
  }
  const configObject: ConfigObjectType = JSON.parse(configObjectJson);
  return configObject;
};

const validateConfigFile = (configObject: ConfigObjectType) => {
  const { parser, write } = configObject;
  let validate = true;

  if (!parser) {
    validate = false;
    console.log(chalk.red(""), "/n"); //TODO:error message
  }
  if (!write) {
    validate = false;
    console.log(chalk.red(""), "/n"); //TODO:error message
  }

  if (!parser.entry) {
    validate = false;
    console.log(chalk.red(""), "/n"); //TODO:error message
  }

  if (!Array.isArray(parser.plugins) || parser.plugins.length <= 0) {
    validate = false;
    console.log(chalk.red(""), "/n"); //TODO:error message
  }

  if (!write.end) {
    validate = false;
    console.log(chalk.red(""), "/n"); //TODO:error message
  }

  if (!Array.isArray(write.plugins) || write.plugins.length <= 0) {
    validate = false;
    console.log(chalk.red(""), "/n"); //TODO:error message
  }

  return validate;
};

const main = async () => {
  const configObject = await getConfigFile();
  if (!configObject) {
    return;
  }

  const validateResult = validateConfigFile(configObject);
  if (!validateResult) {
    return;
  }

  const parserPlugins = configObject.parser.plugins || [];

  const parserResults = await Promise.all(
    parserPlugins.map(async (parserPlugin) => {
      const plugin = require(parserPlugin.plugin).default;
      return plugin(parserPlugin, configObject);
    })
  );

  const writePlugins = configObject.write.plugins || [];

  Promise.all(
    writePlugins.map(async (writePlugin) => {
      const plugin = require(writePlugin.plugin).default;
      return plugin(writePlugin, parserResults, configObject);
    })
  );
};

main();
