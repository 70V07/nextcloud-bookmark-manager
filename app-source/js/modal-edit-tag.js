'use strict'

const remote 		= require( 'electron' ).remote
const ipc 			= require( 'electron' ).ipcRenderer
const dialog 		= remote.dialog
const Store 		= require( 'electron-store' )
const store 		= new Store()
const $ 			= require( 'jquery' )

const fetch			= require( './fetch.min' )
const serialize		= require( './serialize.min' )

const 	urlParams = new URLSearchParams( location.search ),
		theTag = urlParams.get('tag')



//note(dgmid): populate form

function populateForm() {
	
	$('header').append( theTag )
	$('input[name="old_name"]').val( theTag )
	$('input[name="new_name"]').attr('placeholder', theTag).attr("pattern", '^(?!' + theTag + '$).*')
}



//note(dgmid): close modal

function closeModal() {
	
	const modal = remote.getCurrentWindow()
	modal.close()
}



$(document).ready(function() {
	
	populateForm()
	
	//note(dgmid): cancel modal
	
	$('#cancel').click( function() {
		
		closeModal()
	})
	
	
	//note(dgmid): update data
	
	$('#modal-form').submit( function( e ) {
		
		e.preventDefault()
		
		let	oldtag = $('input[name="old_name"]').val(),
			newtag = $('input[name="new_name"]').val()
		
		let data = serialize.serialize({
		
			'old_name': oldtag,
			'new_name': newtag
		})
		
		fetch.bookmarksApi( 'modifytag', '', data, function() {
			
			ipc.send('refresh', 'refresh')
			closeModal()
		})
	})
})
