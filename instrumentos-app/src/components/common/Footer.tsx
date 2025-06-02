const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-info">
                    <h3>Musical Hendrix</h3>
                    <p>Tienda de instrumentos musicales con más de 15 años de experiencia</p>
                </div>
                <div className="footer-contact">
                    <h4>Contacto</h4>
                    <p>Av. Las Heras y Av. San Martin, Ciudad de Mendoza</p>
                    <p>Tel: (261) 555-1234</p>
                    <p>Email: info@musicalhendrix.com</p>
                </div>
                <div className="footer-copyright">
                    <p>&copy; {new Date().getFullYear()} Musical Hendrix. Todos los derechos reservados.</p>
                    <p className="footer-academic">
                        Laboratorio de Computación 4
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;