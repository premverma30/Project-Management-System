import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskAssignment extends Document {
  userId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
}

const TaskAssignmentSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITaskAssignment>('TaskAssignment', TaskAssignmentSchema);
