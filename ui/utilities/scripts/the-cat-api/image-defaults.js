import CategoryDefaults from './category-defaults'
import BreedDefaults from './breed-defaults'

export default {
  id: String(),
  url: String(),
  width: Number(),
  height: Number(),
  categories: Array(CategoryDefaults),
  sub_id: String(),
  breeds: Array(BreedDefaults),
}