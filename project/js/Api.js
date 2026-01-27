class Api {
    constructor(_Entity) {

        this.Link = `http://localhost:3000/${_Entity}`;
    }

    async get() {
        try {
            let response = await fetch(this.Link);
            if (!response.ok) {
                throw new Error(`Failed to GET from ${this.Link} (Status: ${response.status})`);
            }
            let getresponse = await response.json();
            return getresponse;
        } catch (error) {
            console.error("API GET ERROR:", error);
            throw error;
        }
    }

    async post(_myobject) {
        try {
            let response = await fetch(this.Link, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(_myobject)
            });
            if (!response.ok) {
                throw new Error(`Failed to POST to ${this.Link} (Status: ${response.status})`);
            }
            let getresponse = await response.json();
            return getresponse;
        } catch (error) {
            console.error("API POST ERROR:", error);
            throw error;
        }
    }

    async edit(id, _myobject) {
        try {
            let response = await fetch(`${this.Link}/${id}`, {
                method: "PUT",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(_myobject)
            });
            if (!response.ok) {
                throw new Error(`Failed to EDIT id: ${id} (Status: ${response.status})`);
            }
            let getresponse = await response.json();
            return getresponse;
        } catch (error) {
            console.error("API EDIT ERROR:", error);
            throw error;
        }
    }

    async delete(id) {
        try {
            let response = await fetch(`${this.Link}/${id}`, {
                method: "DELETE"
            });
            if (!response.ok) {
                throw new Error(`Failed to DELETE id: ${id} (Status: ${response.status})`);
            }
            let getresponse = await response.json();
            return getresponse;
        } catch (error) {
            console.error("API DELETE ERROR:", error);
            throw error;
        }
    }
}
export {Api};