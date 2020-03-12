
module.exports.serialize = function( obj ) {
	
	const str = []
	for ( let p in obj )
		if ( obj.hasOwnProperty(p) ) {
			str.push( encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]) )
		}
	
	return str.join("&")
}
