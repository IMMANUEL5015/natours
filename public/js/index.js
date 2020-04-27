import '@babel/polyfill';
import { login, logout, forgotPassword, resetPassword, signup, updateSettings, deleteUser } from './user';
import { bookTour, displayMap, deleteTour } from './tour';
import { createReview, updateReview, deleteReview } from './review';
import { addToFavorites, removeFromFavorites } from './favorites';
import { showAlert } from './alerts';
import { createNewBooking } from './booking';

//Tours

//Display tour locations on map for only the tour details page
const mapBox = document.getElementById('map');
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
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

//Users

//Login user on only the login page
const loginForm = document.querySelector('.form--login');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.getElementById('login').textContent = 'Logging in...';
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        await login(email, password);
        document.getElementById('login').textContent = 'Login';
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
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.getElementById('signup').textContent = 'Signing up...';
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        await signup(email, name, password, passwordConfirm);
        document.getElementById('signup').textContent = 'Register';
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

//Reviews

//Create Review
const createReviewForm = document.querySelector('.form--review');
if (createReviewForm) {
    createReviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.getElementById('create-review-button').textContent = 'Creating Review...';
        const review = document.getElementById('review').value;
        const rating = document.getElementById('rating').value;

        const submitLink = document.getElementById('create-review-button').dataset.submitLink;
        const submitLinkArr = submitLink.split(',');
        const tour = submitLinkArr[0];
        const slug = submitLinkArr[1];

        await createReview(review, rating, tour, slug);
        document.getElementById('create-review-button').textContent = 'SUBMIT';
    });
}

//Update Review
const updateReviewForm = document.querySelector('.form--review-update');
if (updateReviewForm) {
    updateReviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.getElementById('update-review-button').textContent = 'Updating...';
        const review = document.getElementById('review').value;
        const rating = document.getElementById('rating').value;

        const updateLink = document.getElementById('update-review-button').dataset.updateLink;
        const updateLinkArr = updateLink.split(',');
        const tour = updateLinkArr[0];
        const reviewId = updateLinkArr[1];
        const slug = updateLinkArr[2];

        await updateReview(review, rating, tour, reviewId, slug);
        document.getElementById('update-review-button').textContent = 'UPDATE';
    });
}

//Delete Review
const deleteReviewBtn = document.querySelector('#delete-review');
if (deleteReviewBtn) {
    deleteReviewBtn.addEventListener('click', async (e) => {
        deleteReviewBtn.textContent = 'Deleting...';

        const deleteLink = deleteReviewBtn.dataset.deleteLink;
        const deleteLinkArr = deleteLink.split(',');
        const tour = deleteLinkArr[0];
        const reviewId = deleteLinkArr[1];
        const slug = deleteLinkArr[2];

        await deleteReview(tour, reviewId, slug);
        deleteReviewBtn.textContent = 'DELETE';
    });
}

//Favorites

//Add to favorites
const likeTourBtn = document.getElementById('likeTour');
if (likeTourBtn) {
    likeTourBtn.addEventListener('click', async (e) => {
        likeTourBtn.textContent = 'Adding To Favorites...';
        const { tourId } = likeTourBtn.dataset;
        await addToFavorites(tourId);
        likeTourBtn.textContent = 'Add To Favorites';
    });
}

//Remove from favorites
const dislikeTourBtn = document.getElementById('dislikeTour');
if (dislikeTourBtn) {
    dislikeTourBtn.addEventListener('click', async (e) => {
        dislikeTourBtn.textContent = 'Removing from favorites...';
        const { tourId } = dislikeTourBtn.dataset;
        await removeFromFavorites(tourId);
        dislikeTourBtn.textContent = 'Remove From Favorites';
    });
}

//Display Alert Message
const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);

//Create A New Booking
const createNewBookingForm = document.querySelector('.form--create-new-booking');
if (createNewBookingForm) {
    createNewBookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.getElementById('createBookingNow').textContent = 'Processing...';
        const tour = document.getElementById('name').value;
        const user = document.getElementById('email').value;
        const price = document.getElementById('price').value;
        await createNewBooking(tour, user, price);
        document.getElementById('createBookingNow').textContent = 'Create Booking';
    });
}