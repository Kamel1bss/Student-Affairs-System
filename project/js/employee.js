import { Api } from "./Api.js";

export class Employee extends Api {
    constructor() {
        super("employees");
    }
}