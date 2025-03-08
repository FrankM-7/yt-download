const electron = require('electron');
const path = require('path');
const url = require('url');
const loadBalancer = require('electron-load-balancer');

const { app, BrowserWindow, ipcMain, Menu } = require('electron');

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

app.whenReady().then(() => {
    // createWindow();

    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Update',
                    click() {
                        // call the update function
                        if (mainWindow) {
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
                        }
                    }
                }
            ]
        },
        {
            label: 'Dev Tools',
            submenu: [
                {
                    label: 'Open Dev Tools',
                    click() {
                        mainWindow.webContents.openDevTools();
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
});

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
        minWidth: 800,
        minHeight: 650,
    });
    // mainWindow.maximize();
    mainWindow.show();

    mainWindow.loadURL(startUrl);
    process.env.DEV && mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        loadBalancer.stopAll();
        mainWindow = null;
        app.quit();
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

// used for example
ipcMain.on('START_BACKGROUND_VIA_MAIN', (event, args) => {
	const backgroundFileUrl = url.format({
		pathname: path.join(__dirname, `../background_tasks/background.html`),
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

	cache.data = args.song;
});

// used to update python libraries
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

ipcMain.on('START_SEARCH_VIA_MAIN', (event, args) => {
	const backgroundFileUrl = url.format({
		pathname: path.join(__dirname, `../background_tasks/search.html`),
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

    cache.data = args.search;
});

// START_DOWNLOAD_VIA_MAIN
ipcMain.on('START_DOWNLOAD_VIA_MAIN', (event, args) => {
    const backgroundFileUrl = url.format({
        pathname: path.join(__dirname, `../background_tasks/download.html`),
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

    cache.data = args.url;
});


ipcMain.on('MESSAGE_FROM_BACKGROUND', (event, args) => {
	mainWindow.webContents.send('MESSAGE_FROM_BACKGROUND_VIA_MAIN', args.message);
});

ipcMain.on('BACKGROUND_READY', (event, args) => {
	event.reply('START_PROCESSING', {
		data: cache.data,
	});
});

ipcMain.on('CLOSE_BACKGROUND_WINDOW', () => {
    if (hiddenWindow) {
        hiddenWindow.close();
    }
});