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

document.addEventListener('show', function init(event) {
  var page = event.target;
  console.log(page.id + '.show');

  // Each page calls its own showing controller.
  if (RunningMan.controllers.hasOwnProperty(page.id + '.show')) {
    RunningMan.controllers[page.id + '.show'](page);
  }
});

document.addEventListener('destroy', function init(event) {
  var page = event.target;
  console.log(page.id + '.destroy');

  // Each page calls its own showing controller.
  if (RunningMan.controllers.hasOwnProperty(page.id + '.destroy')) {
    RunningMan.controllers[page.id + '.destroy']();
  }
});
