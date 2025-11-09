"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const ParkingSlot_1 = __importDefault(require("../models/ParkingSlot"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all parking slots (public route, no auth required)
router.get('/', async (req, res) => {
    try {
        const slots = await ParkingSlot_1.default.find().lean();
        console.log(`Returning ${slots.length} parking slots`);
        // Transform the data for frontend compatibility
        const transformedSlots = slots.map((slot) => ({
            id: slot._id.toString(),
            section: slot.section,
            number: slot.number,
            floor: slot.floor,
            type: slot.type,
            isAvailable: slot.isAvailable,
            price: slot.price
        }));
        res.json(transformedSlots);
    }
    catch (error) {
        console.error('Error fetching parking slots:', error);
        res.status(500).json({ message: 'Error fetching parking slots' });
    }
});
// Get available parking slots (public route, no auth required)
router.get('/available', async (req, res) => {
    try {
        const slots = await ParkingSlot_1.default.find({ isAvailable: true }).lean();
        console.log(`Returning ${slots.length} available parking slots`);
        // Transform the data for frontend compatibility
        const transformedSlots = slots.map((slot) => ({
            id: slot._id.toString(),
            section: slot.section,
            number: slot.number,
            floor: slot.floor,
            type: slot.type,
            isAvailable: slot.isAvailable,
            price: slot.price
        }));
        res.json(transformedSlots);
    }
    catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ message: 'Error fetching available slots' });
    }
});
// Create new parking slot (admin only)
router.post('/', auth_1.auth, [
    (0, express_validator_1.body)('section').trim().notEmpty().withMessage('Section is required'),
    (0, express_validator_1.body)('number').isInt({ min: 1 }).withMessage('Valid slot number is required'),
    (0, express_validator_1.body)('floor').isInt({ min: 1 }).withMessage('Valid floor number is required'),
    (0, express_validator_1.body)('type').isIn(['standard', 'handicap', 'electric']).withMessage('Valid slot type is required'),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }).withMessage('Valid price is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { section, number, floor, type, price } = req.body;
        // Check if slot already exists
        const existingSlot = await ParkingSlot_1.default.findOne({ section, number, floor });
        if (existingSlot) {
            return res.status(400).json({ message: 'Parking slot already exists' });
        }
        const slot = new ParkingSlot_1.default({
            section,
            number,
            floor,
            type,
            price
        });
        await slot.save();
        res.status(201).json(slot);
    }
    catch (error) {
        console.error('Error creating parking slot:', error);
        res.status(500).json({ message: 'Error creating parking slot' });
    }
});
// Update parking slot availability
router.patch('/:id/availability', auth_1.auth, [
    (0, express_validator_1.body)('isAvailable').isBoolean().withMessage('Valid availability status is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { isAvailable } = req.body;
        const slot = await ParkingSlot_1.default.findByIdAndUpdate(req.params.id, { isAvailable }, { new: true });
        if (!slot) {
            return res.status(404).json({ message: 'Parking slot not found' });
        }
        res.json(slot);
    }
    catch (error) {
        console.error('Error updating slot availability:', error);
        res.status(500).json({ message: 'Error updating slot availability' });
    }
});
exports.default = router;
