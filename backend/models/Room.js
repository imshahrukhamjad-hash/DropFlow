import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    name: { type: String, required: false },
    createdAt: { type: Date, default: Date.now, index: { expires: '24h' } },
  },
  { timestamps: true }
);

const Room = mongoose.model('Room', roomSchema);

export default Room;
