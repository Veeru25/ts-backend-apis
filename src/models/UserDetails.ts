import mongoose, { Document, Schema } from 'mongoose';

interface IUserDetails extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  email?: string;
  mobile?: string;
  pincode?: string;
  address?: string;
}

const userDetailsSchema = new Schema<IUserDetails>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: false,
  },
  mobile: {
    type: String,
    required: false,
  },
  pincode: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
});

const UserDetails = mongoose.models.UserDetails || mongoose.model<IUserDetails>('UserDetails', userDetailsSchema);

export default UserDetails;
