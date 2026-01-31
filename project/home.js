import { Api } from "./js/Api.js";
import { Student } from './js/student.js';
import { Course } from './js/course.js';
import { Instructor } from './js/instructor.js';
import { Employee } from "./js/employee.js";

let user = sessionStorage.getItem("loggedInUser");
if (!user) {
    window.location.href = "index.html";
}

let replaceuser = document.getElementById("user-name");
user = JSON.parse(user);
replaceuser.innerText = user["name"]
//logout
let logout=document.getElementById("logoutBtn");
logout.addEventListener('click',()=>{
    sessionStorage.clear();
    window.location.href="index.html";
})


// sorting
// Table Sorting Functionality
function initTableSorting() {
    const table = document.querySelector('.styled-table'); // table
    if (!table) return;

    const headers = table.querySelectorAll('thead th:not(:last-child)'); // Exclude ACTIONS column
    let currentSortColumn = null;
    let currentSortOrder = null;

    headers.forEach((header, columnIndex) => {
        header.addEventListener('click', () => {
            // Determine sort order
            if (currentSortColumn === columnIndex) {
                // Toggle between asc, desc, and no sort
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

            // Remove all sort classes from headers
            headers.forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
            });

            // Add appropriate class to current header
            if (currentSortOrder === 'asc') {
                header.classList.add('sort-asc');
            } else if (currentSortOrder === 'desc') {
                header.classList.add('sort-desc');
            }

            // Sort the table
            sortTable(table, columnIndex, currentSortOrder);
        });
    });
}

function sortTable(table, columnIndex, order) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    if (!order) {
        // Reset to original order - you might want to store original order
        return;
    }

    rows.sort((a, b) => {
        const aText = a.cells[columnIndex].textContent.trim();
        const bText = b.cells[columnIndex].textContent.trim();

        // Try to parse as numbers
        const aNum = parseFloat(aText);
        const bNum = parseFloat(bText);

        let comparison = 0;

        // If both are valid numbers, compare numerically
        if (!isNaN(aNum) && !isNaN(bNum)) {
            comparison = aNum - bNum;
        } else {
            // Otherwise compare as strings (case-insensitive)
            comparison = aText.localeCompare(bText, undefined, { numeric: true, sensitivity: 'base' });
        }

        return order === 'asc' ? comparison : -comparison;
    });

    // Re-append rows in sorted order
    rows.forEach(row => tbody.appendChild(row));
}

//searching
// Search Functionality
function initTableSearch() {
    const searchInput = document.getElementById('table-search');
    const table = document.querySelector('.styled-table');
    
    // Safety check: if no input or table, stop
    if (!searchInput || !table) return;

    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    searchInput.addEventListener('keyup', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        rows.forEach(row => {
            // 1. Get text from all columns EXCEPT the last one (Actions)
            const cells = Array.from(row.querySelectorAll('td:not(:last-child)'));
            const rowText = cells.map(td => td.textContent).join(' ').toLowerCase();

            // 2. Toggle visibility
            if (rowText.includes(searchTerm)) {
                row.style.display = ""; // Show
            } else {
                row.style.display = "none"; // Hide
            }
        });
    });
}
//render
function renderTable(data, title) {
    const appRoot = document.getElementById('app-root');
    
    if(title === "home"){
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

    // --- CHANGED SECTION START ---
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
                            <button class="btn-edit" data-id="${row.id}">Edit</button>
                            <button class="btn-delete" data-id="${row.id}">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    // --- CHANGED SECTION END ---

    appRoot.innerHTML = tableHTML;
    
    // Initialize BOTH features now
    initTableSorting();
    initTableSearch(); // <--- Don't forget to call this!
}


let studentbtn = document.getElementById("btn-students");
let coursesbtn = document.getElementById("btn-courses");
let instructorsbtn = document.getElementById("btn-instructors");
let employeesbtn = document.getElementById("btn-employees");
let homebtn=document.getElementById("btn-home");
// studentbtn.addEventListener('click', async () => {
// try {
//         let student = new Student();
//         let response = await student.getStudentsWithCourseNames();
//         renderTable(response, "Students");
//     } catch (error) {
//         console.error(error);
//         appRoot.innerHTML = '<div class="error">Failed to load data. Is the server running?</div>';
//     }
// });


// coursesbtn.addEventListener('click', async () => {
// try {
//         let course = new Course();
//         let response=await course.get();
//         renderTable(response, "Courses");
//     } catch (error) {
//         console.error(error);
//         appRoot.innerHTML = '<div class="error">Failed to load data. Is the server running?</div>';
//     }
// });

// instructorsbtn.addEventListener('click', async () => {
// try {
//         let instructor = new Instructor();
//         let response = await instructor.get()
//         renderTable(response, "instructors");
//     } catch (error) {
//         console.error(error);
//         appRoot.innerHTML = '<div class="error">Failed to load data. Is the server running?</div>';
//     }
// });

// employeesbtn.addEventListener('click', async () => {
// try {
//         let employee = new Employee();
//         let response = await employee.get()
//         renderTable(response, "employees");
//     } catch (error) {
//         console.error(error);
//         appRoot.innerHTML = '<div class="error">Failed to load data. Is the server running?</div>';
//     }
// });

// homebtn.addEventListener('click',()=>{
//     renderTable(0,"home");
// })

//delete
// --- DELETE FUNCTIONALITY ---

const appRoot = document.getElementById('app-root');

appRoot.addEventListener('click', async (e) => {
    
    // 1. Check if the clicked element is a Delete Button
    if (e.target.classList.contains('btn-delete')) {
        
        // 2. Get the ID from the button
        const id = e.target.getAttribute('data-id');
        
        // 3. Find out which Page we are on by reading the <h2> title
        // Example: "Students List" -> We split it to get just "Students"
        const pageTitle = document.querySelector('.content-header h2').innerText;
        
        // 4. Confirm Action
        const confirmDelete = confirm(`Are you sure you want to delete ID: ${id} from ${pageTitle}?`);
        if (!confirmDelete) return;

        try {
            // 5. Decide which Class to use based on the Title
            let manager = null;

            if (pageTitle.toLowerCase().includes("student")) {
                manager = new Student();
            } 
            else if (pageTitle.toLowerCase().includes("course")) {
                manager = new Course();
            } 
            else if (pageTitle.toLowerCase().includes("instructor")) {
                manager = new Instructor();
            } 
            else if (pageTitle.toLowerCase().includes("employee")) {
                manager = new Employee();
            }

            // 6. Perform the Delete
            if (manager) {
               console.log(await manager.delete(id)) ;
                e.target.closest('tr').remove();
                alert("Deleted successfully!");
            }

        } catch (error) {
            console.error(error);
            alert("Error deleting record.");
        }
    }
});

//render edit
function renderEditForm(data, manager, type) {
    const appRoot = document.getElementById('app-root');
    
    // 1. Filter out keys we don't want to edit (like "id" or complex arrays)
    // For simplicity, we edit everything except ID.
    const fields = Object.keys(data).filter(key => key !== 'id' && key !== 'enrolledCourses' && key !== 'instructor');

    // 2. Build the Form HTML
    let formHTML = `
        <div class="form-container">
            <h2>Edit ${type.toUpperCase()} (ID: ${data.id})</h2>
            <form id="edit-form">
                ${fields.map(key => `
                    <div class="form-group">
                        <label>${key.toUpperCase()}</label>
                        <input type="text" name="${key}" value="${data[key]}" required>
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
        // Trigger the sidebar button click to reload the table
        document.getElementById(`btn-${type}s`).click(); 
    });

    // SAVE: Collect data and send PUT request
    document.getElementById('edit-form').addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop reload
        
        // Harvest the data from inputs
        const formData = new FormData(e.target);
        const updatedObject = {};
        
        // Convert FormData to JSON object
        formData.forEach((value, key) => {
            updatedObject[key] = value;
        });

        try {
            // Keep the old ID and arrays (like enrolledCourses) that were hidden
            // spread syntax merges old data with new data
            const finalData = { ...data, ...updatedObject };
            
            await manager.edit(data.id, finalData);
            
            alert("Updated Successfully!");
            // Go back to the list
            document.getElementById(`btn-${type}s`).click();
            
        } catch (error) {
            console.error(error);
            alert("Update Failed.");
        }
    });
}

//edit
// --- EDIT FUNCTIONALITY ---

appRoot.addEventListener('click', async (e) => {
    
    // 1. Check if the clicked element is an Edit Button
    if (e.target.classList.contains('btn-edit')) {
        
        const id = e.target.getAttribute('data-id');
        const pageTitle = document.querySelector('.content-header h2').innerText; // "Students List"

        // 2. Decide Context (Same as Delete)
        let manager = null;
        let type = "";

        if (pageTitle.toLowerCase().includes("student")) {
            manager = new Student();
            type = "student";
        } else if (pageTitle.toLowerCase().includes("course")) {
            manager = new Course();
            type = "course";
        } else if (pageTitle.toLowerCase().includes("instructor")) {
            manager = new Instructor();
            type = "instructor";
        } else if (pageTitle.toLowerCase().includes("employee")) {
            manager = new Employee();
            type = "employee";
        }
        

        if (manager) {
            // 3. We need to fetch the SINGLE item to fill the inputs
            try {
                const response = await fetch(`${manager.Link}/${id}`);
                const data = await response.json();
                
                renderEditForm(data, manager, type);
                
            } catch (error) {
                console.error(error);
                alert("Failed to load data for editing.");
            }
        }

    }
    
});

//add render
function renderAddForm(type, manager) {
    const appRoot = document.getElementById('app-root');
    
    // 1. Get the list of fields from our schema
    const fields = schemas[type]; 

    // 2. Build the Form HTML (Inputs are empty value="")
    let formHTML = `
        <div class="form-container">
            <h2>Add New ${type.toUpperCase()}</h2>
            <form id="add-form">
                ${fields.map(key => `
                    <div class="form-group">
                        <label>${key.toUpperCase()}</label>
                        <input type="${key === 'email' ? 'email' : 'text'}" 
                               name="${key}" 
                               placeholder="Enter ${key}" 
                               required>
                    </div>
                `).join('')}
                
                <div class="form-actions">
                    <button type="submit" class="save-btn">✅ Create</button>
                    <button type="button" class="cancel-btn">❌ Cancel</button>
                </div>
            </form>
        </div>
    `;

    appRoot.innerHTML = formHTML;

    // 3. CANCEL Listener
    document.querySelector('.cancel-btn').addEventListener('click', () => {
        // Go back to the list by simulating a click on the sidebar
        document.getElementById(`btn-${type}s`).click(); 
    });

    // 4. SUBMIT Listener (The Create Logic)
    document.getElementById('add-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Harvest data
        const formData = new FormData(e.target);
        const newObject = {};
        
        formData.forEach((value, key) => {
            // Convert numbers like GPA or Credits to real numbers, not strings
            if (key === 'gpa' || key === 'credits') {
                newObject[key] = Number(value);
            } else {
                newObject[key] = value;
            }
        });

        // Add empty enrolledCourses array if it's a student (Requirement)
        if (type === 'student') {
            newObject.enrolledCourses = [];
        }

        try {
            // CALL POST (Create)
            await manager.post(newObject);
            
            alert("Created Successfully!");
            document.getElementById(`btn-${type}s`).click(); // Go back to list
            
        } catch (error) {
            console.error(error);
            alert("Failed to create record.");
        }
    });
}
// Data Structure for Adding New Items
const schemas = {
    student: ["name", "email", "phone", "gpa", "enrollmentDate"],
    course: ["name", "credits", "instructorId"],
    instructor: ["name", "email", "phone", "department"],
    employee: ["name", "email", "password", "role"]
};


// --- ADD FUNCTIONALITY ---
// --- ADD FUNCTIONALITY --- (Event Listener)

appRoot.addEventListener('click', (e) => {
    // 1. Check if the clicked element is the "Add" button
    if (e.target.classList.contains('btn-add')) {
        
        // 2. Identify Context based on the Page Title
        // Example: "Students List" -> We need to create a Student
        const pageTitle = document.querySelector('.content-header h2').innerText; 
        
        let type = "";
        let manager = null;

        if (pageTitle.toLowerCase().includes("student")) {
            type = "student";
            manager = new Student();
        } else if (pageTitle.toLowerCase().includes("course")) {
            type = "course";
            manager = new Course();
        } else if (pageTitle.toLowerCase().includes("instructor")) {
            type = "instructor";
            manager = new Instructor();
        } else if (pageTitle.toLowerCase().includes("employee")) {
            type = "employee";
            manager = new Employee();
        }

        // 3. Render the Empty Form if we found a match
        if (type && manager) {
            renderAddForm(type, manager);
        }
    }
});
// --- CLIENT-SIDE PAGINATION STATE ---
let currentPage = 1;
const itemsPerPage = 5; 
let currentData = [];  // Stores ALL 100% of the data
let currentTitle = ""; // Stores "Students", "Courses", etc.


// --- SIDEBAR LISTENERS ---

studentbtn.addEventListener('click', async () => {
    currentPage = 1; 
    currentTitle = "Students"; // Remember we are in Students
    
    try {
        let student = new Student();
        // 1. Fetch EVERYTHING (No query params needed!)
        currentData = await student.getStudentsWithCourseNames(); 
        
        // 2. Pass it to our new Slicer Function
        renderPaginatedTable();
        
    } catch (error) { 
        console.error(error); 
        document.getElementById('app-root').innerHTML = '<div class="error">Failed to load data.</div>';
    }
});

coursesbtn.addEventListener('click', async () => {
    currentPage = 1;
    currentTitle = "Courses";
    
    try {
        let course = new Course();
        currentData = await course.get(); // Fetch All
        renderPaginatedTable();
    } catch (error) { console.error(error); }
});

instructorsbtn.addEventListener('click', async () => {
    currentPage = 1;
    currentTitle = "Instructors";
    
    try {
        let instructor = new Instructor();
        currentData = await instructor.get(); // Fetch All
        renderPaginatedTable();
    } catch (error) { console.error(error); }
});

employeesbtn.addEventListener('click', async () => {
    currentPage = 1;
    currentTitle = "Employees";
    
    try {
        let employee = new Employee();
        currentData = await employee.get(); // Fetch All
        renderPaginatedTable();
    } catch (error) { console.error(error); }
});

homebtn.addEventListener('click', () => {
    renderTable(0, "home");
});


// 1. The Logic Function: Cuts the data
function renderPaginatedTable() {
    // A. Calculate where to cut
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    // B. Slice the array (e.g., Get items 0 to 5)
    const paginatedData = currentData.slice(start, end);

    // C. Render the table with just those few items
    renderTable(paginatedData, currentTitle);

    // D. Draw the buttons
    renderClientPaginationControls();
}

// 2. The Buttons Function: Draws Next/Prev
function renderClientPaginationControls() {
    const appRoot = document.getElementById('app-root');
    const totalItems = currentData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Create buttons HTML
    const controls = document.createElement('div');
    controls.className = 'pagination-controls';
    controls.innerHTML = `
        <button id="btn-prev" ${currentPage === 1 ? 'disabled' : ''}>⬅️ Previous</button>
        <span class="page-info">Page ${currentPage} of ${totalPages}</span>
        <button id="btn-next" ${currentPage === totalPages ? 'disabled' : ''}>Next ➡️</button>
    `;

    appRoot.appendChild(controls);

    // --- BUTTON LISTENERS ---
    
    document.getElementById('btn-prev').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPaginatedTable(); // Re-slice the array
        }
    });

    document.getElementById('btn-next').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPaginatedTable(); // Re-slice the array
        }
    });
}


