import Admin from '../models/Admin';

export const seedAdmin = async (): Promise<void> => {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: adminUsername });

    if (existingAdmin) {
      console.log(`✅ Admin user '${adminUsername}' already exists`);
      return;
    }

    // Create new admin user
    const admin = new Admin({
      username: adminUsername,
      password: adminPassword, // Will be hashed by pre-save hook
      email: adminEmail,
    });

    await admin.save();
    console.log(`✅ Admin user '${adminUsername}' created successfully`);
  } catch (error: any) {
    if (error.code === 11000) {
      console.log(`✅ Admin user already exists (duplicate key)`);
    } else {
      console.error('❌ Error seeding admin user:', error.message);
    }
  }
};

