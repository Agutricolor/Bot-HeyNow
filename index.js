// const bcrypt = require("bcrypt");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const prisma = require("./db")


const client = new Client({
  authStrategy: new LocalAuth(),
});

client.initialize();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("AUTHENTICATED");
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (message) => {
  if (message.body.toLowerCase().includes("hola")) {
    return message.reply("Buenas! Somos la odontología Caras Felices, escriba el número que pertenezca a la acción requerida: 1 - Agendar una consulta | 2 - Revisar mi agenda")
  }
  if (message.body == "1") {
    return message.reply("Para realizar su agenda, escriba número del mes, día, hora (16:30:00 con este formato de horas, minutos, segundos), nombre y cédula de identidad separados por un espacio")
  }
  if (message.body == "2") {
    return message.reply("Para revisar su agenda, escriba su cédula de identidad sin puntos ni guiones")
  }
  if (message.body.includes(":")) {
    const data = message.body.split(" ")
    const date = new Date(`2022-${data[0].length < 2 ? 0 : ""}${data[0]}-${data[1]}T${data[2]}`)
    try {
      const allAgendas = await prisma.agenda.findMany({
        where: {
          date
        }
      })
      console.log(allAgendas)
      if (allAgendas.length > 0) return message.reply("Ya hay alguien agendado en la fecha solicitada, pruebe con una fecha distinta")
      const newAgenda = await prisma.agenda.create({
        data: {
          date,
          name: data[3],
          ci: data[4]
        }
      })
      if (newAgenda) return message.reply("Has sido agendado/a en la fecha indicada, nos vemos!")
    } catch (error) {
      console.log(error)
      return message.reply("No hemos podido cargar los datos, intentelo más tarde")
    }
  }
  if (!isNaN(message.body)) {
    try {
      const userAgenda = await prisma.agenda.findUnique({
        where: {
          ci: message.body
        }
      })
      var date = new Date(userAgenda?.date.toString())
      return message.reply(`${userAgenda.name}, tu consulta está agendada para la siguiente fecha: ${date.toLocaleString()}`)
    } catch (error) {
      console.log(error)
      return message.reply("No hemos podido cargar los datos, intentelo más tarde")
    }
  }
})