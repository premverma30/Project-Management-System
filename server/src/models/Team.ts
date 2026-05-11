import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  teamName: string;
  productOwnerUserId?: mongoose.Types.ObjectId;
  projectManagerUserId?: mongoose.Types.ObjectId;
}

const TeamSchema: Schema = new Schema(
  {
    teamName: { type: String, required: true },
    productOwnerUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    projectManagerUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<ITeam>('Team', TeamSchema);
