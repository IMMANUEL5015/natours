import '@babel/polyfill';
import { login, logout } from './login';
import { forgotPassword } from './forgotPassword';
import { resetPassword } from './resetPassword';
import { signup } from './signup';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { deleteTour } from './deleteTour';
import { deleteUser } from './deleteUser';

//Display tour locations on map for only the tour details page
const mapBox = document.getElementById('map');
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

//Login user on only the login page
const loginForm = document.querySelector('.form--login');
if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

//Logout user whenever the logout button is clicked
const logoutBtn = document.querySelector('.nav__el--logout');
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

//Signup user on only the signup page
const signupForm = document.querySelector('.form--signup');
if (signupForm) {
    signupForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        signup(email, name, password, passwordConfirm);
    });
}

//Update the data of a logged in user
const updateDataForm = document.querySelector('.form-user-data');
if (updateDataForm) {
    updateDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.querySelector('.email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        updateSettings(form, 'Data');
    });
}

//Update the password of a logged in user
const updateUserPassword = document.querySelector('.form-user-password');
if (updateUserPassword) {
    updateUserPassword.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.querySelector('.btn-save-password').textContent = 'Updating...';

        const currentPassword = document.getElementById('password-current').value;
        const newPassword = document.getElementById('password').value;
        const confirmNewPassword = document.getElementById('password-confirm').value;

        await updateSettings({ currentPassword, newPassword, confirmNewPassword }, 'Password');
        document.querySelector('.btn-save-password').textContent = 'Save Password';

        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
}


//Book Tour
const bookTourBtn = document.getElementById('book-tour');
if (bookTourBtn) {
    bookTourBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...';
        //using object destructuring
        const { tourId } = e.target.dataset;
        bookTour(tourId);
    });
}

//Toggle navbar on small screens
const toggler = document.getElementById('nav__items--toggle');
if (toggler) {
    let headerIsVisible = false;
    toggler.addEventListener('click', e => {
        //If header is invisible on toggle, make it visible
        if (!headerIsVisible) {
            document.getElementById('invisible--header').style.display = 'block';
            headerIsVisible = true;
        }
        else {
            //If header is visible on toggle, make it invisible
            document.getElementById('invisible--header').style.display = 'none';
            headerIsVisible = false;
        }
    });
}

//Logout user whenever the logout button is clicked on smaller screens
const logoutButton = document.querySelector('#logout');
if (logoutButton) {
    logoutButton.addEventListener('click', logout);
}

//Send reset password link to the email address of a user who has forgotten their password
const forgotPasswordForm = document.querySelector('.form--forgot-password');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.querySelector('.btn--forgot-password').textContent = 'Please wait...';
        const email = document.getElementById('email').value;
        await forgotPassword(email);
        document.querySelector('.btn--forgot-password').textContent = 'Submit';
        document.getElementById('email').value = '';
    });
}

//Reset User Password
const resetPasswordForm = document.querySelector('.form--reset-password');
if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { resetToken } = document.querySelector('.btn--reset-password').dataset;
        document.querySelector('.btn--reset-password').textContent = 'Please wait...';
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        await resetPassword(password, passwordConfirm, resetToken);

        document.querySelector('.btn--reset-password').textContent = 'Reset';
        document.getElementById('password').value = '';
        document.getElementById('passwordConfirm').value = '';
    });
}

//Delete a tour
const deleteTourBtn = document.getElementById('deleteTour');
if (deleteTourBtn) {
    deleteTourBtn.addEventListener('click', async (e) => {
        deleteTourBtn.textContent = 'Processing...';
        //using object destructuring
        const { tourId } = e.target.dataset;
        await deleteTour(tourId);
        deleteTourBtn.textContent = 'DELETE TOUR';
    });
}

//Delete a specific user
const deleteUserBtn = document.getElementById('deleteUser');
if (deleteUserBtn) {
    deleteUserBtn.addEventListener('click', async (e) => {
        deleteUserBtn.textContent = 'Processing...';
        //using object destructuring
        const { userId } = e.target.dataset;
        await deleteUser(userId);
        deleteUserBtn.textContent = 'DELETE USER';
    });
}