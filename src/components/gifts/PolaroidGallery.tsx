import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Heart, Sparkles, MapPin, Calendar, X, ChevronLeft, ChevronRight, Shuffle, LayoutGrid, Layers } from 'lucide-react';
import { PhotoMemory } from '../../types';
import { sfx } from '../../utils/soundEffects';

interface PolaroidGalleryProps {
  photos: PhotoMemory[];
  onBack: () => void;
}

export const PolaroidGallery: React.FC<PolaroidGalleryProps> = ({ photos, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'stack' | 'grid'>('stack');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMemory | null>(null);

  const handleNext = () => {
    sfx.playPop();
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    sfx.playPop();
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleShuffle = () => {
    sfx.playPop();
    const nextRandom = Math.floor(Math.random() * photos.length);
    setCurrentIndex(nextRandom);
  };

  const currentPhoto = photos[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="relative z-10 w-full max-w-4xl mx-auto px-4 py-6 flex flex-col items-center min-h-[85vh]"
      id="polaroid-gallery"
    >
      {/* Top Navigation & Header */}
      <div className="w-full flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-rose-700 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-rose-200 hover:bg-rose-50 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quay lại 3 món quà</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'stack' ? 'grid' : 'stack')}
            className="p-2 text-rose-700 bg-white/80 backdrop-blur-md rounded-full border border-rose-200 shadow-sm hover:bg-rose-50 transition cursor-pointer"
            title={viewMode === 'stack' ? "Xem dạng lưới" : "Xem dạng xếp chồng"}
          >
            {viewMode === 'stack' ? <LayoutGrid className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Title Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 text-xs font-bold text-rose-600 bg-rose-100/90 rounded-full border border-rose-200 mb-2">
          <Camera className="w-3.5 h-3.5" />
          <span>MÓN QUÀ SỐ 1</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-heading">
          Khoảnh Khắc Của Chúng Mình 📸
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
          Mỗi bức ảnh Polaroid là một mảnh ghép kỷ niệm ngọt ngào được lưu giữ.
        </p>
      </div>

      {/* Main Display: STACK VIEW */}
      {viewMode === 'stack' ? (
        <div className="flex flex-col items-center w-full max-w-md">
          {/* Polaroid Stack Area */}
          <div className="relative w-72 sm:w-80 h-96 sm:h-[420px] flex items-center justify-center mb-6">
            {/* Background stacked polaroid shadows */}
            <div className="absolute w-full h-full bg-white/60 rounded-xl shadow-md rotate-6 scale-95 pointer-events-none border border-slate-200" />
            <div className="absolute w-full h-full bg-white/70 rounded-xl shadow-md -rotate-3 scale-98 pointer-events-none border border-slate-200" />

            {/* Active Polaroid Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhoto.id}
                initial={{ opacity: 0, scale: 0.8, rotate: -8, y: 30 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: currentPhoto.rotation || 0,
                  y: 0,
                }}
                exit={{ opacity: 0, scale: 0.8, rotate: 12, y: -40 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                onClick={() => {
                  sfx.playPop();
                  setSelectedPhoto(currentPhoto);
                }}
                className="absolute inset-0 bg-white p-3.5 sm:p-4 rounded-xl shadow-2xl border border-slate-200 flex flex-col cursor-pointer group hover:scale-[1.03] transition-transform duration-300 select-none"
              >
                {/* Washi Tape Accent */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-rose-200/80 backdrop-blur-sm border-t border-b border-rose-300/60 rotate-[-2deg] shadow-sm z-20" />

                {/* Photo Image Frame */}
                <div className="relative w-full aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden border border-slate-200/60 shadow-inner">
                  <img
                    src={currentPhoto.url}
                    alt={currentPhoto.caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    <span>Nhấn để xem kỹ</span>
                  </div>
                </div>

                {/* Polaroid Bottom Caption Area */}
                <div className="flex-1 flex flex-col justify-between pt-3 pb-1 px-1">
                  <p className="font-handwriting text-xl sm:text-2xl text-slate-800 leading-snug line-clamp-2">
                    "{currentPhoto.caption}"
                  </p>

                  <div className="flex items-center justify-between text-xs text-rose-700 font-semibold border-t border-rose-100 pt-2 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-rose-500" />
                      {currentPhoto.date || "Kỷ niệm"}
                    </span>
                    {currentPhoto.location && (
                      <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        {currentPhoto.location}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Stack Navigation Controls */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={handlePrev}
              className="p-3 bg-white text-rose-600 rounded-full shadow-md hover:bg-rose-50 active:scale-95 transition border border-rose-200 cursor-pointer"
              title="Ảnh trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold text-slate-600 bg-white/80 px-3 py-1.5 rounded-full border border-slate-200">
              {currentIndex + 1} / {photos.length}
            </span>

            <button
              onClick={handleShuffle}
              className="p-3 bg-white text-rose-600 rounded-full shadow-md hover:bg-rose-50 active:scale-95 transition border border-rose-200 cursor-pointer"
              title="Ngẫu nhiên"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              className="p-3 bg-white text-rose-600 rounded-full shadow-md hover:bg-rose-50 active:scale-95 transition border border-rose-200 cursor-pointer"
              title="Ảnh tiếp theo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          {photos.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => {
                sfx.playPop();
                setSelectedPhoto(p);
              }}
              className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col"
              style={{ transform: `rotate(${p.rotation ? p.rotation * 0.7 : 0}deg)` }}
            >
              <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-slate-100">
                <img
                  src={p.url}
                  alt={p.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition duration-300"
                />
              </div>
              <p className="font-handwriting text-lg text-slate-800 line-clamp-2">
                "{p.caption}"
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                <span>{p.date}</span>
                <span>{p.location}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Expanded Modal for Photo Detail */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white max-w-lg w-full rounded-2xl p-5 shadow-2xl border-4 border-white overflow-hidden"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-3 right-3 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-slate-100 shadow-md">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="px-2">
                <p className="font-handwriting text-2xl sm:text-3xl text-slate-800 mb-3 leading-relaxed">
                  "{selectedPhoto.caption}"
                </p>

                <div className="flex items-center justify-between text-sm text-rose-600 font-semibold bg-rose-50 p-3 rounded-xl border border-rose-100">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedPhoto.date}</span>
                  </div>
                  {selectedPhoto.location && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span>{selectedPhoto.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
