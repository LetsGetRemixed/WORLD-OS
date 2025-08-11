import type { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    // Extend JSX intrinsic elements with @react-three/fiber elements (fallbacks for strict TS)
    interface IntrinsicElements extends ThreeElements {
      primitive: any;
      ambientLight: any;
      pointLight: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
      mesh: any;
      group: any;
    }
  }
}

export {};


