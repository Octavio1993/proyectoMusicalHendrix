const DondeEstamosPage = () => {
  return (
    <div className="donde-estamos-page">
      <div className="page-header">
        <h1>Donde Estamos</h1>
        <p>Visítanos en nuestra tienda física</p>
      </div>

      <div className="map-container">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3350.0458988622567!2d-68.8479428!3d-32.892532!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDUzJzMzLjEiUyA2OMKwNTAnNTIuNiJX!5e0!3m2!1ses!2sar!4v1629460242040!5m2!1ses!2sar"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ubicación de Musical Hendrix"
        ></iframe>
      </div>

      <div className="location-info">
        <div className="info-card">
          <h3>Información de contacto</h3>
          <p><strong>Dirección:</strong> Av. Las Heras y Av. San Martín, Ciudad de Mendoza</p>
          <p><strong>Teléfono:</strong> (261) 555-1234</p>
          <p><strong>Email:</strong> info@musicalhendrix.com</p>
          <p><strong>Horario de atención:</strong> Lunes a Viernes de 9:00 a 18:00, Sábados de 9:00 a 13:00</p>
        </div>

        <div className="info-card">
          <h3>Cómo llegar</h3>
          <p><strong>En colectivo:</strong> Líneas que pasan cerca: 101, 102, 103, 501, 502</p>
          <p><strong>En auto:</strong> Estacionamiento disponible en la zona</p>
          <p><strong>A pie:</strong> A 10 minutos caminando desde la Plaza Independencia</p>
        </div>
      </div>
    </div>
  );
};

export default DondeEstamosPage;