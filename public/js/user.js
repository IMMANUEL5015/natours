import { showAlert } from './alerts';

//1. Update User Settings
//The type of can either be password or normal data (name and email)
export const updateSettings = async (data, type) => {
    try {
        const url = type === 'Password'
            ? '/api/v1/users/updatePassword'
            : '/api/v1/users/me';
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });

        if (res.data.status === 'success') {
            showAlert('success', `${type} updated successfully!`);
            window.setTimeout(() => {
                location.reload(true);
            }, 2000);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

//2. Signup User
export const signup = async (email, name, password, passwordConfirm) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: {
                email,
                name,
                password,
                passwordConfirm
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Account created successfully! Please check your email inbox.');
            window.setTimeout(() => {
                location.assign('/');
            }, 2500)
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

//3. Reset User Password
export const resetPassword = async (password, passwordConfirm, resetToken) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `/api/v1/users/resetPassword/${resetToken}`,
            data: {
                password,
                passwordConfirm
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Reset password successful!');
            window.setTimeout(() => {
                location.assign('/');
            }, 6000)
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

//4. User Forgot Password
export const forgotPassword = async (email) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/forgotPassword',
            data: {
                email
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Your password reset link has been sent to your email address.');
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

//5. User Login
export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500)
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

//6. User logout
export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout'
        });
        if (res.data.status === 'success') location.reload(true);
    } catch (err) {
        showAlert('error', 'An error occured. Try Again!')
    }
}

//7. Delete User
export const deleteUser = async userId => {
    try {
        await axios({
            method: 'DELETE',
            url: `/api/v1/users/${userId}`
        });

        showAlert('success', 'User deleted successfully!');
        window.setTimeout(() => {
            location.assign('/users?page=1');
        }, 2000)
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}