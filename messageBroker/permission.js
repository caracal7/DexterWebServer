
const { DeepstreamPlugin } = require('@deepstream/types');
const { ACTIONS } = require( '@deepstream/protobuf/dist/types/messages');
const { TOPIC } = require( '@deepstream/protobuf/dist/types/all');

/*
const stripObj = obj => {
	const result = {};
	Object.getOwnPropertyNames(obj)
		.sort(i => typeof obj[i] != 'object' ? 1 : -1)
		.forEach(i =>
			result[i] = typeof obj[i] == 'object' ? {} : obj[i]
		);
	return result;
}

console.log( stripObj(ALL))
*/


module.exports = class Permission extends DeepstreamPlugin {

    constructor ( pluginOptions,  services) {
    	super( pluginOptions,  services);
    }

	async canPerformAction (socketWrapper, message, callback, passItOn) {
		const topic = TOPIC[message.topic];
		const action = ACTIONS[message.topic][message.action];

        if(topic == 'RECORD' && (action == 'CREATE' || action == 'READ' || action == 'PATCH' || action == 'UPDATE' || action == 'DELETE')) {
            console.log('===> canPerformAction <=== username/topic/action/name:', socketWrapper.userId , '/' , topic , '/' , action , '/' , message.name);
        } else if(topic == 'RECORD' && (action == 'SUBSCRIBECREATEANDREAD' || action == 'SUBSCRIBEANDHEAD')) {
            console.log('===> canPerformAction <=== username/topic/action/name/names:', socketWrapper.userId , '/' , topic , '/' , action , '/' , message.name , '/' , message.names);
            //console.log(ACTIONS[message.topic])
        } else {
            console.log('===> canPerformAction <=== username/topic/action:', socketWrapper.userId , '/' , topic , '/' , action);
    		console.log(message, passItOn);
        }



		// In this example just check that there is a name to the message and it contains the username.
		// This is a very naive example as it means the user
        // can't invoke RPCs and scopes all realtime interaction to just one client. However if you used `authData.orgName` this would allow you to do multi-tenancy

		return callback(socketWrapper, message, passItOn, null, true);

		if (message.action == 12 ) return callback(socketWrapper, message, passItOn, null, true)
        // permissions!
        if (message.name && message.name.includes(socketWrapper.userId))
            return callback(socketWrapper, message, passItOn, null, true)


        callback(socketWrapper, message, passItOn, "Error, name doesn't include the username or message doesn't have a name", false)
    }

	async whenReady (...args) {
		console.log('[permission.js ready]:::whenReady()')
	}

	close (...args) {
		console.log('[permission.js close]:::close()')
	}

}
