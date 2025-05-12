let currentSlide = 0;
const slides = document.querySelectorAll('.slider section');
const totalSlides = slides.length;
const slider = document.querySelector('.slider');

function moveToNextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  slider.style.transform = `translateX(-${currentSlide * 100}vw)`;
  updateDotIndicators();
}

function updateDotIndicators() {
  const dots = document.querySelectorAll('.slider-controls ul li');
  dots.forEach((dot, index) => {
    dot.classList.toggle('selected', index === currentSlide);
  });
}

setInterval(moveToNextSlide, 3000);

const dotContainer = document.querySelector('.slider-controls ul');
for (let i = 0; i < totalSlides; i++) {
  const dot = document.createElement('li');
  if (i === 0) dot.classList.add('selected');
  dotContainer.appendChild(dot);
}