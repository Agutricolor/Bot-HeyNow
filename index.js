const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
require('dotenv').config()
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
// Funciones de usuario/cliente
client.on("message", async (message) => {
  const number = message.from.split("@")
  if (message.body == process.env.ADMIN_KEY) return
  if (message.body.toLowerCase().includes("hola") || message.body.toLowerCase().includes("agenda")) {
    return message.reply("Buenas! Somos el Centro Dental Pando, escriba el número que pertenezca a la acción requerida: 1 - Agendar una consulta | 2 - Revisar mi agenda | 3 - Eliminar mi agenda")
  }
  if (message.body == "1") {
    message.reply("Para realizar su agenda, escriba número del mes, día, hora (16:30 con este formato de horas, minutos), nombre y cédula de identidad, todo separado por un espacio")
    return client.sendMessage(message.from, "Nuestros horarios son de 09:00 a 19:00, turno cada media hora, si su horario no cumple estás condiciones, no será tomada la agenda")
  }
  if (message.body == "2") {
    return message.reply("Para revisar su agenda, escriba su cédula de identidad sin puntos ni guiones")
  }
  if (message.body == "3") {
    return message.reply("Para eliminar su agenda, escriba 3 y el número de cédula asociado a la agenda sin puntos ni guiones, separados por un espacio")
  }
  if (message.body.includes(":")) {
    const data = message.body.split(" ")
    if ((Number(data[2].charAt(1)) < 9  && Number(data[2].charAt(0)) === 0) || Number(data[2].charAt(1)) > 9 || Number(data[2].charAt(0) > 1)) {
      return message.reply("El horario introducido, no es aceptado. Trabajamos de 09:00 a 19:00 hs")
    }
    if ((data[2].charAt(3) !== "3" && data[2].charAt(3) !== "0") || data[2].charAt(4) !== "0") {
      return message.reply("El horario introducido, no es aceptado. Trabajamos en turnos de cada media hora.")
    }
    const date = new Date(`2022-${data[0].length < 2 ? 0 : ""}${data[0]}-${data[1].length < 2 ? 0 : ""}${data[1]}T${data[2]}:00`)
    try {
      const allAgendas = await prisma.agenda.findMany({
        where: {
          date
        }
      })
      if (allAgendas.length > 0) return message.reply("Ya hay alguien agendado en la fecha u hora solicitada, pruebe con una distinta")
      const newAgenda = await prisma.agenda.create({
        data: {
          date,
          name: data[3],
          ci: data[4]
        }
      })
      if (newAgenda) {
        message.reply("Entre a este link para ver nuestra ubicación: https://goo.gl/maps/wEwq4ATqi9XMWegHA")
        return message.reply("Has sido agendado/a en la fecha indicada, nos vemos!")
      }
    } catch (error) {
      console.log(error)
      return message.reply("No hemos podido cargar los datos o ya existe una agenda con el mismo número de cédula, intentelo más tarde")
    }
  }
  if (!isNaN(message.body) && number[0] != process.env.ADMIN_NUMBER) {
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
  const deleteMessage = message.body.split(" ")
  if (deleteMessage[0] == "3" && !isNaN(deleteMessage[1])) {
    try {
      const deleteAgenda = await prisma.agenda.delete({
        where: {
          ci: deleteMessage[1]
        }
      })
      if (deleteAgenda) return message.reply("Agenda borrada con éxito")
    } catch (error) {
      console.log(error)
      return message.reply("La acción solicitada no se ha podido procesar, intentelo de nuevo más tarde")
    }
  }
})
// Funciones de admin
client.on("message", async (message) => {
  const todayDate = Date()
  const number = message.from.split("@")
  const numberMatch = number[0] == process.env.ADMIN_NUMBER
  if (message.body == process.env.ADMIN_KEY && numberMatch) {
    message.reply("Hola Admin!")
    client.sendMessage(message.from, "Escriba el número correspondiente a la acción requerida")
    client.sendMessage(message.from, "101 - Borrar consulta atendida | 102 - Revisar agenda completa | 103 - Revisar agenda del día")
  }
  if (message.body == 101 && numberMatch) {
    message.reply("Para borrar consulta atendida, escriba 101 y el número de cédula del cliente sin puntos ni guiones, separados por un espacio")
  } else if (message.body == 102 && numberMatch) {
    try {
      const allAgenda = await prisma.agenda.findMany({
        orderBy: {
          date: "asc"
        },
        select: {
          date: true,
          name: true,
          ci: true
        }
      })
      const dayAgenda = allAgenda.filter(agenda => {
        return agenda.date.toLocaleString().split("/")[0] == Number(todayDate.split(" ")[2])
      })
      allAgenda.forEach(agenda => {
        client.sendMessage(message.from, `Nombre: ${agenda.name}, C.I: ${agenda.ci}, Fecha/horario: ${agenda.date.toLocaleString()}`)
      });
    } catch (error) {
      console.error(error)
      return message.reply("No se ha podido realizar la acción solicitada, intentelo de nuevo más tarde")
    }
  } else if (message.body == 103 && numberMatch) {
    try {
      const allAgenda = await prisma.agenda.findMany({
        orderBy: {
          date: "asc"
        },
        select: {
          date: true,
          name: true,
          ci: true
        }
      })
      const dayAgenda = allAgenda.filter(agenda => {
        return agenda.date.toLocaleString().split("/")[0] == Number(todayDate.split(" ")[2])
      })
      if (dayAgenda.length === 0) return message.reply("No hay consultas para hoy")
      dayAgenda.forEach(agenda => {
        client.sendMessage(message.from, `Nombre: ${agenda.name}, C.I: ${agenda.ci}, Fecha/horario: ${agenda.date.toLocaleString()}`)
      });
    } catch (error) {
      console.error(error)
      return message.reply("No se ha podido realizar la acción solicitada, intentelo de nuevo más tarde")
    }
  }
  const deleteMessage = message.body.split(" ")
  if (deleteMessage[0] == 101 && numberMatch && !isNaN(deleteMessage[1]))  {
    try {
      const deleteAgenda = await prisma.agenda.delete({
        where: {
          ci: deleteMessage[1]
        }
      })
      if (deleteAgenda) return message.reply("Agenda eliminada con éxito")
    } catch (error) {
      console.error(error)
      return message.reply("No se ha podido realizar la acción solicitada, intentelo de nuevo más tarde")
    }
  }
})