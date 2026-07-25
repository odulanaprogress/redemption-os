import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression()); // Enable gzip compression on all API responses

// ─── IN-MEMORY DATABASE SEEDS ─────────────────────────────────────────

let database = {
  venueMaps: [
    {
      id: 'map-001',
      updatedAt: 1718000000000,
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: 'zone-main',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]
              ]
            },
            properties: {
              name: 'Main Sanctuary',
              occupancyLimit: 15000,
              // Unnecessary properties that will be stripped for bandwidth optimization
              metaCreatedBy: 'Admin Grace',
              metaCreatedDate: '2024-01-01T12:00:00Z',
              legacyCodeReference: 'BLDG-A-SANC-101',
              architecturalDetailNotes: 'High ceiling, acoustically treated walls, 12 emergency exit routes.'
            }
          },
          {
            type: 'Feature',
            id: 'zone-north',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [[10, 10], [10, 20], [20, 20], [20, 10], [10, 10]]
              ]
            },
            properties: {
              name: 'North Wing',
              occupancyLimit: 8000,
              metaCreatedBy: 'Admin Grace',
              metaCreatedDate: '2024-01-02T10:00:00Z',
              legacyCodeReference: 'BLDG-A-WING-N202',
              architecturalDetailNotes: 'Connects to main parking lot'
            }
          }
        ]
      }
    }
  ],
  zones: [
    { id: 'zone-main', name: 'Main Sanctuary', capacity: 15000, attendees: 10850, status: 'operational', updatedAt: 1718000000000 },
    { id: 'zone-north', name: 'North Wing', capacity: 8000, attendees: 4960, status: 'operational', updatedAt: 1718000000000 },
    { id: 'zone-south', name: 'South Wing', capacity: 8000, attendees: 3840, status: 'operational', updatedAt: 1718000000000 },
    { id: 'zone-parking', name: 'Parking Lot A', capacity: 1000, attendees: 980, status: 'full', updatedAt: 1718000000000 }
  ],
  snapshots: [
    {
      id: 'snapshot-latest',
      timestamp: Date.now(),
      updatedAt: Date.now(),
      density: {
        'zone-main': 0.72,
        'zone-north': 0.62,
        'zone-south': 0.48,
        'zone-parking': 0.98
      }
    }
  ],
  incidents: []
};

// ─── EDGE/LOW BANDWIDTH OPTIMIZATION UTILITIES ─────────────────────────

/**
 * Strips unnecessary polygon properties from GeoJSON before transmission.
 * Ensures the payload is as lightweight as possible.
 */
function simplifyGeoJSON(geojson) {
  if (!geojson || geojson.type !== 'FeatureCollection') return geojson;

  const simplifiedFeatures = geojson.features.map(feature => {
    // Retain only key properties needed for styling/naming in the frontend
    const { name, occupancyLimit } = feature.properties || {};
    return {
      type: feature.type,
      id: feature.id,
      geometry: feature.geometry, // Keep exact geometry coords
      properties: {
        name,
        occupancyLimit
      }
    };
  });

  return {
    type: 'FeatureCollection',
    features: simplifiedFeatures
  };
}

// ─── API ROUTES ────────────────────────────────────────────────────────

// Delta Sync Endpoint
// Conflict resolution: Server wins for zone/map data
app.get('/api/sync', (req, res) => {
  const since = parseInt(req.query.since || '0', 10);
  console.log(`[API] Processing Delta Sync request since timestamp: ${since} (${new Date(since).toISOString()})`);

  // Filter modified records
  const changedMaps = database.venueMaps
    .filter(map => map.updatedAt > since)
    .map(map => ({
      ...map,
      geojson: simplifyGeoJSON(map.geojson) // Apply GeoJSON optimization
    }));

  const changedZones = database.zones.filter(zone => zone.updatedAt > since);
  const changedSnapshots = database.snapshots.filter(snap => snap.updatedAt > since);

  res.json({
    lastSyncTime: Date.now(),
    venueMaps: changedMaps,
    zones: changedZones,
    snapshots: changedSnapshots
  });
});

// Endpoint to receive incoming incident reports
app.post('/api/incidents', (req, res) => {
  const { zone, incidentType, description, phone, timestamp } = req.body;
  
  if (!zone || !incidentType) {
    return res.status(400).json({ error: 'Missing required incident fields.' });
  }

  const newIncident = {
    id: `inc-${Math.random().toString(36).substr(2, 9)}`,
    zone,
    incidentType,
    description: description || '',
    phone: phone || '',
    timestamp: timestamp || Date.now(),
    status: 'received',
    createdAt: Date.now()
  };

  database.incidents.push(newIncident);
  console.log('[API] New Incident Report Received & Saved:', newIncident);

  // Trigger SMS fallback alert to responders
  const smsBody = {
    zone,
    incidentType,
    description: description || 'No details provided.',
    incidentId: newIncident.id,
    phone: phone || process.env.DEFAULT_RESPONDER_PHONE || ''
  };

  // Run SMS send in background (non-blocking)
  sendAlertSMS(smsBody).catch(err => console.error('[SMS Callback] Error triggering SMS fallback:', err));

  res.status(201).json({
    success: true,
    data: newIncident
  });
});

// ─── SMS FALLBACK FOR ALERTS ──────────────────────────────────────────

/**
 * Handles alert transmission via Termii or Africa's Talking APIs
 */
async function sendAlertSMS({ zone, incidentType, description, incidentId, phone }) {
  if (!phone) {
    console.warn('[SMS Alert] Skipped. No responder phone number provided.');
    return;
  }

  const messageText = `ZONE ${zone} ALERT: ${incidentType} — ${description}. Ref: ${incidentId}`;
  console.log(`[SMS Alert] Preparing to send to ${phone}: "${messageText}"`);

  // 1. Try Termii API integration if configured
  if (process.env.TERMII_API_KEY) {
    try {
      console.log('[SMS Alert] Dispatching via Termii...');
      const response = await fetch('https://api.ng.termii.com/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phone,
          from: process.env.TERMII_SENDER_ID || 'Redemption',
          sms: messageText,
          type: 'plain',
          channel: 'generic',
          api_key: process.env.TERMII_API_KEY
        })
      });
      const data = await response.json();
      console.log('[SMS Alert] Termii response:', data);
      return data;
    } catch (error) {
      console.error('[SMS Alert] Termii dispatch failed:', error);
    }
  }

  // 2. Fallback or primary via Africa's Talking API
  if (process.env.AT_API_KEY && process.env.AT_USERNAME) {
    try {
      console.log('[SMS Alert] Dispatching via Africa\'s Talking...');
      const response = await fetch('https://api.africastalking.com/version1/messaging', {
        method: 'POST',
        headers: {
          'ApiKey': process.env.AT_API_KEY,
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          username: process.env.AT_USERNAME,
          to: phone,
          message: messageText
        })
      });
      const data = await response.json();
      console.log('[SMS Alert] Africa\'s Talking response:', data);
      return data;
    } catch (error) {
      console.error('[SMS Alert] Africa\'s Talking dispatch failed:', error);
    }
  }

  // 3. Log mock message if no credentials exist (Sandbox/Local environment)
  console.log(`[SMS Alert Mock] 🚨 SMS SENT SUCCESSFULLY (Simulated API credentials check failed)`);
  console.log(`[SMS Alert Mock] Destination: ${phone} | Content: ${messageText}`);
}

// POST endpoint for explicit SMS alert trigger
app.post('/api/alerts/sms', async (req, res) => {
  const { zone, incidentType, description, incidentId, phone } = req.body;

  if (!zone || !incidentType || !incidentId || !phone) {
    return res.status(400).json({ error: 'Missing parameters. Required: { zone, incidentType, description, incidentId, phone }' });
  }

  try {
    const result = await sendAlertSMS({ zone, incidentType, description, incidentId, phone });
    res.json({ success: true, message: 'SMS Alert Dispatch Triggered', result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send SMS Alert fallback', details: error.message });
  }
});

// ─── USSD FALLBACK CALLBACK ───────────────────────────────────────────

// Africa's Talking USSD session callback endpoint
app.post('/api/ussd', (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  console.log(`[USSD Callback] Session: ${sessionId} | Code: ${serviceCode} | Phone: ${phoneNumber} | Text: "${text}"`);

  let response = '';
  const steps = text ? text.split('*') : [];

  if (steps.length === 0 || steps[0] === '') {
    // Main Menu
    response = `CON Welcome to Redemption OS Command Center
1. Check Zone Status
2. Report Incident
3. Evacuation Route`;
  } 
  // ─── MENU 1: CHECK ZONE STATUS ───
  else if (steps[0] === '1') {
    const statusText = database.zones.map(z => `${z.name}: ${z.status.toUpperCase()} (${Math.round((z.attendees/z.capacity)*100)}%)`).join('\n');
    response = `END Live Zone Statuses:\n${statusText}`;
  } 
  // ─── MENU 2: REPORT INCIDENT ───
  else if (steps[0] === '2') {
    if (steps.length === 1) {
      // Choose Incident Type
      response = `CON Select Incident Type:
1. Medical Emergency
2. Crowd Overcrowding
3. Fire Hazard
4. Security Issue`;
    } else if (steps.length === 2) {
      // Type chosen, ask for zone
      response = `CON Select Zone:
1. Main Sanctuary
2. North Wing
3. South Wing
4. Parking Lot A`;
    } else if (steps.length === 3) {
      // Zone chosen, ask description
      response = `CON Enter brief description of the incident:`;
    } else if (steps.length === 4) {
      // Description typed, finalize
      const incidentTypes = { '1': 'Medical Emergency', '2': 'Crowd Overcrowding', '3': 'Fire Hazard', '4': 'Security Issue' };
      const zones = { '1': 'Main Sanctuary', '2': 'North Wing', '3': 'South Wing', '4': 'Parking Lot A' };

      const type = incidentTypes[steps[1]] || 'General Incident';
      const zoneName = zones[steps[2]] || 'Unknown Zone';
      const desc = steps[3];

      const incidentId = `ussd-${Math.random().toString(36).substr(2, 5)}`;
      const newIncident = {
        id: incidentId,
        zone: zoneName,
        incidentType: type,
        description: `[USSD REPORT] ${desc}`,
        phone: phoneNumber,
        timestamp: Date.now(),
        status: 'received',
        createdAt: Date.now()
      };

      database.incidents.push(newIncident);
      console.log(`[USSD] Incident reported via USSD:`, newIncident);

      // Trigger parallel SMS Alert Dispatch to responder
      sendAlertSMS({
        zone: zoneName,
        incidentType: type,
        description: `[USSD] ${desc}`,
        incidentId,
        phone: phoneNumber // Send alert confirmation to user/reporter as well
      }).catch(err => console.error('[USSD Alert dispatch error]:', err));

      response = `END Incident reported successfully.
Thank you for keeping us safe.
Ref ID: ${incidentId}`;
    }
  } 
  // ─── MENU 3: EVACUATION ROUTE ───
  else if (steps[0] === '3') {
    if (steps.length === 1) {
      response = `CON Select Zone for evacuation instructions:
1. Main Sanctuary
2. North Wing
3. South Wing
4. Parking Lot A`;
    } else if (steps.length === 2) {
      const zoneChoice = steps[1];
      let evacRoute = '';
      let zoneName = '';

      switch (zoneChoice) {
        case '1':
          zoneName = 'Main Sanctuary';
          evacRoute = 'Proceed out the South main double doors to Assembly Area B.';
          break;
        case '2':
          zoneName = 'North Wing';
          evacRoute = 'Take North stairway down to ground floor and head to North Gate.';
          break;
        case '3':
          zoneName = 'South Wing';
          evacRoute = 'Follow green illuminated signs towards West Emergency Fire Exit.';
          break;
        case '4':
          zoneName = 'Parking Lot A';
          evacRoute = 'Walk past Gate A security guard box to the open lawns.';
          break;
        default:
          zoneName = 'Unknown Zone';
          evacRoute = 'Proceed immediately to your nearest clear exit path.';
      }

      response = `END Evacuation for ${zoneName}:
${evacRoute}`;
    }
  } else {
    response = `END Invalid entry. Exiting USSD session.`;
  }

  res.set('Content-Type', 'text/plain');
  res.send(response);
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Offline Fallback Node Server running on http://localhost:${PORT}`);
});
