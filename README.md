# IoT Alert Processing System

Designed and delivered an event-driven alert processing system to automate incident creation from maintenance alerts. Built using Business Rules and REST API integration patterns to eliminate manual ticket entry and enable rapid response to equipment failures.

**Business Value:** Eliminates manual ticket creation, enables automated assignment routing, provides complete alert traceability, and supports future REST API integration with external monitoring systems.

---

## Business Problem

**Before:**
- Manual ticket creation required 30+ minutes per maintenance alert
- Delayed response to critical equipment failures (HVAC, water leaks, fire alarms)
- Alerts lost in email/text messages with no centralized tracking
- No automated assignment to appropriate maintenance specialists
- Manual data entry wasted staff time copying alert details into work orders

---

## Solution Delivered

**Event-Driven Alert Processing:**
- Created custom `u_maintenance_alert` table to capture alert data
- Implemented Business Rule automation:
  - Triggers on alert insert (After Insert)
  - Auto-creates incidents for high-severity alerts (Critical/High)
  - Populates incident from alert details (type, unit, message)
  - Sets priority based on severity classification
  - Routes to appropriate assignment group based on alert type
- Built assignment routing logic:
  - HVAC alerts → HVAC Specialists
  - Water/Plumbing → Plumber group
  - Fire/Safety → Emergency Response
  - Electrical → Electrician group
- Configured bidirectional reference fields for alert-to-incident traceability

---

## Business Value

**What the System Does:**
- **Eliminates manual ticket entry** through automated incident creation from alert records
- **Enables rapid response** via automatic assignment to appropriate specialist groups
- **Provides complete traceability** with bidirectional links between alerts and incidents
- **Supports REST API integration** - architecture ready for inbound webhook connectivity
- **Ensures 24/7 processing** through server-side automation (no manual intervention required)

---

## Technical Highlights

**ServiceNow Features Used:**
- **Business Rules:** Server-side JavaScript automation (After Insert trigger)
- **GlideRecord API:** Database operations for incident creation
- **Conditional Logic:** Severity-based processing and assignment routing
- **Reference Fields:** Bidirectional alert ↔ incident linking
- **Custom Tables:** Event capture table with full lifecycle tracking

**Code Example - Auto-Create Incidents:**
```javascript
(function executeRule(current, previous) {
    // Process high-priority alerts only
    if (current.severity == 'Critical' || current.severity == 'High') {
        
        // Create new incident
        var incident = new GlideRecord('incident');
        incident.initialize();
        incident.short_description = current.alert_type + ' Alert - ' + current.unit.getDisplayValue();
        incident.description = 'External System: ' + current.external_system + '\n' + 
                               'Alert Message: ' + current.message;
        incident.priority = (current.severity == 'Critical') ? 1 : 2;
        incident.assignment_group = getAssignmentGroup(current.alert_type);
        incident.u_source_alert = current.sys_id;
        var incidentID = incident.insert();
        
        // Update alert as processed
        current.processed = true;
        current.created_incident = incidentID;
        current.update();
    }
})(current, previous);
```

**REST API Integration Pattern (Production-Ready):**
```javascript
// Scripted REST API endpoint for external sensor data
(function process(request, response) {
    var payload = request.body.data;
    var sensorData = JSON.parse(payload);
    
    // Create alert from sensor telemetry
    var alert = new GlideRecord('u_maintenance_alert');
    alert.initialize();
    alert.external_system = sensorData.system_type;
    alert.alert_type = sensorData.event_type;
    alert.severity = sensorData.severity;
    alert.message = sensorData.message;
    alert.insert(); // Business Rule automatically fires
    
    response.setStatus(201);
    response.setBody({"status": "success"});
})(request, response);
```

---

## Screenshots

### Alert Capture Table Schema
![Alert Table](assets/01_maintenance_alert_table_structure.png)  
*Custom integration table with severity classification, alert type routing, and bidirectional incident linking*

### Real-Time Alert Feed
![Alert List](assets/02_mainenance_alerts_list.png)  
*Live event stream showing HVAC failures, water leaks, fire alarms, and equipment malfunctions*

### Alert Detail Record
![Alert Form](assets/03_maintenance_alert_form.png)  
*Complete event record showing unit location, severity, and auto-created incident reference*

### Automation Logic
![Business Rule](assets/04_business_rule_script.png)  
*Server-side JavaScript showing conditional processing, GlideRecord operations, and assignment routing*

### Auto-Generated Incident
![Created Incident](assets/05_incident_created_from_alert.png)  
*Work order automatically created, populated, and assigned from maintenance alert*

---

## Setup Notes

**Environment:** ServiceNow Personal Developer Instance (Zurich Release)

**Prerequisites:**
- Unit table (from Asset Management application)
- Incident table (OOTB ServiceNow)
- Assignment groups configured for routing

**Key Tables:**
- `u_maintenance_alert` (custom event capture table)
- Integration: `incident` (auto-created work orders)
- Integration: `u_unit` (location references)

**Production Integration (Future):**
- REST API endpoint for inbound sensor data
- JSON payload parsing
- OAuth 2.0 authentication
- Webhook registration with external IoT vendors

---

## Technologies

- Business Rules (Server-side JavaScript)
- GlideRecord API
- Scripted REST APIs (integration pattern)
- JSON Data Processing
- Event-Driven Architecture
- Reference Fields

---

## Related Projects

Integrates with [Asset Management Application](../project1_asset_compliance) for unit location references and [Mobile Portal](../project4_service_portal) for alert feed display.

---

**Built on ServiceNow Platform (Zurich Release)**
