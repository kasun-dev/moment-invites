import ClassicTemplate from './ClassicTemplate';
import MetallicTemplate from './MetallicTemplate';

export const INVITATION_TEMPLATES = [
  { id: 'classic', name: 'Classic Dark', preview: 'A clean, elegant dark theme' },
  { id: 'metallic', name: 'Studio Metallic', preview: 'Professional camera-standard aesthetic' },
];

export const TemplateComponents: Record<string, any> = {
  classic: ClassicTemplate,
  metallic: MetallicTemplate,
};