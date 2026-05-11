import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectTeam extends Document {
  teamId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
}

const ProjectTeamSchema: Schema = new Schema(
  {
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IProjectTeam>('ProjectTeam', ProjectTeamSchema);
