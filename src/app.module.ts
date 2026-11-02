import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { BooksModule } from './books/books.module.js';
import { MembersModule } from './members/members.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { AuthModule } from './auth/auth.module.js';
import { SimpleLoggerMiddleware } from './middlewares/simple-logger/simple-logger.middleware.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { CustomersModule } from './customers/customers.module.js';
import { PublishersModule } from './publishers/publishers.module.js';
import { AuthorsModule } from './authors/authors.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { ShipmentsModule } from './shipments/shipments.module.js';
import Joi from 'joi';

@Module({
  imports: [
    BooksModule, 
    MembersModule, 
    CategoriesModule, 
    AuthModule, 
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT:Joi.number().default(3000),
        NODE_ENV:Joi.string()
        .valid('development', 'production')
        .default('development'),
        DB_HOST:Joi.string().required(),
        DB_PORT:Joi.number().default(5432),
        DB_USER:Joi.string().required(),
        DB_PASSWORD:Joi.string().required(),
        DB_DATABASE:Joi.string().required()
      })
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),

    UsersModule,

    OrdersModule,

    CustomersModule,
    PublishersModule,
    AuthorsModule,
    PaymentsModule,
    ShipmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SimpleLoggerMiddleware).forRoutes('*');
  }
}
