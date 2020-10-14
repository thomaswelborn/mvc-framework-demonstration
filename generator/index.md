# Generator
Generate web project files from a command line using a template engine.  

## Development Dependencies
- EJS
- Globby
- Beautify
- Yargs
- Node Prompt
- Diff

## Configuration
```
{
  _id: String(),
  template: String(),
  type: String()
  destination: String(),
  overwrite: Boolean(),
  merge: Boolean(),
  data: Object(),
}
```

### Properties
#### ID
Unique ID. 

#### Template
File path to 

#### Destination

#### Overwrite

#### Merge

#### Data

## Command Line Interface

### Generate
- Create all files defined in Data folders.  
- Monitor Data and Template folders, then re-generate files when edits occur.  

#### NPM
```
npm run generate
```

#### Node
```
node ./generator
```



### Generate Files
Create a file (or files) from data in a specified directory.  

#### NPM
``
npm run generate:files ./data/path/to/file/configuration
``
#### Node
```
node ./generator --files  ./data/path/to/file/configuration
```

