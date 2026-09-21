import mongoose from 'mongoose';

const waitlistSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Invalid email address'],
    },
    source: { type: String, default: 'landing-page' },
  },
  { timestamps: true, versionKey: false },
);

export const WaitlistSubscriber = mongoose.model('WaitlistSubscriber', waitlistSubscriberSchema);
