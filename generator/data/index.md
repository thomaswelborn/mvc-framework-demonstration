# Generator | Data

## Architecture
### Folders
Base folders represent system folders: 
- Processes
- Services
- UI

### Data
```
{
  _id: String(),
  template: String(),
  destination: String(),
  overwrite: Boolean(),
  merge: Boolean(),
  data: Object(),
}
```

**_id**  
Unique `String` in the format `folder-subfolder-className`.  

**template**  
`String` folder path to template used for rendering file.  

**destination**  
`String` folder path to output of rendered file.  

**overwrite**  
`Boolean` indicating whether file should be overwritten.  

**merge**  
`Boolean` indicating whether file should be merged with existing.  

**data**  
`Object` with properties that populate template.  

