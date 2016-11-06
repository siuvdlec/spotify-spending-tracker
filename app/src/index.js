import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

function tick() {
    ReactDOM.render(
        <App />,
        document.getElementById('root')
    );
}

setInterval(tick, 1000);