'use client';
import { useState } from 'react';
import { ScrollAnimation, FadeIn, TapScale, ScaleIn } from '../components/AnimationWrappers';
import { motion } from 'framer-motion';

export default function RSVP({ data }: { data: any }) {
  const [status, setStatus] = useState<string | null>(null);
  async function onSubmit(e: any) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/rsvp', { method: 'POST', body: form });
    setStatus(res.ok ? 'Thanks for your response!' : 'Something went wrong.');
    if (res.ok) (e.target as HTMLFormElement).reset();
  }
  return (
    <section className="container py-16 relative" id="rsvp">
      {/* Decorative invitation elements */}
      <div className="absolute top-5 left-5 text-5xl opacity-10 animate-pulse">💌</div>
      <div className="absolute top-5 right-5 text-5xl opacity-10 animate-pulse" style={{animationDelay: '0.7s'}}>✉️</div>
      <ScrollAnimation className="text-center">
        <div className="inline-block">
          <div className="text-5xl mb-2">💐</div>
          <h2 className="section-title">{data.heading}</h2>
          <p className="subtext">{data.note}</p>
        </div>
      </ScrollAnimation>
      <FadeIn delay={0.3} className="max-w-xl mx-auto mt-8">
        <motion.form 
          onSubmit={onSubmit} 
          className="card space-y-4"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.input
            name="name" 
            placeholder="Your Name" 
            className="w-full border rounded-lg px-4 py-3 transition-all duration-200" 
            required 
            whileFocus={{ scale: 1.02, borderColor: 'var(--primary)' }}
          />
          <motion.input
            name="email" 
            type="email" 
            placeholder="Email" 
            className="w-full border rounded-lg px-4 py-3 transition-all duration-200" 
            required 
            whileFocus={{ scale: 1.02, borderColor: 'var(--primary)' }}
          />
          <motion.select
            name="attending" 
            className="w-full border rounded-lg px-4 py-3 transition-all duration-200" 
            required
            whileFocus={{ scale: 1.02, borderColor: 'var(--primary)' }}
          >
            <option value="">Will you attend?</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </motion.select>
          <motion.textarea
            name="message" 
            placeholder="Message (optional)" 
            className="w-full border rounded-lg px-4 py-3 transition-all duration-200" 
            whileFocus={{ scale: 1.02, borderColor: 'var(--primary)' }}
          />
          <TapScale>
            <button className="btn btn-primary w-full">Send RSVP</button>
          </TapScale>
          {status && (
            <ScaleIn>
              <div className="text-center p-3 bg-green-50 rounded-lg text-green-800">{status}</div>
            </ScaleIn>
          )}
        </motion.form>
      </FadeIn>
    </section>
  );
}
