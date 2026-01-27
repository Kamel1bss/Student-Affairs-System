import { Api } from "./Api.js";
import { Course } from './course.js';
export class Student extends Api {
     constructor() {
          super("students");
     }
     async getStudentsWithCourseNames() {
          const students = await this.get();
          const courseApi = new Api("courses");
          const allCourses = await courseApi.get();
          const studentsWithNames = students.map(student => {
               if (student.enrolledCourses && student.enrolledCourses.length > 0) {

                    const courseNames = student.enrolledCourses.map(courseId => {
                         const matchingCourse = allCourses.find(c => c.id === courseId);
                         return matchingCourse ? matchingCourse.name : courseId;
                    });

                    return {
                         ...student,
                         enrolledCourses: courseNames.join(", ") // "Advanced JS, Database Systems"
                    };
               }

               return student;
          });

          return studentsWithNames;
     }
}
