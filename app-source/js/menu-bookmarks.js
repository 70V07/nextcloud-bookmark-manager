'use strict'

let i18n = require('./i18n.min')

const {
	app,
	BrowserWindow,
	Menu,
	MenuItem,
	ipcMain,
	shell,
	clipboard
} = require( 'electron' )

const dialog 		= require( 'electron' ).dialog
const Store 		= require( 'electron-store' )
const store 		= new Store()
const applescript 	= require( 'applescript' )



//note(dgmid): decodeentities

function decodeEntities( str ) {
	
	return 	String(str)
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
}



ipcMain.on('show-bookmark-menu', ( event, message ) => {
	
	let title = decodeEntities( message[1] )
	
	const bookmarkMenuTemplate = [
		{
			label: i18n.t('menubookmarks:open', 'Open {{title}} in Default Browser', { title: title }),
			click () { require('electron').shell.openExternal( message[3] ) }
		},
		{
			label: i18n.t('menubookmarks:with', 'Open {{title}} with…', { title: title }),
			submenu: []
		},
		{
			label: i18n.t('menubookmarks:copy', 'Copy {{title}} url to Clipboard', { title: title }),
			click () { clipboard.writeText(message[3], title) }	
		},
		{
			type: 'separator'
		},
		{
			label: i18n.t('menubookmarks:edit', 'Edit {{title}} Bookmark…', { title: title }),
			click (item, focusedWindow) { if(focusedWindow) focusedWindow.webContents.send('edit-bookmark', message) }
		},
		{
			label: `Delete ${title} Bookmark…`,
			label: i18n.t('menubookmarks:delete', 'Delete {{title}} Bookmark…', { title: title }),
			click (item, focusedWindow) { if(focusedWindow) focusedWindow.webContents.send('delete-bookmark', message) }
			
		},
	]
	
	const browsers = store.get('browsers')
	
	for (let i = 0, len = browsers.length; i < len; i++) {
		
		let theBrowser = browsers[i]['name']
		
		let launchScript =
		
		`tell application "${theBrowser}"
			open location "${message[3]}"
		end tell
		tell application "System Events"
			tell application process "${theBrowser}"
			set frontmost to true
			end tell
		end tell`
		
		bookmarkMenuTemplate[1].submenu.push({
				label: theBrowser,
				click () {
					
					applescript.execString(launchScript, function(err, rtn) {
						if (err) {
							
							dialog.showErrorBox(
								i18n.t('menubookmarks:errorbox.title', 'Error launching: {{browser}}', { browser: theBrowser }),
								i18n.t('menubookmarks:errorbox.content', 'the url {{url}} could not be opened', { url: message[3] })
							)
							
							console.log( err )
						}
					})
				}
			}
		)
	}
	
	const bookmarkMenu = Menu.buildFromTemplate( bookmarkMenuTemplate )
	
	const win = BrowserWindow.fromWebContents( event.sender )
	bookmarkMenu.popup( win )
})
