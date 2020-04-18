import axios from "../../node_modules/axios";
import { showAlert } from './alerts';

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