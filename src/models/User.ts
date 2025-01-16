import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
  username: string;
  usertype: 'user' | 'admin' | 'customer'; 
  email: string;
  password: string;
  userotp?: string;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  username: { 
    type: String,
    required: true,
  },
  usertype: {
    type: String,
    enum: ['user', 'admin', 'customer'],
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userotp: {
    type: String,
    required: false,
  },
});

userSchema.pre<IUser>('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
