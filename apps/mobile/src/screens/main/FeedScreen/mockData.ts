// Mock data for themes
export const mockThemes = [
  { id: 'flying', name: 'Flying', symbol: '🦅', count: 234 },
  { id: 'water', name: 'Water', symbol: '💧', count: 189 },
  { id: 'animals', name: 'Animals', symbol: '🦁', count: 167 },
  { id: 'family', name: 'Family', symbol: '👨‍👩‍👧‍👦', count: 145 },
  { id: 'travel', name: 'Travel', symbol: '✈️', count: 132 },
  { id: 'nature', name: 'Nature', symbol: '🌳', count: 128 },
  { id: 'space', name: 'Space', symbol: '🚀', count: 98 },
  { id: 'food', name: 'Food', symbol: '🍕', count: 87 },
  { id: 'school', name: 'School', symbol: '📚', count: 76 },
  { id: 'magic', name: 'Magic', symbol: '✨', count: 65 },
];

// Mock data for dreams
export const mockDreams = [
  {
    id: '1',
    username: 'DreamExplorer',
    isAnonymous: false,
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    location: 'San Francisco, CA',
    transcription: `I was flying above the clouds, feeling completely free. The sun was setting and painting everything in golden hues. I could see my childhood home below, but it looked different - bigger and more magical. As I flew closer, I realized I could control the wind with my thoughts. The feeling of freedom was indescribable. I woke up feeling inspired and energized.`,
    likes: 42,
    isLiked: false,
    themes: ['Flying', 'Magic'],
    imageUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=800',
  },
  {
    id: '2',
    username: null,
    isAnonymous: true,
    date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    transcription: `Deep underwater, breathing normally. Swimming with whales that were singing the most beautiful songs. Each note created colorful bubbles that floated upward. I could understand their language - they were telling stories about ancient oceans. The water was warm and comforting, like being wrapped in liquid starlight.`,
    likes: 128,
    isLiked: true,
    themes: ['Water', 'Animals', 'Magic'],
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=800',
  },
  {
    id: '3',
    username: 'NightWanderer',
    isAnonymous: false,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    location: 'Tokyo, Japan',
    transcription: `My grandmother visited me in my dream. She looked young and vibrant, like in her old photos. We sat in her garden, which was filled with flowers that glowed softly in the moonlight. She told me secrets about our family history and gave me a special locket. When I woke up, I felt her presence still with me. It was so real and comforting.`,
    likes: 89,
    isLiked: false,
    themes: ['Family', 'Nature'],
  },
  {
    id: '4',
    username: 'StarGazer22',
    isAnonymous: false,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    transcription: `Floating in space, but I could breathe. Earth looked like a beautiful blue marble below. Suddenly, I was on a space station with people from all over the world. We were working together on something important - a machine that could create peace. The stars were so bright and close, I could almost touch them.`,
    likes: 156,
    isLiked: false,
    themes: ['Space', 'Travel'],
    imageUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=800',
  },
  {
    id: '5',
    username: null,
    isAnonymous: true,
    date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    location: 'New York, NY',
    transcription: `Walking through a forest where the trees were made of books. Each leaf was a page with a different story. When the wind blew, you could hear whispers of all the tales being told at once. I climbed one of the trees and found myself in a library in the clouds. The librarian was an owl who gave me a book about my future.`,
    likes: 234,
    isLiked: true,
    themes: ['Nature', 'School', 'Magic'],
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=800',
  },
  {
    id: '6',
    username: 'DreamChef',
    isAnonymous: false,
    date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    transcription: `In a kitchen where ingredients floated in the air. I was cooking for a huge feast, and everything I made came to life. The pasta danced on the plates, the vegetables sang in harmony. The guests were characters from my favorite books. We all ate together at a table that extended into infinity.`,
    likes: 67,
    isLiked: false,
    themes: ['Food', 'Magic'],
  },
  {
    id: '7',
    username: 'WildDreamer',
    isAnonymous: false,
    date: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    location: 'Sydney, Australia',
    transcription: `Running with a pack of wolves through a snowy forest. I was one of them, understanding their communication perfectly. We were on an important mission to save the forest from disappearing. The moon was full and bright, lighting our path. I felt powerful and connected to nature in a way I've never experienced.`,
    likes: 198,
    isLiked: false,
    themes: ['Animals', 'Nature'],
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800',
  },
  {
    id: '8',
    username: null,
    isAnonymous: true,
    date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    transcription: `Back in my old school, but it was also a castle. The classrooms were filled with floating equations and historical figures teaching lessons. I had to solve a puzzle to graduate, and each correct answer made me grow wings. By the end, I was soaring through the hallways with my classmates.`,
    likes: 45,
    isLiked: false,
    themes: ['School', 'Flying', 'Magic'],
  },
];