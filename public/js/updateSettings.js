import { showAlert } from './alerts';

//The type of can either be password or normal data (name and email)
export const updateSettings = async (data, type) => {
    try {
        const url = type === 'Password'
            ? 'http://127.0.0.1:8000/api/v1/users/updatePassword'
            : 'http://127.0.0.1:8000/api/v1/users/me';
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

//Import the function in the index.js file
//Interact with the dom in the index.js file