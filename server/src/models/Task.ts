import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  text: string;
  userId: mongoose.Types.ObjectId;
}

const CommentSchema: Schema = new Schema(
  {
    text: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export interface ITask extends Document {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  tags?: string;
  startDate?: Date;
  dueDate?: Date;
  points?: number;
  projectId: mongoose.Types.ObjectId;
  authorUserId: mongoose.Types.ObjectId;
  assignedUserId?: mongoose.Types.ObjectId;
  comments: IComment[];
}

const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['To Do', 'Work In Progress', 'Under Review', 'Completed'], default: 'To Do' },
    priority: { type: String, enum: ['Urgent', 'High', 'Medium', 'Low', 'Backlog'], default: 'Medium' },
    tags: { type: String },
    startDate: { type: Date },
    dueDate: { type: Date },
    points: { type: Number },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    authorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    comments: [CommentSchema],
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', TaskSchema);
