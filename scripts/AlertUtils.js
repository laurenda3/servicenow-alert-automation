var AlertUtils = Class.create();
AlertUtils.prototype = {
    initialize: function () { },

    /**
     * Processes an incoming maintenance alert and determines the response.
     * 
     * @param {GlideRecord} alertGR - The maintenance alert record to process.
     * @return {string} The sys_id of the created incident (if any).
     * 
     * Why: I moved the ticket creation and routing rules into one 
     * organized script to keep things professional. This means the 
     * main rule can stay simple while the script handles the 
     * complex parts of mapping the data.
     */
    processAlert: function (alertGR) {
        if (!alertGR) return '';

        // Only process high-priority alerts for incident creation
        if (alertGR.severity == 'Critical' || alertGR.severity == 'High') {
            var incident = new GlideRecord('incident');
            incident.initialize();

            // Data Mapping: Alert -> Incident
            incident.short_description = alertGR.alert_type + ' Alert - ' + alertGR.unit.getDisplayValue();
            incident.description = 'Source System: ' + alertGR.external_system + '\n' +
                'Sensor Message: ' + alertGR.message;

            // Priority Mapping logic
            incident.priority = (alertGR.severity == 'Critical') ? 1 : 2;

            // Intelligent Routing to Specialist groups
            incident.assignment_group = this._getAssignmentGroup(alertGR.alert_type);

            // Referential Integrity: Link back to source alert
            incident.u_source_alert = alertGR.sys_id;

            var incidentID = incident.insert();

            return incidentID;
        }
        return '';
    },

    /**
     * Helper to route alerts to specific trade groups.
     * @private
     */
    _getAssignmentGroup: function (type) {
        var groupName = 'Maintenance General';

        if (type == 'HVAC') groupName = 'HVAC Specialists';
        else if (type == 'Plumbing') groupName = 'Plumbing Group';
        else if (type == 'Electrical') groupName = 'Electrician Team';

        var gr = new GlideRecord('sys_user_group');
        if (gr.get('name', groupName)) {
            return gr.sys_id;
        }
        return '';
    },

    type: 'AlertUtils'
};
