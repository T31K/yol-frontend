export interface Song {
  slug: string
  title: string
  artist: string
  videoId: string
  category: string
}

export const songs: Song[] = [
  // Pop Hits
  { slug: 'despacito', title: 'Despacito', artist: 'Luis Fonsi ft. Daddy Yankee', videoId: 'kJQP7kiw5Fk', category: 'Pop' },
  { slug: 'shape-of-you', title: 'Shape of You', artist: 'Ed Sheeran', videoId: 'JGwWNGJdvx8', category: 'Pop' },
  { slug: 'see-you-again', title: 'See You Again', artist: 'Wiz Khalifa ft. Charlie Puth', videoId: 'RgKAFK5djSk', category: 'Pop' },
  { slug: 'uptown-funk', title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', videoId: 'OPf0YbXqDm0', category: 'Pop' },
  { slug: 'gangnam-style', title: 'Gangnam Style', artist: 'PSY', videoId: '9bZkp7q19f0', category: 'Pop' },
  { slug: 'sugar', title: 'Sugar', artist: 'Maroon 5', videoId: '09R8_2nJtjg', category: 'Pop' },
  { slug: 'counting-stars', title: 'Counting Stars', artist: 'OneRepublic', videoId: 'hT_nvWreIhg', category: 'Pop' },
  { slug: 'roar', title: 'Roar', artist: 'Katy Perry', videoId: 'CevxZvSJLk8', category: 'Pop' },
  { slug: 'shake-it-off', title: 'Shake It Off', artist: 'Taylor Swift', videoId: 'nfWlot6h_JM', category: 'Pop' },
  { slug: 'thinking-out-loud', title: 'Thinking Out Loud', artist: 'Ed Sheeran', videoId: 'lp-EO5I60KA', category: 'Pop' },
  { slug: 'blinding-lights', title: 'Blinding Lights', artist: 'The Weeknd', videoId: '4NRXx6U8ABQ', category: 'Pop' },
  { slug: 'someone-like-you', title: 'Someone Like You', artist: 'Adele', videoId: 'hLQl3WQQoQ0', category: 'Pop' },
  { slug: 'hello', title: 'Hello', artist: 'Adele', videoId: 'YQHsXMglC9A', category: 'Pop' },

  // Rock & Classic
  { slug: 'bohemian-rhapsody', title: 'Bohemian Rhapsody', artist: 'Queen', videoId: 'fJ9rUzIMcZQ', category: 'Rock' },
  { slug: 'never-gonna-give-you-up', title: 'Never Gonna Give You Up', artist: 'Rick Astley', videoId: 'dQw4w9WgXcQ', category: 'Classic' },
  { slug: 'take-on-me', title: 'Take On Me', artist: 'a-ha', videoId: 'djV11Xbc914', category: 'Classic' },
  { slug: 'sweet-child-o-mine', title: "Sweet Child O' Mine", artist: "Guns N' Roses", videoId: '1w7OgIMMRc4', category: 'Rock' },
  { slug: 'hotel-california', title: 'Hotel California', artist: 'Eagles', videoId: 'EqPtz5qN7HM', category: 'Rock' },
  { slug: 'stairway-to-heaven', title: 'Stairway to Heaven', artist: 'Led Zeppelin', videoId: 'QkF3oxziUI4', category: 'Rock' },
  { slug: 'smells-like-teen-spirit', title: 'Smells Like Teen Spirit', artist: 'Nirvana', videoId: 'hTWKbfoikeg', category: 'Rock' },
  { slug: 'comfortably-numb', title: 'Comfortably Numb', artist: 'Pink Floyd', videoId: '_FrOQC-zEog', category: 'Rock' },

  // Hip Hop & R&B
  { slug: 'lose-yourself', title: 'Lose Yourself', artist: 'Eminem', videoId: '_Yhyp-_hX2s', category: 'Hip Hop' },
  { slug: 'gods-plan', title: "God's Plan", artist: 'Drake', videoId: 'xpVfcZ0ZcFM', category: 'Hip Hop' },
  { slug: 'humble', title: 'HUMBLE.', artist: 'Kendrick Lamar', videoId: 'tvTRZJ-4EyI', category: 'Hip Hop' },
  { slug: 'old-town-road', title: 'Old Town Road', artist: 'Lil Nas X', videoId: 'r7qovpFAGrQ', category: 'Hip Hop' },
  { slug: 'stay', title: 'Stay', artist: 'The Kid LAROI & Justin Bieber', videoId: 'kTJczUoc26U', category: 'Pop' },

  // K-Pop
  { slug: 'dynamite', title: 'Dynamite', artist: 'BTS', videoId: 'gdZLi9oWNZg', category: 'K-Pop' },
  { slug: 'butter', title: 'Butter', artist: 'BTS', videoId: 'WMweEpGlu_U', category: 'K-Pop' },
  { slug: 'how-you-like-that', title: 'How You Like That', artist: 'BLACKPINK', videoId: 'ioNng23DkIM', category: 'K-Pop' },
  { slug: 'kill-this-love', title: 'Kill This Love', artist: 'BLACKPINK', videoId: '2S24-y0Ij3Y', category: 'K-Pop' },
  { slug: 'ddu-du-ddu-du', title: 'DDU-DU DDU-DU', artist: 'BLACKPINK', videoId: 'IHNzOHi8sJs', category: 'K-Pop' },

  // Latin
  { slug: 'mi-gente', title: 'Mi Gente', artist: 'J Balvin & Willy William', videoId: 'wnJ6LuUFpMo', category: 'Latin' },
  { slug: 'danza-kuduro', title: 'Danza Kuduro', artist: 'Don Omar ft. Lucenzo', videoId: '7zp1TbLFPp8', category: 'Latin' },
  { slug: 'bailando', title: 'Bailando', artist: 'Enrique Iglesias', videoId: 'NUsoVlDFqZg', category: 'Latin' },

  // Study & Lo-fi
  { slug: 'lofi-hip-hop-radio', title: 'Lofi Hip Hop Radio', artist: 'Lofi Girl', videoId: 'jfKfPfyJRdk', category: 'Study' },
  { slug: 'coffee-shop-ambience', title: 'Coffee Shop Ambience', artist: 'Calmed By Nature', videoId: 'h2zkV-l_TbY', category: 'Study' },
  { slug: 'rain-sounds', title: 'Rain Sounds for Sleep', artist: 'Relaxing White Noise', videoId: 'mPZkdNFkNps', category: 'Study' },

  // Acoustic & Chill
  { slug: 'let-her-go', title: 'Let Her Go', artist: 'Passenger', videoId: 'RBumgq5yVrA', category: 'Acoustic' },
  { slug: 'perfect', title: 'Perfect', artist: 'Ed Sheeran', videoId: '2Vv-BfVoq4g', category: 'Acoustic' },
  { slug: 'photograph', title: 'Photograph', artist: 'Ed Sheeran', videoId: 'nSDgHBxUbVQ', category: 'Acoustic' },
  { slug: 'all-of-me', title: 'All of Me', artist: 'John Legend', videoId: '450p7goxZqg', category: 'Acoustic' },
  { slug: 'a-thousand-years', title: 'A Thousand Years', artist: 'Christina Perri', videoId: 'rtOvBOTyX00', category: 'Acoustic' },

  // Workout & Energy
  { slug: 'eye-of-the-tiger', title: 'Eye of the Tiger', artist: 'Survivor', videoId: 'btPJPFnesV4', category: 'Workout' },
  { slug: 'stronger', title: 'Stronger', artist: 'Kanye West', videoId: 'PsO6ZnUZI0g', category: 'Workout' },
  { slug: 'till-i-collapse', title: "Till I Collapse", artist: 'Eminem', videoId: 'ytQ5CYE1VZw', category: 'Workout' },
  { slug: 'cant-hold-us', title: "Can't Hold Us", artist: 'Macklemore & Ryan Lewis', videoId: '2zNSgSzhBfM', category: 'Workout' },

  // Anime & Gaming
  { slug: 'unravel', title: 'Unravel', artist: 'TK from Ling Tosite Sigure', videoId: 'uMeR2W19wT0', category: 'Anime' },
  { slug: 'gurenge', title: 'Gurenge', artist: 'LiSA', videoId: 'CwkzK-F0Y00', category: 'Anime' },
  { slug: 'blue-bird', title: 'Blue Bird', artist: 'Ikimono-gakari', videoId: 'boMz1GUb8Sw', category: 'Anime' },
  { slug: 'megalovania', title: 'Megalovania', artist: 'Toby Fox', videoId: 'wDgQdr8ZkTw', category: 'Gaming' },
]

export const categories = Array.from(new Set(songs.map((s) => s.category))).sort()
