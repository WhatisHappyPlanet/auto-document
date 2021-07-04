type pluginsType = Array<{
  plugin:string,
  options:{
    [key:string]:any
  }
}> | undefined;

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
