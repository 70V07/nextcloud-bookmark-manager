'use strict'

const i18n			= require( './i18n.min' )

const { remote }	= require( 'electron' )
const ipc 			= require( 'electron' ).ipcRenderer
const dialog		= remote.dialog
const Store			= require( 'electron-store' )
const store			= new Store()
const $				= require( 'jquery' )
const log			= require( 'electron-log' )



let bookmarkFile = new Store({
	
	name: 'bookmarks',
	defaults: {
		data: null
	}
})



const path = '/index.php/apps/bookmarks/public/rest/v2'
const calltype = {
	
	'all': {
		'method': 'GET',
		'url': '/bookmark?page=-1'	
	},
	'single': {
		'method': 'GET',
		'url': '/bookmark/'
	},
	'add': {
		'method': 'POST',
		'url': '/bookmark?'
	},
	'modify': {
		'method': 'PUT',
		'url': '/bookmark/',
	},
	'delete': {
		'method': 'DELETE',
		'url': '/bookmark/'
	},
	'modifytag': {
		'method': 'POST',
		'url': '/tag?'
	},
	'deletetag': {
		'method': 'DELETE',
		'url': '/tag?old_name='
	}
}



module.exports.bookmarksApi = function( call, id, data, callback ) {
	
	let server 		= store.get( 'loginCredentials.server' ),
		username 	= store.get( 'loginCredentials.username' ),
		password 	= store.get( 'loginCredentials.password' )
	
	let init = {
		
		method: calltype[call]['method'],
		headers: {
			'Authorization': 'Basic ' + btoa( username + ':' + password ),
			'Content-Type': 'application/json'
		},
		mode: 'cors',
		cache: 'no-cache',
		credentials: 'omit'
	}
	
	let url = `${path}${calltype[call]['url']}${id}${data}`
	log.info(`${call} : ${url}`)
	
	fetch(server + url, init)
	.then(function(response) {
		
		if(!response.ok) {
			
			log.warn(`fetch error: ${response.status} - ${response.statusText}`)
			let errTxt = parseErrorMessage( response.status )
			throw Error( `${response.status} ${errTxt}` )
			
		} else {
		
			log.info( `response ok` )
			return response.text()
		}
		
	}).then(function(message) {
		
		switch( call ) {
			
			case 'all':
				
				let doc = JSON.parse(message)
				
				if (doc['status'] == 'error') {
					
					dialog.showErrorBox(
						i18n.t('fetch:errorbox.title.json', 'JSON parsing error'),
						i18n.t('fetch:errorbox.content.json', 'An error occured parsing the bookmarks')
					)
					
					log.error(doc['message'])
				
				} else {
					
					callback( doc.data )
					bookmarkFile.set('data', doc.data)
				}
				
			break
			
			case 'single': callback( message )
			break
			
			default: callback()
		}
		
	}).catch(function( error ) {
		
		log.error(error)
		
		dialog.showErrorBox(
			
			i18n.t('fetch:errorbox.title.error', 'Error'),
			i18n.t('fetch:errorbox.content.error', 'problem retrieving:\n{{- server}}{{- url}}\n\n{{error}}', {server: server, url: url, error: error})
		)
	})
}



function parseErrorMessage( message ) {
	
	let errMsg
	
	switch( message ) {
		
		case 400: errMsg = i18n.t('fetch:dialog.error.message.400', 'Bad Request')
		break
		case 401: errMsg = i18n.t('fetch:dialog.error.message.401', 'Unauthorized')
		break
		case 403: errMsg = i18n.t('fetch:dialog.error.message.403', 'Forbidden')
		break
		case 404: errMsg = i18n.t('fetch:dialog.error.message.404', 'Not Found')
		break
		case 500: errMsg = i18n.t('fetch:dialog.error.message.500', 'Internal Server Error')
		break
		case 501: errMsg = i18n.t('fetch:dialog.error.message.501', 'Not Implemented')
		break
		case 502: errMsg = i18n.t('fetch:dialog.error.message.502', 'Bad Gateway')
		break
		case 503: errMsg = i18n.t('fetch:dialog.error.message.503', 'Service Unavailable')
		break
		case 504: errMsg = i18n.t('fetch:dialog.error.message.504', 'Gateway Timeout')
		break
		
		default: errMsg =  i18n.t('fetch:dialog.error.message.default', 'Unspecified')
	}
	
	return errMsg
}
