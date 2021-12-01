import { readFile } from "fs/promises";
import path from "path";
import chalk from "chalk";
import {
  ConfigObjectType,
  isDevelopment,
  currentExecPath,
} from "@autodocument/shared";

type PartialConfigObjectType = Partial<ConfigObjectType>;

const getConfigFile = async () => {
  const configFilePath = path.resolve(currentExecPath, "autoDoc.config.json");
  const configObjectJson = await readFile(configFilePath, "utf8").catch((e) => {
    console.log(chalk.red("[Failed to read configuration file]"), e);
  });
  if (!configObjectJson) {
    return;
  }
  try {
    const configObject: PartialConfigObjectType = JSON.parse(configObjectJson);
    return configObject;
  } catch (e) {
    console.log(chalk.red("[Failed to parse json]"), e);
  }
};

const validateConfigFile = (configObject: PartialConfigObjectType) => {
  const { parser, write } = configObject;
  let validate = true;

  if (!parser) {
    validate = false;
    // console.log(chalk.red(""), "/n"); //TODO:error message
  }
  if (!write) {
    validate = false;
    // console.log(chalk.red(""), "/n"); //TODO:error message
  }

  if (!parser?.entry) {
    validate = false;
    // console.log(chalk.red(""), "/n"); //TODO:error message
  }

  if (!parser?.plugin) {
    validate = false;
    // console.log(chalk.red(""), "/n"); //TODO:error message
  }

  if (!write?.end) {
    validate = false;
    // console.log(chalk.red(""), "/n"); //TODO:error message
  }

  if (!write?.plugin) {
    validate = false;
    // console.log(chalk.red(""), "/n"); //TODO:error message
  }

  !validate &&
    console.log(
      chalk.red(
        "[Configuration item verification failed, please check the configuration file]"
      )
    );

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

  try {
    const parserPlugin = require(configObject?.parser
      ?.plugin as string).default;

    const parserResult = await parserPlugin?.(
      configObject?.parser,
      configObject
    );

    isDevelopment && console.log("[ParserResult]:", parserResult);

    const writePlugin = require(configObject?.write?.plugin as string).default;

    writePlugin?.(configObject?.write, configObject, parserResult);

    console.log(chalk.green("File written successfully"));
  } catch (e) {
    console.log(
      chalk.red(
        "[An error occurred during the parsing process, please check whether the plug-in is installed and correctly configured]"
      ),
      e
    );
  }
};

main();
