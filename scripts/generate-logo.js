import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

async function generateReviewAILogo() {
  const zai = await ZAI.create();

  console.log('Generating ReviewAI logo...');

  // Generate main logo
  const logoResponse = await zai.images.generations.create({
    prompt: 'Modern tech logo for code review AI, letter R and AI combined, sleek minimalist design, gradient from purple to blue, geometric shapes, professional, clean, white background, high quality',
    size: '1024x1024'
  });

  const logoBase64 = logoResponse.data[0].base64;
  const logoBuffer = Buffer.from(logoBase64, 'base64');
  fs.writeFileSync('./public/reviewai-logo.png', logoBuffer);
  console.log('✓ Main logo saved: ./public/reviewai-logo.png');

  // Generate hero banner
  const heroResponse = await zai.images.generations.create({
    prompt: 'Abstract technology background representing AI code analysis, flowing data streams, circuit patterns, purple and blue gradient, modern, clean, wide aspect ratio, high quality',
    size: '1440x720'
  });

  const heroBase64 = heroResponse.data[0].base64;
  const heroBuffer = Buffer.from(heroBase64, 'base64');
  fs.writeFileSync('./public/hero-bg.png', heroBuffer);
  console.log('✓ Hero banner saved: ./public/hero-bg.png');

  // Generate feature illustration
  const featureResponse = await zai.images.generations.create({
    prompt: 'Illustration of code being analyzed by AI, robot hand reviewing code on screen, glowing elements, purple and blue theme, modern tech style, detailed, high quality',
    size: '1344x768'
  });

  const featureBase64 = featureResponse.data[0].base64;
  const featureBuffer = Buffer.from(featureBase64, 'base64');
  fs.writeFileSync('./public/feature-illustration.png', featureBuffer);
  console.log('✓ Feature illustration saved: ./public/feature-illustration.png');

  console.log('\n✓ All assets generated successfully!');
}

generateReviewAILogo().catch(console.error);
