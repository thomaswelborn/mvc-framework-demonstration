export default (controller) => {
  return (
    (controller.models.ui.get('auth') && controller.models.user.get('isAuthenticated')) ||
    (controller.models.ui.get('noAuth') && !controller.models.user.get('isAuthenticated'))
  )
}