// Function to get the current date in the format "May 15, 2025, Thursday"
function updateDate() {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const currentDate = new Date().toLocaleDateString('en-US', options);
    document.getElementById('current-date').textContent = currentDate;
  }
  
  // Update the date when the page loads
  window.onload = updateDate;
  
  function openModal() {
    document.getElementById('modalOverlay').style.display = 'flex';
  }
  
  function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
  }
  