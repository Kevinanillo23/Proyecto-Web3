import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcrypt';

interface UserAttributes {
    id: number;
    username: string;
    email: string;
    password?: string;
    role: string;
    resetPasswordToken?: string | null;
    plainResetToken?: string | null;
    resetPasswordExpire?: Date | null;
    walletAddress?: string | null;
    nonce: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role' | 'resetPasswordToken' | 'plainResetToken' | 'resetPasswordExpire' | 'walletAddress' | 'nonce'> { }

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public username!: string;
    public email!: string;
    public password!: string;
    public role!: string;
    public resetPasswordToken!: string | null;
    public plainResetToken!: string | null;
    public resetPasswordExpire!: Date | null;
    public walletAddress!: string | null;
    public nonce!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public async matchPassword(enteredPassword: string): Promise<boolean> {
        return await bcrypt.compare(enteredPassword, this.password);
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: 'user',
        },
        resetPasswordToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        plainResetToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        resetPasswordExpire: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        walletAddress: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        nonce: {
            type: DataTypes.STRING,
            defaultValue: () => Math.floor(Math.random() * 1000000).toString(),
        },
    },
    {
        sequelize,
        tableName: 'users',
        hooks: {
            beforeCreate: async (user) => {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
        },
    }
);

export default User;
