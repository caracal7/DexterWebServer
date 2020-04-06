const { spawn } = require('child_process');

const job_name_to_process = {}

//const jobsQueue = new Map();



function get_job_name_to_process(job_name) {     //if there is such a process, then keep_alive is true
    return job_name_to_process[
        job_name_to_process.keep_alive
            ? job_name_to_process.keep_alive
            : job_name
    ];
}


function set_job_name_to_process(job_name, process) {
    job_name_to_process[job_name] = process;
}

function remove_job_name_to_process(job_name) {
    delete job_name_to_process[job_name];
}




function extract_job_name(job_name_with_extension) {
	const dot_pos = job_name_with_extension.indexOf(".");
    return dot_pos === -1
        ? job_name_with_extension
        : job_name_with_extension.substring(0, dot_pos);
}



//see bottom of je_and_browser_code.js: submit_window for
//the properties of mess_obj
function serve_show_window_call_callback(socket, mess_obj){
    let callback_arg = mess_obj.callback_arg
    let job_name = callback_arg.job_name
    let job_process = get_job_name_to_process(job_name)
    console.log("\n\nserve_show_window_call_callback got job_name: " + job_name + " and its process: " + job_process)
    let code = mess_obj.callback_fn_name + "(" +
               JSON.stringify(callback_arg) + ")"
    //code = mess_obj.callback_fn_name + '({"is_submit": false})' //out('short str')" //just for testing
    console.log("serve_show_window_call_callback made code: " + code)
    job_process.stdin.setEncoding('utf-8');
    job_process.stdin.write(code + "\n") //need the newline so that stdio.js readline will be called
}

//------------------------------------------------------------------------------

const myJob = (socket, options) => {
    console.log('myJob XXXX', options);
    const job_process = spawn('node',
        ["core define_and_start_job " + "RunCalMakeIns.dde"],
        {cwd: '/root/Documents/dde', shell: true}
    );
    job_process.stdout.on('data', data => {
        console.log("stdout", data);
        socket.send(data.toString());
    })
    job_process.stderr.on('data', data => {
        console.log("stderr", data);
        socket.send(data.toString());
    })
}

//------------------------------------------------------------------------------

const serve_job_button_click = (socket, mess_obj) => {
    console.log("serve_job_button_click()", mess_obj.job_name_with_extension);


    const job_name_with_extension = mess_obj.job_name_with_extension;
    const jobfile = "/srv/samba/share/dde_apps/" + job_name_with_extension;
    const job_name = extract_job_name(job_name_with_extension);
    const job_process = get_job_name_to_process(job_name) ;//warning: might be undefined.

    if(!job_process){
        //https://nodejs.org/api/child_process.html
        //https://blog.cloudboost.io/node-js-child-process-spawn-178eaaf8e1f9
        const job_process = spawn('node',
            ["core define_and_start_job " + jobfile],   //a jobfile than ends in "/keep_alive" is handled specially in core/index.js
            {cwd: '/root/Documents/dde', shell: true}
        );
        set_job_name_to_process(job_name, job_process);
        console.log("just set job_name: " + job_name + " to new process: " + job_process);

        job_process.stdout.on('data', data => {
            console.log("\n\nserver: stdout.on data got data: " + data + "\n");
            //server_response.write(data_str) //pipe straight through to calling browser's handle_stdout
            //https://github.com/expressjs/compression/issues/56 sez call flush even though it isn't documented.
            //server_response.flushHeaders() //flush is deprecated.
            socket.send(data.toString());
        })

        job_process.stderr.on('data', data => {
            console.log("\n\njob: " + job_name + " got stderr with data: " + data)
            remove_job_name_to_process(job_name)
            //server_response.write("Job." + job_name + " errored with: " + data)
            const lit_obj = {
                job_name: job_name,
                kind: "show_job_button",
                button_tooltip: "Server errored with: " + data,
                button_color: "red"
            }
            socket.send("<for_server>" + JSON.stringify(lit_obj) + "</for_server>");
            //server_response.end()
        })

        job_process.on('close', code => {
            console.log("\n\nServer closed the process of Job: " + job_name + " with code: " + code)
            if(code !== 0){
                const lit_obj = {
                    job_name: job_name,
                    kind: "show_job_button",
                    button_tooltip: "Errored with server close error code: " + code,
                    button_color: "red"
                }
                socket.send("<for_server>" + JSON.stringify(lit_obj) + "</for_server>");
            }
            remove_job_name_to_process(job_name);
        })
    }
    else {
    	let code
        if(job_name === "keep_alive") { //happens when transition from keep_alive box checked to unchecked
        	code = "set_keep_alive_value(" + mess_obj.keep_alive_value + ")"
        }
        else {
        	//code = "Job." + job_name + ".server_job_button_click()"
            code = 'Job.maybe_define_and_server_job_button_click("' + jobfile + '")'
        }
        console.log("serve_job_button_click writing to job: " + job_name + " stdin: " + code)
        //https://stackoverflow.com/questions/13230370/nodejs-child-process-write-to-stdin-from-an-already-initialised-process
        job_process.stdin.setEncoding('utf-8');
        job_process.stdin.write(code + "\n")
        //job_process.stdin.end();
    }
    //serve_get_refresh(q, req, res)
    //return serve_jobs(q, req, res)  //res.end()
};

//------------------------------------------------------------------------------

module.exports = {
    myJob,
    serve_job_button_click,
    serve_show_window_call_callback,
};
