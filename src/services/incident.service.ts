import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, isMockMode } from '../config/firebase.config';
import { Incident, IncidentStatus, IncidentType, IncidentPriority } from '../types';
import { v4 as uuidv4 } from 'uuid';

// In-memory mock incidents
const mockIncidents: Incident[] = [
  {
    id: 'inc-001',
    reportedBy: 'security-001',
    type: 'medical',
    priority: 'high',
    status: 'in_progress',
    title: 'Medical Emergency',
    description: 'Elderly attendee fainted near Zone C refreshment stand. Medical team dispatched.',
    location: { zone: 'Zone C', building: 'Refreshment Area' },
    assignedTo: ['security-001'],
    createdAt: new Date(Date.now() - 25 * 60000),
    updatedAt: new Date(Date.now() - 10 * 60000),
  },
  {
    id: 'inc-002',
    reportedBy: 'parent-001',
    type: 'lost_child',
    priority: 'critical',
    status: 'acknowledged',
    title: 'Lost Child Report',
    description: 'Child Timmy, age 6, yellow shirt. Last seen near Stage Area 20 minutes ago.',
    location: { zone: 'Stage Area', building: 'Main Auditorium' },
    assignedTo: ['security-001', 'security-002'],
    createdAt: new Date(Date.now() - 20 * 60000),
    updatedAt: new Date(Date.now() - 5 * 60000),
  },
  {
    id: 'inc-003',
    reportedBy: 'attendee-001',
    type: 'security',
    priority: 'medium',
    status: 'reported',
    title: 'Unauthorized Access',
    description: 'Unknown individual attempting to enter restricted backstage area at Gate 3.',
    location: { zone: 'Gate 3', building: 'Backstage Entrance' },
    createdAt: new Date(Date.now() - 15 * 60000),
    updatedAt: new Date(Date.now() - 15 * 60000),
  },
  {
    id: 'inc-004',
    reportedBy: 'attendee-001',
    type: 'facility',
    priority: 'low',
    status: 'resolved',
    title: 'Sound Issue in Hall B',
    description: 'Audio feedback causing discomfort. Speaker team resolved.',
    location: { zone: 'Hall B', building: 'North Wing' },
    createdAt: new Date(Date.now() - 60 * 60000),
    updatedAt: new Date(Date.now() - 45 * 60000),
    resolvedAt: new Date(Date.now() - 45 * 60000),
    resolution: 'Audio team adjusted speaker levels and eliminated feedback loop.',
  },
  {
    id: 'inc-005',
    reportedBy: 'security-002',
    type: 'other',
    priority: 'medium',
    status: 'in_progress',
    title: 'Parking Lot Overcrowding',
    description: 'Parking Lot A is at full capacity. Traffic backing up on main access road.',
    location: { zone: 'Parking Lot A', building: 'Main Entrance' },
    assignedTo: ['security-002'],
    createdAt: new Date(Date.now() - 40 * 60000),
    updatedAt: new Date(Date.now() - 20 * 60000),
  },
];

export class IncidentService {
  private collectionName = 'incidents';

  async createIncident(incidentData: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) {
    if (isMockMode) {
      const incident: Incident = {
        id: `inc-${uuidv4().slice(0, 8)}`,
        ...incidentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockIncidents.unshift(incident);
      return { success: true, data: incident };
    }
    try {
      const incidentRef = doc(collection(db!, this.collectionName));
      const incident: Incident = {
        id: incidentRef.id,
        ...incidentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await setDoc(incidentRef, incident);
      return { success: true, data: incident };
    } catch (error: any) {
      console.error('Create incident error:', error);
      return { success: false, error };
    }
  }

  async getIncident(id: string): Promise<Incident | null> {
    if (isMockMode) return mockIncidents.find((i) => i.id === id) ?? null;
    try {
      const ref = doc(db!, this.collectionName, id);
      const snap = await getDoc(ref);
      if (snap.exists()) return { id, ...snap.data() } as Incident;
      return null;
    } catch (error) {
      console.error('Get incident error:', error);
      return null;
    }
  }

  async getIncidents(filters?: {
    type?: IncidentType;
    status?: IncidentStatus;
    priority?: IncidentPriority;
    reportedBy?: string;
    assignedTo?: string;
  }): Promise<Incident[]> {
    if (isMockMode) {
      return mockIncidents.filter((i) => {
        if (filters?.type && i.type !== filters.type) return false;
        if (filters?.status && i.status !== filters.status) return false;
        if (filters?.priority && i.priority !== filters.priority) return false;
        if (filters?.reportedBy && i.reportedBy !== filters.reportedBy) return false;
        if (filters?.assignedTo && !i.assignedTo?.includes(filters.assignedTo)) return false;
        return true;
      });
    }
    try {
      let q = query(collection(db!, this.collectionName), orderBy('createdAt', 'desc'));
      if (filters?.type) q = query(q, where('type', '==', filters.type));
      if (filters?.status) q = query(q, where('status', '==', filters.status));
      if (filters?.priority) q = query(q, where('priority', '==', filters.priority));
      if (filters?.reportedBy) q = query(q, where('reportedBy', '==', filters.reportedBy));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Incident));
    } catch (error) {
      console.error('Get incidents error:', error);
      return [];
    }
  }

  async getActiveIncidents(): Promise<Incident[]> {
    if (isMockMode) {
      return mockIncidents.filter((i) =>
        ['reported', 'acknowledged', 'in_progress'].includes(i.status)
      );
    }
    try {
      const q = query(
        collection(db!, this.collectionName),
        where('status', 'in', ['reported', 'acknowledged', 'in_progress']),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Incident));
    } catch (error) {
      console.error('Get active incidents error:', error);
      return [];
    }
  }

  async updateIncident(id: string, updates: Partial<Incident>) {
    if (isMockMode) {
      const idx = mockIncidents.findIndex((i) => i.id === id);
      if (idx > -1) Object.assign(mockIncidents[idx], { ...updates, updatedAt: new Date() });
      return { success: true };
    }
    try {
      const ref = doc(db!, this.collectionName, id);
      await updateDoc(ref, { ...updates, updatedAt: new Date() });
      return { success: true };
    } catch (error: any) {
      console.error('Update incident error:', error);
      return { success: false, error };
    }
  }

  async resolveIncident(id: string, resolution: string) {
    if (isMockMode) {
      const idx = mockIncidents.findIndex((i) => i.id === id);
      if (idx > -1) Object.assign(mockIncidents[idx], {
        status: 'resolved', resolution, resolvedAt: new Date(), updatedAt: new Date(),
      });
      return { success: true };
    }
    try {
      const ref = doc(db!, this.collectionName, id);
      await updateDoc(ref, { status: 'resolved', resolution, resolvedAt: new Date(), updatedAt: new Date() });
      return { success: true };
    } catch (error: any) {
      console.error('Resolve incident error:', error);
      return { success: false, error };
    }
  }

  async deleteIncident(id: string) {
    if (isMockMode) {
      const idx = mockIncidents.findIndex((i) => i.id === id);
      if (idx > -1) mockIncidents.splice(idx, 1);
      return { success: true };
    }
    try {
      const ref = doc(db!, this.collectionName, id);
      await deleteDoc(ref);
      return { success: true };
    } catch (error: any) {
      console.error('Delete incident error:', error);
      return { success: false, error };
    }
  }
}

export const incidentService = new IncidentService();
