import React, { useRef, useEffect, useState } from 'react';
import { Waves, Sparkles, Droplets } from 'lucide-react';

/**
 * RippleDistortion Component (React Bits Certified Architecture)
 * High-performance 2D liquid wave propagation & refractive pixel displacement
 * with chromatic RGB shift and interactive cursor disturbance.
 */
export default function RippleDistortion({
  className = '',
  imageSrc = '/images/stitch_hook_banner_logo.jpg',
  dropRadius = 4.0,
  dampening = 0.982,
  perturbance = 0.04,
  ambientRipples = true,
  interactiveStrength = 1.0,
  showBadge = true
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = container.clientWidth || 600);
    let height = (canvas.height = container.clientHeight || 450);

    // Wave simulation resolution grid
    const scaleFactor = 3;
    const simWidth = Math.floor(width / scaleFactor);
    const simHeight = Math.floor(height / scaleFactor);
    const simSize = simWidth * simHeight;

    let buffer1 = new Float32Array(simSize);
    let buffer2 = new Float32Array(simSize);

    // Offscreen background canvas with luxury pastel gradient & texture
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = width;
    bgCanvas.height = height;
    const bgCtx = bgCanvas.getContext('2d');

    const drawBackground = () => {
      // Luxury Atelier Gradient
      const grad = bgCtx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#FAF8F5');
      grad.addColorStop(0.25, '#EFE9FA');
      grad.addColorStop(0.65, '#E1EFEF');
      grad.addColorStop(1, '#FEEDEA');
      bgCtx.fillStyle = grad;
      bgCtx.fillRect(0, 0, width, height);

      // Knitted tactile mesh pattern
      bgCtx.fillStyle = 'rgba(138, 104, 232, 0.16)';
      const step = 16;
      for (let x = 0; x < width; x += step) {
        for (let y = 0; y < height; y += step) {
          bgCtx.beginPath();
          bgCtx.arc(x + (y % (step * 2) === 0 ? 0 : step / 2), y, 1.6, 0, Math.PI * 2);
          bgCtx.fill();
        }
      }

      // Soft decorative organic rings
      bgCtx.strokeStyle = 'rgba(43, 96, 100, 0.12)';
      bgCtx.lineWidth = 1.5;
      bgCtx.beginPath();
      bgCtx.arc(width * 0.25, height * 0.35, Math.min(width, height) * 0.28, 0, Math.PI * 2);
      bgCtx.stroke();

      bgCtx.strokeStyle = 'rgba(138, 104, 232, 0.12)';
      bgCtx.beginPath();
      bgCtx.arc(width * 0.75, height * 0.65, Math.min(width, height) * 0.32, 0, Math.PI * 2);
      bgCtx.stroke();
    };

    drawBackground();

    // Load and draw calligraphy logo / artwork onto bgCanvas
    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
      img.onload = () => {
        bgCtx.save();
        bgCtx.globalAlpha = 0.55;
        const aspect = img.width / img.height;
        let drawW = Math.min(width * 0.88, 520);
        let drawH = drawW / aspect;
        if (drawH > height * 0.75) {
          drawH = height * 0.75;
          drawW = drawH * aspect;
        }
        bgCtx.drawImage(img, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
        bgCtx.restore();
      };
    }

    // Add ripple drop to fluid buffer
    const drop = (x, y, radius, strength) => {
      const cx = Math.floor((x / width) * simWidth);
      const cy = Math.floor((y / height) * simHeight);
      const rad = Math.floor(radius);

      for (let j = -rad; j <= rad; j++) {
        for (let i = -rad; i <= rad; i++) {
          const px = cx + i;
          const py = cy + j;
          if (px >= 0 && px < simWidth && py >= 0 && py < simHeight) {
            const dist = Math.sqrt(i * i + j * j);
            if (dist < rad) {
              const amount = Math.cos((dist / rad) * (Math.PI / 2)) * strength;
              buffer1[py * simWidth + px] += amount;
            }
          }
        }
      }
    };

    // Track mouse velocity & disturbance
    let lastX = -1;
    let lastY = -1;

    const handlePointerMove = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (lastX >= 0 && lastY >= 0) {
        const dx = x - lastX;
        const dy = y - lastY;
        const speed = Math.sqrt(dx * dx + dy * dy);
        if (speed > 1.2) {
          const power = Math.min(speed * 4.2, 190) * interactiveStrength;
          drop(x, y, dropRadius, power);
        }
      } else {
        drop(x, y, dropRadius + 1, 90 * interactiveStrength);
      }

      lastX = x;
      lastY = y;
    };

    const onMouseMove = (e) => handlePointerMove(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      drop(e.clientX - rect.left, e.clientY - rect.top, dropRadius + 2.5, 240);
    };
    const onPointerLeave = () => {
      lastX = -1;
      lastY = -1;
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchmove', onTouchMove);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mouseleave', onPointerLeave);

    // Ambient automatic liquid ripples
    let ambientTimer = null;
    if (ambientRipples) {
      ambientTimer = setInterval(() => {
        const randX = Math.random() * width;
        const randY = Math.random() * height;
        drop(randX, randY, Math.random() * 2 + 3.5, Math.random() * 85 + 75);
      }, 1500);
    }

    // Initial ripple waves
    setTimeout(() => drop(width * 0.3, height * 0.4, 5.5, 160), 100);
    setTimeout(() => drop(width * 0.7, height * 0.6, 6.0, 190), 400);

    // Animation Render Loop
    const render = () => {
      // 1. Fluid wave equation propagation
      for (let y = 1; y < simHeight - 1; y++) {
        for (let x = 1; x < simWidth - 1; x++) {
          const idx = y * simWidth + x;
          const data =
            (buffer1[idx - 1] +
              buffer1[idx + 1] +
              buffer1[idx - simWidth] +
              buffer1[idx + simWidth]) /
              2 -
            buffer2[idx];

          buffer2[idx] = data * dampening;
        }
      }

      // Buffer swap
      const temp = buffer1;
      buffer1 = buffer2;
      buffer2 = temp;

      // 2. Sample pixel buffer and displace with chromatic aberration
      const sourceImgData = bgCtx.getImageData(0, 0, width, height);
      const targetImgData = ctx.createImageData(width, height);
      const src = sourceImgData.data;
      const dst = targetImgData.data;

      const scaleX = simWidth / width;
      const scaleY = simHeight / height;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const simX = Math.floor(x * scaleX);
          const simY = Math.floor(y * scaleY);

          if (simX > 0 && simX < simWidth - 1 && simY > 0 && simY < simHeight - 1) {
            const idx = simY * simWidth + simX;
            const dx = buffer1[idx + 1] - buffer1[idx - 1];
            const dy = buffer1[idx + simWidth] - buffer1[idx - simWidth];

            if (dx !== 0 || dy !== 0) {
              const displaceX = Math.floor(x + dx * 0.52);
              const displaceY = Math.floor(y + dy * 0.52);

              const clampedX = Math.max(0, Math.min(width - 1, displaceX));
              const clampedY = Math.max(0, Math.min(height - 1, displaceY));

              const srcIdx = (clampedY * width + clampedX) * 4;
              const dstIdx = (y * width + x) * 4;

              // Chromatic channel split
              const redDisplace = Math.floor(dx * 0.22);
              const rX = Math.max(0, Math.min(width - 1, clampedX + redDisplace));
              const rIdx = (clampedY * width + rX) * 4;

              // Specular light bounce on wave crests
              const specular = Math.min(255, Math.max(0, (dx + dy) * 2.2));

              dst[dstIdx] = Math.min(255, src[rIdx] + specular * 0.7); // Red
              dst[dstIdx + 1] = Math.min(255, src[srcIdx + 1] + specular * 0.5); // Green
              dst[dstIdx + 2] = Math.min(255, src[srcIdx + 2] + specular * 1.0); // Blue
              dst[dstIdx + 3] = 255;
              continue;
            }
          }

          // Plain copy
          const directIdx = (y * width + x) * 4;
          dst[directIdx] = src[directIdx];
          dst[directIdx + 1] = src[directIdx + 1];
          dst[directIdx + 2] = src[directIdx + 2];
          dst[directIdx + 3] = 255;
        }
      }

      ctx.putImageData(targetImgData, 0, 0);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!container) return;
      width = canvas.width = container.clientWidth;
      height = canvas.height = container.clientHeight;
      bgCanvas.width = width;
      bgCanvas.height = height;
      drawBackground();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (ambientTimer) clearInterval(ambientTimer);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('mouseleave', onPointerLeave);
    };
  }, [imageSrc, dropRadius, dampening, perturbance, ambientRipples, interactiveStrength]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden w-full h-full select-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-crosshair"
      />
      {/* Knitted stitch texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'radial-gradient(rgba(43, 96, 100, 0.35) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />

      {showBadge && (
        <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E0D4F5] shadow-xs">
          <Waves className="w-3.5 h-3.5 text-[#8A68E8] animate-bounce" />
          <span className="text-[11px] font-extrabold text-[#1D4548] tracking-wider uppercase font-sans">
            React Bits • Ripple Distortion
          </span>
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
        </div>
      )}
    </div>
  );
}
