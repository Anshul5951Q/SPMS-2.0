import express from 'express';
import { body, validationResult } from 'express-validator';
import ParkingSlot, { IParkingSlot } from '../models/ParkingSlot';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get all parking slots (public route, no auth required)
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const slots = await ParkingSlot.find().lean();
    console.log(`Returning ${slots.length} parking slots`);
    
    // Transform the data for frontend compatibility
    const transformedSlots = slots.map((slot: any) => ({
      id: slot._id.toString(),
      section: slot.section,
      number: slot.number,
      floor: slot.floor,
      type: slot.type,
      isAvailable: slot.isAvailable,
      price: slot.price
    }));
    
    res.json(transformedSlots);
  } catch (error) {
    console.error('Error fetching parking slots:', error);
    res.status(500).json({ message: 'Error fetching parking slots' });
  }
});

// Get available parking slots (public route, no auth required)
router.get('/available', async (req: express.Request, res: express.Response) => {
  try {
    const slots = await ParkingSlot.find({ isAvailable: true }).lean();
    console.log(`Returning ${slots.length} available parking slots`);
    
    // Transform the data for frontend compatibility
    const transformedSlots = slots.map((slot: any) => ({
      id: slot._id.toString(),
      section: slot.section,
      number: slot.number,
      floor: slot.floor,
      type: slot.type,
      isAvailable: slot.isAvailable,
      price: slot.price
    }));
    
    res.json(transformedSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ message: 'Error fetching available slots' });
  }
});

// Create new parking slot (admin only)
router.post('/',
  auth,
  [
    body('section').trim().notEmpty().withMessage('Section is required'),
    body('number').isInt({ min: 1 }).withMessage('Valid slot number is required'),
    body('floor').isInt({ min: 1 }).withMessage('Valid floor number is required'),
    body('type').isIn(['standard', 'handicap', 'electric']).withMessage('Valid slot type is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required')
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { section, number, floor, type, price } = req.body;

      // Check if slot already exists
      const existingSlot = await ParkingSlot.findOne({ section, number, floor });
      if (existingSlot) {
        return res.status(400).json({ message: 'Parking slot already exists' });
      }

      const slot = new ParkingSlot({
        section,
        number,
        floor,
        type,
        price
      });

      await slot.save();
      res.status(201).json(slot);
    } catch (error) {
      console.error('Error creating parking slot:', error);
      res.status(500).json({ message: 'Error creating parking slot' });
    }
  }
);

// Update parking slot availability
router.patch('/:id/availability',
  auth,
  [
    body('isAvailable').isBoolean().withMessage('Valid availability status is required')
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { isAvailable } = req.body;
      const slot = await ParkingSlot.findByIdAndUpdate(
        req.params.id,
        { isAvailable },
        { new: true }
      );

      if (!slot) {
        return res.status(404).json({ message: 'Parking slot not found' });
      }

      res.json(slot);
    } catch (error) {
      console.error('Error updating slot availability:', error);
      res.status(500).json({ message: 'Error updating slot availability' });
    }
  }
);

export default router; 