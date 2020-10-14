# MVC Framework Demonstration | Application

## Models
### Application
```
{
  apiKey: String(),
}
```

### User
```
{
  sub_id: String(),
}
```

### Category
```
{
  id: Number(),
  name: String(),
}
```

### Breed
```
{
  name: String(),
  description: String(),
  url: String(),
}
```

### Photo
```
{
  id: String(),
  sub_id: String(),
  url: String(),
  categories: Array(),
  breeds: Array(),
}
```

## Routes
```
{
  '/': controller.index,
  '/account/login': controller.login,
  '/account/profile': controller.profile,
  '/photos': controller.photos,
  '/photos/:photo': controller.photo,
  '/favorites': controller.favorites,
  '/favorites/:photo': controller.favorite,
  '/votes': controller.votes,
  '/votes/:photo': controller.vote,
  '/photos/upload': controller.upload,
}
```
