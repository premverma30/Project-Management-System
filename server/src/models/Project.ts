import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status: 'Active' | 'Completed' | 'Archived';
  ownerId: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
}

const ProjectSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ['Active', 'Completed', 'Archived'], default: 'Active' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ teamId: 1 });

export default mongoose.model<IProject>('Project', ProjectSchema);
