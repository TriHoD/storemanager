const mongoose = require('mongoose');
const encryption = require('../utilities/encryption');
const propertyIsRequired = '{0} is required';

let userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: propertyIsRequired.replace('{0}', 'Username'),
        unique: true
    },
    password: {
        type: String,
        required: propertyIsRequired.replace('{0}', 'Password')
    },
    salt: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: propertyIsRequired.replace('{0}', 'First name')
    },
    lastName: {
        type: String,
        required: propertyIsRequired.replace('{0}', 'Last name')
    },
    age: {
        type: Number,
        min: [0, 'Age must be between 0 and 120'],
        max: [120, 'Age must be between 0 and 120']
    },
    gender: {
        type: String,
        enum: {
            values: ['Male', 'Female'],
            message: 'Gender should be either "Male" or "Female"'
        }
    },
    about: { type: String },
    roles: [{ type: mongoose.SchemaTypes.String }],
    bougthProducts: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Product' }],
    createdProducts: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Product' }],
    createdCategories: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Category' }]
});

userSchema.method({
    authenticate: function (password) {
        let hashedPassword = encryption.generateHashedPassword(this.salt, password);

        if (hashedPassword === this.password) {
            return true;
        }

        return false;
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

module.exports.seedAdminUser = () => {
    User.find({username: 'admin'}).then(users => {
        if (users.length === 0) {
            let salt = encryption.generateSalt();
            let hashedPass = encryption.generateHashedPassword(salt, 'Admin12');

            User.create({
                username: 'admin',
                firstName: '',
                lastName: '',
                salt: salt,
                password: hashedPass,
                age: 00,
                gender: 'Male',
                about: 'Admin',
                roles: ['Admin']
            });
        }
    });
};
