import AppsManager     from 'lib/AppsManager';
import Immutable       from 'immutable';
import installDevTools from 'immutable-devtools';
import Parse           from 'parse';
import ReactDOM        from 'react-dom';
import Routes          from './routes';

require('stylesheets/fonts.scss');
installDevTools(Immutable);

if (window.DEVELOPMENT) {
  let host = location.host.split('.');
  Parse.serverURL = location.protocol + '//' + host.slice(host.length - 2).join('.');
}

// Avoid extra billing charges
Parse.CoreManager.set('VERSION', 'browser');

// App entry point
AppsManager.seed().then(() => {
	ReactDOM.render(Routes, document.getElementById('browser_mount'));
});
