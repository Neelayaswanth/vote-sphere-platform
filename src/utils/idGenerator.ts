
export const generateUniqueId = (): string => {
  // Generate 2 random numbers (00-99)
  const numbers1 = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  // Generate 4 random capital letters
  const letters = Array.from({ length: 4 }, () => 
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join('');
  
  // Generate 3 random numbers (000-999)
  const numbers2 = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${numbers1}${letters}${numbers2}`;
};

export const validateIdFormat = (id: string): boolean => {
  // Check if ID matches format: 2 digits + 4 capital letters + 3 digits
  const pattern = /^\d{2}[A-Z]{4}\d{3}$/;
  return pattern.test(id);
};

export const formatIdForDisplay = (id: string): string => {
  if (id.length === 9) {
    return `${id.slice(0, 2)} ${id.slice(2, 6)} ${id.slice(6, 9)}`;
  }
  return id;
};
