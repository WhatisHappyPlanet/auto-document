import { readFile } from "fs/promises";
import path from "path";
import chalk from "chalk";
import {
  ConfigObjectType,
  isDevelopment,
  currentExecPath,
  DEV_CONFIG_FILE,
} from "@autodocument/shared";

isDevelopment && console.log("[Environment]:Dev");

type PartialConfigObjectType = Partial<ConfigObjectType>;

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
  try {
    const configObject: PartialConfigObjectType = JSON.parse(configObjectJson);
    return configObject;
  } catch (e) {
    console.log(chalk.red("is not json"), e); // TODO: error message
  }
};

const validateConfigFile = (configObject: PartialConfigObjectType) => {
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

  if (!parser?.entry) {
    validate = false;
    console.log(chalk.red(""), "/n"); //TODO:error message
  }

  if (!parser?.plugin) {
    validate = false;
    console.log(chalk.red(""), "/n"); //TODO:error message
  }

  if (!write?.end) {
    validate = false;
    console.log(chalk.red(""), "/n"); //TODO:error message
  }

  if (!write?.plugin) {
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
  } catch (e) {
    console.log(chalk.red("some error!!!"), e); //TODO: error message
  }
};

main();
