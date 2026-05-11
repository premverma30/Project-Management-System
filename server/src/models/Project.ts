import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IProject>('Project', ProjectSchema);
