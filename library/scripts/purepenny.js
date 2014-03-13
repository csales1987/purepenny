/**
 * ----------------------------------------------
 *	Table of Contents and Object Tree for purepenny
 * ----------------------------------------------
 * purepenny
 *		.init(options)
 *		.debug
 *		.hide
 *		.show
 * document.ready
 * ----------------------------------------------
 */

var purepenny = {

	init: function () {

		// configure requirejs
		requirejs.config({
			baseUrl: 'library/scripts',
			paths: {
				async:             'lib/requirejs-plugins/async',
				depend:            'lib/requirejs-plugins/depend',
				json:              'lib/requirejs-plugins/json',
				noext:             'lib/requirejs-plugins/noext'
			}
		});

		// create an instance of an application
		purepenny.app = new Fuse.App({
			paths: {
				gadgets: 'modules'
			}
		});
	}
};

// =======================================================================
// Document ready, init all behaviors from purepenny object
// =======================================================================

$(document).ready(purepenny.init);
