"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const users_1 = __importDefault(require("./data/users"));
const User_1 = __importDefault(require("./models/User"));
const database_1 = __importDefault(require("./config/database"));
dotenv_1.default.config();
const importData = async () => {
    try {
        await database_1.default.sync({ force: true }); // Wipe and recreate tables
        await User_1.default.bulkCreate(users_1.default, { individualHooks: true }); // Use hooks for hashing passwords
        console.log('Data Imported!');
        process.exit();
    }
    catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};
const destroyData = async () => {
    try {
        await database_1.default.drop(); // Drop all tables
        console.log('Data Destroyed!');
        process.exit();
    }
    catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};
if (process.argv[2] === '-d') {
    destroyData();
}
else {
    importData();
}
