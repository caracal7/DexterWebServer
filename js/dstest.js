process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const { DeepstreamClient } = require('@deepstream/client');

// Isolated vm test 1

// Create a new isolate limited to 128MB
const ivm = require('isolated-vm');
const isolate = new ivm.Isolate({ memoryLimit: 128 });

// Create a new context within this isolate. Each context has its own copy of all the builtin
// Objects. So for instance if one context does Object.prototype.foo = 1 this would not affect any
// other contexts.
const context = isolate.createContextSync();

// Get a Reference{} to the global object within the context.
const jail = context.global;

// This make the global object available in the context as `global`. We use `derefInto()` here
// because otherwise `global` would actually be a Reference{} object in the new isolate.
jail.setSync('global', jail.derefInto());

// We will create a basic `log` function for the new isolate to use.
const logCallback = function(...args) {
	console.log(...args);
};
context.evalClosureSync(`global.log = function(...args) {
	$0.applyIgnored(undefined, args, { arguments: { copy: true } });
}`, [ logCallback ], { arguments: { reference: true } });

// And let's test it out:
context.evalSync('log("hello world")');
// > hello world

// Let's see what happens when we try to blow the isolate's memory
const hostile = isolate.compileScriptSync(`
	const storage = [];
	const twoMegabytes = 1024 * 1024 * 2;
	while (true) {
		const array = new Uint8Array(twoMegabytes);
		for (let ii = 0; ii < twoMegabytes; ii += 4096) {
			array[ii] = 1; // we have to put something in the array to flush to real memory
		}
		storage.push(array);
		log('I\\'ve wasted '+ (storage.length * 2)+ 'MB');
	}
`);

// Using the async version of `run` so that calls to `log` will get to the main node isolate
hostile.run(context).catch(err => console.error(err));



//==============================================================================





//------------------------------------------------------------------------------


const deepstream = (options) => new Promise((resolve, reject) => {

    console.log('DeepstreamClient');
    const client = new DeepstreamClient('wss://192.168.1.142:6020');


	client.whoami = {
		username: undefined
	};

	client.login( {
		username: options.username,
		password: options.password
	}, async (valid, args) => {
        console.log(args)
		if( valid ) {
			client.whoami.username = options.username;
			resolve(client);
		}
		else reject(Error(args.reason));
	});
});


const app = async () => {

    const client = await deepstream({ username:'server', password: 'serverklg' }).catch(e => e);
    if(client instanceof Error) console.log('Error', client);
    console.log(client.whoami);

    client.rpc.provide('add-two-numbers', (data, response) => {
        response.send( data.numA + data.numB );
    })


}

app();
