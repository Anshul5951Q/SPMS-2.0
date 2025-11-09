"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const parkingSlotSchema = new mongoose_1.default.Schema({
    section: {
        type: String,
        required: true,
        trim: true
    },
    number: {
        type: Number,
        required: true
    },
    floor: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['standard', 'handicap', 'electric']
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    price: {
        type: Number,
        required: true,
        default: 50 // Default price in Indian Rupees
    }
}, {
    timestamps: true
});
// Compound index for unique slot identification
parkingSlotSchema.index({ section: 1, number: 1, floor: 1 }, { unique: true });
exports.default = mongoose_1.default.model('ParkingSlot', parkingSlotSchema);
