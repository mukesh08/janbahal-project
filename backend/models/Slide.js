const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema(
  {
    slider:       { type: mongoose.Schema.Types.ObjectId, ref: 'Slider', index: true },
    image:        { type: String, default: '' },
    heading:      { type: String, default: '', trim: true },
    subtext:      { type: String, default: '', trim: true },
    buttonLabel:  { type: String, default: '', trim: true },
    buttonUrl:    { type: String, default: '', trim: true },
    buttonTarget: { type: String, enum: ['_self', '_blank'], default: '_self' },
    order:        { type: Number, default: 0 },
    active:       { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Slide', slideSchema);
