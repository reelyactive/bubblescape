var Bubble = function(scope) {
  var self = this;
  self.scope = scope;
  Loader.whenAvailable('jQuery', function() {
    self.initialize();
  });
}

Bubble.generateID = function(jsonID) {
  if (Bubbles.ids.indexOf(jsonID) >= 0) { // duplicate ID
    if (!Bubbles.dupeIDs.hasOwnProperty(jsonID)) {
      Bubbles.dupeIDs[jsonID] = {count: 1};
    }
    Bubbles.dupeIDs[jsonID].count += 1;
    return jsonID + Bubbles.dupeIDs[jsonID].count;
  } else {
    Bubbles.ids.push(jsonID);
    return jsonID;
  }
}

Bubble.availableTypes = function(visible, all) {
  
  if (visible.length == 0) return all;
  
  var arr1 = visible.split(',');
  var arr2 = all;
  
  var commonValues = [];
  var i, j;
  var arr1Length = arr1.length;
  var arr2Length = arr2.length;

  for (i = 0; i < arr1Length; i++) {
      for (j = 0; j < arr2Length; j++) {
          if (arr1[i] === arr2[j]) {
              commonValues.push(arr1[i]);
          }
      }
  }
  
  return commonValues;
  
}

Bubble.prototype = {
  
  initialize: function(scope) {
    var self = this;
    if (self.scope.unsupported) return false;
    self.style();
    self.addIcons();
    self.setHoverEvent();
    self.startFloating();
  },
  
  setClasses: function() {
    var self = this;
    self.containerClass = '.bubble';
    self.bubbleClass = self.containerClass+'--photo';
    self.labelClass = self.containerClass+'--label';
    self.iconClass = self.containerClass+'--icon';
    self.toggleClass = self.containerClass+'--toggle';
  },
  
  setDivs: function() {
    var self = this;
    self.container = $('#'+self.scope.itemID);
    self.bubble = $(self.bubbleClass, self.container);
    self.label = $(self.labelClass, self.container);
    self.toggle = $(self.toggleClass, self.container);
  },
  
  style: function() {
    var self = this;
    
    self.setClasses();
    self.setDivs();
    
    self.size = parseInt(self.scope.size);
    self.borderSize = self.size / 10;
    self.labelTop = self.size * 0.9;
    self.containerSize = self.size + self.borderSize*6;
    
    self.container.css({
      width: self.containerSize,
      height: self.containerSize,
      display: 'inline-block'
    });
    
    self.bubble.css({
      width: self.size,
      height: self.size,
      borderRadius: self.size,
      borderWidth: self.borderSize,
      top: self.borderSize*2
    });
    
    self.label.css({
      fontSize: self.borderSize,
      top: self.labelTop,
      borderRadius: self.borderSize/2
    });
  },
  
  parseServices: function() {
    var self = this;
    self.sameAs = {};
    $.each(self.scope.types, function(index, type) {
      var node = self.scope[type.toLowerCase()];
      if (node.hasOwnProperty('schema:sameAs')) {
        self.sameAs[type] = node['schema:sameAs'];
      } else {
        self.sameAs[type] = [];
      }
    });
  },
  
  addIcons: function() {
    var self = this;
    
    $(self.iconClass, self.bubble).remove();
    
    self.parseServices();
    
    $.each(BubbleServices, function(serviceName, service) {
      $.each(self.sameAs, function(type, urls) {
        $.each(urls, function(index, url) {
          if (url.indexOf(service.keyString) > -1) { // has service
            // create icon element
            var icon = $('<a class="'+self.iconClass.substring(1)+'" />');
            icon.data('service', serviceName);
            icon.data('url', url);
            icon.attr({
              'href': url,
              'target': '_blank'
            });
            // set image
            if (service.hasOwnProperty('image')) {
              icon.css('background-image', 'url('+service.image+')');
              Loader.preloadImages(service.image);
            } else {
              icon.addClass(self.iconClass+'-naked');
              icon.html(serviceName.substr(0,2));
            }
            // set tooltip
            var tooltip = BubbleServices.defaultTooltip;
            if (service.hasOwnProperty('tooltip')) {
              tooltip = service.tooltip;
            }
            tooltip = tooltip.replace('{{name}}', self.name(type));
            tooltip = tooltip.replace('{{service}}', serviceName);
            icon.attr({
              'uib-tooltip': tooltip,
              'tooltip-placement': 'top',
              'tooltip-append-to-body': true
            });
            // bind tooltip unhover handler
            icon.bind('mouseleave.tooltip', function() {
              setTimeout(function() {
                self.checkHover();
              }, 200);
            });
            // add to bubble
            console.log('Adding icon to ' + type);
            icon.appendTo(self.selectByType(type));
          }
        });
      });
    });
  },
  
  getIconPosition: function (angle) {
    var self = this;
    
    function toRad(angle) {
      return angle * (Math.PI / 180);
    }

    var d = self.size;
    var r = d/2;
    var rPad = self.newBorder/2;
    var x = r * Math.sin(toRad(angle));
    var y = r * Math.cos(toRad(angle));
    var xPad = rPad * Math.sin(toRad(angle));
    var yPad = rPad * Math.cos(toRad(angle));
    var left = r + x + xPad - self.iconSize/2;
    var top = r - y - yPad - self.iconSize/2;
    return {'left':left, 'top':top};
  },
  
  setIconCSS: function(icon, angle) {
    var self = this;
    var pos = self.getIconPosition(angle);
    icon.css({
      width: self.iconSize+'px',
      height: self.iconSize+'px',
      lineHeight: self.iconSize+'px',
      left: pos.left+'px', top: pos.top+'px',
      borderRadius: self.iconSize+'px'
    });
    return icon;
  },
  
  revealIcons: function() {
    var self = this;
    var angle = -15;
    var delta = 30;
    var delay = 0;
    self.icons().each(function() {
      icon = self.setIconCSS($(this), angle);
      icon.delay(delay).fadeIn(300);
      angle += delta;
      delay += 50;
    });
  },
  
  setHoverAnimation: function() {
    var self = this;
    
    self.borderIncrease = self.borderSize * 2;
    self.newBorder = self.borderSize + self.borderIncrease;
    self.newSize = self.size + self.borderIncrease*2;
    self.iconSize = self.newBorder * 0.8;

    self.hoverAnimation = {
      borderWidth: self.newBorder+'px',
      top: '-='+self.borderSize*2+'px'
    };
    
    self.cssReset = {
      borderWidth: self.borderSize+'px',
      top: self.borderSize*2,
    }
  },
  
  setHoverEvent: function() {
    var self = this;
    
    self.bubble.unbind('mouseenter mouseleave');

    self.setHoverAnimation();
    
    self.bubble.hover(function() {
      
      if (self.bubble.hasClass('hover')) return false;
      
      Bubbles.active = true;
      Motion.stop();
      $(self.bubbleClass).not(self.bubble).css('opacity', 0.4);
      
      self.bubble.addClass('hover');
      self.toggle.css({opacity: 0});
      self.label.css({backgroundColor: 'transparent'});
      self.label.animate({
        top: self.size + (self.borderSize/3) + 'px'
      }, 300);
      
      self.bubble.animate(self.hoverAnimation, 300, function() {
        if (self.bubble.hasClass('hover')) {
          self.revealIcons();
        }
      });
      
    }, function() { // unhover
      
      if ($('.tooltip:hover').length > 0) return false;
      
      self.bubble.finish();
      self.label.finish();
      self.icons().finish();
      self.bubble.removeClass('hover');
      
      self.icons().hide();
      self.bubble.css(self.cssReset);
      self.label.css({
        backgroundColor: 'black',
        top: self.labelTop
      });
      self.toggle.css({opacity: 1});
      
      $(self.bubbleClass).css('opacity', 1.0);
      Motion.resume();
      Bubbles.active = false;
      
      //Connections.redraw();
      
    });
  },
  
  startFloating: function() {
    var self = this;
    var motionClasses = ['forward-motion', 'backward-motion'];
    var motionClass = motionClasses[Math.floor(Math.random()*motionClasses.length)];
    var delay = Math.random()*10;
    self.container.css({animationDelay: '-'+delay+'s'});
    self.container.addClass(motionClass);
  },
  
  checkHover: function() {
    var self = this;
    if ($(self.bubbleClass+':hover', self.container).length == 0) {
      self.bubble.trigger('mouseleave');
    }
  },
  
  selectByType: function(type) {
    var self = this;
    var selector = self.bubbleClass+'[data-type="'+type+'"]';
    var div = $(selector, self.container);
    return div;
  },
  
  activeBubble: function() {
    var self = this;
    return self.selectByType(self.scope.current);
  },
  
  name: function(type) {
    var self = this;
    return self.selectByType(type).data('name');
  },
  
  icons: function() {
    var self = this;
    return $(self.iconClass, self.activeBubble());
  }
  
}

var BubbleServices = {
  
  defaultTooltip: "Visit {{name}} on {{service}}",
  
  Twitter: {
    keyString: 'twitter.com',
    image: 'images/icons/twitter.png',
    tooltip: "See {{name}}'s tweets"
  },
  
  LinkedIn: {
    keyString: 'linkedin.com',
    image: 'images/icons/linkedin.png'
  },
  
  Instagram: {
    keyString: 'instagram.com',
    image: 'images/icons/instagram.png'
  },
  
  Facebook: {
    keyString: 'facebook.com',
    image: 'images/icons/facebook.png'
  }
  
}

var Bubbles = {
  
  active: false,
  ids: [],
  dupeIDs: {},
  
  areActive: function() {
    var self = this;
    return self.active;
  }
  
}

var Loader = {
  
  loaded: {},
  
  getJQuery: function() {
    var script = document.createElement('script');
    script.src = '//code.jquery.com/jquery-3.1.0.min.js';
    script.type = 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(script);
  },
  
  getFonts: function() {
    var font = document.createElement('link');
    font.href = 'https://fonts.googleapis.com/css?family=Open+Sans:400,600,700,300';
    font.rel = 'stylesheet';
    font.type = 'text/css';
    document.getElementsByTagName('head')[0].appendChild(font);
  },
  
  whenAvailable: function(name, callback) {
    var self = this;
    var interval = 10; // ms
    window.setTimeout(function() {
      if (window[name]) {
        if (!self.loaded.hasOwnProperty(name)) { // first load
          self.afterLoad(name);
          self.loaded[name] = true;
        }
        callback(window[name]);
      } else {
        window.setTimeout(arguments.callee, interval);
      }
    }, interval);
  },
  
  preloadImages: function() {
    for (var i = 0; i < arguments.length; i++) {
      var img = new Image();
      img.src = arguments[i];
    }
  },
  
  afterLoad: function(name) {
    console.log('initing after ' + name);
    switch(name) {
      case 'jQuery':
        Motion.initialize();
        Compiler.initialize();
        break;
    }
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

Loader.getJQuery();
Loader.getFonts();