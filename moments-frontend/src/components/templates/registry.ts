import ClassicTemplate from './ClassicTemplate';
import Kandian from './Kandian';
import MetallicTemplate from './MetallicTemplate';

export const INVITATION_TEMPLATES = [
  { id: 'classic', name: 'Classic Dark', preview: 'A clean, elegant dark theme' },
  { id: 'lily_classic', name: 'Lily Classic', preview: 'A soft, romantic classic theme' },
  { id: 'kandian', name: 'Kandian', preview: 'A vibrant, modern theme' }
];

export const TemplateComponents: Record<string, any> = {
  classic: ClassicTemplate,
  lily_classic: MetallicTemplate,
  kandian: Kandian
};