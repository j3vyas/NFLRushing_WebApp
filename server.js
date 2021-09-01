const express = require( 'express' );
const path = require( 'path' );

const app = express();
const port = process.env.PORT || 8080;

//import + set routes
var routes = require('./api/routes/nfl');
routes( app );

app.get( '/', ( req, res ) => {
  res.sendFile( path.join( __dirname, '/webapp/index.html' ) );
});

//Serve static files
app.use( express.static( './webapp/' ) );

// Listen to the App Engine-specified port, or 8080 otherwise
app.listen( port, () => {
  console.log( `Server listening on port ${port}...` );
});