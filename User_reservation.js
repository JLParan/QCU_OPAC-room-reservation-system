
const monthNameEl = document.getElementById("month-name");
const daysGridEl = document.getElementById("days-grid");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const selectedDateTextEl = document.getElementById("selected-date-text");
const selectedDateContainerEl = document.getElementById("selected-date-container");




let currentDate = new Date();
let selectedDate = null; // Track the selected date




// Function to generate the calendar
function generateCalendar(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();




    daysGridEl.innerHTML = "";
    monthNameEl.textContent = new Date(year, month).toLocaleString("default", {
        month: "long",
        year: "numeric",
    });




    // Generate empty cells for the days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        daysGridEl.innerHTML += `<div class="day empty"></div>`;
    }




    // Generate day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        let dayClass = "day";




        if (date.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)) {
            dayClass += " past"; // Past dates
        } else if (date.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
            dayClass += " available"; // Today's date is available
        } else {
            dayClass += " available"; // Future dates are available
        }




        if (selectedDate && date.setHours(0, 0, 0, 0) === selectedDate.setHours(0, 0, 0, 0)) {
            dayClass += " selected"; // Highlight the selected date
        }




        const dayCell = document.createElement("div");
        dayCell.className = dayClass;
        dayCell.textContent = day;
        dayCell.addEventListener("click", () => handleDayClick(date));
        daysGridEl.appendChild(dayCell);
    }
}




// Handle day click event
function handleDayClick(date) {
    const today = new Date();
    if (date.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)) {
        return; // Do nothing for past dates
    }




    // Store selected date
    selectedDate = date;




    // Update displayed selected date
    selectedDateTextEl.textContent = date.toLocaleDateString();
    selectedDateContainerEl.style.display = "block";




    // Remove yellow highlight from any previously selected date
    const previouslySelected = document.querySelector(".day.selected");
    if (previouslySelected) {
        previouslySelected.classList.remove("selected");
    }




    // Highlight the clicked date in yellow
    const dayCells = document.querySelectorAll(".day");
    dayCells.forEach(cell => {
        const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), cell.textContent);
        if (
            cellDate.getDate() === date.getDate() &&
            cellDate.getMonth() === date.getMonth() &&
            cellDate.getFullYear() === date.getFullYear()
        ) {
            cell.classList.add("selected");
        }
    });
}


// Initialize the calendar
generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
selectedDateContainerEl.style.display = "none"; // Hide selected date initially




// Navigation for previous and next month
prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    selectedDateContainerEl.style.display = "none"; // Hide selected date
    selectedDate = null;
});




nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    selectedDateContainerEl.style.display = "none"; // Hide selected date
    selectedDate = null;
});


// Form elements
const form = document.getElementById('student-form');
const nameInput = document.getElementById('name');
const studentIdInput = document.getElementById('student-id');
const nameError = document.getElementById('name-error');
const studentIdError = document.getElementById('student-id-error');
const roomSelect = document.getElementById('room-select');
const programButtons = document.querySelectorAll('.program-btn');
const programInput = document.getElementById('selected-program');
const programError = document.getElementById('program-error');
const numStudentsSelect = document.getElementById('num-students');
const studentsContainer = document.getElementById('students-container');


programButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        programButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        programInput.value = btn.getAttribute('data-program');
        programError.textContent = '';
    });
});


function validateProgram() {
    if (programInput.value.trim() === '') {
        programError.textContent = 'Please select a program.';
        return false;
    }
    return true;
}


numStudentsSelect.addEventListener('change', function () {
    const numStudents = parseInt(this.value); // Get selected number of students
    studentsContainer.innerHTML = ''; // Clear existing fields




    for (let i = 1; i <= numStudents; i++) {
        const studentFieldGroup = document.createElement('div');
        studentFieldGroup.classList.add('student-container');




        studentFieldGroup.innerHTML = `
            <div class="student-header">
                <strong>Student ${i}</strong>
            </div>
            <div class="student-fields">
                <div class="student-name">
                    <label for="student-name-${i}" class="custom-label">Name</label>
                    <input type="text" id="student-name-${i}" name="student-name-${i}" class="custom-input" placeholder="Enter name">
                </div>
                <div class="student-id">
                    <label for="student-id-${i}" class="custom-label">Student Number</label>
                    <input type="text" id="student-id-${i}" name="student-id-${i}" class="custom-input" placeholder="Enter student ID">
                </div>
            </div>
        `;
        studentsContainer.appendChild(studentFieldGroup);
    }
});


// Validation functions
function validateName() {
    if (nameInput.value.trim() === '') {
        nameInput.classList.add('input-error');
        nameError.textContent = 'Please enter a name.';
        return false;
    }
    nameInput.classList.remove('input-error');
    nameError.textContent = '';
    return true;
}




function validateStudentId() {
    if (studentIdInput.value.trim() === '') {
        studentIdInput.classList.add('input-error');
        studentIdError.textContent = 'Please enter a student ID.';
        return false;
    }
    studentIdInput.classList.remove('input-error');
    studentIdError.textContent = '';
    return true;
}




nameInput.addEventListener('input', validateName);
studentIdInput.addEventListener('input', validateStudentId);




// Handle form submission
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const isNameValid = validateName();
    const isStudentIdValid = validateStudentId();
    const isProgramValid = validateProgram();




if (isNameValid && isStudentIdValid && isProgramValid && selectedDate) {
    // continue with submission
}




    if (isNameValid && isStudentIdValid && selectedDate) {
        // Create data to send to the server (Google Form or backend)
        const data = new FormData();
        data.append('entry.1234567890', nameInput.value); // Replace with the actual entry ID for Name
        data.append('entry.0987654321', studentIdInput.value); // Replace with the actual entry ID for Student ID
        data.append('entry.1122334455', selectedDate.toLocaleDateString()); // Replace with actual entry ID for Da




        // Send data via fetch to Google Forms or your endpoint
        const googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSe2goDTFZcSIFL4T3KdbY6H4lT8ytnpxCWBmDm7sXY3REd_rg/formResponse';
        fetch(googleFormUrl, {
            method: 'POST',
            body: data,
            mode: 'no-cors' // 'no-cors' to handle Google Forms
        })
        .then(() => {
            alert('Your reservation has been successfully submitted!');
            form.reset();
            selectedDateContainerEl.style.display = "none"; // Hide selected date
            selectedDate = null;
        })
        .catch((error) => {
            alert('Submission failed. Please try again later.');
            console.error(error);
        });
    } else {
        alert('Please fill out all fields correctly.');
    }
});



// Handle room select toggle
const selectWrapper = document.querySelector('.custom-select-wrapper');
const selectTrigger = document.querySelector('.custom-select-trigger');
const selectOptions = document.querySelector('.custom-options');




selectTrigger.addEventListener('click', () => {
    selectWrapper.classList.toggle('open');
    selectOptions.style.display = selectWrapper.classList.contains('open') ? 'block' : 'none';
});




selectOptions.addEventListener('click', (event) => {
    if (event.target.classList.contains('custom-option')) {
        const value = event.target.dataset.value;
        roomSelect.value = value;
        selectTrigger.textContent = event.target.textContent;
        selectWrapper.classList.remove('open');
        selectOptions.style.display = 'none';
    }
});








// Close the dropdown if clicked outside
document.addEventListener('click', (event) => {
    if (!selectWrapper.contains(event.target) && !selectOptions.contains(event.target)) {
        selectWrapper.classList.remove('open');
        selectOptions.style.display = 'none';
    }
});

document.addEventListener("DOMContentLoaded", () => {
     const startTimeSelect = document.getElementById("start-time-select"); // Ensure this ID matches your HTML
    if (startTimeSelect) {
        const submitButton = document.getElementById("submit");
          if (submitButton) {
    submitButton.addEventListener('click', () => {
        if (startTimeSelect.value) {
            const selectedStartTimeDisplay = startTimeSelect.options[startTimeSelect.selectedIndex].textContent;
            const endTime = endTimeInput.value;
            const participants = parseInt(participantsInput.value);
            const reason = reasonTextarea.value;
            alert(`Reservation submitted!\nStart Time: ${selectedStartTimeDisplay}\nEnd Time: ${endTime}\nParticipants: ${participants}\nReason: ${reason}`);
            // In a real application, you would send this data to your backend
        } else {
            alert('Please select a start time.');
        }
    });
} else {
    console.error("Submit button not found");
}
} else {
        console.error("Start time select not found");
    }
});


            submitButton.addEventListener('click', () => {
                if (startTimeSelect.value) {
                    const selectedStartTimeDisplay = startTimeSelect.options[startTimeSelect.selectedIndex].textContent;
                    const endTime = endTimeInput.value;
                    const participants = participantsInput.value;
                    const reason = reasonTextarea.value;
                    alert(`Reservation submitted!\nStart Time: ${selectedStartTimeDisplay}\nEnd Time: ${endTime}\nParticipants: ${participants}\nReason: ${reason}`);
                    // In a real application, you would send this data to your backend
                } else {
                    alert('Please select a start time.');
                }
            });

            document.addEventListener('DOMContentLoaded', function() {
                const timeSlotsContainer = document.querySelector('.time-slots');
                const timeSlots = timeSlotsContainer.querySelectorAll('.time-slot');
    
                timeSlots.forEach(slot => {
                    if (slot.classList.contains('available') || slot.classList.contains('selected')) {
                        slot.classList.add('clickable'); // Add a 'clickable' class for styling if needed
                        slot.addEventListener('click', function() {
                            const previouslySelected = document.querySelector('.time-slot.selected');
                            if (previouslySelected && previouslySelected !== this) {
                                previouslySelected.classList.remove('selected');
                            }
                            if (!this.classList.contains('reserved')) {
                                this.classList.toggle('selected');
                            }
                        });
                    }
                });
            });


   