// App logic.
window.RunningMan = {};

document.addEventListener('init', function init(event) {
  var page = event.target;
  console.log(page.id);

  // Each page calls its own initialization controller.
  if (RunningMan.controllers.hasOwnProperty(page.id)) {
    RunningMan.controllers[page.id](page);
  }
});
