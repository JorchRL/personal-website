export const INTERACTIVE_TEMPLATES = [
  {
    id: 'particle',
    name: 'Particle System',
    description: 'Interactive particles that respond to mouse movement',
    icon: '✨',
    config: {
      particleCount: { default: 150, min: 50, max: 300, label: 'Particle Count' },
      color: { default: '#4361EE', label: 'Color' },
      speed: { default: 1, min: 0.1, max: 3, step: 0.1, label: 'Speed' },
      mouseAttract: { default: true, label: 'Mouse Attraction' },
    },
  },
  {
    id: 'geometric',
    name: 'Geometric Scene',
    description: '3D rotating geometric shapes with lighting',
    icon: '🔷',
    config: {
      shape: { default: 'cube', options: ['cube', 'sphere', 'torus', 'octahedron'], label: 'Shape' },
      rotationSpeed: { default: 0.01, min: 0, max: 0.1, step: 0.001, label: 'Rotation Speed' },
      color: { default: '#4361EE', label: 'Color' },
      wireframe: { default: false, label: 'Wireframe' },
    },
  },
  {
    id: 'audio',
    name: 'Audio Visualizer',
    description: 'Real-time audio visualization',
    icon: '🎵',
    config: {
      visualMode: { default: 'bars', options: ['bars', 'wave', 'particles'], label: 'Visual Mode' },
      barCount: { default: 64, min: 32, max: 128, step: 8, label: 'Bar Count' },
      color: { default: '#4361EE', label: 'Color' },
    },
  },
  {
    id: 'custom',
    name: 'Custom Scene',
    description: 'Write your own React component with Three.js or p5.js',
    icon: '⚡',
    config: {},
  },
] as const