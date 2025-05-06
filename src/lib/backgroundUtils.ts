
/**
 * Utility functions for dynamic backgrounds and UI effects
 */

// Collection of gradient backgrounds
const gradients = [
  'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
  'linear-gradient(180deg, rgb(254,100,121) 0%, rgb(251,221,186) 100%)',
  'linear-gradient(to top, #accbee 0%, #e7f0fd 100%)',
  'linear-gradient(to right, #ee9ca7, #ffdde1)',
  'linear-gradient(90deg, hsla(221, 45%, 73%, 1) 0%, hsla(220, 78%, 29%, 1) 100%)',
  'linear-gradient(to top, #d299c2 0%, #fef9d7 100%)',
];

/**
 * Get a random gradient from the collection
 * @param seed Optional seed to get consistent results
 * @returns A CSS gradient string
 */
export const getRandomGradient = (seed?: string): string => {
  if (seed) {
    // Use the seed to get a consistent gradient for the same input
    const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
    return gradients[index];
  }
  
  // Random gradient
  return gradients[Math.floor(Math.random() * gradients.length)];
};

/**
 * Get a CSS class for a colorful card based on an identifier
 * @param id Any string identifier
 * @returns CSS class name for a colorful card
 */
export const getColorfulCardClass = (id: string): string => {
  const options = ['colorful-card-blue', 'colorful-card-purple', 'colorful-card-green', 'colorful-card-amber'];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % options.length;
  return options[index];
};
