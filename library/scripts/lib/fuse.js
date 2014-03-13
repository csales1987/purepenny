/*!
 * Fuse - A Gadget Framework v0.11.2
 */
 
(function (global, undefined) {
var Fuse = {};

/**
 * Reliably returns the type of an object in a String representation.
 * @author <anguscroll@gmail.com> (Angus Croll)
 * @param  {*} object The object of whose type is to be determined
 * @return {String} The gadget with the matching name
 */
var toType = function(obj) {
  if (obj === global) {
    return 'global';
  }
  return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
};
(function (Fuse, requirejs) {

'use strict';

/**
 * Application
 * @module app
 */

/**
 * <p>Creates an instance of a Fuse App</p>
 *
 * <p>The `config` argument object supports the following properties:</p>
 * <dl>
 *   <dt>prefix &lt;String&gt;</dt>
 *   <dd>
 *     A string prefix to add to each module's ID. Defaults to:
 *     <code>"fuse-module-"</code>.
 *   </dd>
 * </dl>
 *
 * @namespace Fuse
 * @class App
 * @extends Fuse.Messenger
 * @constructor
 * @param {Object} config
 */
Fuse.App = function (config) {
  // if no config object is given, set it to an empty object
  config = config || {};
  
  var
    // reference to namespace
    App = Fuse.App,
    // extend from Fuse.Messenger
    self = new Fuse.Messenger,
    /**
     * Global counter used to generate unique module identifiers
     * @property globalCounter
     * @type Number
     * @private
     */
    globalCounter = 0,
    /**
     * Paths to resources
     * @property paths
     * @type Object
     * @private
     */
     paths = {
       helpers: 'helpers',
       gadgets: 'gadgets'
     },
    /**
     * Module ID prefix
     * @property gadgets
     * @type String
     * @private
     */
    prefix = config.prefix || 'fuse-module-',
    /**
     * Map of all created modules
     * @property modules
     * @type Object
     * @private
     */
    modules = {};
  
  // references to local errors
  var GadgetNotFoundError        = App.GadgetNotFoundError,
      RequiredCreatorMethodError = App.RequiredCreatorMethodError;
  
  /**
   * Initializes the applicaiton by parsing and handling configuration options
   * @method init
   * @private
   */
  function init() {
    if (config.paths) {
      paths.helpers = config.paths.helpers || paths.helpers;
      paths.gadgets     = config.paths.gadgets     || paths.gadgets;
    }
  }
  
  /**
   * Retrieves a module by its ID
   * @method getModuleById
   * @private
   * @param  {String} moduleId The ID of the module to be returned
   * @return {Object | null} The module with the matching ID
   */
  function getModuleById(moduleId) {
    return modules[moduleId] || null;
  }
  
  /**
   * Retrieves resources
   * @method getResources
   * @private
   * @param  {String} type The type of the resource to be returned
   * @param  {Array | String} names The names of the resources to be returned
   * @param  {Function} callback A callback to be invoked when the resources
   *                             have retrieved, being passed the resources
   */
  function getResources(type, names, callback) {
    var resourcePaths = [];
    
    // add a URI prefix to each resource's name
    for (var i = 0, j = names.length; i < j; i++) {
      resourcePaths.push(paths[type] + '/' + names[i]);
    }
    
    require(resourcePaths, function () {
      // convert the imported resources into a native array
      var resources = [];
      resources.push.apply(resources, arguments);
      callback(resources);
    });
  }
  
  /**
   * Creates a formatted helper from a loaded helper resource
   * @method createHelperFromResource
   * @private
   * @param  {Object} A helper resource
   * @returns {Object} A formatted helper resource
   */
  function createHelperFromResource(resource) {
    return {
      options: resource.options || {},
      handler: resource.handler
    };
  }
  
  /**
   * Retrieves a helper by its name
   * @method getHelperByName
   * @private
   * @param  {String}   name     The name of the helper to be retrieved
   * @param  {Function} callback A callback to be invoked when the gadget has
   *                             retrieved, being passed the gadget
   */
  function getHelperByName(name, callback) {
    getHelpersByName(name, function (helpers) {
      callback(helpers[name]);
    });
  }
  
  /**
   * Retrieves multiple helpers by their names
   * @method getHelpersByName
   * @private
   * @param  {Array}    names    The names of the helpers to be retrieved
   * @param  {Function} callback A callback to be invoked when the helpers
   *                             has retrieved, being passed a map of helpers
   */
  function getHelpersByName(names, callback) {
    getResources('helpers', names, function (resources) {
      var helpers = {};
      
      // transform the resources list into a helpers map
      for (var i = 0, j = names.length; i < j; i++) {
        helpers[names[i]] = createHelperFromResource(resources[i]);
      }
      
      callback(helpers);
    });
  }
  
  /**
   * Creates a formatted gadget from a loaded gadget resource
   * @method createGadgetFromResource
   * @private
   * @param  {Object} A gadget resource
   * @returns {Object} A formatted gadget resource
   */
  function createGadgetFromResource(resource) {
    if (resource === null) {
      throw new Error('The gadget was not defined properly');
    }
    
    return {
      options: resource.options || {},
      helpers: resource.helpers,
      creator: resource.creator
    };
  }
  
  /**
   * Retrieves a gadget by its name
   * @method getGadgetByName
   * @private
   * @param  {String}   name     The name of the gadget to be retrieved
   * @param  {Function} callback A callback to be invoked when the gadget has
   *                             retrieved, being passed the gadget
   */
  function getGadgetByName(name, callback) {
    getResources('gadgets', [name], function (resources) {
      var resource = resources[0];
      
      if (resource === undefined) {
        throw new GadgetNotFoundError(name);
      } else {
        callback(createGadgetFromResource(resource));
      }
    });
  }
  
  /**
   * Merges two arrays together, removing duplicate values
   * @method mergeUniqueArrays
   * @private
   * @param  {String} name The name of the gadget to be returned
   * @return {Fuse.Gadget | null} The gadget with the matching name
   */
  function mergeUniqueArrays(a, b) {
    if (a !== undefined && b !== undefined) {
      var c = a.concat(b);
      for(var i = 0; i < c.length; i++) {
        for(var j = i + 1; j < c.length; j++) {
          if(c[i] === c[j]) {
            c.splice(j, 1);
          }
        }
      }
      
      return c;
    } else {
      return a || b;
    }
  }
  
  /**
   * Stubs out an instance of a gadget
   * @method create
   * @param  {String} name   Name of a gadget
   * @param  {Object} options
   * @return {String} Module ID of the created gadget
   */
  self.create = function (name, options) {
    // create a unique module ID and increment the global module ID counter
    var moduleId = prefix + globalCounter++;
    
    // create the module
    modules[moduleId] = {
      type: name,
      instance: null,
      options: options
    };
    
    return moduleId;
  };
  
  /**
   * Starts and renders a module
   * @method start
   * @param  {String} moduleId ID of a module
   * @return {String | null} Module ID of the started gadget, or null if it has
   *                         already been started
   */
  self.start = function (moduleId) {
    var module = getModuleById(moduleId),
        config = {},
        finish, next, sandbox;
    
    // ensure this module isn't already started
    if (module !== null && module.instance === null) {
      getGadgetByName(module.type, function (gadget) {
        // shortcuts to gadget properties
        var creator         = gadget.creator,
            helpersList = gadget.helpers;
        
        // retrieve helpers
        getHelpersByName(helpersList || [], function (helpers) {
          // begin building the sandbox's configuration object
          config.app = self;
          config.options = module.options;
          
          // create the module's sandbox
          sandbox = new Fuse.Sandbox(moduleId, config);
          
          // define a finish function to be called once the last helper has
          // finished executing
          finish = function () {
            // create a module instance using the gadget's creator
            module.instance = gadget.creator(sandbox);
            
            // if no create method is returned by the gadget's creator, throw
            // a RequiredCreatorMethodError
            if (module.instance.create === undefined) {
              throw new RequiredCreatorMethodError('create');
            }
            
            module.instance.create();
          };
          
          // if helpers is defined, pass the sandbox through each of the
          // helper
          if (helpersList) {
            var i = 0,
                length = helpersList.length;
            
            // define a next function to be called by the helper to pass the
            // sandbox to the next helper, or finish the queue
            next = function () {
              if (i + 1 > length) {
                finish();
              } else {
                helpers[helpersList[i++]].handler.call(null, sandbox, next);
              }
            };
            
            // start with the first helper
            next();
          } else {
            finish();
          }
        });
      });
      
      return moduleId;
    } else {
      return null;
    }
  };
  
  /**
   * Stops and destroys a module instance
   * @method stop
   * @param  {String} moduleId ID of a module
   * @return {String}          ID of the module stopped or `null` if a module
   *                           wasn't stopped
   */
  self.stop = function (moduleId) {
    var module = getModuleById(moduleId);
    
    if (module !== null && module.instance !== null) {
      if (module.instance.destroy === undefined) {
        throw new RequiredCreatorMethodError('destroy');
      }
      
      module.instance.destroy();
      module.instance = null;
      
      return moduleId;
    } else {
      return null;
    }
  };
  
  // initialize the application
  init();
  
  return self;
};

/**
 * Thrown when a gadget is not found in the local cache
 * @class App.GadgetNotFoundError
 * @constructor
 * @extends Error
 * @param {String} message (optional) Name of the gadget not found
 */
Fuse.App.GadgetNotFoundError = function (message) {
  this.name = 'GadgetNotFoundError';
  this.message = 'Gadget ' + ((message) ? '' + message + ' ' : '') + 'doesn\'t exist';
};

/**
 * Thrown when a required function such as create and destroy are not returned
 * from a gadget's creator method.
 * @class App.RequiredCreatorMethodError
 * @extends Error
 * @constructor
 */
Fuse.App.RequiredCreatorMethodError = function () {
  this.name = 'RequiredCreatorMethodError';
  this.message = 'Gadgets creator functions are required to return both a "create" and "destroy" function.';
};

Fuse.App.GadgetNotFoundError.prototype        = new Error;
Fuse.App.RequiredCreatorMethodError.prototype = new Error;

}(Fuse, requirejs));
(function (Fuse) {

/**
 * @module messenger
 * @namespace Fuse
 */

/**
 * Pub/sub messaging system
 * @class Messenger
 * @constructor
 */
Fuse.Messenger = function () {
  var self = this,
      channels = {}, // map of all channels being used;
      publish, publishMany,
      subscriber, subscribeMany,
      unsubscribe, unsubscribeMany;
  
  /**
   * Publishes a message to a channel
   * @method publish
   * @param {String} channel A channel to publish a message to
   * @param {Any}    message A message to be sent to subscribers
   * @param {Object} context A context each subscriber's callback function will
   *                         be invoked with
   */
  self.publish = function (channel, message, context) {
    var thisArgs, thisChannel;
    
    if (channels[channel]) {
      thisMessage = (message !== undefined) ? message : [];
      thisChannel = channels[channel];
      
      for (var i = 0, j = thisChannel.length; i < j; i++) {
        thisChannel[i].call(context || null, thisMessage);
      }
    }
  };
  
  /**
   * Publishes a single message to multiple channels
   * @method publishMany
   * @param {Array}  channels A list of channels to publish a message to
   * @param {Any}    message  A message to be sent to subscribers
   * @param {Object} context  A context each subscriber's callback function will
   *                          be invoked with
   */
  self.publishMany = function (channels, message, context) {
    for (var i = 0, j = channels.length; i < j; i++) {
      self.publish(channels[i], message, context);
    }
  };
  
  /**
   * Creates a subscription to a channel with a callback
   * @method subscribe
   * @param  {String}   channel  Channel to be subscribed to
   * @param  {Function} callback Function to be invoked when a message is
   *                              published to the specified channel
   * @return {Object} Subscription handle used to unsubscribe
   */
  self.subscribe = function (channel, callback) {
    // create an empty array of subscribers if one doesn't already exist
    if (channels[channel] === undefined) {
      channels[channel] = [];
    }
    
    // add this subscription to the channel stack
    channels[channel].push(callback);
    
    return {
      channel: channel,
      callback: callback
    };
  };
  
  /**
   * Creates subscriptions to multiple channels for a single callback
   * @method subscribeMany
   * @param  {Array}   channels A list of channels to be subscribed to
   * @param  {Function} callback A function to be invoked when a message is
   * @return {Array} An array of subscription handles used to
   *                 unsubscribe
   */
  self.subscribeMany = function (channels, callback) {
    var handles = [];
    
    for (var i = 0, j = channels.length; i < j; i++) {
      handles.push(self.subscribe(channels[i], callback));
    }
    
    return handles;
  };
  
  /**
   * Removes a subscription from a channel
   * @method unsubscribe
   * @param {Object} handle A channel/callback pair used to unsubscribe
   */
  self.unsubscribe = function (handle) {
    var channel = handle.channel;
    
    if (channel && channels[channel]) {
      var thisChannel = channels[channel];
      
      for (var i = 0, j = thisChannel.length; i < j; i++) {
        if (thisChannel[i] === handle.callback) {
          thisChannel.splice(i, 1);
        }
      }
    }
  };
  
  /**
   * Removes a list of subscriptions from a channel
   * @method unsubscribeMany
   * @param {Array} handles
   */
  self.unsubscribeMany = function (handles) {
    for (var i = 0, j = handles.length; i < j; i++) {
      self.unsubscribe(handles[i]);
    }
  };
};

/**
 * <p>
 *   A scoped version of Fuse.Messenger. All publish and subscribe operations
 *   are excuted under a scope specified during instantiation.
 * </p>
 * <p>
 *   For example, if a scoped messenger's scope is <code>'/foo/'</code> and it
 *   publishes to the channel <code>'bar'</code>, under the hood it will be
 *   publishing to the channel <code>'/foo/bar'</code>.
 * </p>
 * 
 * @class Messenger.Scoped
 * @constructor
 * @param {String}         scope  A string representing the channel scope.
 * @param {Fuse.Messenger} parent (optional) A parent messenger used to perform
 *                                the messaging tasks. If one is not specified,
 *                                one will be created.
 */
Fuse.Messenger.Scoped = function (scope, parent) {
  var Messenger = Fuse.Messenger,
      self = this,
      handles = [],
      publish, subscribe, unsubscribe, unsubscribeAll;
  
  // if no parent messenger is defined, create one
  if (!parent) {
    parent = new Messenger;
  }
  
  /**
   * Prefixes a scope string to a list of channels
   * @method getScopedChannels
   * @private
   * @param  {String} channels A list of channels to be prefixed
   * @return {Array}  A list of scoped channels
   */
  function getScopedChannels(channels) {
    var scopedChannels = [];
    
    for (var i = 0; i < channels.length; i++) {
      scopedChannels.push(scope + channels[i]);
    }
    
    return scopedChannels;
  }
  
  /**
   * Publishes a message to a scoped channel
   * @method publish
   * @param {String} channel A channel to publish a message to
   * @param {Any}    message A message to be sent to subscribers
   * @param {Object} context A context each subscriber's callback function will
   *                         be invoked with
   */
  self.publish = function (channel, message, context) {
    parent.publish(scope + channel, message, context);
  };
  
  /**
   * Publishes a single message to many scoped channels
   * @method publishMany
   * @param {Array}  channels A list of channels to publish a message to
   * @param {Any}    message  A message to be sent to subscribers
   * @param {Object} context  A context each subscriber's callback function will
   *                          be invoked with
   */
  self.publishMany = function (channels, message, context) {
    parent.publishMany(getScopedChannels(channels), message, context);
  };
  
  /**
   * Creates a subscription to a scoped channel with a callback
   * @method subscribe
   * @param  {String}   channel  A channel to be subscribed to
   * @param  {Function} callback Function to be invoked when a message is
   *                             published to the specified channel
   * @return {Object} Subscription handle used to unsubscribe
   */
  self.subscribe = function (channel, callback) {
    var handle = parent.subscribe(scope + channel, callback);
    
    handles.push(handle);
    
    return handle;
  };
  
  /**
   * Creates a subscription to many scoped channels with a callback
   * @method subscribeMany
   * @param  {String}   channels A list of channels to be subscribed to
   * @param  {Function} callback Function to be invoked when a message is
   *                             published to the specified channel
   * @return {Array} An array of subscription handles used to unsubscribe
   */
  self.subscribeMany = function (channels, callback) {
    var newHandles = parent.subscribeMany(getScopedChannels(channels), callback);
    
    handles.concat(newHandles);
    
    return newHandles;
  };
  
  /**
   * Removes a subscription from a scoped channel
   * @method unsubscribe
   * @param {Object} handle A channel/callback pair used to unsubscribe
   */
  self.unsubscribe = function (handle) {
    parent.unsubscribe(handle);
  };
  
  /**
   * Removes a list of subscriptions from a scoped channel
   * @method unsubscribeMany
   * @param {Array} handles
   */
  self.unsubscribeMany = function (handles) {
    parent.unsubscribeMany(handles);
  };
  
  /**
   * Removes all subscriptions from this scoped messenger
   * @method unsubscribeAll
   */
  self.unsubscribeAll = function () {
    parent.unsubscribeMany(handles);
  };
};

}(Fuse));
(function (Fuse) {

/**
 * Sandbox
 * @module sandbox
 */

/**
 * <p>Provides a secure environment for Gadgets to interact with.</p>
 * <p>The `config` argument object supports the following properties:</p>
 * <dl>
 *   <dt>app &lt;Fuse.App&gt;</dt>
 *   <dd>
 *     A reference to the parent Fuse application mainly used for providing a
 *     parent to the sandbox's scoped messenger.
 *   </dd>
 *   <dt>options &lt;Object&gt;</dt>
 *   <dd>
 *     <p>
 *       A map of configuration properties specified when a gadget is
 *       constructed.
 *     </p>
 *   </dd>
 * </dl>
 *
 * @namespace Fuse
 * @class Sandbox
 * @extends Fuse.Messenger.Scoped
 * @constructor
 * @param {String} moduleId ID of the module to utilize to sandbox
 * @param {Object} config   A configuration object
 */
Fuse.Sandbox = function (moduleId, config) {
  config  = config || {};
  
  // extend from Fuse.Messenger.Scoped
  var self = new Fuse.Messenger.Scoped('/' + moduleId, config.app || null);
  
  var options = config.options || {};
  
  /**
   * Instance of the App that created the module
   * @property app
   */
  self.app = config.app;
  
  /**
   * Returns the ID of the sandbox's module
   * @method getId
   * @return {String} ID of the sandbox's module
   */
  self.getId = function () {
    return moduleId;
  };
  
  /**
   * Returns the value of an key in the options object.
   * @method getOption
   * @return {*}
   */
  self.getOption = function (key) {
    return options[key];
  };
  
  return self;
};

}(Fuse));
global.Fuse = Fuse;

}(this));
