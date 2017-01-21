var Loader = {
  
  scripts: [
    'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.4.7/angular.min.js',
    'https://code.angularjs.org/1.4.7/angular-animate.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/2.0.2/ui-bootstrap-tpls.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/angular-sanitize/1.5.0/angular-sanitize.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.3.7/socket.io.min.js',
    'https://code.jquery.com/jquery-3.1.0.min.js',
    'js/socket.min.js',
    'js/beaver.js',
    'js/cormorant.js',
    'js/bubble.js',
    'js/cuttlefish.js',
    'js/bottlenose.js'
  ],
  
  styles: [
    'style/bubble.css',
    'https://fonts.googleapis.com/css?family=Open+Sans:400,600,700,300'
  ],
  
  getScript: function(file) {
    return new Promise(function(fulfill, reject) {
      var script = document.createElement("script");
      script.addEventListener("load", fulfill);
      script.src = file;
      console.log(file);
      document.head.appendChild(script);
    });
  },
  
  getStyle: function(file) {
    var style = document.createElement("link");
    style.src = file;
    style.rel = 'stylesheet';
    style.type = 'text/css';
    console.log(file);
    document.head.appendChild(style);
  },
  
  preloadImages: function() {
    for (var i = 0; i < arguments.length; i++) {
      var img = new Image();
      img.src = arguments[i];
    }
  },
  
  getScripts: function() {
    var self = this;
    self.getScript(self.scripts.shift()).then(function() {
      if (self.scripts.length > 0) {
        self.getScripts();
      } else {
        // done getting scripts, time to initialize
        Champagne.init();
      }
    })
  },
  
  getFiles: function() {
    var self = this;
    self.styles.forEach(function(file) {
      self.getStyle(file);
    })
    self.getScripts();
  }
  
}


var AngularCompile;

var Compiler = { // need Angular to recompile new elements after DOM manipulation
  
  initialized: false,
  
  initialize: function() {
    var self = this;
    
    if (self.initialized) return true;
    
    oldPrepend = $.fn.prepend;
    $.fn.prepend = function()
    {
      var isFragment =
        arguments[0][0] && arguments[0][0].parentNode
        && arguments[0][0].parentNode.nodeName == "#document-fragment";
      var result = oldPrepend.apply(this, arguments);
      if (isFragment)
      AngularCompile(arguments[0]);
      return result;
    };
    
    oldAppend = $.fn.append;
    $.fn.append = function()
    {
      var isFragment =
        arguments[0][0] && arguments[0][0].parentNode
        && arguments[0][0].parentNode.nodeName == "#document-fragment";
      var result = oldAppend.apply(this, arguments);
      if (isFragment)
      AngularCompile(arguments[0]);
      return result;
    };

    AngularCompile = function(root)
    {
      var injector = angular.element($('[ng-app]')[0]).injector();
      var $compile = injector.get('$compile');
      var $rootScope = injector.get('$rootScope');
      var result = $compile(root)($rootScope);
      $rootScope.$digest();
      return result;
    }
    
    self.initialized = true;
  }
  
}


var Champagne = {
  
  init: function() {
    (function($){
      $.event.special.destroyed = {
        remove: function(o) {
          if (o.handler) {
            o.handler()
          }
        }
      }
    })(jQuery);
    Compiler.initialize();
    
    uncork();
  },
  
  bootstrap: function(module) {
    angular.bootstrap($("body")[0], [module]);
  }
  
}

Loader.getFiles();