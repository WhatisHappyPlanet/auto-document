export interface HandlePathOptionsType{
  currentExecPath:string;
  directoryToFilePath?:boolean; // '/path/directory' => '/path/directory/index.[ts,tsx,js,jsx]'
}

