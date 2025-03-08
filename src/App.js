import logo from './logo.svg';
import './App.css';
import { useEffect } from 'react';

const electron = window.require('electron');
const { ipcRenderer } = electron;

function App() {
  useEffect(() => {
    ipcRenderer.on('MESSAGE_FROM_BACKGROUND_VIA_MAIN', (event, args) => {
			console.log(args);
		});

		ipcRenderer.send('START_UPDATE_VIA_MAIN');
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
