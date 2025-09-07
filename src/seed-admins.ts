import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function seedAdmins() {
  // Create DataSource
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ['src/**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established.');

    const userRepository = dataSource.getRepository(User);

    // Check if admins already exist
    const existingAdmins = await userRepository.count({ where: { role: UserRole.ADMIN } });
    if (existingAdmins > 0) {
      console.log('Admin users already exist. Skipping seeding.');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    // Create admin users
    const admin1 = userRepository.create({
      email: 'admin1@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'One',
      role: UserRole.ADMIN,
      isActive: true,
    });

    const admin2 = userRepository.create({
      email: 'admin2@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Two',
      role: UserRole.ADMIN,
      isActive: true,
    });

    await userRepository.save([admin1, admin2]);
    console.log('2 admin users created successfully.');
  } catch (error) {
    console.error('Error seeding admins:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Run the seeder
seedAdmins();
