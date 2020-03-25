'use strict'

const i18n		= require( './i18n.min' )

const Store		= require( 'electron-store' )
const store		= new Store()
const $			= require( 'jquery' )
const dt		= require( 'datatables.net' )( window, $ )
const keytable	= require( 'datatables.net-keytable' )( window, $ )



module.exports.bookmarkTable = $('#bookmarks').DataTable({
	
	keys: {
		tabIndex: 1,
		blurable: true,
		keys: [ 	32, // space
					38, // up
					40  // down
		]
	},
	scrollY: 	'calc(100vh - 59px)', // window height - header - footer
	paging: 	false,
	dom: 'ltipr', // hide default search field
	columns:
	[
		{title: 'ID'},
		{title: ''},
		{title: i18n.t('bookmarktable:header.title', 'Title')},
		{title: i18n.t('bookmarktable:header.description', 'Description')},
		{title: i18n.t('bookmarktable:header.url', 'Url')},
		{title: 'unix added'},
		{title: i18n.t('bookmarktable:header.created', 'Created')},
		{title: 'unix modified'},
		{title: i18n.t('bookmarktable:header.modified', 'Modified')},
		{title: i18n.t('bookmarktable:header.tags', 'Tags')}
	],
	columnDefs:
		[
			{
				targets: [ 0 ],
				visible: false,
				searchable: false
			},
			{
				targets: [ 1 ],
				className: 'details-control',
				orderable: false,
				data: null,
				defaultContent: '',
				width: '5px'
            },
			{
				targets: [ 2 ],
			},
			{
				targets: [ 3 ],
				visible: false
			},
			{
				targets: [ 4 ],
				visible: false
			},
			{
				targets: [ 5 ],
				visible: false
			},
			{
				targets: [ 6 ],
				visible: store.get('tableColumns.created'),
				searchable: false,
				width: '100px',
				iDataSort: 5
			},
			{
				targets: [ 7 ],
				visible: false
			},
			{
				targets: [ 8 ],
				visible: store.get('tableColumns.modified'),
				searchable: false,
				width: '100px',
				iDataSort: 7
			},
			{ 	className: 'date-column',
				targets: [ 6, 7 ]
			},
			{
				className: 'tags-column dt-body-right padded-right',
				targets: [ 9 ],
				width: '60px'
			}
		],
	
	language: {
		emptyTable: ' ',
		zeroRecords: i18n.t('bookmarktable:footer.zero', 'No matching Bookmarks were found'),
		info: i18n.t('bookmarktable:footer.info', 'Showing _TOTAL_ Bookmarks'),
		infoEmpty: i18n.t('bookmarktable:footer.empty', 'Showing 0 to 0 of 0 Bookmarks'),
		infoFiltered: i18n.t('bookmarktable:footer.filtered', '(filtered from _MAX_ Bookmarks)')
	}
})



module.exports.detailsTable = function( data ) {
	
	return `<div class="details-panel">
	<div class="row">
		<div class="label">${i18n.t('bookmarktable:header.url', 'Url')}:</div>
		<div class="value nowrap">${data[4]}</div>
	</div>
	
	<div class="row">
		<div class="label">${i18n.t('bookmarktable:header.description', 'Description')}:</div>
		<div class="value">${data[3]}</div>
	</div>
	
	<div class="row">
		<div class="label">${i18n.t('bookmarktable:header.created', 'Created')}:</div>
		<div class="value">${data[6]}</div>
	</div>
	
	<div class="row">
		<div class="label">${i18n.t('bookmarktable:header.modified', 'Modified')}:</div>
		<div class="value">${data[8]}</div>
	</div>
	
	<div class="row">
		<div class="label">${i18n.t('bookmarktable:header.tags', 'Tags')}:</div>
		<div class="value">${data[9]}</div>
	</div>
</div>`
}
