import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { EventModule } from './event/event.module';
import { AuthMiddleware } from './common/middleware/auth.middleware';
import { TicketModule } from './ticket/ticket.module';
import { StripeModule } from './stripe/stripe.module';
import { ConfigModule } from '@nestjs/config';
import { VenueModule } from './venue/venue.module';
import { SupabaseModule } from './supabase/supabase.module';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    SupabaseModule,
    EventModule,
    TicketModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    StripeModule,
    VenueModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude('auth/register', 'auth/login')
      .forRoutes('*');
  }
}
