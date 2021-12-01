import path from "path";
import doctrine from "doctrine";
import fsPromise from "fs/promises";
import { HandlePathOptionsType } from "../index";

export const isDevelopment = process.env.NODE_ENV === "development";

export const currentExecPath = isDevelopment
  ? path.resolve(process.cwd(), "../../examples/parser-tsInterface")
  : process.cwd();

export const DEV_CONFIG_FILE =
  "../../examples/parser-tsInterface/autoDoc.config.json";

export const allowFileExtensions = ["ts", "tsx", "js", "jsx"];

export const parseComment = (commentStr: string) => {
  if (!commentStr) {
    return "";
  }
  return doctrine.parse(commentStr, {
    unwrap: true,
  });
};

export const getIsValidPath = async (filePath: string) => {
  const isValid = await fsPromise
    .access(filePath)
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });

  return isValid;
};

export const filePathAddExtension = async (filePath: string) => {
  let flag = false,
    result = filePath;
  for (const extension of allowFileExtensions) {
    const isValidPath = await getIsValidPath(`${filePath}.${extension}`);
    if (isValidPath) {
      flag = true;
      result = `${filePath}.${extension}`;
      break;
    }
  }
  return flag ? result : Promise.reject();
};

export const getIsDirectory = async (filePath: string) => {
  try {
    const isDirectory = await fsPromise.stat(filePath).then((stat) => {
      return stat.isDirectory();
    });
    return isDirectory;
  } catch (e) {
    return Promise.reject();
  }
};

export const handlePath = async (
  filePath: string,
  options: HandlePathOptionsType
) => {
  const { currentExecPath, directoryToFilePath = false } = options;

  let absoluteFilepath = filePath;

  const parseResult = path.parse(filePath);
  absoluteFilepath =
    parseResult.root !== "/"
      ? path.resolve(currentExecPath, filePath)
      : absoluteFilepath;

  const isValidPath = await getIsValidPath(filePath);
  if (!isValidPath) {
    try {
      absoluteFilepath = await filePathAddExtension(absoluteFilepath);
      return absoluteFilepath;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  try {
    const isDirectory = await getIsDirectory(absoluteFilepath);
    if (isDirectory && directoryToFilePath) {
      absoluteFilepath = await filePathAddExtension(
        `${absoluteFilepath}/index`
      );
      return absoluteFilepath;
    }
  } catch (e) {
    return Promise.reject(e);
  }
  return absoluteFilepath;
};
