interface pluginType{
  plugin:string,
  options:{
    [key:string]:any
  }
}
type pluginsType = Array<pluginType> | undefined;

interface configObjectType{
  parser:{
    entry:string | undefined,
    plugins:pluginsType
  },
  write:{
    end:string | undefined,
    plugins:pluginsType
  }
}

interface parserResultType{
  componentNames:string[],
  documents:Array<string[]>
}
