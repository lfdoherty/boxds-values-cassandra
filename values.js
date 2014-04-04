
exports.make = function(pool){

	pool.execute('CREATE TABLE boxds_values ('+
		'key varchar,'+
		'data blob,'+
		'last_sequence_id int,'+
		'PRIMARY KEY (key)'+
	');',function(){
	})
	
	return {
		exists: function(name, cb){
			pool.execute('SELECT last_sequence_id FROM boxds_values WHERE key = ?', [name], 1,function(err, result){
				try{
					if(err){
						console.log('ERROR: ' + err)
						cb(err)
					}else{
						if(result.rows.length === 0){
							cb(undefined, false)
						}else{
							cb(undefined, true)
						}
					}
				}catch(e){
					console.log('ERROR: ' + e.stack)
				}
			})
		},
		get: function(name, cb){
			//pool.cql
			//console.log('get')
			if(!name){
				console.log('ERROR: ' + new Error('undefined name').stack)
				cb('undefined name')
				return
			}
			
			pool.execute('SELECT data, last_sequence_id FROM boxds_values WHERE key = ?', [name], 1,function(err, result){
				if(err){
					console.log('ERROR: ' + err)
					try{
						cb(err)
					}catch(e){
						console.log('ERROR: ' + e.stack)
					}
				}else{
					//console.log('get-value(' + name + ')-> ' + JSON.stringify(result))
					if(result.rows.length === 0){
						//console.log('no value got for key: ' + name)
						try{
							cb()
						}catch(e){
							console.log('ERROR: ' + e.stack)
						}
					}else{
						//console.log('got ' + name + ' ' + JSON.stringify(result, null, 2))
						var row = result.rows[0]
						//console.log(JSON.stringify(row) + ' ' + row.data.constructor.name)
						var data = row.data
						var lastSequenceId = row.last_sequence_id
						try{
							cb(undefined, data, lastSequenceId)
						}catch(e){
							console.log('ERROR: ' + e.stack)
						}
					}
				}
			})
		},
		put: function(name, valueBuf, lastSequenceId, cb){
			if(typeof(lastSequenceId) !== 'number') throw new Error('lastSequenceId missing or not a number: ' + lastSequenceId)
			//pool.cql
			pool.execute('INSERT INTO boxds_values (key, last_sequence_id, data) VALUES (?, ?, ?)', [name, lastSequenceId, valueBuf], 1, function(err){
			//con.execute('UPDATE Standard1 SET ?=? WHERE key=?', ['cola', 'valuea', 'key0'], function(err) {
				if(err) throw err
				if(cb) cb(true)
			})
			//throw new Error('TODO')
		}
	}
}
