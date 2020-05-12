'use strict'

let i18n = require('./i18n.min')

const {
	app,
	BrowserWindow,
	Menu,
	MenuItem,
	ipcMain
} = require( 'electron' )



ipcMain.on('show-panels-menu', ( event, message ) => {
	
	const panelsMenuTemplate = [
		{
			label: i18n.t('menupanels:open', 'Open All'),
			click (item, focusedWindow) { if(focusedWindow) focusedWindow.webContents.send('toggle-info-panels', 'open') }
		},
		{
			label: i18n.t('menupanels:close', 'Close All'),
			click (item, focusedWindow) { if(focusedWindow) focusedWindow.webContents.send('toggle-info-panels', 'close') }
		}
	]
	
	const panelsMenu = Menu.buildFromTemplate( panelsMenuTemplate )
	
	const win = BrowserWindow.fromWebContents( event.sender )
	panelsMenu.popup( win )
})
