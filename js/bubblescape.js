Champagne.enableSockets();

Champagne.ready(function() {
  
  // Constant definitions
  DEFAULT_SOCKET_URL = 'https://www.hyperlocalcontext.com/reelyactive';


  /**
   * bubblescape Module
   * All of the JavaScript specific to the dashboard is contained inside this
   * angular module.  The only external dependency is champagne.
   */
  angular.module('bubblescape', ['champagne'])


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
  .controller('InteractionCtrl', function($scope, $attrs, Socket, beaver,
                                          cormorant) {

    // Variables accessible in the HTML scope
    $scope.devices = beaver.getDevices();
    $scope.stories = cormorant.getStories();
    $scope.visible = $attrs.visible;

    // beaver.js listens on the websocket for events
    beaver.listen(Socket, function() { return !Bubbles.areActive(); });

    // Handle events pre-processed by beaver.js
    beaver.on('appearance', function(event) {
      handleEvent(event);
    });
    beaver.on('displacement', function(event) {
      handleEvent(event);
    });
    beaver.on('keep-alive', function(event) {
      handleEvent(event);
    });
    beaver.on('disappearance', function(event) {
      handleEvent(event);
    });

    // Handle an event
    function handleEvent(event) {
      var deviceId = event.deviceId;
      var deviceUrl = event.deviceUrl;
      var receiverUrl = event.receiverUrl;

      cormorant.getCombinedStory(deviceUrl, receiverUrl, deviceId,
                                 function(story, id) {
        beaver.addDeviceProperty(id, 'story', story);
      });
    }

    // Verify if the device's story has been fetched
    $scope.hasFetchedStory = function(device) {
      return device.hasOwnProperty('story');
    };

  });
  
});
