'use strict';
const fs = require('fs')

exports.getAllData = function( req, res ) {
  fs.readFile( 'rushing.json', 'utf8' , ( err, data ) => {
    if ( err ){
      res.send( err );
    }
    res.json( JSON.parse( data ) );
  });

};