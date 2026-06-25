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
} from 'firebase/firestore';
import { db, isMockMode } from '../config/firebase.config';
import { QRTag } from '../types';
import { qrService } from './qr.service';
import { v4 as uuidv4 } from 'uuid';
import { useSessionStore } from '../store/session.store';

// In-memory mock store
const mockMembers: FamilyMember[] = [
  {
    id: 'child-001',
    parentId: 'parent-001',
    firstName: 'Timmy',
    lastName: 'Okonkwo',
    dateOfBirth: new Date('2018-03-12'),
    allergies: ['Peanuts', 'Latex'],
    medicalNotes: 'Mild asthma – carries inhaler',
    assignedZone: 'Children Zone A',
    emergencyContact: {
      name: 'David Okonkwo',
      relationship: 'Father',
      phoneNumber: '+234 800 111 2233',
      alternatePhone: '+234 800 444 5566',
    },
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date(),
  },
  {
    id: 'child-002',
    parentId: 'parent-001',
    firstName: 'Grace',
    lastName: 'Okonkwo',
    dateOfBirth: new Date('2020-07-22'),
    allergies: [],
    assignedZone: 'Children Zone B',
    emergencyContact: {
      name: 'David Okonkwo',
      relationship: 'Father',
      phoneNumber: '+234 800 111 2233',
    },
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date(),
  },
  {
    id: 'child-003',
    parentId: 'parent-002',
    firstName: 'Kwesi',
    lastName: 'Mensah',
    dateOfBirth: new Date('2017-11-05'),
    allergies: ['Shellfish'],
    assignedZone: 'Children Zone A',
    emergencyContact: {
      name: 'Sarah Mensah',
      relationship: 'Mother',
      phoneNumber: '+233 200 555 6677',
    },
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date(),
  },
  {
    id: 'child-004',
    parentId: 'parent-002',
    firstName: 'Abena',
    lastName: 'Mensah',
    dateOfBirth: new Date('2019-04-18'),
    allergies: [],
    assignedZone: 'Children Zone B',
    emergencyContact: {
      name: 'Sarah Mensah',
      relationship: 'Mother',
      phoneNumber: '+233 200 555 6677',
    },
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date(),
  },
];

const mockQRTags: QRTag[] = [];

export class FamilyService {
  private collectionName = 'family_members';
  private qrCollectionName = 'qr_tags';

  async createFamilyMember(
    parentId: string,
    memberData: Omit<FamilyMember, 'id' | 'parentId' | 'createdAt' | 'updatedAt' | 'sessionId'>
  ) {
    const memberId = isMockMode ? `child-${uuidv4().slice(0, 8)}` : uuidv4();
    const sessionId = useSessionStore.getState().activeSessionId || 'DEFAULT_SESSION';

    try {
      const qrCodeData = await qrService.generateQRCode({
        familyMemberId: memberId,
        parentId,
        firstName: memberData.firstName,
        lastName: memberData.lastName,
      });

      const familyMember: FamilyMember = {
        id: memberId,
        sessionId,
        parentId,
        ...memberData,
        qrCode: qrCodeData.qrCodeURL,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const qrTag: QRTag = {
        id: qrCodeData.id,
        familyMemberId: memberId,
        qrCodeData: qrCodeData.data,
        qrCodeURL: qrCodeData.qrCodeURL,
        printable: true,
        createdAt: new Date(),
      };

      if (isMockMode) {
        mockMembers.unshift(familyMember);
        mockQRTags.push(qrTag);
      } else {
        const memberRef = doc(db!, this.collectionName, memberId);
        await setDoc(memberRef, familyMember);
        await setDoc(doc(db!, this.qrCollectionName, qrCodeData.id), qrTag);
      }

      return { success: true, data: { familyMember, qrTag } };
    } catch (error: any) {
      console.error('Create family member error:', error);
      return { success: false, error };
    }
  }

  async getFamilyMember(id: string): Promise<FamilyMember | null> {
    if (isMockMode) return mockMembers.find((m) => m.id === id) ?? null;
    try {
      const ref = doc(db!, this.collectionName, id);
      const snap = await getDoc(ref);
      if (snap.exists()) return { id, ...snap.data() } as FamilyMember;
      return null;
    } catch (error) {
      console.error('Get family member error:', error);
      return null;
    }
  }

  async getFamilyMembersByParent(parentId: string): Promise<FamilyMember[]> {
    const sessionId = useSessionStore.getState().activeSessionId;
    if (isMockMode) return mockMembers.filter((m) => m.parentId === parentId && (!sessionId || m.sessionId === sessionId || !m.sessionId));
    try {
      const q = query(collection(db!, this.collectionName), where('parentId', '==', parentId));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FamilyMember));
    } catch (error) {
      console.error('Get family members error:', error);
      return [];
    }
  }

  async updateFamilyMember(id: string, updates: Partial<FamilyMember>) {
    if (isMockMode) {
      const idx = mockMembers.findIndex((m) => m.id === id);
      if (idx > -1) Object.assign(mockMembers[idx], { ...updates, updatedAt: new Date() });
      return { success: true };
    }
    try {
      const ref = doc(db!, this.collectionName, id);
      await updateDoc(ref, { ...updates, updatedAt: new Date() });
      return { success: true };
    } catch (error: any) {
      console.error('Update family member error:', error);
      return { success: false, error };
    }
  }

  async deleteFamilyMember(id: string) {
    if (isMockMode) {
      const idx = mockMembers.findIndex((m) => m.id === id);
      if (idx > -1) mockMembers.splice(idx, 1);
      return { success: true };
    }
    try {
      const ref = doc(db!, this.collectionName, id);
      await deleteDoc(ref);
      const q = query(collection(db!, this.qrCollectionName), where('familyMemberId', '==', id));
      const snap = await getDocs(q);
      snap.docs.forEach(async (qrDoc) => await deleteDoc(qrDoc.ref));
      return { success: true };
    } catch (error: any) {
      console.error('Delete family member error:', error);
      return { success: false, error };
    }
  }

  async getQRTag(familyMemberId: string): Promise<QRTag | null> {
    if (isMockMode) {
      const member = mockMembers.find((m) => m.id === familyMemberId);
      if (!member?.qrCode) return null;
      return mockQRTags.find((t) => t.familyMemberId === familyMemberId) ?? {
        id: `qr-${familyMemberId}`,
        familyMemberId,
        qrCodeData: JSON.stringify({ familyMemberId }),
        qrCodeURL: member.qrCode,
        printable: true,
        createdAt: member.createdAt,
      };
    }
    try {
      const q = query(collection(db!, this.qrCollectionName), where('familyMemberId', '==', familyMemberId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return { id: d.id, ...d.data() } as QRTag;
      }
      return null;
    } catch (error) {
      console.error('Get QR tag error:', error);
      return null;
    }
  }

  async scanQRCode(qrCodeData: string) {
    try {
      const parsedData = JSON.parse(qrCodeData);
      const familyMember = await this.getFamilyMember(parsedData.familyMemberId);
      if (!familyMember) return { success: false, error: 'Family member not found' };
      return {
        success: true,
        data: {
          child: {
            name: `${familyMember.firstName} ${familyMember.lastName}`,
            photo: familyMember.photoURL,
            dateOfBirth: familyMember.dateOfBirth,
            allergies: familyMember.allergies,
            medicalNotes: familyMember.medicalNotes,
          },
          guardian: familyMember.emergencyContact,
          assignedZone: familyMember.assignedZone,
        },
      };
    } catch (error: any) {
      console.error('Scan QR code error:', error);
      return { success: false, error };
    }
  }

  getAllMockMembers() {
    const sessionId = useSessionStore.getState().activeSessionId;
    return mockMembers.filter(m => !sessionId || m.sessionId === sessionId || !m.sessionId);
  }
}

export const familyService = new FamilyService();
