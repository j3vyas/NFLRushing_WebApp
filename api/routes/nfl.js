'use strict';

module.exports = function( app ) {
  var nfl = require( '../controllers/nfl' );

  app.route( '/nflrushing' )
    .get( nfl.getAllData );
    // .post(nfl.addToData);
};