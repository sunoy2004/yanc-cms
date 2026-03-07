"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToWebp = convertToWebp;
const sharp_1 = __importDefault(require("sharp"));
async function convertToWebp(buffer) {
    return (0, sharp_1.default)(buffer)
        .webp({ quality: 80 })
        .toBuffer();
}
//# sourceMappingURL=imageProcessor.js.map