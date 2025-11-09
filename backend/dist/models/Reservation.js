"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const reservationSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    slot: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'ParkingSlot',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'completed'],
        default: 'pending'
    }
}, {
    timestamps: true
});
// Index for efficient querying of user's reservations
reservationSchema.index({ user: 1, startTime: -1 });
// Index for efficient querying of slot's reservations
reservationSchema.index({ slot: 1, startTime: 1, endTime: 1 });
exports.default = mongoose_1.default.model('Reservation', reservationSchema);
