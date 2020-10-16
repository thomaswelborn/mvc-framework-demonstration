import CategoryDefaults from './category-defaults'
import BreedDefaults from './breed-defaults'

export default {
  id: String(),
  url: String(),
  categories: Array(CategoryDefaults),
  breeds: Array(BreedDefaults),
}