const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    filename:     { type: String, required: true },
    mimetype:     { type: String, required: true },
    size:         { type: Number, required: true },
    url:          { type: String, required: true },
    driveFileId:  { type: String, default: '' },   // Google Drive backup file id
    driveLink:    { type: String, default: '' },   // Google Drive shareable link
    uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Media', mediaSchema);
