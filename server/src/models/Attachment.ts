import mongoose, { Schema, Document } from 'mongoose';

export interface IAttachment extends Document {
  fileURL: string;
  fileName?: string;
  taskId: mongoose.Types.ObjectId;
  uploadedById: mongoose.Types.ObjectId;
}

const AttachmentSchema: Schema = new Schema(
  {
    fileURL: { type: String, required: true },
    fileName: { type: String },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    uploadedById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAttachment>('Attachment', AttachmentSchema);
