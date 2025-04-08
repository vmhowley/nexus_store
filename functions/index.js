const functions = require("firebase-functions");
const admin = require("firebase-admin");
const emailjs = require("emailjs-com");

admin.initializeApp();

// Función para enviar el correo
exports.sendInvoiceOnCashOrder = functions.firestore
    .document("orders/{orderId}")
    .onCreate(async (snap, context) => {
      const order = snap.data();

      if (order.paymentMethod !== "efectivo") return null;

      const emailParams = {
        to_email: order.email,
        subject: `Factura de tu orden - Nexus Computing`,
        customer_name: order.customerName,
        items: order.items,
        total: order.total,
      };

      const response = await sendEmail(emailParams);

      if (response.status === "success") {
        console.log("Correo enviado a", order.email);
      } else {
        console.error("Error al enviar el correo", response);
      }

      return null;
    });

/**
 * Función para enviar un correo electrónico usando EmailJS.
 * @param {Object} params - Los parámetros necesrios para el correo electrónico.
 * @return {Object} El resultado de la operación de envío.
 */
async function sendEmail(params) {
  const serviceID = "tu_service_id"; // Obtén el servicio ID desde tu EmailJS
  const templateID = "tu_template_id"; // Obtén el template ID desde tu EmailJS

  try {
    const result = await emailjs.send(serviceID, templateID, params);
    return result;
  } catch (error) {
    console.error("Error enviando correo:", error);
    return {status: "failed"};
  }
}
