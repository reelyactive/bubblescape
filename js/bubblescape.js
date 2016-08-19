/**
 * Copyright reelyActive 2016
 * We believe in an open Internet of Things
 */


// Constant definitions
DEFAULT_SOCKET_URL = 'http://www.hyperlocalcontext.com/reelyactive';


/**
 * bubblescape Module
 * All of the JavaScript specific to the dashboard is contained inside this
 * angular module.  The only external dependencies are:
 * - beaver, cormorant and cuttlefish (reelyActive)
 * - socket.io (btford)
 * - ngSanitize (angular)
 */
angular.module('bubblescape', ['btford.socket-io', 'reelyactive.beaver',
                               'reelyactive.cormorant',
                               'reelyactive.cuttlefish', 'ngSanitize'])


/**
 * Socket Factory
 * Creates the websocket connection to the given URL using socket.io.
 */
.factory('Socket', function(socketFactory) {
  return socketFactory({
    ioSocket: io.connect(DEFAULT_SOCKET_URL)
  });
})


/**
 * InteractionCtrl Controller
 * Handles the manipulation of all variables accessed by the HTML view.
 */
.controller('InteractionCtrl', function($scope, Socket, beaver, cormorant) {

  // Variables accessible in the HTML scope
  $scope.devices = beaver.getDevices();
  $scope.stories = cormorant.getStories();

  // beaver.js listens on the websocket for events
  beaver.listen(Socket, function() { return !Bubbles.areActive(); });

  // Handle events pre-processed by beaver.js
  beaver.on('appearance', function(event) {
    handleEvent('appearance', event);
  });
  beaver.on('displacement', function(event) {
    handleEvent('displacement', event);
  });
  beaver.on('keep-alive', function(event) {
    handleEvent('keep-alive', event);
  });
  beaver.on('disappearance', function(event) {
    handleEvent('disappearance', event);
  });

  // Handle an event
  function handleEvent(type, event) {
    cormorant.getStory(event.deviceUrl, function() {});
    cormorant.getStory(event.receiverUrl, function() {});
  }

  // Verify if the device's story has been fetched
  $scope.hasFetchedStory = function(device) {
    return $scope.stories.hasOwnProperty(device.deviceUrl);
  };

  // Get the story corresponding to the given device
  $scope.getStory = function(device) {
    return $scope.stories[device.deviceUrl];
  };
});
