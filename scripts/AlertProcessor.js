/**
 * @BusinessRule: Process Maintenance Alert
 * @Table: u_maintenance_alert
 * @When: After Insert
 * 
 * Why: We use an 'After' rule because we are creating a record on a DIFFERENT table (incident).
 * This ensures the Alert itself is saved first, providing us with a sys_id to link
 * back to from the Incident record (referential integrity).
 */
(function executeRule(current, previous) {
    // Process high-priority alerts only
    if (current.severity == 'Critical' || current.severity == 'High') {

        var incident = new GlideRecord('incident');
        incident.initialize();

        // Data Mapping: Alert -> Incident
        incident.short_description = current.alert_type + ' Alert - ' + current.unit.getDisplayValue();
        incident.description = 'Source System: ' + current.external_system + '\n' +
            'Sensor Message: ' + current.message;

        // Priority Mapping
        incident.priority = (current.severity == 'Critical') ? 1 : 2;

        // Intelligent Routing Logic
        incident.assignment_group = getAssignmentGroup(current.alert_type);

        // Bidirectional Reference
        incident.u_source_alert = current.sys_id;

        var incidentID = incident.insert();

        // Update Alert with Reference to new Incident
        current.processed = true;
        current.created_incident = incidentID;
        current.update();
    }

    /**
     * Helper to route to correct maintenance specialist group
     */
    function getAssignmentGroup(type) {
        var groupName = 'Maintenance General';

        if (type == 'HVAC') groupName = 'HVAC Specialists';
        else if (type == 'Plumbing') groupName = 'Plumbing Group';
        else if (type == 'Electrical') groupName = 'Electrician Team';

        var gr = new GlideRecord('sys_user_group');
        if (gr.get('name', groupName)) {
            return gr.sys_id;
        }
        return '';
    }
})(current, previous);
