OdieBotnet - Device Manager service

The Device Manager is in charge of managing device ip and websocket connections based on device id's. 

The main purpose of the Device Manager is to route messages from a rest interface to specific devices. 

Id's identify any grouping of devices as well as actual control points to route messages.

API:
*POST - Device/:deviceId
**route message to a specific device through it's device-id-number
**Any data in the body of the post request is passed to the device with a specific ID
