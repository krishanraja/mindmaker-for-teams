import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Clock } from 'lucide-react';
import matrixPreview from '@/assets/mindmaker-leaders-preview-matrix.png';
import scorePreview from '@/assets/mindmaker-leaders-preview-score.png';

export const RapidInsightsProof: React.FC = () => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const proofImages = [
    {
      id: 'matrix',
      src: matrixPreview,
      alt: 'Peer comparison matrix generated during workshop',
      label: 'Peer Comparison Matrix',
    },
    {
      id: 'score',
      src: scorePreview,
      alt: 'Personalized AI readiness insights',
      label: 'Personalized Insights',
    },
  ];

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const cardWidth = carousel.offsetWidth * 0.9; // 90vw
      const gap = 16;
      const paddingLeft = carousel.offsetWidth * 0.05; // 5vw
      const adjustedScroll = scrollLeft - paddingLeft + (carousel.offsetWidth - cardWidth) / 2;
      const newIndex = Math.round(adjustedScroll / (cardWidth + gap));
      setActiveImageIndex(Math.max(0, Math.min(1, newIndex)));
    };

    carousel.addEventListener('scroll', handleScroll);
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="py-12 border-t border-border bg-accent/5">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Real Outputs From One Session
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            See the caliber of insights your team will generate
          </p>
        </div>

        <div ref={carouselRef} className="mobile-carousel md:grid md:grid-cols-2 md:gap-6">
          {proofImages.map((image) => (
            <Dialog
              key={image.id}
              open={openDialog === image.id}
              onOpenChange={(open) => setOpenDialog(open ? image.id : null)}
            >
              <DialogTrigger asChild>
                <Card className="mobile-carousel-item md:h-auto cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden bg-card">
                  <div className="relative flex-1 flex items-center justify-center bg-muted/5">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                      <span className="text-sm font-medium text-foreground">
                        Click to enlarge
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-card flex-shrink-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Generated during workshop</span>
                    </div>
                    <p className="text-sm font-medium text-foreground mt-2">
                      {image.label}
                    </p>
                  </div>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-auto rounded-lg"
                />
              </DialogContent>
            </Dialog>
          ))}
        </div>

        {/* Dot Indicators - Mobile Only */}
        <div className="flex md:hidden justify-center gap-2 mt-6">
          {proofImages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                const carousel = carouselRef.current;
                if (carousel) {
                  const cardWidth = carousel.offsetWidth * 0.9;
                  const gap = 16;
                  const paddingLeft = carousel.offsetWidth * 0.05;
                  carousel.scrollTo({
                    left: paddingLeft + index * (cardWidth + gap),
                    behavior: 'smooth'
                  });
                }
              }}
              className={`h-2 rounded-full transition-all ${
                activeImageIndex === index 
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-primary/30'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
