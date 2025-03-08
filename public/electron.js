const electron = require('electron');
const path = require('path');
const url = require('url');
const loadBalancer = require('electron-load-balancer');

const { app, BrowserWindow, ipcMain } = require('electron');

const nativeImage = electron.nativeImage;

if (process.env.DEV) {
    const {
        default: installExtension,
        REDUX_DEVTOOLS,
        REACT_DEVELOPER_TOOLS,
    } = require('electron-devtools-installer');

    app.whenReady().then(() => {
        installExtension(REDUX_DEVTOOLS).then(name =>
            console.log(`Added Extension:  ${name}`),
        );
        installExtension(REACT_DEVELOPER_TOOLS).then(name =>
            console.log(`Added Extension:  ${name}`),
        );
    });
}

const icon = nativeImage.createFromPath(path.join(__dirname, 'app_icon.png'));
let mainWindow;

function createWindow() {
    const startUrl = process.env.DEV
        ? 'http://localhost:3000'
        : url.format({
            pathname: path.join(__dirname, '/../build/index.html'),
            protocol: 'file:',
            slashes: true,
        });
    mainWindow = new BrowserWindow({
        show: false,
        icon,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        },
        minWidth: 500,
        minHeight: 300,
    });
    mainWindow.maximize();
    mainWindow.show();

    mainWindow.loadURL(startUrl);
    process.env.DEV && mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        loadBalancer.stopAll();
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

/* ----------------------------------- Custom code starts here ------------------------------------- */

// loadBalancer.register(
//   ipcMain,
//   {
//     linker: '/background_tasks/linker.html',
//     playback: '/background_tasks/playback.html',
//   },
//   // Set to true to unhide the window, useful for IPC debugging
//   { debug: false },
// );

// ipcMain.on('OSC_VOLTAGE_DATA', (event, args) => {
//   mainWindow.webContents.send('OSC_VOLTAGE_DATA', args);
// });

// ipcMain.on('OSC_XY_PLOT_DATA', (event, args) => {
//   mainWindow.webContents.send('OSC_XY_PLOT_DATA', args);
// });

let cache = {
	data: undefined,
};

let hiddenWindow;

ipcMain.on('START_BACKGROUND_VIA_MAIN', (event, args) => {
	const backgroundFileUrl = url.format({
		pathname: path.join(__dirname, `../background_tasks/background.html`),
		protocol: 'file:',
		slashes: true,
	});
	hiddenWindow = new BrowserWindow({
		show: true,
		webPreferences: {
			nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
		},
	});
	hiddenWindow.loadURL(backgroundFileUrl);

	hiddenWindow.webContents.openDevTools();

	hiddenWindow.on('closed', () => {
		hiddenWindow = null;
	});

	cache.data = args.song;
});

ipcMain.on('START_UPDATE_VIA_MAIN', (event, args) => {
	const backgroundFileUrl = url.format({
		pathname: path.join(__dirname, `../background_tasks/update_python_libs.html`),
		protocol: 'file:',
		slashes: true,
	});
	hiddenWindow = new BrowserWindow({
		show: false,
		webPreferences: {
			nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
		},
	});
	hiddenWindow.loadURL(backgroundFileUrl);

	hiddenWindow.webContents.openDevTools();

	hiddenWindow.on('closed', () => {
		hiddenWindow = null;
	});
});

ipcMain.on('MESSAGE_FROM_BACKGROUND', (event, args) => {
	mainWindow.webContents.send('MESSAGE_FROM_BACKGROUND_VIA_MAIN', args.message);
});

ipcMain.on('BACKGROUND_READY', (event, args) => {
	event.reply('START_PROCESSING', {
		data: cache.data,
	});
});