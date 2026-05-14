import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { ZoomableImage } from './zoomable-image';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    img: ZoomableImage,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
