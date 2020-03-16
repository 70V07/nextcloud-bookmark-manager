'use strict'

const { Notification } 	= require('electron')
const path 				= require('path')
const dialog 			= require('electron').dialog
const fs 				= require( 'fs-extra' )
const log 				= require( 'electron-log' )
const Store 			= require( 'electron-store' )
const bookmarks			= new Store( {name: 'bookmarks'} )



module.exports.exportBookmarks = function( filePath ) {
	
	let exportname 		= path.basename( filePath ),
		exportpath 		= path.dirname( filePath ),
		bookmarkdata 	= bookmarks.get( 'data' )
	
	let output =
`<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>`
	
	
	for ( let item of bookmarkdata ) {
		
		let tagList = item.tags.toString()
			
		output +=
`
<DT><A HREF="${item.url}" TAGS="${tagList}">${item.title}</A>`
		
		if( item.description ) {
			
			output += `<DD>${item.description}`
		}
	}
	
	
	fs.outputFile( filePath, output )

	.then(() => fs.readFile( filePath, 'utf8') )
	
	.then(data => {
		
		let exportNotification = new Notification({
			
			title: 		`Export Successful`,
			subtitle: 	`the file: ${exportname}`,
			body: 		`has been saved to: ${exportpath}`
		})
		
		exportNotification.onclick = () => {
			
			exportProcess.close()
		}
		
		exportNotification.show()
	})
	
	.catch(error => {
		
		log.error( error )
		
		dialog.showErrorBox(
			`Export Error`,
			`An error occured exporting:\n${filePath}`
		)
	})
}
