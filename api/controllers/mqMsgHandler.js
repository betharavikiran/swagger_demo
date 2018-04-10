'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
var util = require('util');

const amqp = require('amqplib/callback_api');

// Should come from Settings
const instance = 'amqp://avvzmzqh:1tHLz4fMPZmb9zbRjNc2DSmB-NlRrLF1@salamander.rmq.cloudamqp.com/avvzmzqh';
const queue = 'request_queue';

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
module.exports = {
    readMsg: readMsg,
    postMQMsg: postMQMsg
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function readMsg(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var name = req.swagger.params.name.value || 'stranger';
  var hello = util.format('Hello, %s!', name);

  // this sends back a JSON response which is a single string
  res.json(hello);
}

function postMQMsg(req, res){
    const data = req.swagger.params.mqMsg.value;
    postToMqInternal(data.requestorId, data.date, data.msgString);
    res.json('done');
}

function postToMqInternal(requestorId, date, msgStr) {
    amqp.connect(instance, function (err, conn) {
        conn.createChannel(function (err, ch) {
            ch.assertQueue(queue, {durable: true});
            ch.sendToQueue(queue, new Buffer(msgStr), {persistent: true});
            console.log(" [x] Sent '%s'", msgStr);
        });
        setTimeout(function () {
            conn.close();
            process.exit(0)
        }, 500);
    });
}

