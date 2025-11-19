import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/http-exception.filter'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  )

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter())

  // Global response interceptor
  app.useGlobalInterceptors(new TransformInterceptor())

  // Global prefix
  app.setGlobalPrefix('api')

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Sakura Healthcare Management System API')
    .setDescription('Complete API documentation for Sakura Healthcare Management System')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('patients', 'Patient management')
    .addTag('doctors', 'Doctor management')
    .addTag('appointments', 'Appointment management')
    .addTag('medical-records', 'Medical records management')
    .addTag('lab-results', 'Lab results management')
    .addTag('prescriptions', 'Prescription management')
    .addTag('messages', 'Messaging system')
    .addTag('clinics', 'Clinic management')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3001', 'Development server')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  })

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`🚀 Sakura Backend API is running on: http://localhost:${port}`)
  console.log(`📚 API Base URL: http://localhost:${port}/api`)
  console.log(`📖 Swagger Documentation: http://localhost:${port}/api/docs`)
}
bootstrap()

