export interface ConfigObjectType {
  parser: {
    entry: string;
    plugin: string;
    options?: {
      [key: string]: any;
    };
  };
  write: {
    end: string;
    plugin: string;
    options?: {
      [key: string]: any;
    };
  };
}

export interface ParserResultType {
  componentNames: string[];
  documents: Array<string[]>;
}
