# Modular bubblescape
A dynamic visualisation of bubbles representing people, products and places, using the new **champagne** module.

### How it works
Previously, creating reelyActive bubbles required several separate JavaScript files: cuttlefish.js, beaver.js, bubble.js, and so on. Now, only one file is needed: **champagne.js.** It automatically loads all the relevant modules and scripts, including Angular and jQuery.

The bubblescape interface uses Socket.IO, which is optionally included in champagne. To enable it, we call `Champagne.enableSockets()`.

We then create an Angular module to handle the appearance and disappearance of bubbles. Because this module is dependent on champagne, it must be instantiated after champagne has finished loading all the required files. This is easily handled by passing code to the `Champagne.ready()` function:

**bubblescape.js**:
~~~~
Champagne.ready(function() {
    angular.module('bubblescape', ['champagne'])
    // controller goes here
}
~~~~~

Similar to how jQuery's `$(document).ready()` accepts a function to execute when the DOM has finished loading, code passed to `Champagne.ready()` is executed after all the dynamically-added JavaScript files have loaded. champagne automatically bootstraps the new module at the appropriate time.

In our HTML, bubbles are created with the `<bubble>` element, corresponding to a directive in cuttlefish.

By default, the bubbles will be placed randomly around the browser window. However, it's easy to contain the bubbles within a div: just add `id="bubbles"` to the containing div and the bubbles will be placed within that element only.

**index.html**:
~~~~
<div ng-controller="InteractionCtrl" id="bubbles">
    <bubble ng-repeat="(id, device) in devices | orderBy:'receiverId'"
            ng-if="hasFetchedStory(device)" size="140px"
            json="device.story" motion="true" fade="true"
            visible="Person,Product">
    </bubble>
</div>
~~~~