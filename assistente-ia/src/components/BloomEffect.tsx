import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { EffectComposer, EffectPass, RenderPass, BloomEffect } from 'postprocessing';

export function Bloom({ threshold = 1.2, intensity = 1.5 }: { threshold?: number; intensity?: number }) {
  const { gl, scene, camera } = useThree();
  const state = useThree();

  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));

    const bloom = new BloomEffect({ luminanceThreshold: threshold, intensity, mipmapBlur: true });
    composer.addPass(new EffectPass(camera, bloom));

    const originalRender = state.render;
    state.render = (() => {
      composer.render();
    }) as typeof originalRender;

    return () => {
      state.render = originalRender;
      composer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera, threshold, intensity]);

  return null;
}
