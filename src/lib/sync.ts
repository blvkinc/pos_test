import { supabase, Database } from './supabase';
import * as db from './db';
import { Product, Transaction } from '../types';

class SyncService {
  private syncInProgress = false;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  private async handleOnline() {
    console.log('Online event detected, starting sync...');
    const state = await db.getSyncState();
    state.isOnline = true;
    await db.updateSyncState(state);
    await this.sync();
  }

  private async handleOffline() {
    console.log('Offline event detected');
    const state = await db.getSyncState();
    state.isOnline = false;
    await db.updateSyncState(state);
  }

  async sync() {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping...');
      return;
    }
    console.log('Starting sync process...');
    this.syncInProgress = true;

    try {
      // Sync products
      await this.syncProducts();

      // Sync transactions
      await this.syncTransactions();

      // Update last sync time
      const state = await db.getSyncState();
      state.lastSync = new Date().toISOString();
      await db.updateSyncState(state);
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncProducts() {
    try {
      console.log('Starting product sync...');
      // Fetch products from Supabase
      const { data: supabaseProducts, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        console.error('Error fetching products from Supabase:', error);
        throw error;
      }

      console.log(`Fetched ${supabaseProducts?.length || 0} products from Supabase`);

      // Save to IndexedDB
      await db.saveProducts(supabaseProducts as Product[]);
      console.log('Products saved to IndexedDB');
    } catch (error) {
      console.error('Failed to sync products:', error);
      throw error;
    }
  }

  private async syncTransactions() {
    console.log('Starting transaction sync...');
    const state = await db.getSyncState();
    const pendingTransactions = await Promise.all(
      state.pendingTransactions.map(id => db.getTransaction(id))
    );

    console.log(`Found ${pendingTransactions.length} pending transactions`);

    for (const transaction of pendingTransactions) {
      if (!transaction) continue;

      let retries = 0;
      let lastError: Error | null = null;

      while (retries < this.maxRetries) {
        try {
          console.log(`Attempting to sync transaction ${transaction.id} (attempt ${retries + 1}/${this.maxRetries})`);
          
          // Upload to Supabase
          const { error } = await supabase
            .from('transactions')
            .insert(transaction);

          if (error) {
            console.error(`Supabase error for transaction ${transaction.id}:`, error);
            throw error;
          }

          // Remove from pending transactions
          await db.removePendingTransaction(transaction.id);
          console.log(`Successfully synced transaction ${transaction.id}`);
          break; // Success, exit retry loop
        } catch (error) {
          lastError = error as Error;
          retries++;
          if (retries === this.maxRetries) {
            console.error(`Failed to sync transaction ${transaction.id} after ${this.maxRetries} attempts:`, error);
            // Don't break here, let it continue to the next transaction
          } else {
            console.log(`Retrying transaction ${transaction.id} (attempt ${retries + 1}/${this.maxRetries})`);
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          }
        }
      }

      // If all retries failed, log the error but continue with other transactions
      if (retries === this.maxRetries && lastError) {
        console.error(`Transaction ${transaction.id} failed to sync after all retries:`, lastError);
      }
    }
  }

  async saveTransaction(transaction: Transaction) {
    console.log('Saving transaction:', transaction.id);
    
    // Save locally first
    await db.saveTransaction(transaction);

    const state = await db.getSyncState();
    if (state.isOnline) {
      try {
        console.log(`Attempting to sync transaction ${transaction.id} immediately`);
        // Try to sync immediately if online
        const { error } = await supabase
          .from('transactions')
          .insert(transaction);

        if (error) {
          console.error(`Failed to sync transaction ${transaction.id}:`, error);
          throw error;
        }
        
        console.log(`Transaction ${transaction.id} synced successfully`);
        
        // Update last sync time
        state.lastSync = new Date().toISOString();
        await db.updateSyncState(state);
      } catch (error) {
        console.error(`Error syncing transaction ${transaction.id}:`, error);
        // If sync fails, add to pending transactions
        await db.addPendingTransaction(transaction.id);
        console.log(`Transaction ${transaction.id} added to pending sync`);
        throw error; // Re-throw to handle in the UI
      }
    } else {
      // If offline, add to pending transactions
      await db.addPendingTransaction(transaction.id);
      console.log(`Transaction ${transaction.id} saved offline`);
      throw new Error('Offline mode: Transaction saved locally');
    }
  }

  async getTransactionSyncStatus(transactionId: string): Promise<'synced' | 'pending' | 'error'> {
    const state = await db.getSyncState();
    if (state.pendingTransactions.includes(transactionId)) {
      return 'pending';
    }
    return 'synced';
  }

  async getLastSyncTime(): Promise<string | null> {
    const state = await db.getSyncState();
    return state.lastSync;
  }
}

export const syncService = new SyncService(); 