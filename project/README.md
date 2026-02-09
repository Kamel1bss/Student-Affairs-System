# JSON Server Setup

This project uses JSON Server to simulate a RESTful API during development.

## Requirements

Before running the project, ensure the following are installed:

Node.js (v16 or later recommended)

npm (included with Node.js)

Verify installation:
```
node -v
npm -v
```
## Installation
Install json-server as a project dependency:
```
npm install json-server
```
## Configuration
Create a db.json file in the project root directory:
```
{
  "Students": [],
  "Courses" : [],
  "Instructors": [],
  "Employee" :[]
}
```

## Running the Server

Start the JSON Server using the following command:

```
npx json-server --watch db.json --port 3000
```

The server will be available at:
```
http://localhost:3000
```

### Available Endpoints (Example)

<ul>
<li>GET /students</li>
<li>POST /students</li>
<li>PUT /students/:id</li>
<li>DELETE /students/:id</li>
</ul>