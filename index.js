const bcrypt = require("bcrypt");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
// import prisma from "./db";
const { PrismaClient } = require("@prisma/client");

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

client.on("message", async (msg) => {
  const chat = await client.getChatById(msg.from);
  const messages = await chat.fetchMessages();
  const lastMsg = messages[messages.length - 3];
  console.log(lastMsg);
  if (!lastMsg)
    msg.reply(
      "No hemos podido obtener la información, intentalo de nuevo más tarde"
    );
  if (msg.body.toLowerCase().includes("admin")) {
    client.sendMessage(
      msg.from,
      "Inserte email y contraseña separados por un espacio"
    );
  }
  if (msg.body.includes("@")) {
    const emailPass = msg.body.split(" ");
    const email = emailPass[0];
    const pass = emailPass[1];
    const existAdmin = await prisma.admin.findUnique({
      where: {
        email,
      },
    });
    if (existAdmin) {
      // comparar contraseña hasheada y avisar que tiene permitido realizar acciones de admin y revelarlas
      const isAdmin = await bcrypt.compare(pass, existAdmin.password);
      if (isAdmin) {
        // mostras acciones disponibles
        client.sendMessage(
          msg.from,
          "Escriba AGREGAR_CONCIERTO para agregar un concierto, BORRAR_CONCIERTO para borrar uno o INFO_CONCIERTO para obtener el stock del mismo"
        );
      }
    } else {
      // hashear contraseña y crear admin y mandar mensaje de usuario creado con exito
      const hashedPass = await bcrypt.hash(pass, 10);
      const newAdm = await prisma.admin.create({
        data: {
          email,
          password: hashedPass,
        },
      });
      if (newAdm) {
        client.sendMessage(msg.from, "Admin creado con éxito");
      }
    }
  }
  if (msg.body === "AGREGAR_CONCIERTO") {
    msg.reply(
      "Escriba nombre, precio y cantidad de lugares del concierto, separados por un espacio"
    );
  }
  if (msg.body === "BORRAR_CONCIERTO" || msg.body === "INFO_CONCIERTO") {
    msg.reply("Escriba nombre del concierto");
  }
  if (lastMsg.body === "AGREGAR_CONCIERTO") {
    const data = msg.body.split(" ");
    const name = data[0];
    const price = Number(data[1]);
    const stock = Number(data[2]);
    const newConcert = await prisma.concert.create({
      data: {
        name,
        price,
        stock,
      },
    });
    if (newConcert) {
      msg.reply("Concierto agregado con exito");
    }
  } else if (lastMsg.body === "BORRAR_CONCIERTO") {
    const deleteConcert = await prisma.concert.delete({
      where: {
        name: msg.body,
      },
    });
    if (deleteConcert) {
      msg.reply("Concierto eliminado con exito");
    }
  } else if (lastMsg.body === "INFO_CONCIERTO") {
    const info = await prisma.concert.findUnique({
      where: {
        name: msg.body,
      },
    });
    if (info) {
      msg.reply(`Entradas restantes: ${info.stock}`);
    }
  }
});
