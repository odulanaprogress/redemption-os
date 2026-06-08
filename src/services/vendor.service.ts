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
import { db } from '../config/firebase.config';
import { isMockMode } from '../config/firebase.config';
import { Vendor, VendorStatus, Product } from '../types';

export class VendorService {
  private vendorCollectionName = 'vendors';
  private productCollectionName = 'products';

  async createVendor(userId: string, vendorData: Omit<Vendor, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    try {
      const vendorRef = doc(collection(db!, this.vendorCollectionName));
      const vendor: Vendor = {
        id: vendorRef.id,
        userId,
        ...vendorData,
        rating: 0,
        totalSales: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(vendorRef, vendor);
      return { success: true, data: vendor };
    } catch (error: any) {
      console.error('Create vendor error:', error);
      return { success: false, error };
    }
  }

  async getVendor(id: string): Promise<Vendor | null> {
    try {
      const vendorRef = doc(db!, this.vendorCollectionName, id);
      const vendorSnap = await getDoc(vendorRef);

      if (vendorSnap.exists()) {
        return { id, ...vendorSnap.data() } as Vendor;
      }
      return null;
    } catch (error) {
      console.error('Get vendor error:', error);
      return null;
    }
  }

  async getVendorByUserId(userId: string): Promise<Vendor | null> {
    try {
      const q = query(collection(db!, this.vendorCollectionName), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const vendorDoc = querySnapshot.docs[0];
        return { id: vendorDoc.id, ...vendorDoc.data() } as Vendor;
      }
      return null;
    } catch (error) {
      console.error('Get vendor by user ID error:', error);
      return null;
    }
  }

  async getVendors(status?: VendorStatus): Promise<Vendor[]> {
    try {
      let q = query(collection(db!, this.vendorCollectionName), orderBy('createdAt', 'desc'));

      if (status) {
        q = query(q, where('status', '==', status));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Vendor));
    } catch (error) {
      console.error('Get vendors error:', error);
      return [];
    }
  }

  async updateVendor(id: string, updates: Partial<Vendor>) {
    try {
      const vendorRef = doc(db!, this.vendorCollectionName, id);
      await updateDoc(vendorRef, {
        ...updates,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Update vendor error:', error);
      return { success: false, error };
    }
  }

  async approveVendor(id: string, approvedBy: string) {
    try {
      const vendorRef = doc(db!, this.vendorCollectionName, id);
      await updateDoc(vendorRef, {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Approve vendor error:', error);
      return { success: false, error };
    }
  }

  async rejectVendor(id: string) {
    try {
      const vendorRef = doc(db!, this.vendorCollectionName, id);
      await updateDoc(vendorRef, {
        status: 'rejected',
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Reject vendor error:', error);
      return { success: false, error };
    }
  }

  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const productRef = doc(collection(db!, this.productCollectionName));
      const product: Product = {
        id: productRef.id,
        ...productData,
        rating: 0,
        reviewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(productRef, product);
      return { success: true, data: product };
    } catch (error: any) {
      console.error('Create product error:', error);
      return { success: false, error };
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const productRef = doc(db!, this.productCollectionName, id);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        return { id, ...productSnap.data() } as Product;
      }
      return null;
    } catch (error) {
      console.error('Get product error:', error);
      return null;
    }
  }

  async getProductsByVendor(vendorId: string): Promise<Product[]> {
    try {
      const q = query(
        collection(db!, this.productCollectionName),
        where('vendorId', '==', vendorId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
      console.error('Get products by vendor error:', error);
      return [];
    }
  }

  async getAllProducts(filters?: { category?: string; inStock?: boolean; featured?: boolean }): Promise<Product[]> {
    try {
      let q = query(collection(db!, this.productCollectionName), orderBy('createdAt', 'desc'));

      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters?.inStock !== undefined) {
        q = query(q, where('inStock', '==', filters.inStock));
      }
      if (filters?.featured !== undefined) {
        q = query(q, where('featured', '==', filters.featured));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
      console.error('Get all products error:', error);
      return [];
    }
  }

  async updateProduct(id: string, updates: Partial<Product>) {
    try {
      const productRef = doc(db!, this.productCollectionName, id);
      await updateDoc(productRef, {
        ...updates,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Update product error:', error);
      return { success: false, error };
    }
  }

  async deleteProduct(id: string) {
    try {
      const productRef = doc(db!, this.productCollectionName, id);
      await deleteDoc(productRef);
      return { success: true };
    } catch (error: any) {
      console.error('Delete product error:', error);
      return { success: false, error };
    }
  }
}

export const vendorService = new VendorService();
