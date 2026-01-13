
import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

interface GravitySandboxProps {
  children: React.ReactNode;
  active: boolean;
}

const GravitySandbox: React.FC<GravitySandboxProps> = ({ children, active }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const bodiesMap = useRef<Map<number, Matter.Body>>(new Map());
  const elementRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Need to sync React elements with Matter.js bodies
  const [positions, setPositions] = useState<Record<number, { x: number, y: number, angle: number }>>({});

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Matter JS
    const engine = Matter.Engine.create();
    engineRef.current = engine;
    
    // World setup
    const world = engine.world;
    world.gravity.y = 0; // Start with no gravity

    // Walls (invisible)
    const { width, height } = containerRef.current.getBoundingClientRect();
    const wallOptions = { isStatic: true, render: { visible: false } };
    const ground = Matter.Bodies.rectangle(width / 2, height + 50, width, 100, wallOptions);
    const ceiling = Matter.Bodies.rectangle(width / 2, -50, width, 100, wallOptions);
    const leftWall = Matter.Bodies.rectangle(-50, height / 2, 100, height, wallOptions);
    const rightWall = Matter.Bodies.rectangle(width + 50, height / 2, 100, height, wallOptions);
    
    Matter.World.add(world, [ground, ceiling, leftWall, rightWall]);

    // Add mouse control
    const mouse = Matter.Mouse.create(containerRef.current);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    Matter.World.add(world, mouseConstraint);

    // Initial positioning logic
    const bodies: Matter.Body[] = [];
    elementRefs.current.forEach((el, index) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const parentRect = containerRef.current!.getBoundingClientRect();
      
      const x = rect.left - parentRect.left + rect.width / 2;
      const y = rect.top - parentRect.top + rect.height / 2;
      
      const body = Matter.Bodies.rectangle(x, y, rect.width, rect.height, {
        chamfer: { radius: 24 },
        restitution: 0.5,
        friction: 0.1,
        frictionAir: 0.05
      });
      
      bodiesMap.current.set(index, body);
      bodies.push(body);
    });

    Matter.World.add(world, bodies);

    // Runner to update engine
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    // Sync loop
    const sync = () => {
      const newPositions: any = {};
      bodiesMap.current.forEach((body, index) => {
        newPositions[index] = {
          x: body.position.x,
          y: body.position.y,
          angle: body.angle
        };
      });
      setPositions(newPositions);
      requestAnimationFrame(sync);
    };
    const animId = requestAnimationFrame(sync);

    return () => {
      cancelAnimationFrame(animId);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
    };
  }, []);

  // Handle gravity toggle
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.world.gravity.y = active ? 1.5 : 0;
      
      if (!active) {
        // Reset to original positions when disabled? 
        // Actually it's cooler if they just float.
        // Let's apply some chaotic upward forces to reset them gently if turned off.
        bodiesMap.current.forEach((body) => {
            if (!active) {
                 Matter.Body.setAngularVelocity(body, 0);
                 Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 5, y: -Math.random() * 5 });
            }
        });
      }
    }
  }, [active]);

  return (
    <div 
      ref={containerRef} 
      className="relative grid grid-cols-12 gap-6 min-h-[600px] w-full"
      style={{ perspective: '1000px' }}
    >
      {React.Children.map(children, (child, index) => {
        const pos = positions[index];
        const style: React.CSSProperties = active && pos ? {
          position: 'absolute',
          left: 0,
          top: 0,
          width: 'auto', // Width is managed by the original layout but absolute positioning needs care
          transform: `translate(${pos.x - (elementRefs.current[index]?.offsetWidth || 0) / 2}px, ${pos.y - (elementRefs.current[index]?.offsetHeight || 0) / 2}px) rotate(${pos.angle}rad)`,
          zIndex: 50,
          pointerEvents: 'auto',
          margin: 0
        } : {
          visibility: 'visible',
          transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        };

        return (
          <div 
            // Fix: Ref assignment wrapped in braces to return void, satisfying TypeScript
            ref={el => { elementRefs.current[index] = el; }}
            style={style}
            className={child && (child as any).props.className ? (child as any).props.className : ''}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

export default GravitySandbox;
