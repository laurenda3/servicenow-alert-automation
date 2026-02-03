/**
 * @ScriptedRESTAPI: Inbound Maintenance Alert
 * @Method: POST
 * 
 * This represents the forward-looking architecture for the project.
 * It demonstrates the ability to handle raw JSON payloads from IoT sensors.
 */
(function process(request, response) {

    var body = request.body.data;
    var sensorData = JSON.parse(body);

    // Validate required fields for referential integrity
    if (!sensorData.event_type || !sensorData.unit_id) {
        return new sn_ws_err.BadRequestError('Missing required sensor data');
    }

    // Create Alert record (Land the data)
    var alert = new GlideRecord('u_maintenance_alert');
    alert.initialize();
    alert.external_system = sensorData.system_type;
    alert.alert_type = sensorData.event_type;
    alert.severity = sensorData.severity;
    alert.message = sensorData.message;
    alert.unit = sensorData.unit_id; // Mapping to Unit CI

    var alertID = alert.insert(); // The Business Rule 'Process Maintenance Alert' will fire here

    response.setStatus(201);
    response.setBody({
        "status": "success",
        "alert_id": alertID,
        "message": "Event captured and processing initiated."
    });

})(request, response);
