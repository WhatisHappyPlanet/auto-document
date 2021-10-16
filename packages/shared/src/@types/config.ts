export interface PluginType{
  plugin:string,
  options:{
    [key:string]:any
  }
}

export type PluginsType = Array<PluginType> | undefined;

export interface ConfigObjectType{
  parser:{
    entry:string | undefined,
    plugins:PluginsType
  },
  write:{
    end:string | undefined,
    plugins:PluginsType
  }
}

export interface ParserResultType{
  componentNames:string[],
  documents:Array<string[]>
}
