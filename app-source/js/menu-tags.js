'use strict'

let i18n = require('./i18n.min')

const {
	app,
	BrowserWindow,
	Menu,
	MenuItem,
	ipcMain
} = require( 'electron' )



//note(dgmid): decodeentities

function decodeEntities( str ) {
	
	return 	String(str)
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
}



ipcMain.on('show-tags-menu', ( event, message ) => {
	
	let tag = decodeEntities( message )
	
	const tagsMenuTemplate = [
		{
			label: i18n.t('menutags:edit', 'Edit {{tag}} Tag…', { tag: tag }),
			click (item, focusedWindow) { if(focusedWindow) focusedWindow.webContents.send('edit-tag', message) }
		},
		{
			type: 'separator'
		},
		{
			label: i18n.t('menutags:delete', 'Delete {{tag}} Tag…', { tag: tag }),
			click (item, focusedWindow) { if(focusedWindow) focusedWindow.webContents.send('delete-tag', message) }
		},
	]
	
	const tagsMenu = Menu.buildFromTemplate( tagsMenuTemplate )
	
	const win = BrowserWindow.fromWebContents( event.sender )
	tagsMenu.popup( win )
})
