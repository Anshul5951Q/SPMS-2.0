import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Reservation from '../models/Reservation';
import ParkingSlot from '../models/ParkingSlot';
import { auth } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

const router = express.Router();

// Get user's reservations
router.get('/my-reservations', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const reservations = await Reservation.find({ user: userId })
      .populate('slot')
      .sort({ startTime: -1 });
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Error fetching reservations' });
  }
});

// Create new reservation
router.post('/',
  auth,
  [
    body('slotId').notEmpty().withMessage('Slot ID is required'),
    body('startTime').isISO8601().withMessage('Valid start time is required'),
    body('endTime').isISO8601().withMessage('Valid end time is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { slotId, startTime, endTime } = req.body;

      // Check if slot exists and is available
      const slot = await ParkingSlot.findById(slotId);
      if (!slot) {
        return res.status(404).json({ message: 'Parking slot not found' });
      }
      if (!slot.isAvailable) {
        return res.status(400).json({ message: 'Parking slot is not available' });
      }

      // Check for overlapping reservations
      const overlappingReservation = await Reservation.findOne({
        slot: slotId,
        status: { $in: ['pending', 'active'] },
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
          }
        ]
      });

      if (overlappingReservation) {
        return res.status(400).json({ message: 'Slot is already reserved for this time period' });
      }

      // Calculate total price
      const start = new Date(startTime);
      const end = new Date(endTime);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const totalPrice = hours * slot.price;

      const reservation = new Reservation({
        user: userId,
        slot: slotId,
        startTime,
        endTime,
        totalPrice,
        status: 'pending',
        paymentStatus: 'pending'
      });

      await reservation.save();

      // Update slot availability
      slot.isAvailable = false;
      await slot.save();

      res.status(201).json(reservation);
    } catch (error) {
      console.error('Error creating reservation:', error);
      res.status(500).json({ message: 'Error creating reservation' });
    }
  }
);

// Cancel reservation
router.patch('/:id/cancel',
  auth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const reservation = await Reservation.findOne({
        _id: req.params.id,
        user: userId
      });

      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      if (reservation.status === 'cancelled') {
        return res.status(400).json({ message: 'Reservation is already cancelled' });
      }

      // Update reservation status
      reservation.status = 'cancelled';
      await reservation.save();

      // Update slot availability
      const slot = await ParkingSlot.findById(reservation.slot);
      if (slot) {
        slot.isAvailable = true;
        await slot.save();
      }

      res.json(reservation);
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      res.status(500).json({ message: 'Error cancelling reservation' });
    }
  }
);

// Update payment status
router.patch('/:id/payment',
  auth,
  [
    body('paymentStatus').isIn(['completed']).withMessage('Valid payment status is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const reservation = await Reservation.findOne({
        _id: req.params.id,
        user: userId
      });

      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      reservation.paymentStatus = 'completed';
      reservation.status = 'active';
      await reservation.save();

      res.json(reservation);
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ message: 'Error updating payment status' });
    }
  }
);

export default router; 