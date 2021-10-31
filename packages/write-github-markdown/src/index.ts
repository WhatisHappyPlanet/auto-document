import chalk from "chalk";
import path from "path";
import { readFile, writeFile } from "fs/promises";
import { tableHead, allowFileExtensions } from "./constants";
import { handlePath } from "./utils";
import {
  PluginType,
  ConfigObjectType,
  ParserResultType,
  currentExecPath,
} from "@autodocument/shared";

const write = async (
  writePlugin: PluginType,
  parserResults: Array<ParserResultType>,
  configObject: ConfigObjectType
) => {
  const { options } = writePlugin;
  const { componentNames, documents } = parserResults[0];
  let docText = "";
  if (options?.headerContent) {
    const headerContent = await readFile(
      path.resolve(currentExecPath, options.headerContent),
      "utf8"
    ).catch((e) => {
      console.log(chalk.red("error"), e); // TODO: error message
    });

    docText = `${headerContent || ""}\n`;
  }
  docText += "# Components\n";

  componentNames.forEach((componentName, index) => {
    if (componentName) {
      docText += `<a href="#doc${index}"><font size=2 color=#00f>${
        index + 1
      }.${componentName}</font></a>\n\n`;
    }
  });

  componentNames.forEach((componentName, index) => {
    const document = documents[index];
    if (componentName) {
      docText += `## <a id="doc${index}">${index + 1}.${componentName}</a>\n`;
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
      console.log(chalk.red("error")); // TODO: error message
    });

    docText += `\n${footerContent || ""}\n`;
  }

  const handleEndPath = await handlePath(configObject?.write?.end || "", {
    currentExecPath,
    directoryToFilePath: true,
  }).catch((e) => {
    console.log(chalk.red("error")); //TODO: error message
  });

  if (!handleEndPath) {
    return;
  }

  try {
    await writeFile(handleEndPath, docText);
  } catch (e) {
    console.log(chalk.red("write readme file error")); // TODO: error message
    return Promise.reject();
  }
};

export default write;
