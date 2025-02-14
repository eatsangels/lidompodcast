import Head from "next/head";

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Términos de Responsabilidad | Lidom Podcast Show</title>
        <meta
          name="description"
          content="Términos de Responsabilidad de Lidom Podcast Show"
        />
      </Head>
      <div className="min-h-screen relative flex items-center justify-center p-6 bg-gradient-to-r from-blue-700 via-white to-red-700">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <img
            src="https://seeklogo.com/images/L/lidom-logo-2612AD5687-seeklogo.com.png"
            alt="Lidom Logo Watermark"
            className="h-screen w-screen object-contain "
          />
        </div>
        {/* Content */}
        <div className="relative bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-2xl p-10 max-w-3xl w-full">
          <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
            Términos de Responsabilidad
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            En{" "}
            <span className="font-bold text-gray-900">
              Lidom Podcast Show
            </span>{" "}
            nos enorgullece ofrecer información deportiva de la más alta calidad.
            Sin embargo, es importante aclarar que no representamos ni estamos
            afiliados a la Liga de Béisbol Profesional de la República Dominicana.
            Trabajamos incansablemente para proporcionar datos precisos y
            actualizados, aunque no nos hacemos responsables por posibles errores
            o imprecisiones involuntarias.
          </p>
          <p className="text-lg text-gray-700 mb-6">
            Además, queremos informar que{" "}
            <span className="font-bold text-gray-900">
              Lidom Podcast Show
            </span>{" "}
            no realiza la venta de boletos; por lo tanto, en caso de cancelación de
            algún partido, no asumimos responsabilidad alguna respecto a las
            transacciones gestionadas por terceros.
          </p>
          <p className="text-lg text-gray-700">
            Nos regimos bajo el estricto cumplimiento de la DMCA (Digital Millennium
            Copyright Act | Ley de Derechos de Autor), reafirmando nuestro compromiso
            con la integridad y el respeto hacia la propiedad intelectual.
          </p>
        </div>
      </div>
    </>
  );
}
