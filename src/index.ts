import inquirer from 'inquirer';
import { pool, connectToDb } from './connection.js';

await connectToDb();

async function mainMenu(){
    const questions = [
    {
        type: 'list',
        name: 'options',
        message: 'Choose from the following',
        choices: ['View all departments','View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role','Quit']
    },
];
inquirer.prompt(questions).then((async anwsers => {
    if (anwsers.options === 'View all departments'){
        await viewDepartments();
        await mainMenu();
    }
    if(anwsers.options === 'View all roles'){
        await viewRoles();
        await mainMenu();
    };

    if(anwsers.options === 'View all employees'){
        await viewEmployees();
        await mainMenu();
    };
    if (anwsers.options === 'Add a department'){
        await addDepartment();
    };
    if (anwsers.options === 'Add a role'){
        await addRole();
    };

    if (anwsers.options === 'Add an employee'){
        await addEmployee();
    };

    if (anwsers.options === 'Update an employee role'){
        await updateEmployee();
    };
    if(anwsers.options === 'Quit'){
        process.exit(0);
    };
}));
};

async function viewDepartments() {
    const result = await pool.query("SELECT * FROM department");
    console.table(result.rows);
 };

async function viewRoles() {
   const result = await pool.query("SELECT * FROM role");
   console.table(result.rows);
};

async function viewEmployees() {
    const result = await pool.query("SELECT * FROM employee");
    console.table(result.rows);
};

function addDepartment(){
    const questions = [
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of the department?'
        }
    ];
    inquirer.prompt(questions).then(async answers => {
        try{
            await pool.query(`INSERT INTO department(name)
                VALUES ($1)`, [answers.name]);
                console.log(`Added ${answers.name} to departments`);
        }

        catch(err){
            console.error(`Could not add ${answers.name} to departments:`,err);
        };
        
        await mainMenu();  

      });
};

async function addRole(){

    const departments = await pool.query('SELECT id, name FROM department');
    const departmentChoices = departments.rows.map(dep => ({ name: dep.name, value: dep.id }));

    const questions = [
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of the role?'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'What is the salary of the role?'
        },
        {
            type: 'list',
            name: 'department',
            message: 'What department does this role belong to?',
            choices: departmentChoices
        }
    ];
    inquirer.prompt(questions).then(async answers => {
        try{
            await pool.query(`INSERT INTO role(title, salary, department_id)
                VALUES ($1, $2, $3)`, [answers.name, answers.salary, answers.department]);
                console.log(`Added ${answers.name} to roles`);
        }

        catch(err){
            console.log(`Could not add ${answers.name} to role:`, err)
        };

        await mainMenu(); 

      });
};

async function updateEmployee(){

    const roles = await pool.query('SELECT id, title FROM role');
    const roleChoices = roles.rows.map(role => ({ name: role.title, value: role.id }));

    const employee = await pool.query('SELECT id, first_name, last_name FROM employee');
    const employeeChoices = employee.rows.map(emm => ({ name: emm.first_name + emm.last_name, value: emm.id }));

    const managers = await pool.query('SELECT id, first_name, last_name FROM employee');
    const managerChoices = managers.rows.map(manager => ({ name: `${manager.first_name} ${manager.last_name}`, value: manager.id }));

    managerChoices.push({ name: 'None', value: null });

    const questions = [
        {
            type: 'list',
            name: 'employee',
            message: 'Which employee would you like to update?',
            choices: employeeChoices
        },
        {
            type: 'list',
            name: 'newRole',
            message: `What is the employee's new role?`,
            choices: roleChoices
        },
        {
            type: 'list',
            name: 'newManager',
            message: `Who is the employee's new manager?`,
            choices: managerChoices
        }
    ];
    inquirer.prompt(questions).then(async answers => {
        try {
            await pool.query(`
                UPDATE employee
                SET role_id = $1, manager_id = $2
                WHERE id = $3`,
                [answers.newRole, answers.newManager, answers.employee])
            console.log(`Updated employee`);
        }

        catch (err){
            console.error(`Error updating employee:`, err);
        }
        
        await mainMenu();

      });
};

async function addEmployee(){

    const roles = await pool.query('SELECT id, title FROM role');
    const roleChoices = roles.rows.map(role => ({ name: role.title, value: role.id }));

    const employee = await pool.query('SELECT id, first_name, last_name FROM employee');
    const employeeChoices = employee.rows.map(emm => ({ name: emm.first_name + emm.last_name, value: emm.id }));

    employeeChoices.push({ name: 'None', value: null });

    const questions = [
        {
            type: 'input',
            name: 'firstName',
            message: `What is employee's first name?`
        },
        {
            type: 'input',
            name: 'lastName',
            message:`What is employee's first name?`
        },
        {
            type: 'list',
            name: 'role',
            message:`What is employee's role?`,
            choices: roleChoices
        },
        {
            type: 'list',
            name: 'manager',
            message: `Who is employee's manager?`,
            choices: employeeChoices
        },
    ];
    inquirer.prompt(questions).then(async answers => {
        try {
            await pool.query(`
                INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES ($1, $2, $3, $4)`,
                [answers.firstName, answers.lastName, answers.role, answers.manager])
                console.log(`Added ${answers.firstName} ${answers.lastName} to employees`);
        }

        catch (err){
            console.error(`Error adding employee: ${answers.firstName} ${answers.lastName}`, err);
        };
        
        await mainMenu();

      });
};

mainMenu();
