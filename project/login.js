import { Api } from "./js/Api.js";
const userApi = new Api("employees");

document.getElementById("loginForm").addEventListener("submit", async function(e) { 
    e.preventDefault();
     const emailInput = document.getElementById("email").value;
    const passwordInput = document.getElementById("password").value;
    const errormsg = document.getElementById("errorMsg");

    try {
        const employees = await userApi.get();
        const user = employees.find(emp => emp.email === emailInput && emp.password === passwordInput&& emp.role === "admin");

        if (user) {
            errormsg.style.display = "none";
            sessionStorage.setItem("loggedInUser", JSON.stringify(user));
            window.location.href = "dashboard.html";
        } else {
            errormsg.textContent = "Invalid email or password.";
            errormsg.style.display = "block";
        }
    } catch (error) {
        console.error(error);
        errormsg.textContent = "Server Error. Is json-server running?";
        errormsg.style.display = "block";
    }
});