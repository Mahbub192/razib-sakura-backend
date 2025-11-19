import { DataSource, DataSourceOptions } from 'typeorm'
import { config } from 'dotenv'
import { seedDatabase } from './seed'
import { ConfigService } from '@nestjs/config'
import * as path from 'path'

// Load environment variables
config()

const configService = new ConfigService()

async function runSeed() {
  try {
    // Create DataSource with proper entity paths for TypeScript
    const dataSourceOptions: DataSourceOptions = {
      type: 'postgres',
      host: configService.get('DB_HOST') || 'localhost',
      port: configService.get('DB_PORT') || 5433,
      username: configService.get('DB_USERNAME') || 'postgres',
      password: configService.get('DB_PASSWORD') || '12345',
      database: configService.get('DB_DATABASE') || 'sakura_db',
      entities: [path.join(__dirname, '../../**/*.entity.ts')], // Use TypeScript files
      synchronize: true, // Enable sync to create tables if they don't exist
      logging: false, // Disable logging for cleaner output
    }

    const dataSource = new DataSource(dataSourceOptions)

    await dataSource.initialize()
    console.log('✅ Database connected')

    await seedDatabase(dataSource)

    await dataSource.destroy()
    console.log('✅ Database connection closed')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

runSeed()

