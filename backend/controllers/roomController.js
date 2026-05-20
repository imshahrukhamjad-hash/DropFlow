import Room from '../models/Room.js';
import crypto from 'crypto';

export const createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    // Generate a unique 6-character room ID
    const roomId = crypto.randomBytes(3).toString('hex').toUpperCase();

    const newRoom = await Room.create({
      roomId,
      name,
    });

    res.status(201).json({
      message: 'Room created successfully',
      room: newRoom,
    });
  } catch (error) {
    console.error('Room Creation Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json(room);
  } catch (error) {
    console.error('Get Room Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
