import dotenv from 'dotenv';
import users from './data/users';
import User from './models/User';
import sequelize from './config/database';

dotenv.config();

const importData = async () => {
    try {
        await sequelize.sync({ force: true }); // Wipe and recreate tables

        await User.bulkCreate(users, { individualHooks: true }); // Use hooks for hashing passwords

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await sequelize.drop(); // Drop all tables

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
