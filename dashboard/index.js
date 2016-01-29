import Parse from 'parse';
import ReactDOM from 'react-dom';
import Routes from './routes';

require('stylesheets/fonts.scss');

if (process.env.NODE_ENV !== 'production') {
	const Immutable = require('immutable');
	require('immutable-devtools')(Immutable);
}

if (window.DEVELOPMENT) {
  let host = location.host.split('.');
  Parse.serverURL = location.protocol + '//' + host.slice(host.length - 2).join('.');
}

// Avoid extra billing charges
Parse.CoreManager.set('VERSION', 'browser');

// App entry point

ReactDOM.render(Routes, document.getElementById('browser_mount'));
