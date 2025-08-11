import { WorldNode } from './model';

export function composeImagePrompt(node: WorldNode): string {
  const style = [
    'concept art, painterly, volumetric light',
    'moody fog, soft rim light',
    'ancient basalt cliffs, lantern-lit market, wide shot',
    'no photo-real humans, stylized figures',
  ];
  const tags = (node.tags || []).join(', ');
  const props = Object.entries(node.props || {})
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join(', ');
  return `A ${node.type} called "${node.title}". Summary: ${node.summary || 'n/a'}. Tags: ${tags}. Props: ${props}. Visual style: ${style.join(', ')}.`;
}

export function composeNarrationText(node: WorldNode): string {
  const tone = 'calm, evocative, cinematic';
  const details = Object.entries(node.props || {})
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join('; ');
  return `Narrate a 20-30 second introduction to the ${node.type} "${node.title}" in a ${tone} voice. Include tags (${(node.tags || []).join(', ')}) and details (${details}). Keep it safe and non-graphic.`;
}


