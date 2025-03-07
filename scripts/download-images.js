const fs = require('fs');
const path = require('path');
const https = require('https');

// Create the public/images directory if it doesn't exist
const imagesDir = path.join(__dirname, '../public/images');
const projectImagesDir = path.join(imagesDir, 'projects');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

if (!fs.existsSync(projectImagesDir)) {
  fs.mkdirSync(projectImagesDir, { recursive: true });
}

// Image configurations with seeds for consistent results via Picsum Photos
// Using https://picsum.photos/ API
const projectImages = [
  {
    filename: 'minimalist-ecommerce.jpg',
    seed: 'minimal-ecommerce',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'Minimalist E-commerce'
  },
  {
    filename: 'ai-content-studio.jpg',
    seed: 'ai-technology',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'AI Content Studio'
  },
  {
    filename: 'brutalist-portfolio.jpg',
    seed: 'brutalist-architecture',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'Brutalist Portfolio'
  },
  {
    filename: 'monochrome-dashboard.jpg',
    seed: 'dashboard-minimal',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'Monochrome Dashboard'
  },
  {
    filename: 'typography-magazine.jpg',
    seed: 'typography-magazine',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'Typography Magazine'
  },
  {
    filename: 'architect-showcase.jpg',
    seed: 'minimal-architecture',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'Architect Showcase'
  }
];

// Gallery images for each project
const galleryImages = [
  // Minimalist E-commerce galleries
  {
    filename: 'minimalist-ecommerce-gallery-1.jpg',
    seed: 'minimal-product-1',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'Minimalist E-commerce Gallery 1'
  },
  {
    filename: 'minimalist-ecommerce-gallery-2.jpg',
    seed: 'minimal-shop-2',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'Minimalist E-commerce Gallery 2'
  },
  {
    filename: 'minimalist-ecommerce-gallery-3.jpg',
    seed: 'elegant-product-3',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'Minimalist E-commerce Gallery 3'
  },
  
  // AI Content Studio galleries
  {
    filename: 'ai-content-studio-gallery-1.jpg',
    seed: 'futuristic-interface-1',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'AI Content Studio Gallery 1'
  },
  {
    filename: 'ai-content-studio-gallery-2.jpg',
    seed: 'ai-visualization-2',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'AI Content Studio Gallery 2'
  },
  {
    filename: 'ai-content-studio-gallery-3.jpg',
    seed: 'tech-workspace-3',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'AI Content Studio Gallery 3'
  },
  
  // Brutalist Portfolio galleries
  {
    filename: 'brutalist-portfolio-gallery-1.jpg',
    seed: 'brutalist-design-1',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'Brutalist Portfolio Gallery 1'
  },
  {
    filename: 'brutalist-portfolio-gallery-2.jpg',
    seed: 'concrete-stark-2',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'Brutalist Portfolio Gallery 2'
  },
  {
    filename: 'brutalist-portfolio-gallery-3.jpg',
    seed: 'typography-poster-3',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'Brutalist Portfolio Gallery 3'
  },
  
  // Additional galleries for other projects
  {
    filename: 'monochrome-dashboard-gallery-1.jpg',
    seed: 'data-visualization-1',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'Monochrome Dashboard Gallery 1'
  },
  {
    filename: 'monochrome-dashboard-gallery-2.jpg',
    seed: 'ui-monochrome-2',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'Monochrome Dashboard Gallery 2'
  },
  {
    filename: 'monochrome-dashboard-gallery-3.jpg',
    seed: 'analytics-minimal-3',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'Monochrome Dashboard Gallery 3'
  },
  
  {
    filename: 'typography-magazine-gallery-1.jpg',
    seed: 'editorial-design-1',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'Typography Magazine Gallery 1'
  },
  {
    filename: 'typography-magazine-gallery-2.jpg',
    seed: 'magazine-spread-2',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'Typography Magazine Gallery 2'
  },
  {
    filename: 'typography-magazine-gallery-3.jpg',
    seed: 'publication-design-3',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'Typography Magazine Gallery 3'
  },
  
  {
    filename: 'architect-showcase-gallery-1.jpg',
    seed: 'architecture-interior-1',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'Architect Showcase Gallery 1'
  },
  {
    filename: 'architect-showcase-gallery-2.jpg',
    seed: 'architectural-model-2',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'Architect Showcase Gallery 2'
  },
  {
    filename: 'architect-showcase-gallery-3.jpg',
    seed: 'architectural-drawing-3',
    width: 1400,
    height: 800,
    grayscale: true,
    description: 'Architect Showcase Gallery 3'
  }
];

// Function to build Picsum URL for an image config
function buildPicsumUrl(imageConfig) {
  // Base URL
  let url = 'https://picsum.photos';
  
  // Add seed for consistent random image
  if (imageConfig.seed) {
    url += `/seed/${imageConfig.seed}`;
  }
  
  // Add dimensions
  url += `/${imageConfig.width}/${imageConfig.height}`;
  
  // Add grayscale option if needed
  if (imageConfig.grayscale) {
    url += '?grayscale';
  }
  
  return url;
}

// Function to download an image from URL and save to file
function downloadImage(imageConfig) {
  return new Promise((resolve, reject) => {
    const url = buildPicsumUrl(imageConfig);
    const filePath = path.join(projectImagesDir, imageConfig.filename);
    const file = fs.createWriteStream(filePath);
    
    console.log(`Downloading: ${imageConfig.description} from ${url}`);
    
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        console.log(`Redirecting to: ${response.headers.location}`);
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          
          file.on('finish', () => {
            file.close();
            console.log(`✅ Downloaded: ${imageConfig.filename}`);
            resolve();
          });
          
          file.on('error', (err) => {
            fs.unlink(filePath, () => {}); // Clean up failed file
            console.error(`❌ Error downloading ${imageConfig.filename}: ${err.message}`);
            reject(err);
          });
        }).on('error', reject);
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${imageConfig.filename}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Clean up failed file
        console.error(`❌ Error downloading ${imageConfig.filename}: ${err.message}`);
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Clean up failed file
      console.error(`❌ Error downloading ${imageConfig.filename}: ${err.message}`);
      reject(err);
    });
  });
}

// Download all images
async function downloadAllImages() {
  console.log('📥 Downloading project images from Lorem Picsum...');
  
  // Add delay between requests to avoid overwhelming the server
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  try {
    // Download main project images
    for (const imageConfig of projectImages) {
      try {
        console.log(`Fetching ${imageConfig.description}...`);
        await downloadImage(imageConfig);
        await delay(300); // 300ms delay between requests
      } catch (error) {
        console.error(`Failed to download ${imageConfig.filename}: ${error.message}`);
      }
    }
    
    // Download gallery images
    for (const imageConfig of galleryImages) {
      try {
        console.log(`Fetching ${imageConfig.description}...`);
        await downloadImage(imageConfig);
        await delay(300); // 300ms delay between requests
      } catch (error) {
        console.error(`Failed to download ${imageConfig.filename}: ${error.message}`);
      }
    }
    
    console.log('✅ All images downloaded successfully!');
  } catch (error) {
    console.error('❌ Error downloading images:', error);
  }
}

// Run the download
downloadAllImages(); 