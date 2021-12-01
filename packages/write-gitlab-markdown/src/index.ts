import chalk from "chalk";
import path from "path";
import { readFile, writeFile } from "fs/promises";
import { tableHead, allowFileExtensions } from "./constants";
import { handlePath } from "./utils";
import {
  ConfigObjectType,
  ParserResultType,
  currentExecPath,
} from "@autodocument/shared";

const TABLE_OF_CONTENT = "[[_TOC_]]"; // gitlab content list

const write = async (
  writePlugin: ConfigObjectType["write"],
  configObject: ConfigObjectType,
  parserResult: ParserResultType
) => {
  const { options } = writePlugin;
  const { componentNames, documents } = parserResult;
  let docText = `${TABLE_OF_CONTENT}\n`;
  if (options?.headerContent) {
    const headerContent = await readFile(
      path.resolve(currentExecPath, options.headerContent),
      "utf8"
    ).catch((e) => {
      console.log(chalk.red("[failed to get the header markdown content]"), e);
    });

    docText += `${headerContent || ""}\n`;
  }
  docText += "## Components\n";

  componentNames.forEach((componentName, index) => {
    const document = documents[index];
    if (componentName) {
      docText += `### ${componentName}\n`;
      docText += tableHead;
      document.forEach((item) => {
        docText += `| ${item[0]} | ${item[1]} |\n`;
      });
    }
  });

  if (options?.footerContent) {
    const footerContent = await readFile(
      path.resolve(currentExecPath, options.footerContent),
      "utf8"
    ).catch((e) => {
      console.log(chalk.red("[failed to get the footer markdown content]"), e);
    });

    docText += `\n${footerContent || ""}\n`;
  }

  const handleEndPath = await handlePath(configObject?.write?.end || "", {
    currentExecPath,
    directoryToFilePath: true,
  }).catch((e) => {
    console.log(
      chalk.red(
        "[The end file path cannot be processed correctly, please check]"
      ),
      e
    );
  });

  if (!handleEndPath) {
    return;
  }

  try {
    await writeFile(handleEndPath, docText);
  } catch (e) {
    console.log(chalk.red("[Failed to write document]"));
    return Promise.reject();
  }
};

export default write;
