const mongoose = require('mongoose');

/* A named slider (group / "main slider"). Holds many Slides ("sub-sliders"). */
const sliderSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    slug:     { type: String, unique: true, lowercase: true, trim: true },
    autoplay: { type: Boolean, default: true },
    interval: { type: Number,  default: 6000 },   // ms between auto-advances
    height:   { type: String,  default: '' },     // optional CSS height override
  },
  { timestamps: true }
);

module.exports = mongoose.model('Slider', sliderSchema);
