import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleDestroy {
  private readonly client: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const serverKey = this.config.get<string>('SUPABASE_SERVER_ROLE_KEY');
    const publicKey = this.config.get<string>('SUPABASE_PUBLIC_KEY');
    const key = serverKey || publicKey;

    if (!url) {
      throw new Error('SUPABASE_URL environment variable is not defined');
    }
    if (!key) {
      throw new Error(
        'Either SUPABASE_SERVER_ROLE_KEY or SUPABASE_PUBLIC_KEY must be defined',
      );
    }

    this.client = createClient(url, key);
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * Convenience accessor to Supabase storage API. Example:
   *   this.supabase.storage.from('bucket').upload(...)
   */
  get storage() {
    return this.client.storage;
  }

  onModuleDestroy() {
    // supabase-js client does not require explicit cleanup, but implement
    // the hook in case future versions require it.
  }
}
