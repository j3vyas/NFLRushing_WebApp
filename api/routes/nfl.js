'use strict';

module.exports = function( app ) {
  var nfl = require( '../controllers/nfl' );

  // todoList Routes
  app.route( '/rushing' )
    .get( nfl.getAllData );
    // .post(nfl.addToData);
};