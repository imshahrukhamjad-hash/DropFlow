import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    roomId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now, index: { expires: '24h' } },
  },
  { timestamps: true }
);

const File = mongoose.model('File', fileSchema);

export default File;
