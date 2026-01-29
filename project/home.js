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


//render
function renderTable(data, title) {
    const appRoot = document.getElementById('app-root');
    if(title==="home"){
        appRoot.innerHTML=`<div class="welcome-banner">
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
            <button class="btn-add">+ Add New ${title.slice(0, -1)}</button> </div>
        
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

    appRoot.innerHTML = tableHTML;
    initTableSorting();
}

let studentbtn = document.getElementById("btn-students");
let coursesbtn = document.getElementById("btn-courses");
let instructorsbtn = document.getElementById("btn-instructors");
let employeesbtn = document.getElementById("btn-employees");
let homebtn=document.getElementById("btn-home");
studentbtn.addEventListener('click', async () => {
try {
        let student = new Student();
        let response = await student.getStudentsWithCourseNames();
        renderTable(response, "Students");
    } catch (error) {
        console.error(error);
        appRoot.innerHTML = '<div class="error">Failed to load data. Is the server running?</div>';
    }
});


coursesbtn.addEventListener('click', async () => {
try {
        let course = new Course();
        let response=await course.get();
        renderTable(response, "Courses");
    } catch (error) {
        console.error(error);
        appRoot.innerHTML = '<div class="error">Failed to load data. Is the server running?</div>';
    }
});

instructorsbtn.addEventListener('click', async () => {
try {
        let instructor = new Instructor();
        let response = await instructor.get()
        renderTable(response, "instructors");
    } catch (error) {
        console.error(error);
        appRoot.innerHTML = '<div class="error">Failed to load data. Is the server running?</div>';
    }
});

employeesbtn.addEventListener('click', async () => {
try {
        let employee = new Employee();
        let response = await employee.get()
        renderTable(response, "employees");
    } catch (error) {
        console.error(error);
        appRoot.innerHTML = '<div class="error">Failed to load data. Is the server running?</div>';
    }
});

homebtn.addEventListener('click',()=>{
    renderTable(0,"home");
})
