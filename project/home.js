import { Api } from "./js/Api.js";
import { Student } from './js/student.js';
import { Course } from './js/course.js';
import { Instructor } from './js/instructor.js';
import { Employee } from "./js/employee.js";

const appRoot = document.getElementById('app-root');
const schemas = {
    student: ["name", "email", "phone", "gpa", "enrollmentDate"],
    course: ["name", "credits", "instructorId"],
    instructor: ["name", "email", "phone", "department"],
    employee: ["name", "email", "password", "role"]
};

let currentPage = 1;
const itemsPerPage = 5;
let currentData = [];
let currentTitle = "";

// Check authentication and initialize user display
const sessionUser = sessionStorage.getItem("loggedInUser");
if (!sessionUser) {
    window.location.href = "index.html";
} else {
    const user = JSON.parse(sessionUser);
    document.getElementById("user-name").innerText = user["name"];
}

// Handle user logout
document.getElementById("logoutBtn").addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = "index.html";
});

// Initialize table sorting event listeners
function initTableSorting() {
    const table = document.querySelector('.styled-table');
    if (!table) return;

    const headers = table.querySelectorAll('thead th:not(:last-child)');
    let currentSortColumn = null;
    let currentSortOrder = null;

    headers.forEach((header, columnIndex) => {
        header.addEventListener('click', () => {
            if (currentSortColumn === columnIndex) {
                if (currentSortOrder === 'asc') {
                    currentSortOrder = 'desc';
                } else if (currentSortOrder === 'desc') {
                    currentSortOrder = null;
                    currentSortColumn = null;
                } else {
                    currentSortOrder = 'asc';
                }
            } else {
                currentSortColumn = columnIndex;
                currentSortOrder = 'asc';
            }

            headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));

            if (currentSortOrder === 'asc') {
                header.classList.add('sort-asc');
            } else if (currentSortOrder === 'desc') {
                header.classList.add('sort-desc');
            }

            sortTable(table, columnIndex, currentSortOrder);
        });
    });
}

// Perform the actual sorting of table rows
function sortTable(table, columnIndex, order) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    if (!order) return;

    rows.sort((a, b) => {
        const aText = a.cells[columnIndex].textContent.trim();
        const bText = b.cells[columnIndex].textContent.trim();
        const aNum = parseFloat(aText);
        const bNum = parseFloat(bText);

        let comparison = 0;
        if (!isNaN(aNum) && !isNaN(bNum)) {
            comparison = aNum - bNum;
        } else {
            comparison = aText.localeCompare(bText, undefined, { numeric: true, sensitivity: 'base' });
        }

        return order === 'asc' ? comparison : -comparison;
    });

    rows.forEach(row => tbody.appendChild(row));
}

// Initialize search functionality for the table
function initTableSearch() {
    const searchInput = document.getElementById('table-search');
    const table = document.querySelector('.styled-table');

    if (!searchInput || !table) return;

    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    searchInput.addEventListener('keyup', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        rows.forEach(row => {
            const cells = Array.from(row.querySelectorAll('td:not(:last-child)'));
            const rowText = cells.map(td => td.textContent).join(' ').toLowerCase();
            row.style.display = rowText.includes(searchTerm) ? "" : "none";
        });
    });
}

// Build and display the table based on data and category
function renderTable(data, title) {
    if (title === "home") {
        appRoot.innerHTML = `<div class="welcome-banner">
            <h3>Welcome to the Student Affairs System</h3>
            <p>Select a category from the sidebar to manage records.</p>
        </div>`;
        return;
    }

    if (!data || data.length === 0) {
        appRoot.innerHTML = `<div class="alert">No ${title} found.</div>`;
        return;
    }

    const columns = Object.keys(data[0]);
    let tableHTML = `
        <div class="content-header">
            <h2>${title} List</h2>
            <div class="header-actions">
                <input type="text" id="table-search" placeholder="Search ${title}..." class="search-input">
                <button class="btn-add">+ Add New ${title.slice(0, -1)}</button>
            </div>
        </div>
        <table class="styled-table">
            <thead>
                <tr>
                    ${columns.map(col => `<th>${col.toUpperCase()}</th>`).join('')}
                    <th>ACTIONS</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr>
                        ${columns.map(col => `<td>${row[col]}</td>`).join('')}
                            <td>
                                ${title === "Students" ? `<button class="btn-enroll" data-id="${row.id}">Enroll</button>` : ''}
                                
                                <button class="btn-edit" data-id="${row.id}">Edit</button>
                                <button class="btn-delete" data-id="${row.id}">Delete</button>
                            </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    appRoot.innerHTML = tableHTML;
    initTableSorting();
    initTableSearch();
}

// Build and display the edit form for an existing record
function renderEditForm(data, manager, type) {
    const appRoot = document.getElementById('app-root');
    
    // 1. Filter out keys we don't want to edit (like "id" or complex arrays)
    const fields = Object.keys(data).filter(key => key !== 'id' && key !== 'enrolledCourses' && key !== 'instructor');

    // 2. Build the Form HTML
    let formHTML = `
        <div class="form-container">
            <h2>Edit ${type.toUpperCase()} (ID: ${data.id})</h2>
            <form id="edit-form">
                ${fields.map(key => `
                    <div class="form-group">
                        <label>${key.toUpperCase()}</label>
                        <input name="${key}" 
                               value="${data[key]}" 
                               ${getInputAttributes(key)} 
                               required>
                    </div>
                `).join('')}
                
                <div class="form-actions">
                    <button type="submit" class="save-btn">💾 Save Changes</button>
                    <button type="button" class="cancel-btn">❌ Cancel</button>
                </div>
            </form>
        </div>
    `;

    appRoot.innerHTML = formHTML;

    // 3. Add Listeners for Save/Cancel
    
    // CANCEL: Just go back to the table
    document.querySelector('.cancel-btn').addEventListener('click', () => {
        document.getElementById(`btn-${type}s`).click(); 
    });

    // SAVE: Collect data and send PUT request
    document.getElementById('edit-form').addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const formData = new FormData(e.target);
        const updatedObject = {};
        
        formData.forEach((value, key) => {
            // Convert numbers if necessary (important for GPA/Credits)
            if (key === 'gpa' || key === 'credits') {
                 updatedObject[key] = Number(value);
            } else {
                 updatedObject[key] = value;
            }
        });

        try {
            // Merge old data with new data
            const finalData = { ...data, ...updatedObject };
            
            await manager.edit(data.id, finalData);
            
            alert("Updated Successfully!");
            document.getElementById(`btn-${type}s`).click();
            
        } catch (error) {
            console.error(error);
            alert("Update Failed.");
        }
    });
}
// Build and display the form to add a new record
// UPGRADED: Now supports Dropdowns!
async function renderAddForm(type, manager) {
    const appRoot = document.getElementById('app-root');

    // 1. Get the list of fields
    const fields = schemas[type];

    // --- NEW STEP: PRE-FETCH DATA FOR DROPDOWNS ---
    let instructorOptions = "";

    // If we are adding a COURSE, we need the list of Instructors first
    if (type === 'course') {
        const instManager = new Instructor();
        try {
            const instructors = await instManager.get(); 
            instructorOptions = instructors.map(inst =>
                `<option value="${inst.id}">${inst.name}</option>`
            ).join('');
        } catch (err) {
            console.error("Could not load instructors", err);
        }
    }

    // --- STEP 2: BUILD HTML ---
    let formHTML = `
        <div class="form-container">
            <h2>Add New ${type.toUpperCase()}</h2>
            <form id="add-form">
                ${fields.map(key => {

            // SPECIAL CASE: Dropdown for Instructor ID
            if (key === 'instructorId') {
                return `
                <div class="form-group">
                    <label>INSTRUCTOR</label>
                    <select name="instructorId" required>
                        <option value="" disabled selected>Select an Instructor</option>
                        ${instructorOptions} 
                    </select>
                </div>`;
            }

            // NORMAL CASE: Validation Integrated Here!
            // We replaced the old manual type="..." with ${getInputAttributes(key)}
            return `
            <div class="form-group">
                <label>${key.toUpperCase()}</label>
                <input name="${key}" 
                       ${getInputAttributes(key)} 
                       placeholder="Enter ${key}" 
                       required>
            </div>
            `;
        }).join('')}
                
                <div class="form-actions">
                    <button type="submit" class="save-btn">✅ Create</button>
                    <button type="button" class="cancel-btn">❌ Cancel</button>
                </div>
            </form>
        </div>
    `;

    appRoot.innerHTML = formHTML;

    // --- STEP 3: LISTENERS ---

    // Cancel Button
    document.querySelector('.cancel-btn').addEventListener('click', () => {
        document.getElementById(`btn-${type}s`).click();
    });

    // Submit Button
    document.getElementById('add-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const newObject = {};

        formData.forEach((value, key) => {
            // Convert numbers
            if (key === 'gpa' || key === 'credits') {
                newObject[key] = Number(value);
            } else {
                newObject[key] = value;
            }
        });

        // Initialize empty arrays for Students
        if (type === 'student') {
            newObject.enrolledCourses = [];
        }

        try {
            await manager.post(newObject);
            alert("Created Successfully!");
            document.getElementById(`btn-${type}s`).click();
        } catch (error) {
            console.error(error);
            alert("Failed to create record.");
        }
    });
}
// Slice the current data and render the table for the current page
function renderPaginatedTable() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = currentData.slice(start, end);

    renderTable(paginatedData, currentTitle);
    renderClientPaginationControls();
}

// Generate and handle the pagination buttons
function renderClientPaginationControls() {
    const totalItems = currentData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const controls = document.createElement('div');
    controls.className = 'pagination-controls';
    controls.innerHTML = `
        <button id="btn-prev" ${currentPage === 1 ? 'disabled' : ''}>⬅️ Previous</button>
        <span class="page-info">Page ${currentPage} of ${totalPages}</span>
        <button id="btn-next" ${currentPage === totalPages ? 'disabled' : ''}>Next ➡️</button>
    `;

    appRoot.appendChild(controls);

    document.getElementById('btn-prev').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPaginatedTable();
        }
    });

    document.getElementById('btn-next').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPaginatedTable();
        }
    });
}

// Global click handler for Delete, Edit, and Add buttons
appRoot.addEventListener('click', async (e) => {
    const id = e.target.getAttribute('data-id');
    const pageHeader = document.querySelector('.content-header h2');
    if (!pageHeader && !e.target.classList.contains('btn-add')) return;

    const pageTitle = pageHeader ? pageHeader.innerText : "";
    let manager = null;
    let type = "";

    if (pageTitle.toLowerCase().includes("student")) { manager = new Student(); type = "student"; }
    else if (pageTitle.toLowerCase().includes("course")) { manager = new Course(); type = "course"; }
    else if (pageTitle.toLowerCase().includes("instructor")) { manager = new Instructor(); type = "instructor"; }
    else if (pageTitle.toLowerCase().includes("employee")) { manager = new Employee(); type = "employee"; }

    if (e.target.classList.contains('btn-delete') && manager) {
        if (!confirm(`Are you sure you want to delete ID: ${id}?`)) return;
        try {
            await manager.delete(id);
            e.target.closest('tr').remove();
            alert("Deleted successfully!");
        } catch (error) { console.error(error); }
    }

    if (e.target.classList.contains('btn-edit') && manager) {
        try {
            const response = await fetch(`${manager.Link}/${id}`);
            const data = await response.json();
            renderEditForm(data, manager, type);
        } catch (error) { console.error(error); }
    }

    if (e.target.classList.contains('btn-add') && manager) {
        renderAddForm(type, manager);
    }
    if (e.target.classList.contains('btn-enroll')) {
        const id = e.target.getAttribute('data-id');
        renderEnrollmentModal(id);
    }
});

// Sidebar navigation event listeners
document.getElementById("btn-students").addEventListener('click', async () => {
    currentPage = 1; currentTitle = "Students";
    try {
        currentData = await new Student().getStudentsWithCourseNames();
        renderPaginatedTable();
    } catch (error) { console.error(error); }
});

document.getElementById("btn-courses").addEventListener('click', async () => {
    currentPage = 1; currentTitle = "Courses";
    try {
        currentData = await new Course().get();
        renderPaginatedTable();
    } catch (error) { console.error(error); }
});

document.getElementById("btn-instructors").addEventListener('click', async () => {
    currentPage = 1; currentTitle = "Instructors";
    try {
        currentData = await new Instructor().get();
        renderPaginatedTable();
    } catch (error) { console.error(error); }
});

document.getElementById("btn-employees").addEventListener('click', async () => {
    currentPage = 1; currentTitle = "Employees";
    try {
        currentData = await new Employee().get();
        renderPaginatedTable();
    } catch (error) { console.error(error); }
});

document.getElementById("btn-home").addEventListener('click', () => {
    renderDashboard(); 
});
  renderDashboard(); 
//enrollment logic
async function renderEnrollmentModal(studentId) {
    const appRoot = document.getElementById('app-root');
    const studentManager = new Student();
    const courseManager = new Course();

    try {
        // 1. Fetch Data in Parallel (Faster)
        const [student, courses] = await Promise.all([
            // We fetch the raw student object (no joined names) to get the IDs
            fetch(`http://localhost:3000/students/${studentId}`).then(res => res.json()),
            courseManager.get()
        ]);

        // 2. Build the Modal HTML
        // We check if the student's current array includes the course ID
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <h3>Manage Courses for ${student.name}</h3>
                    <p>Select courses to enroll:</p>
                    
                    <form id="enroll-form">
                        <div class="checkbox-list">
                            ${courses.map(course => `
                                <label class="checkbox-item">
                                    <input type="checkbox" 
                                           name="courseIds" 
                                           value="${course.id}"
                                           ${student.enrolledCourses && student.enrolledCourses.includes(course.id) ? 'checked' : ''}>
                                    <span>${course.name} (${course.credits} Credits)</span>
                                </label>
                            `).join('')}
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="save-btn">Save Enrollments</button>
                            <button type="button" class="cancel-btn close-modal">Close</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // 3. Append Modal to the screen (Don't overwrite the table)
        // We create a temporary div to hold the modal
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);

        // --- LISTENERS ---

        // Close Modal
        const closeModal = () => modalContainer.remove();
        modalContainer.querySelector('.close-modal').addEventListener('click', closeModal);

        // Save Form
        modalContainer.querySelector('#enroll-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            // Harvest Checkbox Data
            // Get all checkboxes that are checked ✅
            const checkboxes = modalContainer.querySelectorAll('input[name="courseIds"]:checked');
            const selectedCourseIds = Array.from(checkboxes).map(cb => cb.value);

            try {
                // Update the student with the new array
                // We merge using spread syntax to keep name, email, etc. safe
                const updatedStudent = { ...student, enrolledCourses: selectedCourseIds };
                
                await studentManager.edit(studentId, updatedStudent);
                
                alert("Enrollment Updated!");
                closeModal();
                
                // Refresh the Students Table to show changes
                document.getElementById('btn-students').click();
                
            } catch (error) {
                console.error(error);
                alert("Failed to enroll.");
            }
        });

    } catch (error) {
        console.error(error);
        alert("Error loading enrollment data.");
    }
}

//Helper:return html attributes
function getInputAttributes(key) {
    if (key === 'email') {
        return 'type="email"'; // Browser checks for @ symbol
    } 
    else if (key === 'gpa') {
        return 'type="number" min="0" max="4" step="0.01"'; // Enforce 0.00 to 4.00
    } 
    else if (key === 'credits') {
        return 'type="number" min="1" max="4"'; // Credits usually 1-4
    } 
    else if (key === 'phone') {
        return 'type="tel" pattern="[0-9]{11}" title="Must be 11 digits"'; // Enforce 11 Numbers
    }
    return 'type="text"'; // Default
}

//render dashboard
async function renderDashboard() {
    const appRoot = document.getElementById('app-root');
    
    // Show a temporary loading text while we count
    appRoot.innerHTML = '<div class="loading-spinner">📊 Gathering Insights...</div>';

    try {
        // 1. Instantiate Managers
        const sManager = new Student();
        const cManager = new Course();
        const iManager = new Instructor();
        const eManager = new Employee();

        // 2. Fetch ALL data in parallel (Faster than waiting one by one)
        const [students, courses, instructors, employees] = await Promise.all([
            sManager.get(),
            cManager.get(),
            iManager.get(),
            eManager.get()
        ]);

        // 3. Build the Dashboard HTML
        const html = `
            <div class="dashboard-header">
                <h2>System Dashboard</h2>
                <p>Overview of current university status</p>
            </div>

            <div class="stats-container">
                <div class="stat-card student-card" onclick="document.getElementById('btn-students').click()">
                    <div class="icon">🎓</div>
                    <div class="info">
                        <h3>${students.length}</h3>
                        <p>Total Students</p>
                    </div>
                </div>

                <div class="stat-card course-card" onclick="document.getElementById('btn-courses').click()">
                    <div class="icon">📚</div>
                    <div class="info">
                        <h3>${courses.length}</h3>
                        <p>Active Courses</p>
                    </div>
                </div>

                <div class="stat-card instructor-card" onclick="document.getElementById('btn-instructors').click()">
                    <div class="icon">👨‍🏫</div>
                    <div class="info">
                        <h3>${instructors.length}</h3>
                        <p>Instructors</p>
                    </div>
                </div>

                <div class="stat-card employee-card" onclick="document.getElementById('btn-employees').click()">
                    <div class="icon">💼</div>
                    <div class="info">
                        <h3>${employees.length}</h3>
                        <p>Employees</p>
                    </div>
                </div>
            </div>

            <div class="quick-actions">
                <h3> Quick Actions</h3>
                <div class="action-buttons">
                    <button onclick="document.getElementById('btn-students').click(); setTimeout(() => document.querySelector('.btn-add').click(), 500)">+ Add Student</button>
                    <button onclick="document.getElementById('btn-courses').click(); setTimeout(() => document.querySelector('.btn-add').click(), 500)">+ Add Course</button>
                </div>
            </div>
        `;

        appRoot.innerHTML = html;

    } catch (error) {
        console.error("Dashboard Error:", error);
        appRoot.innerHTML = '<div class="error">Failed to load Dashboard insights.</div>';
    }
}



renderDashboard();