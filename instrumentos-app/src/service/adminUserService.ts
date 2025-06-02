import { RegistroRequest } from '../types/auth';
import { authService } from './authService';

const API_URL = 'http://localhost:8080/api';

//servicio para administración de usuarios
export const adminUserService = {
    //todos los usuarios (solo para administradores)
    async getAllUsers() {
        try {
            //usuario actual del localStorage
            const currentUser = authService.getUserFromStorage();

            if (!currentUser || currentUser.rol !== 'Admin') {
                throw new Error('No tienes permisos para realizar esta acción');
            }

            //crea los headers para la autenticacion
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };

            if (currentUser?.id) {
                headers['X-User-Id'] = currentUser.id.toString();
            }

            const response = await fetch(`${API_URL}/usuarios`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                throw new Error('Error al obtener usuarios');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw error;
        }
    },

    //registro nuevo operador (solo para administradores)
    async registerOperador(userData: RegistroRequest) {
        try {
            userData.rol = 'Operador';

            //usuario actual del localStorage
            const currentUser = authService.getUserFromStorage();

            if (!currentUser || currentUser.rol !== 'Admin') {
                throw new Error('Solo los administradores pueden registrar operadores');
            }

            //crea headers con el ID de usuario para autenticación
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };

            if (currentUser?.id) {
                headers['X-User-Id'] = currentUser.id.toString();
            }

            const response = await fetch(`${API_URL}/usuarios/registro`, {
                method: 'POST',
                headers,
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al registrar operador');
            }

            return data;
        } catch (error) {
            console.error('Error al registrar operador:', error);
            throw error;
        }
    },

    //elimina usuario (solo para administradores)
    async deleteUser(userId: number) {
        try {
            const currentUser = authService.getUserFromStorage();

            if (!currentUser || currentUser.rol !== 'Admin') {
                throw new Error('Solo los administradores pueden eliminar usuarios');
            }

            //admin no se puede eliminar a si mismo
            if (userId === currentUser.id) {
                throw new Error('No puedes eliminar tu propia cuenta');
            }

            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            
            if (currentUser?.id) {
                headers['X-User-Id'] = currentUser.id.toString();
            }

            const response = await fetch(`${API_URL}/usuarios/${userId}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                throw new Error('Error al eliminar usuario');
            }

            return true;
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            throw error;
        }
    }
};