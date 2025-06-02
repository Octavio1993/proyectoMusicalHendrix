//modelo Categoria
export interface Categoria {
    idCategoriaInstrumento: number;
    denominacion: string;
}

//modelo Instrumento
export interface Instrumento {
    idInstrumento?: number;          
    codigo: string;                  
    denominacion: string;            
    marca: string;
    stock: number;                   
    descripcion: string;
    imagen: string;
    precioActual?: number;           
    categoriaInstrumento: {          
        idCategoriaInstrumento: number;
        denominacion: string;
    };
}

//estado para formularios
export interface FormState {
    isSubmitting: boolean;
    isSuccess: boolean;
    isError: boolean;
    message: string;
}

//usuario simplificado
export interface Usuario {
    idUsuario: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: {
        idRol: number;
        definicion: string; // "Admin", "Operador", "Visor"
    };
}

//imagenes del slider
export interface SliderImage {
    id: number;
    url: string;
    alt: string;
    caption?: string;
    description?: string;
}