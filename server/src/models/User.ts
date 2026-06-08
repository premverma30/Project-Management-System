import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  username: string;
  email: string;
  profilePictureUrl?: string;
  teamId?: mongoose.Types.ObjectId;
}

const UserSchema: Schema = new Schema(
  {
    googleId: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    profilePictureUrl: { type: String },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });

export default mongoose.model<IUser>('User', UserSchema);
