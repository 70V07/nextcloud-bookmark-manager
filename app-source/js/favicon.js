'use strict'

const {BrowserWindow} = require( 'electron' )
const path 					= require( 'path' )
const fs 					= require( 'fs-extra' )
const nativeImage 			= require( 'electron' ).nativeImage
const axios 				= require( 'axios' ).default
const Store					= require( 'electron-store' )
const store 				= new Store()
const log  					= require( 'electron-log' )

const dir 					= store.get( 'dirPath' )
const defaultIcon 			= path.join( __dirname, '../assets/png/' )



module.exports.generate = function () {
	
	let win = BrowserWindow.fromId(1)
	
	let bookmarks 		= new Store( {name: 'bookmarks'} ),
		bookmarkdata 	= bookmarks.get( 'data' ),
		defaultIcons	= store.get( 'defaultIcons' ),
		faviconcount 	= 0,
		faviconarray	= []
	
	for( let  bookmark of bookmarkdata ) {
	
		if(  !defaultIcons.includes( bookmark.id ) && !fs.pathExistsSync( `${dir}/favicons/${bookmark.id}.png` ) ) {
			
			faviconarray.push( bookmark )
		}
	}
	
	let arraylength = faviconarray.length
	
	if( arraylength < 1 ) {
		
		log.info( 'No favicons to generate' )
		win.webContents.send( 'load-tray-menu', '' )
	}
	
	for( let i = 0; i < arraylength; i++ ) {
		
		let win = BrowserWindow.fromId(1)
		
		let bookmarkUrl = new URL( faviconarray[i].url ),
			domain 		= bookmarkUrl.hostname,
			iconurl 	= `https://api.faviconkit.com/${domain}/32`,
			file 		= `${dir}/favicons/${faviconarray[i].id}.png`,
			file2x		= `${dir}/favicons/${faviconarray[i].id}@2x.png`
	
		axios.get(iconurl,  { responseType: 'arraybuffer' })
		.then( function( response ) {
			
			const buffer = Buffer.from(response.data, "utf-8")
			
			if(
				response.headers['content-type'].includes('png') ||
				response.headers['content-type'].includes('jpeg') ||
				response.headers['content-type'].includes('x-icon')
			) {
				
				let imgpng = nativeImage.createFromBuffer(buffer, {
						
						scaleFactor: 1.0
					}).resize({
						width: 16,
						height: 16,
						quality: 'best'
					}).toPNG()
				
				let imgpng2x = nativeImage.createFromBuffer(buffer, {
						
						scaleFactor: 1.0
					}).resize({
						width: 32,
						height: 32,
						quality: 'best'
					}).toPNG()
				
				fs.outputFileSync(file, imgpng, err => {
					
					if(err) log.info(err)
				})
				
				fs.outputFileSync(file2x, imgpng2x, err => {
					
					if(err) log.info(err)
				})
				
				log.info(faviconarray[i].id)
				
				faviconcount++
				if( faviconcount === arraylength ) {
					
					log.info( `Generated ${faviconcount} favicons` )
					store.set( 'defaultIcons', defaultIcons )
					
					win.webContents.send( 'load-tray-menu', '' )
				}
				
			} else {
				
				faviconFallback( bookmarkdata[i].id, bookmarkUrl, file, file2x, function( defaultIcon ) {
					
					log.info(faviconarray[i].id)
					
					if( defaultIcon ) {
						
						defaultIcons.push( defaultIcon )
					}
					
					faviconcount++
					if( faviconcount === arraylength ) {
						
						log.info( `Generated ${faviconcount} favicons` )
						store.set( 'defaultIcons', defaultIcons )
						
						win.webContents.send( 'load-tray-menu', '' )
					}
				})
			}
		})
		.catch( function( err ) {
			
			log.info( `favicon error: ${faviconarray[i].id}: ${err.message}` )
			
			faviconFallback( bookmarkdata[i].id, bookmarkUrl, file, file2x, function( defaultIcon ) {
				
				log.info(faviconarray[i].id)
				
				if( defaultIcon ) {
					
					defaultIcons.push( defaultIcon )
				}
				
				faviconcount++
				if( faviconcount === arraylength ) {
					
					log.info( `Generated ${faviconcount} favicons` )
					store.set( 'defaultIcons', defaultIcons )
					
					win.webContents.send( 'load-tray-menu', '' )
				}
			})
		})
	}
}



module.exports.get = function ( id ) {
	
	if( fs.pathExistsSync( `${dir}/favicons/${id}.png` ) ) {
		
		return `${dir}/favicons/${id}.png`
		
	} else {
		
		return path.join(__dirname, '../assets/png/faviconTemplate.png') 
	}
}



module.exports.exists = function ( id ) {
	
	return ( fs.pathExistsSync( `${dir}/favicons/${id}.png` ) ) ? true : false
}



function faviconFallback( id, url, file, file2x, callback ) {
	
	let iconurl = 'https://www.google.com/s2/favicons?sz=32&domain_url=' + url,
	defaultIcon = null

	axios.get(iconurl,  { responseType: 'arraybuffer' })
	.then( function( response ) {
		
		const buffer = Buffer.from(response.data, "utf-8")
		
		let imgpng = nativeImage.createFromBuffer(buffer, {
				
				scaleFactor: 1.0
			}).resize({
				width: 16,
				height: 16,
				quality: 'best'
			}).toPNG()
		
		let imgpng2x = nativeImage.createFromBuffer(buffer, {
				
				scaleFactor: 1.0
			}).resize({
				width: 32,
				height: 32,
				quality: 'best'
			}).toPNG()
		
		let b64enc = Buffer.from(imgpng, 'binary').toString('base64')
		
		if( isNotDefaultIcon( b64enc ) ) {
			
			fs.outputFileSync(file, imgpng, err => {
				
				if (err) log.info(err)
			})
			
			fs.outputFileSync(file2x, imgpng2x, err => {
				
				if (err) log.info(err)
			})
		
		} else {
			
			defaultIcon = id
		}
		
		callback( defaultIcon )
	})
	.catch( function( err ) {
		
		log.info( `fallback favicon error: ${id}: ${err.message}` )
	})
}



function isNotDefaultIcon( b64 ) {
	
	return ( b64 === 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACs0lEQVQ4jaWTzU8bBxDFf7V31/baXn+sP2oDduxaCZFKqiKDEDSHKKLKiRs55JCPQ070zyGHinsrxbk0kXpBqsTBKQUbqa1AUCgFk0C8trv2YrNm1y69gJWoveWdZqR5b97MaOAj8clVMD//3FO1apGZfHbCtnoLetPMt4yuD0Dxu9uhoKckuYRnxdL+elyK1guF++ZAYH7+uadt68nc9fjTdud8LpdRY6lsWLXsPpLoJJNSWV7ebhxUdE3xSy/3/qgt+cTQcaFw3xQAqlYt8sWNoadnZu/B57cSI5m0ileWGB8bpnNmkU4qZFMR9fftY/W778u+XC7Kr7snz4AjB8BMPjthtLtzTx5NjGTSKgCW3Wd143Awa0yVEUUnjx9OjrQ653Mz+ewEgAPAOu8tXBsJxaa+TA0Itt3HtvuEAjIAHbNHs2USCnhIDYVi3a69MBDQm2Z+dnZU7Zi9DzZ896vrKF4BAK9H4MZnMfYrf3Pv3k1V1808gADQMkxfPKKgeAW8ssRwIshwIjggAzgdUK2fAhCPKBiG6Rs4APDKEgBT49d4c9LEsj90cwVRdAJwcZkLV3fer9SVRDSF4hX4+naOYrnCzmVRNhUhEZW5M5Wh3uyy86eG4ne3Bw7CIbm0vLzdeL/T2GgSrd5Gq7dZ3Thg7bdjACJBN69ebTbCQbk0EBBFYfGgomvFcuV/bQO8PWnS/weK5QrH1ZbmcouLAE4AR2C6k04GAz//cpiOfqoEUskALsmBKIpol4sbG02ys6/x7dLro6Df9aK0efTD4c6PhhNg8tZj+12tsZtIKNLr1QO1tHHkcPtccrN1xolmYJx2WVnZa/y0snsY9Lte7O3VlsKSWt3aKvT+80zT49n8uWV/o+tm3jjt+i4uLlD87rYaltdlt7C4VvqrHHjvmT4a/wJLYRPRy3Z+JAAAAABJRU5ErkJggg==' ) ? false : true
}