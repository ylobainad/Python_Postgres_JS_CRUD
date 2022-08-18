
//###### GLOBAL VARIABLES ######
const userForm = document.querySelector('#userForm');

let users = [];
let editing = false;
let userId = null;

//#########################################################################################################################################

//***********************************************************************************************************
// Para que me muestre todos los datos de los usuarios una vez que este acceda a la página
window.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('/api/users')

    const data = await response.json()

    // Para poder tener acceso a estos datos de forma global. Con reverse hago que se muestren al principio los nuevos usuarios
    users = data.reverse()
    renderUser(users)
});

//***********************************************************************************************************
userForm.addEventListener('submit', async e => {
    //Desactiva el comportamiento por defecto del evento, esto me permite ver el evento cuando lo imprimo en consola
    e.preventDefault()
    const username = userForm['username'].value
    const email = userForm['email'].value
    const password = userForm['password'].value

    if (!editing) {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        });
        const data = await response.json();

        users.unshift(data);
    }
    else {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        })

        const updatedUser = await response.json();
        //Si el user.id es igual al updatedUser.id, entonces reemplázalo por el updatedUser sino lo reemplazas con los mismo datos de user que tenía
        // Esta sixtaxis se conoce como operador ternario y actúa similar a una condicional 
        users = users.map(user => user.id === updatedUser.id ? updatedUser : user)
        editing = false;
        userId = null;
    }
    renderUser(users)
    userForm.reset()
});
//***********************************************************************************************************

function renderUser(users) {
    const userList = document.querySelector('#userList')
    //Esto limpia el userList para nuevamente recolocoar todos los elementos
    userList.innerHTML = ''

    users.forEach(user => {
        const userItem = document.createElement('li')
        userItem.classList = 'list-group-item list-group-item-dark my-2'
        userItem.innerHTML = `
            <header class = 'd-flex justify-content-between align-items-center'>
                <h3>${user.username}</h3>
                <div>
                    <button class = 'btn-delete btn btn-danger btn-sm'>delete</button>
                    <button class = 'btn-edit btn btn-secondary btn-sm'>edit</button>
                </div>
            </header>
            <p>${user.email}</p>
            <p class='text-truncate'>${user.password}</p>
        `

        //*************************************************************************************************************
        btn_delete = userItem.querySelector('.btn-delete');
        //*************************************************************************************************************
        btn_delete.addEventListener('click', async e => {

            const response = await fetch(`/api/users/${user.id}`, {
                method: 'DELETE',
            })
            const data = await response.json()
            users = users.filter(user => user.id !== data.id);
            renderUser(users);
        })

        //*************************************************************************************************************
        btn_edit = userItem.querySelector('.btn-edit');
        //*************************************************************************************************************
        btn_edit.addEventListener('click', async e => {

            const response = await fetch(`/api/users/${user.id}`);
            data = await response.json();

            userForm['username'].value = data.username;
            userForm['email'].value = data.email;

            editing = true;
            userId = user.id
        });
        //*************************************************************************************************************
        userList.append(userItem);
    })
}

