# MVC Framework Demonstration

- [Core Dependencies](#core-dependencies)
- [Installation](#installation)
- [Command Line Interface](#command-line-interface)
- [Project Architecture](#project-architecture)

## Core Dependencies
### Production
- [MVC Framework](https://gitlab.com/thomas.welborn/mvc-framework)

### Development
- [Babel](https://babeljs.io/)
- [Rollup](https://rollupjs.org/)
- [Node SASS](https://www.npmjs.com/package/node-sass)
- [EJS](https://www.npmjs.com/package/node-sass)

## Installation
1. Clone or download [mvc-framework-demonstration](https://github.com/thomaswelborn/mvc-framework-demonstration) to folder system. 

2. Navigate to the cloned project root folder.  

3. Install `package.json`. 
```
npm install
```

4. Start project development environment. 
```
npm run start
```

5. Open a browser and point to the `localhost`.  
```
https://localhost:9000
```

## Command Line Interface
Run NPM scripts that transpile scripts, pre-process styles, compile markup templates, and launch a localhost file server. 

### Start
Concurrently run `scripts`, `styles`, `documents`, and `server` processes.  
```
npm run start
```

### Scripts
Run the `rollup` command, consuming a Rollup configuration object then monitoring script folders for changes.  
```
npm run scripts
```

### Styles
Run Node SASS, consuming a custom configuration object then monitoring style folders for changes.  
```
npm run styles
```

### Documents
Run EJS, consuming a custom configuration object then monitoring document folders for changes.  
```
npm run documents
```

### Server
Run the `browser-sync` command, consuming a BrowserSync configuration object then monitoring `localhost` output folders for changes.  
```
npm run server
```

## Project Architecture
```
+ mvc-framework-demonstration
  - /processes
  + /documents
    - /data
    - /templates
  + /ui
    - /library
    - /modules
    - /utilities
  - /localhost
```
### Processes
Node script and configuration files spawn processes from command line interface to transpile scripts, pre-process styles, compile markup templates, and launch a localhost file server. Processes are generated from the `/generator` folder using the `generate` and `generate:file` commands prior to authoring content.  

### Documents
#### Data
Folder/File system of data configuration objects that compile into documents. Each document configuration object defines a `template`, `destination`, and `data` properties that compile into HTML documents.  

#### Templates
Folder/File system of EJS template layouts/partials that compile into HTML documents from datajj configuration objects.  

### UI
#### Library
Reusable modules used throughout the application.  

#### Modules
Modules used throughout the application. Modules implement Library classes. A module may represent the application, sections of the application, or components of sections.  

#### Utilities
Script and style files used throughout the application. This includes data models that interface with the API, and base extensions of MVC Framework. 

### Localhost
Output folder where document, script, and style files are output and served to a client browser.  

## UI Architecture
### Module Structure
Most modules follow a similar structure with a single controller and one or more models/views/templates/styles associated with the module controller.  
```
+ Module
  - Controller
  - Models
  - Views
  - Templates
  - Styles
```

### Router
The MVC Router is configured for response to window location hash changes which trigger associated modules to render inside the application.  
```
Index: `/`
Login: `/account/login`
Logout: `/account/logout`
Profile: `/account/profile`
Photos: `/photos`
Photo: `/photos/:photo`
Upload: `/upload`
```

### Router Modules, Library Classes
```
+ Application
  - Toggle Navigation
  + Index
    - Select Navigation
    + Media Item
      - Image
      - Navigation
  + Login
  + Logout
  + Profile
  + Photos
    - Select Navigation
    - Media Grid
  + Photo
    - Navigation
    + Media Item
      - Image
      - Navigation
  + Upload
```
