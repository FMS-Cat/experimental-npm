const path = require( 'path' );
const simpleGit = require( 'simple-git' )( path.resolve( __dirname, '..' ) );

const version = require( '../package.json' ).version;

const date = new Date();
let dateString = ( '00' + date.getFullYear() ).slice( -2 );
dateString += ( '00' + ( date.getMonth() + 1 ) ).slice( -2 );
dateString += ( '00' + date.getDate() ).slice( -2 );

const nightlyVersion = `${ version }-dev.${ dateString }`;
console.log( nightlyVersion );

simpleGit.tags( `v${ nightlyVersion }` );
simpleGit.pushTags( 'origin' );
