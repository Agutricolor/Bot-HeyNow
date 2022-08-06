// const bcrypt = require("bcrypt");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageAck } = require("whatsapp-web.js");
// import prisma from "./db";
const { PrismaClient } = require("@prisma/client");
// require('dotenv').config()
// var axios = require('axios');

// const config = (country) =>{
//   return {
//     method: 'get',
//     url: `https://v3.football.api-sports.io/teams?country=${country}`,
//     headers: {
//       'x-rapidapi-key': `${process.env.API_KEY}`,
//       'x-rapidapi-host': 'v3.football.api-sports.io'
//     },
//   };
// } 

const prisma = new PrismaClient();

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

// client.on("message", async (msg) => {
//   const chat = await client.getChatById(msg.from);
//   const messages = await chat.fetchMessages();
//   const lastMsg = messages[messages.length - 3];
//   console.log(lastMsg);
//   if (lastMsg === undefined)
//     return msg.reply(
//       "No hemos podido obtener la información, intentalo de nuevo más tarde"
//     );
//   if (msg.body.toLowerCase().includes("admin")) {
//     return client.sendMessage(
//       msg.from,
//       "Inserte email y contraseña separados por un espacio"
//     );
//   }
//   if (msg.body.includes("@")) {
//     const emailPass = msg.body.split(" ");
//     const email = emailPass[0];
//     const pass = emailPass[1];
//     const existAdmin = await prisma.admin.findUnique({
//       where: {
//         email,
//       },
//     });
//     if (existAdmin) {
//       // comparar contraseña hasheada y avisar que tiene permitido realizar acciones de admin y revelarlas
//       const isAdmin = await bcrypt.compare(pass, existAdmin.password);
//       if (isAdmin) {
//         // mostras acciones disponibles
//         return client.sendMessage(
//           msg.from,
//           "Escriba AGREGAR_CONCIERTO para agregar un concierto, BORRAR_CONCIERTO para borrar uno o INFO_CONCIERTO para obtener el stock del mismo"
//         );
//       }
//     } else {
//       // hashear contraseña y crear admin y mandar mensaje de usuario creado con exito
//       const hashedPass = await bcrypt.hash(pass, 10);
//       const newAdm = await prisma.admin.create({
//         data: {
//           email,
//           password: hashedPass,
//         },
//       });
//       if (newAdm) {
//         return client.sendMessage(msg.from, "Admin creado con éxito");
//       }
//     }
//   }
//   if (msg.body === "AGREGAR_CONCIERTO") {
//     return msg.reply(
//       "Escriba nombre, precio y cantidad de lugares del concierto, separados por un espacio"
//     );
//   }
//   if (msg.body === "BORRAR_CONCIERTO" || msg.body === "INFO_CONCIERTO") {
//     return msg.reply("Escriba nombre del concierto");
//   }
//   if (lastMsg.body === "AGREGAR_CONCIERTO") {
//     const data = msg.body.split(" ");
//     const name = data[0];
//     const price = Number(data[1]);
//     const stock = Number(data[2]);
//     const newConcert = await prisma.concert.create({
//       data: {
//         name,
//         price,
//         stock,
//       },
//     });
//     if (newConcert) {
//       return msg.reply("Concierto agregado con exito");
//     }
//   } else if (lastMsg.body === "BORRAR_CONCIERTO") {
//     const deleteConcert = await prisma.concert.delete({
//       where: {
//         name: msg.body,
//       },
//     });
//     if (deleteConcert) {
//       return msg.reply("Concierto eliminado con exito");
//     }
//   } else if (lastMsg.body === "INFO_CONCIERTO") {
//     const info = await prisma.concert.findUnique({
//       where: {
//         name: msg.body,
//       },
//     });
//     if (info) {
//       return msg.reply(`Entradas restantes: ${info.stock}`);
//     }
//   }
// });

// client.on("message", async (message)=>{
//   if (message.body.includes("resultado")) {
//     return message.reply("Escriba el país de la liga y el club separados por un -")
//   }
//   if (message.body.includes("-")) {
//     const request = message.body.split("-")
//     axios(config(request[0])).then(res => {
//       console.log(res.data.response[0])
      
//     }).catch(err => {
//       console.error(err)
//     })
//   }
// })

client.on("message", async (message) => {
  if (message.body.includes("hola")) {
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
    console.log(data)
    const date = new Date(`2022-${data[0].length < 2 ? 0 : ""}${data[0]}-${data[1]}T${data[2]}`)
    console.log(date)
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


// console.log(new Date("August 15, 2022 16:00:00"))