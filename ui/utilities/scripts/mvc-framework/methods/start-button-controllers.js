export default (settings, controllers, ButtonController) => {
  return controllers.reduce((_controllers, controller, controllerIndex) => {
    _controllers[`button-${controllerIndex}`] = new ButtonController({
      models: {
        user: settings.models.user,
      },
    }, controller).start()
    return _controllers
  }, {})
}
