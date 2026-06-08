import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { isMockMode } from '../config/firebase.config';
import { Order, OrderStatus, Delivery, DeliveryStatus } from '../types';

export class OrderService {
  private orderCollectionName = 'orders';
  private deliveryCollectionName = 'deliveries';

  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const orderRef = doc(collection(db!, this.orderCollectionName));
      const order: Order = {
        id: orderRef.id,
        ...orderData,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(orderRef, order);
      return { success: true, data: order };
    } catch (error: any) {
      console.error('Create order error:', error);
      return { success: false, error };
    }
  }

  async getOrder(id: string): Promise<Order | null> {
    try {
      const orderRef = doc(db!, this.orderCollectionName, id);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        return { id, ...orderSnap.data() } as Order;
      }
      return null;
    } catch (error) {
      console.error('Get order error:', error);
      return null;
    }
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db!, this.orderCollectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
      console.error('Get orders by user error:', error);
      return [];
    }
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    try {
      const q = query(
        collection(db!, this.orderCollectionName),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
      console.error('Get orders by status error:', error);
      return [];
    }
  }

  async updateOrder(id: string, updates: Partial<Order>) {
    try {
      const orderRef = doc(db!, this.orderCollectionName, id);
      await updateDoc(orderRef, {
        ...updates,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Update order error:', error);
      return { success: false, error };
    }
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    try {
      const orderRef = doc(db!, this.orderCollectionName, id);
      const updates: any = {
        status,
        updatedAt: new Date(),
      };

      if (status === 'delivered') {
        updates.completedAt = new Date();
      }

      await updateDoc(orderRef, updates);
      return { success: true };
    } catch (error: any) {
      console.error('Update order status error:', error);
      return { success: false, error };
    }
  }

  async createDelivery(deliveryData: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const deliveryRef = doc(collection(db!, this.deliveryCollectionName));
      const delivery: Delivery = {
        id: deliveryRef.id,
        ...deliveryData,
        status: 'assigned',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(deliveryRef, delivery);
      return { success: true, data: delivery };
    } catch (error: any) {
      console.error('Create delivery error:', error);
      return { success: false, error };
    }
  }

  async getDelivery(id: string): Promise<Delivery | null> {
    try {
      const deliveryRef = doc(db!, this.deliveryCollectionName, id);
      const deliverySnap = await getDoc(deliveryRef);

      if (deliverySnap.exists()) {
        return { id, ...deliverySnap.data() } as Delivery;
      }
      return null;
    } catch (error) {
      console.error('Get delivery error:', error);
      return null;
    }
  }

  async getDeliveryByOrder(orderId: string): Promise<Delivery | null> {
    try {
      const q = query(
        collection(db!, this.deliveryCollectionName),
        where('orderId', '==', orderId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const deliveryDoc = querySnapshot.docs[0];
        return { id: deliveryDoc.id, ...deliveryDoc.data() } as Delivery;
      }
      return null;
    } catch (error) {
      console.error('Get delivery by order error:', error);
      return null;
    }
  }

  async getDeliveriesByPersonnel(personnelId: string): Promise<Delivery[]> {
    try {
      const q = query(
        collection(db!, this.deliveryCollectionName),
        where('deliveryPersonnelId', '==', personnelId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Delivery));
    } catch (error) {
      console.error('Get deliveries by personnel error:', error);
      return [];
    }
  }

  async updateDelivery(id: string, updates: Partial<Delivery>) {
    try {
      const deliveryRef = doc(db!, this.deliveryCollectionName, id);
      await updateDoc(deliveryRef, {
        ...updates,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Update delivery error:', error);
      return { success: false, error };
    }
  }

  async updateDeliveryStatus(id: string, status: DeliveryStatus, currentLocation?: { lat: number; lng: number }) {
    try {
      const deliveryRef = doc(db!, this.deliveryCollectionName, id);
      const updates: any = {
        status,
        updatedAt: new Date(),
      };

      if (currentLocation) {
        updates.currentLocation = currentLocation;
      }

      if (status === 'picked_up') {
        updates.actualPickupTime = new Date();
      } else if (status === 'delivered') {
        updates.actualDeliveryTime = new Date();
      }

      await updateDoc(deliveryRef, updates);
      return { success: true };
    } catch (error: any) {
      console.error('Update delivery status error:', error);
      return { success: false, error };
    }
  }
}

export const orderService = new OrderService();
