
import React, { useEffect, useRef } from 'react';

const CyberBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let meteorites: Meteorite[] = [];
        const mouse = { x: -1000, y: -1000, radius: 150 };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const CRYPTO_CONFIG = [
            { symbol: '₿', name: 'BTC', color: '#f7931a' },
            { symbol: 'Ξ', name: 'ETH', color: '#627eea' },
            { symbol: 'S', name: 'SOL', color: '#14f195' },
            { symbol: 'B', name: 'BNB', color: '#f3ba2f' },
            { symbol: 'X', name: 'XRP', color: '#23292f' },
            { symbol: 'Ɖ', name: 'DOGE', color: '#c2a633' },
            { symbol: '₳', name: 'ADA', color: '#0033ad' },
            { symbol: 'A', name: 'AVAX', color: '#e84142' },
            { symbol: 'T', name: 'TRX', color: '#ff0013' },
            { symbol: '●', name: 'DOT', color: '#e6007a' }
        ];

        class Meteorite {
            x: number;
            y: number;
            speed: number;
            size: number;
            config: typeof CRYPTO_CONFIG[0];
            angle: number;
            rotation: number;
            rotationSpeed: number;
            history: { x: number, y: number }[];

            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = -100;
                this.speed = Math.random() * 4 + 2;
                this.size = Math.random() * 30 + 30; // Larger size: 30px to 60px
                this.config = CRYPTO_CONFIG[Math.floor(Math.random() * CRYPTO_CONFIG.length)];
                this.angle = Math.random() * Math.PI * 0.4 - 0.2; // Random fall angle
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.05;
                this.history = [];
            }

            draw() {
                if (!ctx) return;

                // Draw enhanced trail
                ctx.beginPath();
                ctx.lineWidth = 3;
                for (let i = 0; i < this.history.length; i++) {
                    const opacity = i / this.history.length;
                    ctx.strokeStyle = `${this.config.color}${Math.floor(opacity * 200).toString(16).padStart(2, '0')}`;
                    ctx.lineTo(this.history[i].x, this.history[i].y);
                }
                ctx.stroke();

                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);

                // Neon glow layers
                ctx.shadowBlur = 20;
                ctx.shadowColor = this.config.color;

                // Symbol with better visibility
                ctx.fillStyle = this.config.color;
                ctx.font = `bold ${this.size}px "Outfit", "Inter", sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Add a subtle white outline for readability on dark backgrounds
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.strokeText(this.config.symbol, 0, 0);
                ctx.fillText(this.config.symbol, 0, 0);

                ctx.restore();
            }

            update() {
                this.history.push({ x: this.x, y: this.y });
                if (this.history.length > 20) this.history.shift();

                this.y += this.speed;
                this.x += Math.tan(this.angle) * this.speed;
                this.rotation += this.rotationSpeed;

                // Stronger mouse interaction
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius * 1.5) {
                    const force = (mouse.radius * 1.5 - distance) / (mouse.radius * 1.5);
                    this.x -= (dx / distance) * force * 10;
                    this.y -= (dy / distance) * force * 5;
                }
            }
        }

        class Particle {
            x: number;
            y: number;
            size: number;
            baseX: number;
            baseY: number;
            density: number;
            color: string;

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 2 + 1;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 30) + 1;

                // Color variations in the indigo/slate spectrum
                const colors = ['#6366f1', '#818cf8', '#4f46e5', '#312e81', '#1e1b4b'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update() {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                if (distance < mouse.radius) {
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX;
                        this.x -= dx / 15;
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY;
                        this.y -= dy / 15;
                    }
                }
            }
        }

        const initParticles = () => {
            particles = [];
            meteorites = [];
            const numberOfParticles = (canvas.width * canvas.height) / 8000;
            for (let i = 0; i < numberOfParticles; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                particles.push(new Particle(x, y));
            }
        };

        const connect = () => {
            if (!ctx) return;
            let opacityValue = 1;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        opacityValue = 1 - (distance / 100);
                        ctx.strokeStyle = `rgba(99, 102, 241, ${opacityValue * 0.15})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Spawn meteorites
            if (Math.random() < 0.02) {
                meteorites.push(new Meteorite());
            }

            for (let i = 0; i < particles.length; i++) {
                particles[i].draw();
                particles[i].update();
            }

            for (let i = 0; i < meteorites.length; i++) {
                meteorites[i].draw();
                meteorites[i].update();
                // Remove out of bounds
                if (meteorites[i].y > canvas.height + 50) {
                    meteorites.splice(i, 1);
                    i--;
                }
            }

            connect();
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (event: MouseEvent) => {
            mouse.x = event.x;
            mouse.y = event.y;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 opacity-40"
            style={{ filter: 'blur(0.5px)' }}
        />
    );
};

export default CyberBackground;
